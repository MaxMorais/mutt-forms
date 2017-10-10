/**
* @file Object Field
*/

'use strict'

import Mutt from '../index'
import { Field } from './core'

// TODO: An object is basically a fieldset within a fieldset,
// we are repeating a bunch of functionality from the fieldset
// here. This should be refactored.

/**
* Object Field
* @class
*/
export class ObjectField extends Field {

    constructor({id, name, label = null, initial = null, widget = null,
        validators = [], attribs = {}, description = null, options = {},
        order = null, parent = null, properties = {}, required = []}) {
        super({
            id,
            name,
            label,
            initial,
            widget,
            validators,
            attribs,
            description,
            options,
            order,
            parent
        })

        this.object = {}
        let fieldIndex = 1

        for(let fieldName of Object.keys(properties)) {
            let fieldId = `${name}_${fieldName}`
            let fieldOptions = {}
            let fieldRequired = false

            if(this.options.hasOwnProperty(fieldName)) {
                fieldOptions = options[fieldName]
            }

            // Check if the field is required
            if(required.length > 0) {
                if(required.indexOf(fieldName) !== -1) {
                    fieldRequired = true
                }
            }

            let field = this.constructor.new(
                fieldId,
                fieldName,
                properties[fieldName],
                fieldOptions,
                this, // parent
                fieldRequired
            )

            if(!field) {
                throw new Error('Unable to create Field on ObjectField!')
            }

            if(!field.getSortOrder()) {
                field.setSortOrder(fieldIndex)
            }

            this.object[fieldName] = field

            fieldIndex++
        }

        // Store errors as an object
        this._errors = {}
    }

    get value() {
        let values = {}

        for(let key of Object.keys(this.object)) {
            values[key] = this.object[key].value
        }

        return values
    }

    set value(values) {
        // Wo ist mein Object.isObject()??
        if(typeof values !== 'object') {
            throw new Error(
                'Unable to set object field value(s) from non-object!'
            )
        }

        for(let key of Object.keys(values)) {
            // TODO: Should we warn/error if we set keys that aren't
            // in field object?
            if(this.object.hasOwnProperty(key)) {
                this.object[key].value = values[key]
            }
        }
    }

    /**
    * Validate the form field
    */
    validate() {
        // this is used to check if the object itself is required
        let valid = !!super.validate()

        // if there are children validate them as well
        if(!this.isEmpty()) {
            for(let key of Object.keys(this.object)) {
                let field = this.object[key]
                if(!field.validate()) {
                    this._errors[key] = field.errors
                    valid = false
                }
            }
        }

        return valid
    }

    /**
    * Check if field is non-empty
    * @returns {Boolean} if the field has a non-empty value
    */
    isEmpty() {
        let value = this.value
        if(!value || (Object.keys(value).length === 0)) {
            return true
        }

        for(let key of Object.keys(value)) {
            // an object is only empty if all its children are empty
            // so as soon as one child is not empty we can return
            let field = this.object[key]
            if(!field.isEmpty()) {
                return false
            }
        }
        return true
    }

    /**
    * Refresh the validation state
    */
    refreshValidationState() {
        super.refreshValidationState()
        this._errors = {}
    }

    /**
    *
    */
    postRender() {
        for(let key of Object.keys(this.object)) {
            this.object[key].postRender()
        }
    }

    getWidget() {
        return Mutt.config.getWidget('object')
    }

    /**
    *
    */
    render() {
        return this.widget.renderObject(this.object)
    }

    /**
    *
    */
    getFieldByPath(path) {
        let pathParts = path.split('.')
        let searchName = pathParts.shift()

        for(let key of Object.keys(this.object)) {
            let field = this.object[key]

            if(field.name === searchName) {
                if(pathParts.length === 0) {
                    return field
                } else if(field.constructor.prototype
                                .hasOwnProperty('getFieldByPath')) {
                    return field.getFieldByPath(pathParts.join('.'))
                }
            }
        }

        return null
    }

    /**
    * Property - get/set errors
    * @param {string} Error string
    */
    get errors() {
        return this._errors
    }

    set errors(error) {
        this._errors = error
    }
}
