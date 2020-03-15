(function (factory) {
    typeof define === 'function' && define.amd ? define(factory) :
    factory();
}((function () { 'use strict';

    function noop() { }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error(`Function called outside component initialization`);
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail);
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
            }
        };
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if ($$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set() {
            // overridden by instance, if it has props
        }
    }

    function loader (url, test, callback, options = { async: true, defer: true }) {
      if (!test()) {
        const tag = document.createElement('script');
        tag.src = url;
        tag.async = options.async;
        tag.defer = options.defer;
        tag.onload = callback;
        document.body.appendChild(tag);
      } else {
        callback();
      }
    }

    /* src/Messenger.svelte generated by Svelte v3.20.0 */

    function instance($$self, $$props, $$invalidate) {
    	let { autoBoot = true } = $$props;
    	let { appId } = $$props;
    	let { settings } = $$props;
    	const globalName = "Intercom";
    	const settingsKey = "intercomSettings";
    	const dispatch = createEventDispatcher();

    	function getSettings() {
    		return Object.assign({}, settings, { app_id: appId });
    	}

    	function getIntercom() {
    		return window[globalName];
    	}

    	function boot(options = getSettings()) {
    		window[globalName]("boot", options);
    	}

    	function shutdown() {
    		window[globalName]("shutdown");
    	}

    	function startTour(tourId) {
    		window[globalName]("startTour", tourId);
    	}

    	function updateSettings() {
    		window[settingsKey] = getSettings();
    		window[globalName]("update", window[settingsKey]);
    	}

    	function show() {
    		window[globalName]("show");
    	}

    	function hide() {
    		window[globalName]("hide");
    	}

    	function showNewMessage(content) {
    		window[globalName]("showNewMessage", content);
    	}

    	function showMessages() {
    		window[globalName]("showMessages");
    	}

    	function trackEvent(metadata) {
    		window[globalName]("trackEvent", metadata);
    	}

    	function getVisitorId() {
    		return window[globalName]("getVisitorId");
    	}

    	function bindEvents() {
    		const events = [
    			{ name: "onHide", binding: "hide" },
    			{ name: "onShow", binding: "show" },
    			{
    				name: "onUnreadCountChange",
    				binding: "unread-count-change"
    			}
    		];

    		events.forEach(e => {
    			window[globalName](e.name, dispatch.bind(e.binding));
    		});
    	}

    	onMount(() => {
    		loader(`//widget.intercom.io/widget/${appId}`, () => typeof window[globalName] === "function", () => {
    			window[globalName]("reattach_activator");
    			bindEvents();

    			if (autoBoot) {
    				boot();
    			}
    		});
    	});

    	$$self.$set = $$props => {
    		if ("autoBoot" in $$props) $$invalidate(0, autoBoot = $$props.autoBoot);
    		if ("appId" in $$props) $$invalidate(1, appId = $$props.appId);
    		if ("settings" in $$props) $$invalidate(2, settings = $$props.settings);
    	};

    	return [
    		autoBoot,
    		appId,
    		settings,
    		globalName,
    		settingsKey,
    		getIntercom,
    		boot,
    		shutdown,
    		startTour,
    		updateSettings,
    		show,
    		hide,
    		showNewMessage,
    		showMessages,
    		trackEvent,
    		getVisitorId
    	];
    }

    class Messenger extends SvelteComponent {
    	constructor(options) {
    		super();

    		init(this, options, instance, null, safe_not_equal, {
    			autoBoot: 0,
    			appId: 1,
    			settings: 2,
    			globalName: 3,
    			settingsKey: 4,
    			getIntercom: 5,
    			boot: 6,
    			shutdown: 7,
    			startTour: 8,
    			updateSettings: 9,
    			show: 10,
    			hide: 11,
    			showNewMessage: 12,
    			showMessages: 13,
    			trackEvent: 14,
    			getVisitorId: 15
    		});
    	}

    	get globalName() {
    		return this.$$.ctx[3];
    	}

    	get settingsKey() {
    		return this.$$.ctx[4];
    	}

    	get getIntercom() {
    		return this.$$.ctx[5];
    	}

    	get boot() {
    		return this.$$.ctx[6];
    	}

    	get shutdown() {
    		return this.$$.ctx[7];
    	}

    	get startTour() {
    		return this.$$.ctx[8];
    	}

    	get updateSettings() {
    		return this.$$.ctx[9];
    	}

    	get show() {
    		return this.$$.ctx[10];
    	}

    	get hide() {
    		return this.$$.ctx[11];
    	}

    	get showNewMessage() {
    		return this.$$.ctx[12];
    	}

    	get showMessages() {
    		return this.$$.ctx[13];
    	}

    	get trackEvent() {
    		return this.$$.ctx[14];
    	}

    	get getVisitorId() {
    		return this.$$.ctx[15];
    	}
    }

    /* demo/Demo.svelte generated by Svelte v3.20.0 */

    function create_fragment(ctx) {
    	let current;
    	const messenger = new Messenger({ props: { appId: "qu7n6gye" } });

    	return {
    		c() {
    			create_component(messenger.$$.fragment);
    		},
    		m(target, anchor) {
    			mount_component(messenger, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i(local) {
    			if (current) return;
    			transition_in(messenger.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(messenger.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			destroy_component(messenger, detaching);
    		}
    	};
    }

    class Demo extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, null, create_fragment, safe_not_equal, {});
    	}
    }

    new Demo({ target: document.body });

})));
