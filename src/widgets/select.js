/**
 * @file Select input widget
 */

"use strict";

import { BaseChoiceWidget } from "./choice";

/**
 * SelectInput - Standard HTML select input
 * @class
 */
export class SelectInput extends BaseChoiceWidget {
    /**
     * Render the select field
     */
    renderField() {
        let selectInput = document.createElement("select");
        selectInput.setAttribute("name", this.name);
        selectInput.setAttribute("class", this.getFieldClass());

        for (let attrib in this.attribs) {
            selectInput.setAttribute(attrib, this.attribs[attrib]);
        }

        for (let choice of this.choices) {
            let [value, label] = choice;
            let option = document.createElement("option");
            option.value = value;
            option.textContent = this.formatLabel(label);

            if (this.value === value) {
                option.setAttribute("selected", "selected");
            }

            selectInput.appendChild(option);
        }

        return selectInput;
    }

    /**
     * Get the class name for the widget element
     */
    getFieldClass() {
        return "mutt-field mutt-field-select";
    }
}
