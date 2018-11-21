/**
 * @file Integer Field
 */

"use strict";

import Mutt from "../index";
import { Field } from "./core";
import { IntegerValidator } from "../validators/core";

/**
 * Integer Field, used to input integer values
 * @class
 */
export class IntegerField extends Field {
    constructor({
        id,
        name,
        label = null,
        initial = null,
        widget = null,
        validators = [],
        attribs = {},
        description = null,
        options = {},
        order = null,
        parent = null
    }) {
        super({
            id,
            name,
            label,
            initial,
            widget,
            validators,
            attribs,
            description,
            options,
            order,
            parent
        });

        // Always append an integer validator
        this.validators.push(new IntegerValidator());
    }

    /**
     * Property - get/set value
     */
    get value() {
        let value = this.widget.getValue();

        // Widgets deal with the HTML value, which
        // can not represent an integer. Coerce to
        // the expected type
        if (!value && value !== 0) {
            return "";
        }

        return parseInt(value);
    }

    set value(value) {
        this.widget.setValue(value);
    }

    /**
     *
     */
    getWidget() {
        return Mutt.config.getWidget("number");
    }
}
