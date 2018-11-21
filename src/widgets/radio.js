/**
 * @file HTML Radio widget
 */

"use strict";

import { BaseChoiceWidget } from "./choice";

/**
 * RadioInput - Standard HTML radio input
 * @class
 */
export class RadioInput extends BaseChoiceWidget {
    /**
     *
     */
    constructor(field, type, id, name, label, attribs, options, value) {
        super(field, type, id, name, label, attribs, options, value);

        // Booleans do not have choices, so we must contrive
        // them if they aren't already set
        if (this.type === "boolean") {
            if (options.hasOwnProperty("choices")) {
                this.choices = options.choices;
            } else {
                this.choices = [[true, "Yes"], [false, "No"]];
            }
        }
    }

    /**
     * Render the radio input field
     */
    renderField() {
        let radioInputListWrapper = document.createElement("div");
        let index = 0;

        for (let choice of this.choices) {
            let [value, label] = choice;
            let fieldId = `${this.id}_${index}`;

            let radioInputWrapper = document.createElement("div");
            radioInputWrapper.setAttribute("class", "mutt-field-radio-item");

            let radioInput = document.createElement("input");
            radioInput.setAttribute("id", fieldId);
            radioInput.setAttribute("type", "radio");
            radioInput.setAttribute("name", this.id);
            radioInput.setAttribute("value", value);
            radioInput.setAttribute("class", this.getFieldClass());

            // Radio buttons may be used to drive UI events, if a
            // callback is specified, bind it to the elements as
            // they are being created.
            if (this.options.hasOwnProperty("callback")) {
                radioInput.onclick = () => {
                    return this.options.callback(this);
                };
            }

            if (this.attribs) {
                for (let attrib in this.attribs) {
                    radioInput.setAttribute(attrib, this.attribs[attrib]);
                }
            }

            if (this.value === value) {
                radioInput.setAttribute("checked", "checked");
            }

            let radioInputLabel = document.createElement("label");
            radioInputLabel.setAttribute("for", fieldId);
            radioInputLabel.textContent = this.formatLabel(label);

            radioInputWrapper.appendChild(radioInput);
            radioInputWrapper.appendChild(radioInputLabel);

            radioInputListWrapper.appendChild(radioInputWrapper);

            index++;
        }

        return radioInputListWrapper;
    }

    /**
     * Get the value of the item. Radio buttons require an overide as
     * there are multiple elements on the page, we must attempt to get
     * the selected one
     */
    getRadioValue() {
        let selectedElement = this.getElementWrapper().querySelector(
            ".mutt-field:checked"
        );

        if (!selectedElement) {
            return null;
        }

        this.value = selectedElement.value;

        return this.value;
    }

    getValue() {
        return this.getRadioValue();
    }

    /**
     * Get the class name for the widget element
     */
    getFieldClass() {
        return "mutt-field mutt-field-radio";
    }
}
