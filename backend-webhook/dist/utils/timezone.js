"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBrazilTime = getBrazilTime;
exports.formatBrazilTime = formatBrazilTime;
const moment_timezone_1 = __importDefault(require("moment-timezone"));
function getBrazilTime() {
    return (0, moment_timezone_1.default)().tz('America/Sao_Paulo').toDate();
}
function formatBrazilTime(date) {
    return (0, moment_timezone_1.default)(date).tz('America/Sao_Paulo').format('YYYY-MM-DD HH:mm:ss');
}
