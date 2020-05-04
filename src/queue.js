import Queue from 'fastq'

function worker (cmd, cb) {
  const [ command, params ] = cmd
  this.getIntercom()(command, params)
  console.log('from queue', command, params)
  cb(null)
}

export class EventQueue {
  constructor (getIntercom) {
    this.getIntercom = getIntercom
    this.queue = new Queue(this, worker, 1)
    this.queue.pause()
  }

  send (command, params) {
    this.queue.push([ command, params ])
  }

  start () {
    this.queue.resume()
  }

  stop () {
    this.queue.kill()
  }
}