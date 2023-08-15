const makeWASocket = require("@adiwajshing/baileys").default
const { delay, DisconnectReason, fetchLatestBaileysVersion, makeInMemoryStore, MessageRetryMap, useMultiFileAuthState } = require("@adiwajshing/baileys")
const { Boom } = require('@hapi/boom')
const fs = require("fs")
const http = require("http")
const qrcode = require("qrcode")
const express = require("express")
const { Server } = require("socket.io")
const port = 3000
const app = express()
const server = http.createServer(app)
const io = new Server(server)
var sock = undefined
let qrRetry = 0
app.use("/", express.static(__dirname + "/"))

app.use(express.json())
app.use(express.urlencoded({
    extended: true
}))

app.get('/get/*', (req, res) => {

    res.sendFile('qr.html', {
        root: __dirname
    });
    qrRetry = 0
    if (sock != undefined) {
        sock.logout()
    }
    setTimeout(function() {
        startSock(req.url)
}, 10000);
    
    
});
io.on("connection", async socket => {
    console.log('message', 'Connecting...');
    socket.on("disconnect", (reason) => {
        qrRetry = 0
        console.log("reason", reason)
        if (sock != undefined) {
            sock.logout()
        }
    });
});
async function startSock(url) {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info' + url)
    const { version } = await fetchLatestBaileysVersion()
    sock = makeWASocket({
        version,
        printQRInTerminal: false,
        auth: state
    })
    
    sock.ev.process(
        async (events) => {
            if (events['connection.update']) {
                const update = events['connection.update']
                const { qr, connection, lastDisconnect } = update
                if (connection === 'close') {
                    if ((lastDisconnect?.error)?.output?.statusCode !== DisconnectReason.loggedOut) {
                        startSock(url)
                    } else {
                        console.log('Connection closed. You are logged out.')
                    }
                }
                if (qr != undefined) {
                    if (qrRetry >= 4) {
                        sock.logout()
                        console.log("Hiz", qrRetry)
                        io.emit("logout")
                    } else {
                        qrcode.toDataURL(qr, (err, url) => {
                            io.emit("qr", url)
                            io.emit("log", "QR Code received, please scan")
                            console.log('hi', qrRetry)
                            qrRetry = qrRetry + 1
                        })
                    }
                }
                console.log('connection update', update)
                if (connection === "open") {
                    groups = Object.values(await sock.groupFetchAllParticipating())
                    if (groups) {
                        io.emit("groups", groups)
                        fs.writeFileSync("auth_info" + url + ".json", JSON.stringify(groups), (err) => {
                            if (err) throw err;
                            io.emit("success", "success")
                            sock.logout()
                        })
                    }
                }

            }
            if (events['creds.update']) {
                await saveCreds()
            }
        }
    )
    
}

server.listen(port, () => {
    console.log(`http://localhost:${port}`)
})
