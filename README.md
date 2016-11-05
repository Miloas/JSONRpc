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

let client = new JSONRpcClient('localhost', 8080)

client.Call('add',[1,7],function(err, ret){
    // 8
    if(!err) console.log(ret)
})
```