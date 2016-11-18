/* eslint-env node, mocha */

var http = require('http')
var WebSocket = require('ws')

var JSONRpcClient = function (host, port, requestPath) {
    this.host = host
    this.port = port
    this.requestPath = !requestPath ? '/' : requestPath
    this.wsUrl = 'ws' + '://' + this.host + ':' + this.port + this.requestPath
    this.wsClient = null
    this.wsConnection = null
    this.callOverWs = function (method, params, callback, period) {
        if(this.wsClient === null) {
            this.wsClient = new WebSocket(this.wsUrl)
        }
        var requestJSON = JSON.stringify({
            'id': (new Date()).getTime(),
            'method': method,
            'params': params
        })
        var that = this
        function sendMessage(message) {
            if(that.wsClient === null) return
            if(that.wsClient.readyState === WebSocket.OPEN) {
                that.wsClient.send(message)
                setTimeout(function(){
                    sendMessage(message)
                }, period)
            }
        }
        this.wsClient.on('open', function () {
            if(period) sendMessage(requestJSON)
            else that.wsClient.send(requestJSON)
        })
        this.wsClient.on('message', function (message) {
            var decoded = JSON.parse(message)
            if (decoded.hasOwnProperty('result')) {
                callback(null, decoded.result)
            } else {
                callback(decoded.error, null)
            }
        })
    }
    this.closeWs = function() {
        this.wsClient.terminate()
        this.wsClient = null
    }
    this.call = function (method, params, callback) {
        var requestJSON = JSON.stringify({
            'id': (new Date()).getTime(),
            'method': method,
            'params': params
        })
        var headers = {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache',
            'Content-Length': Buffer.byteLength(requestJSON)
        }
        var options = {
            hostname: host,
            port: port,
            path: this.requestPath,
            method: 'POST',
            headers: headers
        }
        var buf = ''
        var req = http.request(options, function (res) {
            res.setEncoding('utf8')
            res.on('data', function (chunk) { buf += chunk })
            res.on('end', function () {
                var decoded = JSON.parse(buf)
                if (decoded.hasOwnProperty('result')) {
                    callback(null, decoded.result)
                } else {
                    callback(decoded.error, null)
                }
            })
            res.on('error', function (err) {
                callback(err, null)
            })
        })
        req.write(requestJSON)
        req.end()
    }

    this.callPromise = function (method, params) {
        var that = this
        return new Promise(function (resolve, reject) {
            that.call(method, params, function (err, ret) {
                if (err) reject(err)
                else resolve(ret)
            })
        })
    }
}

module.exports = JSONRpcClient