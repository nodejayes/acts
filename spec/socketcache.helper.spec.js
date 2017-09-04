let ASSERT = require('assert');

describe('Socket Cache Specs', function () {
    const SocketCache = require('./../src/common/socketcache.helper');
    const SOCKET = {
        id: 'test'
    }

    it('add and get sockets', function () {
        SocketCache.addSocketIfNotExists(SOCKET);
        let s = SocketCache.getSocket(SOCKET);
        ASSERT.equal(s.id, SOCKET.id, '');
        let idx = SocketCache.getSocket(SOCKET, true);
        ASSERT.equal(idx, 0, '');
        SocketCache.removeSocket(SOCKET);
        s = SocketCache.getSocket(SOCKET);
        ASSERT.equal(s, null, '');
        idx = SocketCache.getSocket(SOCKET, true);
        ASSERT.equal(idx, null, '');
    });
});