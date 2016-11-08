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
```
