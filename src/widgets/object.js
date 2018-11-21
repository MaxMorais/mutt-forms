/**
 * @file Object input widget
 */

"use strict";

import { Widget } from "./core";

/**
 * ObjectInput - Render a list of fields
 * @class
 */
export class ObjectInput extends Widget {
    renderObjectFields(wrapper, fields, allowedFields = null) {
        // Objects need to be ordered on output, we create a list to
        // order them by, then render each in that order
        let orderedFields = [];

        for (const key of Object.keys(fields)) {
            if (allowedFields) {
                if (!Object.keys(allowedFields).includes(key)) {
                    continue;
                }
            }

            let field = fields[key];
            orderedFields.push([field.getSortOrder(), key]);
        }

        orderedFields.sort(function(a, b) {
            return a[0] - b[0];
        });

        for (const fieldOrderKey of orderedFields) {
            let [, key] = fieldOrderKey;
            const renderedField = fields[key].render();
            wrapper.appendChild(renderedField);
        }
    }

    /**
     * Render the object input fields
     */
    renderObject(fields) {
        // Create a fragment for our widget
        let widgetFragment = document.createDocumentFragment();

        let wrapper = this.renderWrapper();

        // Check if we are rendering into fieldsets or just
        // are regular object
        if (this.options.fieldsets) {
            let fieldsetIndex = 0;
            for (let fieldset of this.options.fieldsets) {
                let fieldsetElement = document.createElement("fieldset");
                fieldsetElement.classList.add("mutt-fieldset");
                fieldsetElement.setAttribute(
                    "name",
                    `${this.name}-fieldset-${fieldsetIndex}`
                );

                if (fieldset.hasOwnProperty("options")) {
                    if (
                        fieldset.options.hasOwnProperty("class") &&
                        fieldset.options.class
                    ) {
                        if (fieldset.options.class.includes(" ")) {
                            let classes = fieldset.options.class.split(" ");
                            for (let className of classes) {
                                fieldsetElement.classList.add(className);
                            }
                        } else {
                            fieldsetElement.classList.add(
                                fieldset.options.class
                            );
                        }
                    }
                }

                this.renderObjectFields(
                    fieldsetElement,
                    fields,
                    fieldset.fields
                );

                wrapper.appendChild(fieldsetElement);

                fieldsetIndex++;
            }
        } else {
            this.renderObjectFields(wrapper, fields);
        }

        widgetFragment.appendChild(wrapper);

        this._rendered = true;

        return widgetFragment;
    }

    render() {
        throw new Error(
            "ObjectInput must render as a object - use renderObject"
        );
    }

    renderLabel() {
        throw new Error("ObjectInput does not support a label!");
    }

    /**
     * Get the class name for the widget element
     */
    getFieldClass() {
        return "mutt-field mutt-field-object";
    }
}
