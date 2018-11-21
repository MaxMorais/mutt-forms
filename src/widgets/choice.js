/**
 * @file Choice Widgets
 */

"use strict";

import { Widget } from "./core";

/**
 * BaseChoiceWidget - Abstract input for choice fields
 * @class
 * @abstract
 */
export class BaseChoiceWidget extends Widget {
    /**
     * Abstract class for managing widgets with choices, such as selects
     * @constructor
     * @param {Field} field - fields object widget is bound too
     * @param {string} type - name of field type
     * @param {string} id - ID of the field (used in HTML)
     * @param {string} name - name of the field (used in HTML)
     * @param [string] label - optional label for the field
     * @param [object] attribs - optional HTML attributes for the field
     * @param [object] options - optional values to configure the widget
     * @param [string] value - initial value for the widget
     */
    constructor(field, type, id, name, label, attribs, options, value) {
        super(field, type, id, name, label, attribs, options, value);
        this.choices = [];
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

    /**
     * Format the label text for display as a choice
     * @returns {string} formated label
     */
    formatLabel(label) {
        if (label) {
            label = label.toLowerCase().replace("_", " ");
            return `${label.charAt(0).toUpperCase()}${label.slice(1)}`;
        }

        return label;
    }

    /**
     * @throws Unable to render the field, must be overidden by a subclass
     */
    renderField() {
        throw new Error("Unable to render abstract widget BaseChoiceInput!");
    }
}
