import Hyperswarm from 'hyperswarm'
import Corestore from 'corestore'
import EventEmitter from 'events'
import ram from 'random-access-memory'

export default class Room extends EventEmitter {
  constructor (roomKey, nickname, store = null) {
    super()
    this.store = new Corestore('./.chat/'+roomKey)
    this.swarm = new Hyperswarm()
    this.nickname = nickname
    this.roomKey = Buffer.from(roomKey, 'hex')
    this.localFeed = this.store.get({ name: nickname, valueEncoding: 'json' })
    this.messages = []
    this.peers = []
    this.ready = false

    this.swarm.join(this.roomKey)
    this.swarm.on('connection', (connection) => {
      this.store.replicate(connection)
      connection.write(JSON.stringify({ key: this.localFeed.key.toString('hex'), nickname: this.nickname, type: 'peerInfo' }))
      connection.once('data', (data) => {
        const jsonData = JSON.parse(data.toString())
        console.log(jsonData.nickname + ' joined the chat!')
        this.emit('join', jsonData)
        this.addPeer(jsonData)
      })
    })

    this.init()
  }

  getPeers () {
    return this.peers
  }

  getMessages () {
    return this.messages
  }

  async init () {
    this.localFeed.createReadStream({ live: true }).on('data', async (data) => {
      await this.processMessage(data)
    })
    this.ready = true
  }

  async sendMessage (message) {
    await this.localFeed.append({
      type: 'message',
      nickname: this.nickname,
      text: message,
      timestamp: new Date().toISOString()
    })
  }

  async processMessage (message) {
    console.log(message)
    if (message.type === 'peerInfo') {
      await this.addPeer(message)
    } else {
        this.messages.push(message)
      this.emit('chat', message)
    }
  }

  async addPeer (message) {
    // Check if peer already exists or if it is the local peer
    console.log('add peer: ' + message.key)
    if (!this.peers.find((peer) => peer.key === message.key) && message.key !== this.localFeed.key.toString('hex')) {
      const feed = this.store.get({ key: Buffer.from(message.key, 'hex'), valueEncoding: 'json' })
      console.log('Adding peer: ' + message.nickname)
      feed.on('ready', () => {
        console.log('core ready')
        feed.createReadStream({ live: true }).on('data', (data) => {
            this.processMessage(data)
          })
      })
      this.peers.push(message)
      await this.localFeed.append(message)
    }
  }
}
