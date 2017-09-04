let ASSERT = require('assert');

describe('Request Helper Specs', function () {
    const RequestHelper = require('./../src/common/request.helper');
    const RES = {
        header: {},
        end: function () {
            this.endiscalled = true
        },
        setHeader: function (key, value) {
            this.header[key] = value;
        }
    };

    it('test 200', function () {
        RequestHelper.ok({}, RES);
        ASSERT.equal(RES.statusCode, 200, '');
        ASSERT.equal(RES.endiscalled, true, '');
    });

    it('test 405', function () {
        RequestHelper.notAllowedMethod({}, RES);
        ASSERT.equal(RES.statusCode, 405, '');
        ASSERT.equal(RES.endiscalled, true, '');
    });

    it('test 500', function () {
        RequestHelper.internalError({}, RES);
        ASSERT.equal(RES.statusCode, 500, '');
        ASSERT.equal(RES.endiscalled, true, '');
    });

    it('test 400', function () {
        RequestHelper.externalError({}, RES);
        ASSERT.equal(RES.statusCode, 400, '');
        ASSERT.equal(RES.endiscalled, true, '');
    });

    it('test 307', function () {
        RequestHelper.redirect({}, RES, 'testlocation');
        ASSERT.equal(RES.statusCode, 307, '');
        ASSERT.equal(RES.endiscalled, true, '');
        ASSERT.equal(RES.header.Location, 'testlocation', '');
    });
});