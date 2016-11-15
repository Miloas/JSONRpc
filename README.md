# JSONRpc

> json-rpc 2.0 client

## Test
```javascript
// to Start an json-rpc 2.0 server 
go run test/testServer.go
// do test
npm test
```

## Install
```bash
npm i JSONRpc --save
```

## Use
```javascript
var JSONRpcClient = require('JSONRpc')

const client = new JSONRpcClient('localhost', 8080)

client.call('add', [1,7], (err, ret) => {
    // 8
    if(!err) console.log(ret)
})

// Promise also support
(async () => {
    let ret = await client.callPromise('add', [1,2])
    // 3
    console.log(ret)
})()

//Json-rpc over websocket
//It will periodically call add function, and reseive every result from callback
client.callOverWs('add', [1, 2], function (err, ret) {
    console.log(ret)
}, 1000)

//It will call add once 
client.callOverWs('add', [1, 2], function(err, ret) {
    console.log(ret)
})

//Close the connection
//If u want to construct a new ws, u should close old one first, or construct a new client object.
client.closeWs()
```
