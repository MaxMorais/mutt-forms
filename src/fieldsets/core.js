/**
 * @file Fieldset Interface
 */

"use strict";

import { Field } from "../fields/core";

/**
 * Fieldset wrapper class
 * @class
 */
export class Fieldset {
    /**
     * Setup the fieldset class
     * @constructor
     * @param {string} label the label of the fieldset, typically
     * used for legends
     * @param {string} name the name of the fieldset
     */
    constructor({ label = null, name = null }) {
        this.name = name;
        this.label = label;
        this.fields = [];
        this.errors = {};
    }

    /**
     * Add a field to the fieldset
     * @param {field} field object to add to the fieldset
     */
    addField(field) {
        this.fields.push(field);
    }

    /**
     * Check if a fieldset contains a field
     * @param {string} fieldName A Field name
     */
    hasField(fieldName) {
        for (const field in this.fields) {
            if (field.name === fieldName) {
                return true;
            }
        }

        return false;
    }

    /**
     * Get the data for the fieldset, this is returned as
     * an object with field -> value pairs
     * @returns {object}
     */
    data() {
        let data = {};

        for (const field of this.fields) {
            data[field.name] = field.getSerializedValue();
        }

        return data;
    }

    /**
     * Populate the fieldset with selected values
     * @param {object} data Data object with form values
     */
    populate(data) {
        for (let field of this.fields) {
            if (data.hasOwnProperty(field.name)) {
                field.value = data[field.name];
            }
        }
    }

    /**
     * Validate the fields in the fieldset. Stores an object
     * of error information field name -> error.
     * @returns {boolean}
     */
    validate() {
        let valid = true;

        for (let field of this.fields) {
            if (!field.validate()) {
                this.errors[field.name] = field.errors;
                valid = false;
            }
        }

        return valid;
    }

    /**
     * Set errors on the fields
     * @param {object} errors Object with error information
     */
    setFieldErrors(errors) {
        for (const errorField in errors) {
            if (this.hasField(errorField)) {
                this.getField(errorField);
            }
        }
    }

    /**
     * Set the legend on the form
     * @param {string} legend text to be used for the fieldset legend
     */
    setLegend(legend) {
        this.label = legend;
    }

    /**
     * Refresh the validation state on all of the fields in the fieldset
     */
    refreshValidationState() {
        this.errors = {};

        for (const field of this.fields) {
            field.refreshValidationState();
        }
    }

    /**
     * Render the fieldset and return a document fragment
     * @returns {HTMLFragment}
     */
    render() {
        let fieldsetContainer = document.createDocumentFragment();
        let fieldset = document.createElement("fieldset");
        fieldset.classList.add("mutt-fieldset");

        if (this.name) {
            fieldset.setAttribute("name", this.name);
        }

        if (this.label) {
            let legend = document.createElement("legend");
            legend.textContent = this.label;
            fieldset.appendChild(legend);
        }

        this.fields.sort(function(a, b) {
            return a.getSortOrder() - b.getSortOrder();
        });

        for (const field of this.fields) {
            let fieldElement = field.render();
            fieldset.appendChild(fieldElement);
        }

        fieldsetContainer.appendChild(fieldset);

        return fieldsetContainer;
    }

    /**
     * Callback triggered after the element has been rendered to
     * the stage
     */
    postRender() {
        for (const field of this.fields) {
            field.postRender();
        }
    }

    /**
     * Lock all of the fields in the fieldset
     */
    lock() {
        for (const field of this.fields) {
            field.lock();
        }
    }

    /**
     * Unlock all the fields in the fieldset
     */
    unlock() {
        for (const field of this.fields) {
            field.unlock();
        }
    }

    /**
     * Get a field in the form by it's path. Paths should be
     * provided in 'dot' notation - i.e "some.example.path"
     * @params {string} path dot notation path to field to search for
     * @returns {Field} field returns a field class
     */
    getFieldByPath(path) {
        let pathParts = path.split(".");
        let searchName = pathParts.shift();

        for (const field of this.fields) {
            if (field.name === searchName) {
                const fieldProto = field.constructor.prototype;
                if (pathParts.length === 0) {
                    return field;
                } else if (fieldProto.hasOwnProperty("getFieldByPath")) {
                    return field.getFieldByPath(pathParts.join("."));
                }
            }
        }

        return null;
    }

    /**
     * Create a new fieldset class from a JSON Schema
     * @staticmethod
     * @params {object} schema JSON schema for the fieldset spec
     * @params [object] options options for fields and the fieldset
     * @params [string] name of the fieldset(added as class)
     * @params [string] label optional label for the fieldset
     */
    static new(schema, options = {}, fields = null, name = null, label = null) {
        let fieldsetSpec = {
            name
        };

        if (schema.hasOwnProperty("title")) {
            fieldsetSpec.label = schema.title;
        }

        if (options.hasOwnProperty("form")) {
            if (options.form.hasOwnProperty("label")) {
                fieldsetSpec.label = options.form.label;
            }
        }

        if (label !== null) {
            fieldsetSpec.label = label;
        }

        Object.assign(fieldsetSpec, options);

        if (schema.hasOwnProperty("properties")) {
            schema = schema.properties;
        }

        let fieldset = new Fieldset(fieldsetSpec);
        let fieldIndex = 1;

        for (const fieldName of Object.keys(schema)) {
            let fieldId = `${fieldName}_field_${fieldIndex}`;
            let fieldSchema = schema[fieldName];
            let fieldOptions = {};

            // If a set of fields is specified, we only allow
            // these to be created
            if (fields) {
                if (!Object.keys(fields).includes(fieldName)) {
                    continue;
                }
            }

            if (options.fields) {
                if (options.fields.hasOwnProperty(fieldName)) {
                    fieldOptions = options.fields[fieldName];
                }
            }

            if (options.fieldsets) {
                fieldOptions.fieldsets = options.fieldsets;
            }

            let field = Field.new(
                fieldId,
                fieldName,
                fieldSchema,
                fieldOptions
            );

            if (field) {
                // Only set the sort order if this wasn't set previously,
                // this may of been set by options
                if (!field.getSortOrder()) {
                    field.setSortOrder(fieldIndex);
                }

                fieldset.addField(field);
                fieldIndex++;
            }
        }

        return fieldset;
    }
}
