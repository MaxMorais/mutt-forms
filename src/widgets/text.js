/**
 * @file Text input widget interface
 */

"use strict";

import { Widget } from "./core";

/**
 * TextInput - Standard HTML text input
 * @class
 */
export class TextInput extends Widget {
    /**
     * Render the text input field
     * @returns {HTMLElement} render the input widget
     */
    renderField() {
        let textInput = document.createElement("input");
        textInput.setAttribute("name", this.name);
        textInput.setAttribute("type", "text");
        textInput.setAttribute("value", this.value ? this.value : "");
        textInput.setAttribute("class", this.getFieldClass());

        for (const attrib in this.attribs) {
            textInput.setAttribute(attrib, this.attribs[attrib]);
        }

        return textInput;
    }

    /**
     * Get the class name for the widget element
     */
    getFieldClass() {
        return "mutt-field mutt-field-text";
    }
}

/**
 * TextAreaInput - Standard HTML textarea input
 * @class
 */
export class TextAreaInput extends Widget {
    /**
     * Render the text input field
     */
    renderField() {
        let textareaInput = document.createElement("textarea");
        textareaInput.setAttribute("name", this.name);
        textareaInput.setAttribute("class", this.getFieldClass());
        textareaInput.textContent = this.value ? this.value : "";

        for (const attrib in this.attribs) {
            textareaInput.setAttribute(attrib, this.attribs[attrib]);
        }

        return textareaInput;
    }

    /**
     * Get the class name for the widget element
     */
    getFieldClass() {
        return "mutt-field mutt-field-text";
    }
}

/**
 * EmailInput - Standard HTML text input
 * @class
 */
export class EmailInput extends TextInput {
    /**
     * Render the text input field
     */
    renderField() {
        let textInput = document.createElement("input");
        textInput.setAttribute("name", this.name);
        textInput.setAttribute("type", "email");
        textInput.setAttribute("value", this.value ? this.value : "");
        textInput.setAttribute("class", this.getFieldClass());

        for (const attrib in this.attribs) {
            textInput.setAttribute(attrib, this.attribs[attrib]);
        }

        return textInput;
    }

    /**
     * Get the class name for the widget element
     */
    getFieldClass() {
        return "mutt-field mutt-field-email";
    }
}

/**
 * HiddenInput - Standard HTML hidden input
 * @class
 */
export class HiddenInput extends Widget {
    constructor(field, type, id, name, label, attribs, options, value) {
        super(field, type, id, name, label, attribs, options, value);
        this.choices = [];
    }

    /**
     * Render the text input field
     */
    renderField() {
        let textInput = document.createElement("input");
        textInput.setAttribute("name", this.name);
        textInput.setAttribute("type", "hidden");
        textInput.setAttribute("value", this.value ? this.value : "");
        textInput.setAttribute("class", this.getFieldClass());

        for (const attrib in this.attribs) {
            textInput.setAttribute(attrib, this.attribs[attrib]);
        }

        return textInput;
    }

    /**
     * Label is not used for hidden fields
     */
    renderLabel() {
        return null;
    }

    /**
     * Errors are not shown for hidden fields
     */
    renderErrors() {
        return null;
    }

    /**
     *
     * @params {array}
     */
    setChoices(choices) {
        this.choices = choices;
    }

    /**
     * Get the choices used by the widget
     * @returns {array} choice pair array
     */
    getChoices() {
        return this.choices;
    }
}

/**
 * PasswordInput - Standard HTML password input
 * @class
 */
export class PasswordInput extends TextInput {
    /**
     * Render the text input field
     */
    renderField() {
        let textInput = document.createElement("input");
        textInput.setAttribute("name", this.name);
        textInput.setAttribute("type", "password");
        textInput.setAttribute("value", this.value ? this.value : "");
        textInput.setAttribute("class", this.getFieldClass());

        for (const attrib in this.attribs) {
            textInput.setAttribute(attrib, this.attribs[attrib]);
        }

        return textInput;
    }

    /**
     * Get the class name for the widget element
     */
    getFieldClass() {
        return "mutt-field mutt-field-password";
    }
}

/**
 * DisplayWidget - Display only widget, this just shows the field as
 * plain text. Typically used by the lock form utility.
 */
export function displayReadonlyValue(value) {
    let display = document.createElement("span");

    // TODO: Support for the class being set dynamically
    display.setAttribute("class", "mutt-field mutt-field-display");
    display.textContent = value;

    return display;
}

/**
 * DisplayWidget - Widget to display field as plain text
 * @class
 */
export class DisplayWidget extends Widget {
    /**
     * Render the text input field
     */
    renderField() {
        return displayReadonlyValue(this.value);
    }

    /**
     * Get the class name for the widget element
     */
    getFieldClass() {
        return "mutt-field mutt-field-display";
    }
}
