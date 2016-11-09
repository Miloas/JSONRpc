import test from 'ava'
var JSONRpcClient = require(__dirname + '/../')

let client = new JSONRpcClient('localhost', 8080, '/http')

function thunkPromise(method, params) {
    return new Promise(function (resolve, reject) {
        client.call(method, params, (err, ret) => {
            if (err) reject(err)
            else resolve(ret)
        })
    })
}

test('add correct (call)', async t => {
    t.is(await thunkPromise('add', [1, 7]), 8)
})

test('add error (call)', async t => {
    await thunkPromise('add', [1]).catch(err => t.is(err, 'error'))
})

test('add correct (callPromise)', async t => {
    t.is(await client.callPromise('add', [1, 2]), 3)
})

test('add error (callPromise)', async t => {
    await client.callPromise('add', []).catch(err => t.is(err, 'error'))
})
