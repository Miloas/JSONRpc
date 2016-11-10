/* eslint-env node, mocha */

import test from 'ava'
var JSONRpcClient = require(__dirname + '/../')

let client = new JSONRpcClient('localhost', 8080, '/http')
let ws_client = new JSONRpcClient('localhost', 8080, '/ws')

function thunkPromise(method, params) {
    return new Promise(function (resolve, reject) {
        client.call(method, params, (err, ret) => {
            if (err) reject(err)
            else resolve(ret)
        })
    })
}

test('call add function should get correct result (call)', async t => {
    t.is(await thunkPromise('add', [1, 7]), 8)
})

test('call add function should get error result (call)', async t => {
    await thunkPromise('add', [1]).catch(err => t.is(err, 'error'))
})

test('call add function should get correct result (callPromise)', async t => {
    t.is(await client.callPromise('add', [1, 2]), 3)
})

test('call add function should get error result (callPromise)', async t => {
    await client.callPromise('add', []).catch(err => t.is(err, 'error'))
})

test('call add function should get correct result (callOverWs)', t => {
    ws_client.callOverWs('add', [1, 2], (err, ret) => t.is(ret, 3))
})

test('call add function should get error result (callOverWs)', t => {
    ws_client.callOverWs('add', [], (err, ret) => t.is(err, 'error'))
})