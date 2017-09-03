module.exports.GET = function (req, res, next) {
    next('test ok');
};

module.exports.POST = function (req, res, next) {
    next(req.body);
};

module.exports.PUT = function (req, res, next) {
    next(req.body);
};

module.exports.PATCH = function (req, res, next) {
    next(req.body);
};

module.exports.DELETE = function (req, res, next) {
    next('delete ok');
};