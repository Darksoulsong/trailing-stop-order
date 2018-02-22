"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// import { winston, transports, Logger } from 'winston';
var winston = require("winston");
var winstonRotator = require("winston-daily-rotate-file");
var datePattern = "dd-MM-yyyy-";
var logsDir = 'logs/';
var consoleConfig = [
    new winston.transports.Console({
        'colorize': true
    })
];
function createLogger(type) {
    var loggerInstance = new winston.Logger({
        'transports': consoleConfig
    });
    var typeToLevel = {
        'info': 'info',
        'error': 'error',
        'success': 'info'
    };
    loggerInstance.add(winstonRotator, {
        'name': typeToLevel[type] + "-file",
        'level': "" + typeToLevel[type],
        'filename': logsDir + "report-" + type + ".log",
        'json': false,
        'datePattern': datePattern,
        'prepend': true
    });
    return loggerInstance;
}
var infoLogger = createLogger('info');
var errorLogger = createLogger('error');
var successLogger = createLogger('success');
var logger = {
    info: function (msg) {
        infoLogger.info(msg);
    },
    error: function (msg) {
        errorLogger.error(msg);
    },
    success: function (msg) {
        successLogger.info(msg);
    }
};
exports.default = logger;
//# sourceMappingURL=logger.js.map