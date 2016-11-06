import test from 'ava'
var JSONRpcClient = require(__dirname + '/../')

let client = new JSONRpcClient('localhost', 8080)

function thunkPromise(method, params) {
    return new Promise(function (resolve, reject) {
        client.Call(method, params, (err, ret) => {
            if (err) reject(err)
            else resolve(ret)
        })
    })
}

test('add correct (Call)', async t => {
    t.is(await thunkPromise('add', [1, 7]), 8)
})

test('add error (Call)', async t => {
    await thunkPromise('add', [1]).catch(err => t.is(err, 'error'))
})

test('add correct (CallPromise)', async t => {
    t.is(await client.CallPromise('add', [1, 2]), 3)
})

test('add error (CallPromise)', async t => {
    await client.CallPromise('add', []).catch(err => t.is(err, 'error'))
})