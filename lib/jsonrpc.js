/* eslint-env node, mocha */

var http = require('http')
var WebSocketClient = require('websocket').client

let JSONRpcClient = function (host, port, requestPath) {
    this.host = host
    this.port = port
    this.requestPath = !requestPath ? '/' : requestPath
    this.wsUrl = 'ws' + '://' + this.host + ':' + this.port + this.requestPath
    this.wsConnection = null
    this.callOverWs = function (method, params, callback, period) {
        let requestJSON = JSON.stringify({
            'id': (new Date()).getTime(),
            'method': method,
            'params': params
        })
        let client = new WebSocketClient()
        let that = this
        client.on('connect', function (connection) {
            that.wsConnection = connection
            // console.log('WebSocket Client Connected')
            connection.on('error', function (error) {
                // console.log("Connection Error: " + error.toString())
            })
            connection.on('close', function () {
                // console.log('Connection Closed')
            })
            connection.on('message', function (message) {
                let decoded = JSON.parse(message.utf8Data)
                if (decoded.hasOwnProperty('result')) {
                    callback(null, decoded.result)
                } else {
                    callback(decoded.error, null)
                }
            })

            function sendMessage(message) {
                if (connection.connected) {
                    // console.log(that.wsConnection)
                    connection.sendUTF(message)
                    if (period) {
                        setTimeout(function () {
                            sendMessage(message)
                        }, period)
                    }
                }
            }
            sendMessage(requestJSON)
        })

        client.connect(this.wsUrl)
    }

    this.call = function (method, params, callback) {
        let requestJSON = JSON.stringify({
            'id': (new Date()).getTime(),
            'method': method,
            'params': params
        })
        let headers = {
            'host': host,
            'Content-Length': requestJSON.length
        }
        let options = {
            host: host,
            port: port,
            path: this.requestPath,
            headers: headers,
            method: 'POST'
        }
        let buf = ''
        let req = http.request(options, (res) => {
            res.on('data', (chunk) => buf += chunk)
            res.on('end', () => {
                let decoded = JSON.parse(buf)
                if (decoded.hasOwnProperty('result')) {
                    callback(null, decoded.result)
                } else {
                    callback(decoded.error, null)
                }
            })
            res.on('error', (err) => {
                callback(err, null)
            })
        })
        req.write(requestJSON)
        req.end()
    }

    this.callPromise = function (method, params) {
        let that = this
        return new Promise((resolve, reject) => {
            that.call(method, params, (err, ret) => {
                if (err) reject(err)
                else resolve(ret)
            })
        })
    }
}

module.exports = JSONRpcClient