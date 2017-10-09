/**
* @file Main Core Field class
*/

'use strict'

import Mutt from '../index'
import {
    RequiredValidator,
    BooleanRequiredValidator,
    LengthValidator
} from '../validators/core'

/**
* Base Field class, this is used as a base interface for
* all other Fields
* @class
*/
export class Field {

    /**
    * Initialise the field - this will initalise the assocaited widget
    * @param {string} id the ID of the field
    * @param {string} name the HTML name of the field
    * @param {string} [label] the HTML label linked ot the field
    * @param {mixed} [initial] the initial value for the field
    * @param {Widget} [widget] widget class to use when rendering field
    * @param {array} [validators] List of validators to use when validating field
    * @param {object} [attribs] HTML attributes for the field
    * @param {string} [description] Help text for the field
    * @param {object} [options] rendering options for the field
    * @param {integer} [order] order flag for sorting multiple fields
    * @param {Field} [parent] parent a parent field
    */
    constructor({id, name, label = null, initial = null, widget = null,
        validators = [], attribs = {}, description = null, options = {},
        order = null, parent = null}) {
        this.id = id
        this.name = name
        this.label = label
        this.description = description
        this.attribs = attribs
        this.options = options
        this.validators = validators
        this.sortOrder = order
        this.locked = false
        this.parent = parent

        if(!this.label) {
            this.label = this.name
        }

        this.initOptions()

        // Setup the widget
        let WidgetKlass = this.getWidget()

        if(widget) {
            WidgetKlass = widget
        }

        this.widget = new WidgetKlass(
            this,
            this.type,
            this.id,
            this.name,
            this.label,
            this.attribs,
            this.options,
            initial
        )

        this._errors = []
    }

    /**
    * Enable the options on the field
    */
    initOptions() {
        if(this.options.hasOwnProperty('order')) {
            this.sortOrder = this.options.order
        }
        if(this.options.hasOwnProperty('label')) {
            this.label = this.options.label
        }
        if(this.options.hasOwnProperty('description')) {
            this.description = this.options.description
        }
    }

    /**
    * Property - get/set the type (typically set can not be called
    * but is included for subclasses who may use this)
    */
    get type() {
        let type = this.constructor.name.toLowerCase()
        return (type !== 'field') ? type.replace('field', '') : type
    }

    set type(someType) {
        throw new Error('Unable to set type on a field instance!')
    }

    /**
    * Property - get/set value
    */
    get value() {
        return this.widget.getValue()
    }

    set value(value) {
        this.widget.setValue(value)
    }

    /**
    * Property - get/set errors
    * @param {string} Error string
    */
    get errors() {
        return this._errors
    }

    set errors(error) {
        this._errors.push(error)
    }

    /**
    * Check if field is non-empty
    * @returns {Boolean} if the field has a non-empty value
    */
    isEmpty() {
        return !this.value || (this.value == 0)
    }


    /**
    * Render the form field using it's widget interface
    * @returns {DocumentFragment} rendered HTML widget
    */
    render() {
        return this.widget.render()
    }
    /**
    * Destroy the rendered widget
    * @returns the success or failure response
    */
    destroy() {
        return this.widget.destroy()
    }

    /**
    * Callback to the field after it has been rendered to
    * the stage
    */
    postRender() {
        this.widget.postRender()
    }

    /**
    * Validate the form field
    */
    validate() {
        // Clear any previous validations
        this.refreshValidationState()

        let value = this.value
        for(let validator of this.validators) {
            if(!validator.validate(value)) {
                this.errors = validator.error
                break
            }
        }

        if(this.errors.length > 0) {
            this.widget.refreshErrorState(this.errors)
            return false
        }

        return true
    }

    /**
    * Turn the field from an editable elment to a readonly one
    */
    lock() {
        if(this.locked) {
            return false
        }

        this.widget.lock()
        this.locked = true

        return true
    }

    /*
    * Restore a field from a locked state
    */
    unlock() {
        if(!this.locked) {
            return false
        }

        this.widget.unlock()
        this.locked = false

        return true
    }

    /**
    * Refresh the validation state
    */
    refreshValidationState(update = true) {
        this._errors = []
        this.widget.errors = []

        if(update) {
            this.widget.refreshErrorState([])
        }
    }

    /**
    * Get the widget class used to render the field
    * @return TextInput widget
    */
    getWidget() {
        return Mutt.config.getWidget('text')
    }

    /**
    * Get the sort order of the field. This is used when
    * rendering groups of fields.
    */
    getSortOrder() {
        return this.sortOrder
    }

    /**
    * Set the internal sort order for a field.
    */
    setSortOrder(order) {
        this.sortOrder = order
    }

    /**
    * Display field as a string representation
    */
    toString() {
        return `Field <${this.name} ${this.type}>`
    }

    /**
    *
    */
    updateId(newId, updateWidget = true) {
        let oldId = this.id
        this.id = newId

        if(updateWidget) {
            this.widget.updateId(oldId, newId)
        }
    }

    /**
     *
     */
    updateName(newName, updateWidget = true) {
        this.name = newName

        if(updateWidget) {
            this.widget.updateName(newName)
        }
    }

    /**
     *
     */
    static new(id, name, schema, options = {},
        parent = null, required = false, dependancies = null) {
        let fieldSpec = {
            id: id,
            name: name,
            options: options,
            attribs: {},
            parent: parent
        }

        let FieldKlass = null
        let validators = []

        if(schema.description) {
            fieldSpec.description = schema.description
        }

        if(schema.title) {
            fieldSpec.label = schema.title
        }

        if(schema.default) {
            fieldSpec.initial = schema.default
        }

        if(schema.enum) {
            let choices = []

            for(let option of schema.enum) {
                choices.push([option, option])
            }

            fieldSpec.choices = choices
            FieldKlass = Mutt.config.getField('enum')
        }

        // This is awkward as we are trying to support the
        // legacy/Alpaca option format
        if(options.hasOwnProperty('hidden')) {
            if(options.hidden) {
                fieldSpec.widget = Mutt.config.getWidget('hidden')
            }
        }

        if(schema.format) {
            if(Mutt.config.hasWidget(schema.format)) {
                fieldSpec.widget = Mutt.config.getWidget(schema.format)
            }
        }

        if(options.widget) {
            if(Mutt.config.hasWidget(options.widget)) {
                fieldSpec.widget = Mutt.config.getWidget(options.widget)
            }
        }

        if(schema.items) {
            fieldSpec.items = schema.items
        }

        if(schema.properties) {
            fieldSpec.properties = schema.properties
        }

        // Build validator list
        if(required || (options.hasOwnProperty('required') && options.required)) {
            if(schema.type === 'boolean') {
                validators.push(new BooleanRequiredValidator())
            } else {
                validators.push(new RequiredValidator())
            }

            fieldSpec.attribs.required = 'true'
        }

        // If the schema contains a required attribute this should be
        // a list of required descendants - not the item itself
        if(schema.required) {
            fieldSpec.required = schema.required
        }

        if(schema.minLength) {
            validators.push(
                new LengthValidator({min: schema.minLength})
            )
        }

        if(schema.maxLength) {
            validators.push(
                new LengthValidator({max: schema.maxLength})
            )
        }

        if(options.validators) {
            validators.unshift(...options.validators)
        }

        if(schema.minItems) {
            fieldSpec.minItems = schema.minItems
        }

        if(schema.maxItems) {
            fieldSpec.maxItems = schema.maxItems
        }

        fieldSpec.validators = validators

        if(!FieldKlass) {
            // Attempt to get the field spec
            if(!Mutt.config.hasField(schema.type)) {
                return null
            }

            FieldKlass = Mutt.config.getField(schema.type)
        }

        let field = new FieldKlass(fieldSpec)
        return field
    }
}
