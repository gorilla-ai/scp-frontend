'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Validation = exports.validationRules = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var defaultRules = {
    required: {
        rule: function rule(value) {
            return value !== undefined && value !== '';
        },
        message: '欄位為必填'
    },
    alphabetic: {
        rule: function rule(value) {
            if (value === undefined || value === "") return true;
            return isNaN(value);
        },
        message: '欄位必須為數字'
    },
    noDot: {
        rule: function rule(value) {
            if (value === undefined || value === "") return true;
            return value.indexOf(".") === -1;
        },
        message: '欄位不可包含點'
    },
    lowercase: {
        rule: function rule(value) {
            var toLowercase = value.toLowerCase();
            return toLowercase === value;
        },
        message: '欄位必須小寫'
    },
    firstLowercase: {
        rule: function rule(value) {
            if (value === undefined || value === "") return true;
            var toLowercase = value[0].toLowerCase();
            return toLowercase === value[0];
        },
        message: '欄位第一個字母小寫'
    },
    twid: {
        rule: function rule(value) {
            if (value === undefined || value === "") return true;
            var city = [1, 10, 19, 28, 37, 46, 55, 64, 39, 73, 82, 2, 11, 20, 48, 29, 38, 47, 56, 65, 74, 83, 21, 3, 12, 30];
            var id = value.toUpperCase();
            if (id.search(/^[A-Z](1|2)\d{8}$/i) === -1) {
                return false;
            } else {
                id = id.split('');
                var total = city[id[0].charCodeAt(0) - 65];
                for (var i = 1; i <= 8; i++) {
                    total += eval(id[i]) * (9 - i);
                }
                total += eval(id[9]);
                return total % 10 === 0;
            }
        },
        message: '欄位不符身分證格式'
    },
    birthday: {
        rule: function rule(value) {
            if (value === undefined || value === "") return true;
            var momentDate = (0, _moment2.default)(value, 'YYYY-MM-DD').format('YYYY-MM-DD');
            return momentDate === value && (0, _moment2.default)(momentDate).isBefore((0, _moment2.default)());
        },
        message: '欄位格式不符(ex.1990-01-01)或使用未來時間'
    },
    date: {
        rule: function rule(value) {
            if (value === undefined || value === "") return true;
            return (0, _moment2.default)(value, 'YYYY-MM-DD').format('YYYY-MM-DD') === value;
        },
        message: '欄位格式不符(ex.1990-01-01)'
    }
};
var validationRules = exports.validationRules = {
    REQUIRED: 'required',
    ALPHABETIC: 'alphabetic',
    NO_DOT: 'noDot',
    LOWERCASE: 'lowercase',
    FIRST_LOWERCASE: 'firstLowercase',
    TWID: 'twid',
    BIRTHDAY: 'birthday',
    DATE: 'date'
};

var Validation = exports.Validation = function () {
    function Validation() {
        _classCallCheck(this, Validation);
    }

    _createClass(Validation, null, [{
        key: 'validateWithErrorMessage',

        // static validateWithErrorList(value, validation, fieldName) {//驗證並回傳ErrorList
        //     let errorList = []
        //     if (validation === undefined)//免驗證
        //         return errorList
        //     _.map(validation, (validation) => {
        //         if (!defaultRules[validation].rule(value)) {
        //             errorList.push({
        //                 fieldName,
        //                 massage: defaultRules[validation].message
        //             })
        //         }
        //     })
        //     return errorList
        // }
        value: function validateWithErrorMessage(value, validations, fieldName) {
            //驗證並回傳ErrorList
            if (_lodash2.default.isEmpty(validations)) //免驗證
                return '';
            var errorMsg = null;
            _lodash2.default.forEach(validations, function (validation) {
                if (!errorMsg) {
                    if (!defaultRules[validation].rule(value)) {
                        // console.log(validation)
                        // console.log(fieldName + defaultRules[validation].message)
                        errorMsg = fieldName + defaultRules[validation].message;
                    }
                } else return false;
            });
            return errorMsg;
        }
    }]);

    return Validation;
}();