# json-rpc

> json-rpc 2.0 client

## test
```javascript
// to Start an json-rpc 2.0 server 
go run test/testServer.go
// do test
npm test
```

## Use
```javascript
var JSONRpcClient = require('jsonrpc')

let client = new JSONRpcClient('localhost', 8080)

client.Call('add',[1,7],function(err, ret){
    // 8
    if(!err) console.log(ret)
})
```