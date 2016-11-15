/* eslint-env node, mocha */

var JSONRpcClient = require(__dirname + '/../')
let ws_client = new JSONRpcClient('localhost', 8080, '/ws')
let http_client = new JSONRpcClient('localhost', 8080, "/http")
// ws_client.callOverWs('add', [1,2], function(err,ret) {
//     console.log(ret)
// }, 1000)

// setTimeout(function(){
//     ws_client.closeWs()
// },3000)

// http_client.call('add', [1,2], function(err,ret){
//     console.log(ret)
// })