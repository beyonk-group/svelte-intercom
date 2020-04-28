import Queue from 'fastq'

function worker (cmd, cb) {
  const [ command, params ] = cmd
  this.intercom(command, params)
  cb(null)
}

export class EventQueue {
  constructor (intercom) {
    this.intercom = intercom
    this.queue = new Queue(this, worker, 1)
    this.queue.pause()
  }

  send (command, params) {
    this.queue.push([ command, params ])
  }

  start () {
    this.queue.resume()
  }
}