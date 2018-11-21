/**
 * @file Button widget interface
 */

"use strict";

import { Widget } from "./core";

/**
 * Button - Standard HTML Button
 * @class
 */
export class ButtonWidget extends Widget {
    /**
     * Render the button field
     * @returns {HTMLElement} render the button widget
     */
    renderField() {
        let button = document.createElement("button");
        button.setAttribute("type", "button");
        button.setAttribute("class", this.getFieldClass());

        for (const attrib in this.attribs) {
            button.setAttribute(attrib, this.attribs[attrib]);
        }

        return button;
    }

    /**
     * Get the class name for the widget element
     */
    getFieldClass() {
        return "mutt-field mutt-field-button";
    }
}
