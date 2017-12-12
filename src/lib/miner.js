import store from '../store'

const stats = {}
let miner = {}

function hashFound (ev) {
  const { job_id, result, hashes } = ev // hashesPerSecond
  store.commit('addNode', {id: result, name: hashes, _size: hashes, job_id})
  store.commit('addMessage', `Found ${hashes} hashes!`)
}

function hashAccepted (ev) {
  // const { job_id, result, hashes } = ev // hashesPerSecond
  // store.commit('addMessage', `Accepted ${ev.hashes} hashes!`)
}

function newJob (ev) {
  store.commit('addMessage', `New job @ ${Math.round((1 - ev.throttle) * 100)}% power`)
}

function updateThrottle () {
  miner.setThrottle(store.state.throttle)
}

function updateStats () {
  updateThrottle()
  stats.hashesPerSecond = miner.getHashesPerSecond()
  stats.totalHashes = miner.getTotalHashes(true)
  stats.acceptedHashes = miner.getAcceptedHashes()
  stats.throttle = miner.getThrottle()
  stats.power = `${((1 - stats.throttle).toFixed(2) * 100)}%`
  stats.hashRate = `${stats.hashesPerSecond.toFixed(1)}/sec`
  store.commit('updateStats', stats)
}

export default function (CH) {
  const opts = { threads: 1, throttle: store.state.throttle }
  miner = new CH.Anonymous('s0N1th4I4ElExw1U3JlqGVTjZR428Nyq', opts)
  miner.on('error', ev => console.log({ error: ev }))
  miner.on('open', ev => console.log({ state: 'started', ev }))
  miner.on('close', ev => console.log({ state: 'closed' }))
  miner.on('found', ev => hashFound(ev))
  miner.on('job', ev => newJob(ev))
  miner.on('accepted', ev => hashAccepted(ev))
  miner.start()
  setInterval(updateStats, 500)
}
