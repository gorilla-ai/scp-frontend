import _ from 'lodash'
import moment from 'moment'

let defaultRules = {
    required: {
        rule: (value) => {
            return value !== undefined && value !== ''
        },
        message: '欄位為必填'
    },
    alphabetic: {
        rule: (value) => {
            if (value === undefined || value === "")
                return true;
            return isNaN(value)
        },
        message: '欄位必須為數字'
    },
    noDot: {
        rule: (value) => {
            if (value === undefined || value === "")
                return true;
            return value.indexOf(".") === -1;
        },
        message: '欄位不可包含點'
    },
    lowercase: {
        rule: (value) => {
            let toLowercase = value.toLowerCase()
            return toLowercase === value;
        },
        message: '欄位必須小寫'
    },
    firstLowercase: {
        rule: (value) => {
            if (value === undefined || value === "")
                return true;
            let toLowercase = value[0].toLowerCase()
            return toLowercase === value[0];
        },
        message: '欄位第一個字母小寫'
    },
    twid: {
        rule: (value) => {
            if (value === undefined || value === "")
                return true;
            var city = [1, 10, 19, 28, 37, 46, 55, 64, 39, 73, 82, 2, 11,
                20, 48, 29, 38, 47, 56, 65, 74, 83, 21, 3, 12, 30]
            let id = value.toUpperCase();
            if (id.search(/^[A-Z](1|2)\d{8}$/i) === -1) {
                return false;
            } else {
                id = id.split('');
                var total = city[id[0].charCodeAt(0) - 65];
                for (var i = 1; i <= 8; i++) {
                    total += eval(id[i]) * (9 - i);
                }
                total += eval(id[9]);
                return ((total % 10 === 0));
            }
        },
        message: '欄位不符身分證格式'
    },
    birthday: {
        rule: (value) => {
            if (value === undefined || value === "")
                return true;
            let momentDate = moment(value, 'YYYY-MM-DD').format('YYYY-MM-DD')
            return momentDate === value && moment(momentDate).isBefore(moment())
        },
        message: '欄位格式不符(ex.1990-01-01)或使用未來時間'
    },
    date: {
        rule: (value) => {
            if (value === undefined || value === "")
                return true;
            return moment(value, 'YYYY-MM-DD').format('YYYY-MM-DD') === value
        },
        message: '欄位格式不符(ex.1990-01-01)'
    },
}
export const validationRules = {
    REQUIRED: 'required',
    ALPHABETIC: 'alphabetic',
    NO_DOT: 'noDot',
    LOWERCASE: 'lowercase',
    FIRST_LOWERCASE: 'firstLowercase',
    TWID: 'twid',
    BIRTHDAY: 'birthday',
    DATE: 'date',
}

export class Validation {
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
    static validateWithErrorMessage(value, validations, fieldName) {//驗證並回傳ErrorList
        if (_.isEmpty(validations))//免驗證
            return ''
        let errorMsg = null
        _.forEach(validations, validation => {
            if (!errorMsg) {
                if (!defaultRules[validation].rule(value)) {
                    // console.log(validation)
                    // console.log(fieldName + defaultRules[validation].message)
                    errorMsg = fieldName + defaultRules[validation].message
                }
            }
            else
                return false
        })
        return errorMsg
    }
}