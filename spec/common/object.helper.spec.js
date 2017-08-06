describe('Object Helper Specs', function () {
    const HELPER = require('./../../src/common/object.helper');
    let src = null;

    beforeEach(function () {
        src = {a:'b'};
    });

    it('add new propeties to object', function () {
        HELPER.objectCombine(src, {b:'c'});
        expect(src).toEqual({a:'b', b:'c'});
    });

    it('overwrite properties in object', function () {
        HELPER.objectCombine(src, {a:'c'})
        expect(src).toEqual({a:'c'});
    });
});