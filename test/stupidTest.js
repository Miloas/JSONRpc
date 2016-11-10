/* eslint-env node, mocha */

var JSONRpcClient = require(__dirname + '/../')
let ws_client = new JSONRpcClient('localhost', 8080, '/ws')
ws_client.callOverWs('add', [1, 2], function (err, ret) {
    console.log(ret)
}, 1000)