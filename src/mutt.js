/**
 * @file A simple HTML form interface, with a squishy face.
 * @author Nick Snell <nick@boughtbymany.com>
 * @copyright Bought By Many 2017
 */

"use strict";

import Mutt from "./index";
import { Fieldset } from "./fieldsets/core";

/**
 * Main Mutt form interface. This instance is used to build,
 * control & render the form
 * @class
 */
class MuttForm {
    /**
     * Initialisation of a Mutt form
     * @constructor
     * @param {object} schema JSON Schema containing Form & Field Configuration
     * @param {object} [options={}] form configuration options
     */
    constructor(schema, options = {}) {
        this.schema = schema;
        this.options = {};
        this.callbacks = {};

        if (options && options.hasOwnProperty("form")) {
            this.options = options.form;
        }

        this.mount = false;
        this.multipart = false;
        this.id = null;
        this.locked = false;

        this.form = null;
        this.fieldsets = [];
        this.buttons = { submit: null };

        // Build the form from the config
        this.build(schema, options);
    }

    /**
     * Build the form fieldsets from the config. The default is
     * always to use one, however groups can be specified in the
     * from options
     * @param {object} schema JSON schema of form
     * @param {object} [options=null] options object for the form
     */
    build(schema, options = null) {
        // TODO: Allow build options override

        // If fieldsets is specfied in the form options we are
        // going to attempt to build multiple ones
        if (options.hasOwnProperty("fieldsets")) {
            let fieldsetIndex = 0;

            for (let fieldsetSpec of options.fieldsets) {
                let fieldsetFields = null;
                let fieldsetLabel = null;

                if (fieldsetSpec.hasOwnProperty("fields")) {
                    fieldsetFields = fieldsetSpec.fields;
                }

                if (fieldsetSpec.hasOwnProperty("fieldsets")) {
                    options.fieldsets = fieldsetSpec.fieldsets;
                }

                if (
                    fieldsetSpec.options &&
                    fieldsetSpec.options.hasOwnProperty("label")
                ) {
                    fieldsetLabel = fieldsetSpec.options.label;
                }

                let fieldset = Fieldset.new(
                    schema,
                    options,
                    fieldsetFields,
                    `mutt-fieldset-${fieldsetIndex}`,
                    fieldsetLabel
                );

                this.fieldsets.push(fieldset);
                fieldsetIndex++;
            }
        } else {
            let fieldset = Fieldset.new(schema, options);

            this.fieldsets.push(fieldset);
        }
    }

    /**
     * Get the data from the form - this can be returned as a list
     * of objects, each object being a fieldsets data set. Or, by
     * default, as a merged object of all the data
     * @param {bool} [asList] Boolean to indicate if a list of fieldset
     * data is required. Default is to return a merged object.
     * @return {object} key/value data object for the form
     */
    data(asList = false) {
        if (asList) {
            let data = [];

            for (let fieldset of this.fieldsets) {
                data.push(fieldset.data());
            }

            return data;
        }

        let data = {};

        for (let fieldset of this.fieldsets) {
            data = Object.assign(data, fieldset.data());
        }

        return data;
    }

    /**
     * Populate the form field with selected values
     * @param {object} data Data object with form values
     */
    populate(data) {
        for (let fieldset of this.fieldsets) {
            fieldset.populate(data);
        }
    }

    /**
     * Render the form
     * @param {HTMLElement} mount Containing element for the Mutt Form
     * @return {Promise} a promise to be resolved once rendering
     * is complete
     */
    render(mount) {
        // Save the mount point...
        this.mount = mount;

        return new Promise(resolve => {
            let formContainer = document.createDocumentFragment();
            this.form = document.createElement("form");

            if (this.id) {
                this.form.setAttribute("id", this.id);
            }

            this.form.setAttribute("method", "POST");
            this.form.setAttribute("action", "");
            this.form.setAttribute("class", "mutt-form");

            if (this.multipart) {
                this.form.setAttribute("enctype", "multipart/form-data");
            }

            for (let fieldset of this.fieldsets) {
                let fieldsetElement = fieldset.render();
                this.form.appendChild(fieldsetElement);
            }

            // Add form controls
            let buttonClass = "mutt-button";
            let buttonText = "Submit";

            // Check for button overide options
            if (this.options.hasOwnProperty("buttons")) {
                if (this.options.buttons.hasOwnProperty("submit")) {
                    if (this.options.buttons.submit.hasOwnProperty("class")) {
                        let submitClass = this.options.buttons.submit.class;
                        buttonClass = buttonClass + " " + submitClass;
                    }

                    if (this.options.buttons.submit.hasOwnProperty("text")) {
                        buttonText = this.options.buttons.submit.text;
                    }
                }
            }

            let buttonWrapper = document.createElement("div");
            buttonWrapper.setAttribute("class", "mutt-button-wrapper");

            // Add any aditional buttons specified in the options
            if (this.options.hasOwnProperty("buttons")) {
                for (let buttonName of Object.keys(this.options.buttons)) {
                    if (buttonName === "submit") {
                        // We always default this
                        continue;
                    }

                    let buttonSpec = this.options.buttons[buttonName];

                    // Setup a new button
                    let button = document.createElement("button");
                    button.setAttribute("name", buttonName);
                    button.setAttribute("class", buttonSpec.class);
                    button.setAttribute("type", "button");
                    button.textContent = buttonSpec.text;
                    button.onclick = buttonSpec.callback;

                    this.buttons[buttonName] = button;

                    buttonWrapper.appendChild(button);
                }
            }

            let submitButton = document.createElement("button");
            submitButton.setAttribute("class", buttonClass);
            submitButton.setAttribute("type", "submit");
            submitButton.textContent = buttonText;
            submitButton.onclick = e => {
                this.submit(e);
                return false;
            };

            this.buttons.submit = submitButton;
            buttonWrapper.appendChild(submitButton);

            this.form.appendChild(buttonWrapper);

            // Build the form and render to the viewport
            formContainer.appendChild(this.form);
            this.mount.appendChild(formContainer);

            // Form has been renderd to the stage, call
            // the post render hooks
            for (let fieldset of this.fieldsets) {
                fieldset.postRender();
            }

            resolve(this);
        });
    }

    /**
     * Remove the form from the stage
     * @return {bool} Confirmation of destruction
     */
    destroy() {
        if (this.mount) {
            let form = this.mount.querySelector("form");
            this.mount.removeChild(form);
            return true;
        }

        return false;
    }

    /**
     * Validate the form
     * @return {bool} response to the validation request
     */
    validate() {
        let valid = true;
        let errors = [];

        for (let fieldset of this.fieldsets) {
            if (!fieldset.validate()) {
                errors.push(fieldset.errors);
                valid = false;
            }
        }

        Mutt.logger(
            `Validation -> Status ${valid} -> ${JSON.stringify(errors)}`
        );

        return valid;
    }

    /**
     * Redraw all of the error states on the stage
     */
    refreshValidationState() {
        for (let fieldset of this.fieldsets) {
            fieldset.refreshValidationState();
        }
    }

    /**
     * Submit handler for the form
     * @param {Event} event Event triggering the submission
     * @return {bool} success or failure of submission
     */
    submit(event) {
        // We always validate prior to validateion
        let valid = false;

        try {
            valid = this.validate();
        } catch (e) {
            Mutt.logger("Unable to validate prior to submit!", e);
            return false;
        }

        if (valid) {
            Mutt.logger("Submit form");

            if (this.callbacks.hasOwnProperty("submit")) {
                this.callbacks["submit"](this.data(), event);
            } else {
                this.form.submit();
            }

            return true;
        }

        return false;
    }

    /**
     * Lock a form, this changes all of the fields to a read only state
     */
    lock() {
        Mutt.logger("Locking form");

        for (let fieldset of this.fieldsets) {
            fieldset.lock();
        }
    }

    /**
     * Unlock a form, this can be used to restore a locked form to it's
     * editable state
     */
    unlock() {
        Mutt.log("Unlocking form");

        for (let fieldset of this.fieldsets) {
            fieldset.unlock();
        }
    }

    /**
     * Set the callback for the submission
     * @param {function} callback Callback function for form submission
     */
    on(hook, callback) {
        this.callbacks[hook] = callback;
        return this;
    }

    /**
     * Set the ID for the form - this is used for rendering
     * @param {string} formId ID for a form
     */
    setFormId(formId) {
        this.id = formId;
    }

    /**
     * Get the form ID
     * @return {string} ID for a form
     */
    getFormId() {
        return this.id;
    }

    /**
     * Set field errors in bulk, this is typically used to
     * show errors from a server side response
     * @param {object} errors a hash of errors
     */
    setFieldErrors(errors) {
        // TODO: Known limitation. Errors are not provided
        // in a hierarchical manner. Just as key/value - so
        // duplicate keys scoped by parent objects are not
        // supported. Errors are added to both fields in this
        // instance.
        for (let fieldset of this.fieldsets) {
            fieldset.setFieldErrors(errors);
        }
    }

    /**
     * Get a field in the form by it's path. Paths should be
     * provided in 'dot' notation - i.e "some.example.path"
     * @param {string} path path to the field using dot notation
     */
    getFieldByPath(path) {
        // To find a field we need to inspect each fieldset
        for (let fieldset of this.fieldsets) {
            let field = fieldset.getFieldByPath(path);

            if (field) {
                return field;
            }
        }
    }
}

export default MuttForm;
