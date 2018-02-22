"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var config_1 = require("./../config");
var logger_1 = require("./logger");
var PushBullet = require("pushbullet");
var handlebars = require("handlebars");
var fs = require("fs");
// import fs  = require( 'fs' );
var Reporter = /** @class */ (function () {
    function Reporter() {
        this.successTplSource = null;
        this.logTplSource = null;
        this._preparePushBullet();
    }
    Reporter.prototype.report = function (type, data) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this[type + "Report"](data)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    Reporter.prototype.appreciationReport = function (params) {
        var _this = this;
        var template;
        var msg;
        var compile = function (error, source, resolve) {
            if (error) {
                throw new Error(error);
            }
            _this.logTplSource = source;
            var template = handlebars.compile(source);
            var msg = template(params);
            logger_1.default.info(msg);
        };
        return new Promise(function (resolve, reject) {
            if (_this.logTplSource) {
                compile(null, _this.logTplSource, resolve);
            }
            else {
                fs.readFile('./sources/templates/report-appreciation.tpl.html', 'utf-8', function (err, src) {
                    compile(err, src, resolve);
                });
            }
        });
    };
    Reporter.prototype.sellReport = function (params) {
        var _this = this;
        var msg;
        var template;
        var compile = function (error, source, resolve, reject) {
            if (error) {
                throw new Error(error);
            }
            template = handlebars.compile(source);
            msg = template(params);
            logger_1.default.success(msg);
            _this.pushBulletPusher.note(_this.pushBulletDevice, "Trailing stop order fulfilled", msg, function (error, response) {
                if (error) {
                    var errorMsg = "An error has occurred on trying to push a note to PushBullet. Details: " + error;
                    logger_1.default.error(errorMsg);
                    if (reject) {
                        reject(errorMsg);
                    }
                }
            });
            _this.successTplSource = source;
            if (resolve) {
                resolve();
            }
        };
        return new Promise(function (resolve, reject) {
            if (_this.successTplSource) {
                compile(null, _this.successTplSource, resolve, reject);
            }
            else {
                fs.readFile('./sources/templates/report-success.tpl.html', 'utf-8', function (err, src) {
                    compile(err, src, resolve, reject);
                });
            }
        });
    };
    Reporter.prototype._preparePushBullet = function () {
        this.pushBulletPusher = new PushBullet(config_1.default.reporter.pushBullet.APIKEY);
        this.pushBulletDevice = config_1.default.reporter.pushBullet.deviceIden;
        // this.pushBulletPusher.devices(function (err, resp) { 
        //     console.log( resp.devices );
        // });
    };
    return Reporter;
}());
var instance = null;
var obj = {
    getInstance: function () {
        instance = instance || new Reporter();
        return instance;
    }
};
exports.default = obj;
//# sourceMappingURL=reporter.js.map