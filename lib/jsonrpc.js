var http = require('http')

module.exports = function (host, port) {
    this.host = host
    this.port = port
    this.call = function (method, params, callback, requestPath) {
        let requestJSON = JSON.stringify({
            'id': (new Date()).getTime(),
            'method': method,
            'params': params
        })
        let headers = {
            'host': host,
            'Content-Length': requestJSON.length
        }
        if (requestPath === undefined) requestPath = '/'
        let options = {
            host: host,
            port: port,
            path: requestPath,
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
    this.callPromise = function (method, params, requestPath) {
        return new Promise((resolve, reject) => {
            this.call(method, params, (err, ret) => {
                if (err) reject(err)
                else resolve(ret)
            }, requestPath)
        })
    }
}
