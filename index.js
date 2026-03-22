const mineflayer = require(‘mineflayer’)
const http = require(‘http’)

// ─── CONFIG ───────────────────────────────────────────────
const HOST = ‘OriginRPFR.aternos.me’
const PORT = 36675
const USERNAME = ‘OriginRPBot’
const VERSION = ‘1.12.2’
const RECONNECT_DELAY = 15000
const AFK_MIN = 1000        // 1 seconde minimum
const AFK_MAX = 120000      // 2 minutes maximum
// ──────────────────────────────────────────────────────────

let bot = null
let afkTimer = null
let reconnectTimer = null
let isConnecting = false

function randomDelay() {
return Math.floor(Math.random() * (AFK_MAX - AFK_MIN + 1)) + AFK_MIN
}

function createBot() {
if (isConnecting || reconnectTimer) return
isConnecting = true
console.log(`[Bot] Connexion à ${HOST}:${PORT}...`)

bot = mineflayer.createBot({
host: HOST,
port: PORT,
username: USERNAME,
version: VERSION,
auth: ‘offline’,
hideErrors: true,
})

bot.on(‘error’, (err) => {
console.log(`[Bot] Erreur : ${err.message}`)
handleDisconnect()
})

bot.once(‘spawn’, () => {
isConnecting = false
console.log(`[Bot] Connecté en tant que ${USERNAME} !`)
scheduleNextAFK()
})

bot.on(‘chat’, (username, message) => {
if (username === USERNAME) return
console.log(`[Chat] <${username}> ${message}`)
})

bot.on(‘kicked’, (reason) => {
let msg = reason
try { msg = JSON.parse(reason)?.text || reason } catch (_) {}
console.log(`[Bot] Kické : ${msg}`)
handleDisconnect()
})

bot.on(‘end’, (reason) => {
console.log(`[Bot] Déconnecté : ${reason}`)
handleDisconnect()
})
}

function scheduleNextAFK() {
stopAntiAFK()
const delay = randomDelay()
console.log(`[AFK] Prochain mouvement dans ${(delay / 1000).toFixed(1)}s`)
afkTimer = setTimeout(() => {
doAFKMove()
scheduleNextAFK()
}, delay)
}

function doAFKMove() {
if (!bot || !bot.entity) return
const action = Math.floor(Math.random() * 4)
if (action === 0) {
// Saut
bot.setControlState(‘jump’, true)
setTimeout(() => { if (bot) bot.setControlState(‘jump’, false) }, 500)
console.log(’[AFK] Action : saut’)
} else if (action === 1) {
// Rotation
bot.look(Math.random() * Math.PI * 2, (Math.random() - 0.5) * 0.5, false)
console.log(’[AFK] Action : rotation’)
} else if (action === 2) {
// Marche courte
bot.setControlState(‘forward’, true)
setTimeout(() => { if (bot) bot.setControlState(‘forward’, false) }, 500 + Math.random() * 1000)
console.log(’[AFK] Action : marche’)
} else {
// Rotation + saut
bot.look(Math.random() * Math.PI * 2, 0, false)
bot.setControlState(‘jump’, true)
setTimeout(() => { if (bot) bot.setControlState(‘jump’, false) }, 500)
console.log(’[AFK] Action : rotation + saut’)
}
}

function stopAntiAFK() {
if (afkTimer) {
clearTimeout(afkTimer)
afkTimer = null
}
}

function handleDisconnect() {
cleanup()
scheduleReconnect()
}

function cleanup() {
isConnecting = false
stopAntiAFK()
if (bot) {
try { bot.removeAllListeners() } catch (*) {}
try { bot.end() } catch (*) {}
bot = null
}
}

function scheduleReconnect() {
if (reconnectTimer) return
console.log(`[Bot] Reconnexion dans ${RECONNECT_DELAY / 1000}s...`)
reconnectTimer = setTimeout(() => {
reconnectTimer = null
createBot()
}, RECONNECT_DELAY)
}

// ─── Health server pour Render ────────────────────────────
const PORT_HTTP = process.env.PORT || 3000
http.createServer((req, res) => {
res.writeHead(200)
res.end(‘Bot en ligne’)
}).listen(PORT_HTTP, () => {
console.log(`[Health] Serveur HTTP sur le port ${PORT_HTTP}`)
})

// ─── Démarrage ────────────────────────────────────────────
createBot()