import test from 'ava'
var JSONRpcClient = require('../jsonrpc.js')

let client = new JSONRpcClient('localhost', 8080)

function thunkPromise(method, params) {
    return new Promise(function (resolve, reject) {
        client.Call(method, params, (err, ret) => {
            if (err) reject(err)
            else resolve(ret)
        })
    })
}

test('add correct', async t => {
    t.is(await thunkPromise('add', [1,7]), 8)
})

test('add error', async t => {
    await thunkPromise('add', [1]).catch(err => t.is(err,'error'))
})
