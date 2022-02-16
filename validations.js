const validator = require('validator');

const validateEmail = (email) => {
    const errors = {};

    if (!validator.isEmail(email)) {
        errors.email = 'E-mail is invalid.'
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors
    }
}

const validatePassword = (password) => {
    const errors = {};

    if (!validator.isStrongPassword(password)) {
        errors.password = 'Password should have a minumum of 8 characters, ' + 
        '1 lowercase character, 1 uppercase character, 1 number, and 1 symbol.';
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors
    }
}

module.exports = {
    validateEmail,
    validatePassword
};