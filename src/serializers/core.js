/**
 * @file Core Serializers
 */

/**
 * Base Validation Interface
 * @class
 */
export class Serializer {
    constructor(value, options = {}) {
        this.value = value;
        this.options = options;
    }

    serialize() {
        return this.value;
    }
}

/**
 * TrimSerializer - Remove spaces from a string
 * @class
 */
export class TrimSerializer extends Serializer {
    serialize() {
        return this.value.toString().trim();
    }
}
