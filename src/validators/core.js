/**
 * @file Core Validators
 */

/**
 * Base Validation Interface
 * @class
 */
export class Validator {
    constructor(messages) {
        this.error = null;
        this.messages = {
            required: "This field is required."
        };

        Object.assign(this.messages, messages);
    }

    validate(value) {
        return true;
    }
}

/**
 * RequiredValidator - Validate the existance of a value
 * @class
 */
export class RequiredValidator extends Validator {
    validate(value) {
        if (!value && value !== 0) {
            this.error = this.messages.required;
            return false;
        }

        return true;
    }
}

/**
 * BooleanRequiredValidator - Validate the existance of a value
 * @class
 */
export class BooleanRequiredValidator extends Validator {
    validate(value) {
        if (!(value === true || value === false)) {
            this.error = this.messages.required;
            return false;
        }

        return true;
    }
}

/**
 * BooleanTrueValidator - Validate the existance of a true value
 * @class
 */
export class BooleanTrueValidator extends Validator {
    validate(value) {
        if (value !== true) {
            this.error = this.messages.required;
            return false;
        }

        return true;
    }
}

/**
 * LengthValidator - Validate the length of a string
 * @class
 */
export class LengthValidator extends Validator {
    constructor({ min = null, max = null, messages = null }) {
        super(messages);
        this.min = min;
        this.max = max;

        if (!this.messages.hasOwnProperty("minLength")) {
            this.messages.minLength = `Length must be at least ${this.min}!`;
        }

        if (!this.messages.hasOwnProperty("maxLength")) {
            this.messages.maxLength = `Length must be no more than ${
                this.max
            }!`;
        }
    }

    validate(value) {
        if (!value) {
            this.error = this.messages.required;
            return false;
        }

        if (this.min && value.length < this.min) {
            this.error = this.messages.minLength;
            return false;
        }

        if (this.max && value.length > this.max) {
            this.error = this.messages.maxLength;
            return false;
        }

        return true;
    }
}

/**
 * IntegerValidator - Validate the integer is of a correct type
 * @class
 */
export class IntegerValidator extends Validator {
    constructor(messages) {
        super(messages);

        if (!this.messages.hasOwnProperty("intRequired")) {
            this.messages.intRequired = `Value must be an integer`;
        }
    }

    validate(value) {
        // NOTE: We only check it's an integer IF we
        // have a value.
        if (value && isNaN(value)) {
            this.error = this.messages.intRequired;
            return false;
        }

        return true;
    }
}

/**
 * RegexValidator - Validate the value against a regular expression
 * @class
 */
export class RegexValidator extends Validator {
    constructor(pattern, messages) {
        super(messages);
        this.pattern = pattern;

        if (!this.messages.hasOwnProperty("invalidPattern")) {
            let msg = `Value must match the pattern: ${this.pattern}`;
            this.messages.invalidPattern = msg;
        }
    }

    validate(value) {
        if (!value) {
            this.error = this.messages.required;
            return false;
        }

        if (!value.match(this.pattern)) {
            this.error = this.messages.invalidPattern;
            return false;
        }

        return true;
    }
}
