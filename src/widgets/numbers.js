/**
 * @file Number input widget
 */

"use strict";

import { Widget } from "./core";

/**
 * NumberInput - Standard HTML number input
 * @class
 */
export class NumberInput extends Widget {
    /**
     * Render the text input field
     */
    renderField() {
        let textInput = document.createElement("input");
        textInput.setAttribute("name", this.name);
        textInput.setAttribute("type", "number");
        textInput.setAttribute("inputmode", "numeric");
        textInput.setAttribute("class", this.getFieldClass());
        textInput.setAttribute("value", this.value !== null ? this.value : "");

        // iOS doesn't fire the numerical keyboard for an type="number"
        // by default, adding the pattern forces the numerical keyboard
        // to be fired over the alpha one
        textInput.setAttribute("pattern", "[0-9]*");

        for (const attrib in this.attribs) {
            textInput.setAttribute(attrib, this.attribs[attrib]);
        }

        return textInput;
    }

    /**
     * Get the class name for the widget element
     */
    getFieldClass() {
        return "mutt-field mutt-field-number";
    }
}

/**
 * CurrencyInput
 * @class
 */
export class CurrencyInput extends Widget {
    /**
     * Render the text input field
     */
    renderField() {
        let textInput = document.createElement("input");
        textInput.setAttribute("name", this.name);
        textInput.setAttribute("type", "number");
        textInput.setAttribute("inputmode", "numeric");
        textInput.setAttribute("class", this.getFieldClass());
        textInput.setAttribute("value", this.value !== null ? this.value : "");

        // See note for NumberInput....
        textInput.setAttribute("pattern", "[0-9]*");

        for (const attrib in this.attribs) {
            textInput.setAttribute(attrib, this.attribs[attrib]);
        }

        return textInput;
    }

    /**
     * Get the value of the field. This will remove a currency
     * symbol and round to two decimal places.
     */
    getValue() {
        let value = super.getValue();

        if (value) {
            value = parseFloat(value);
            value = value.toFixed(2);
        }

        return parseFloat(value);
    }

    /**
     * Get the class name for the widget element
     */
    getFieldClass() {
        return "mutt-field mutt-field-currency";
    }
}
