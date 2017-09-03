const ASSERT = require('assert');

describe('Object Helper Specs', function () {
    const HELPER = require('./../src/common/object.helper');
    let src = null;

    beforeEach(function () {
        src = {a:'b'};
    });

    it('add new propeties to object', function () {
        HELPER.objectCombine(src, {b:'c'});
        ASSERT.deepEqual(src, {a:'b', b:'c'}, 'objects are not the same');
    });

    it('overwrite properties in object', function () {
        HELPER.objectCombine(src, {a:'c'});
        ASSERT.deepEqual(src, {a:'c'}, 'objects are not the same');
    });
});