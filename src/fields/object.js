/**
 * @file Object Field
 */

'use strict'

import Mutt from '../index'
import {Field} from './core'
import {resolveSchema} from '../utils'

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
        order = null, parent = null, properties = {}, required = [],
        dependencies = []}) {
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
            parent,
            dependencies,
        })

        this.object = {}
        let fieldIndex = 1

        const resolvedProps = resolveSchema(properties)

        for (const fieldName of Object.keys(resolvedProps)) {
            let fieldId = `${name}_${fieldName}`
            let fieldOptions = {}
            let fieldRequired = false
            let fieldDependsOn = []
            let isDependency = false

            if (this.options.hasOwnProperty(fieldName)) {
                fieldOptions = options[fieldName]
            }

            // Check if the field is required
            if (required.length > 0) {
                if (required.indexOf(fieldName) !== -1) {
                    fieldRequired = true
                }
            }

            // Set the fielf's dependencies
            if (dependencies !== null && Object.keys(dependencies).length > 0 && dependencies.hasOwnProperty(fieldName)) {
                let fieldDependencies = dependencies[fieldName]

                if (!Array.isArray(fieldDependencies)) {
                    fieldDependsOn = fieldDependencies
                } else {
                    fieldDependsOn.push(...dependencies[fieldName])
                }
            }

            // TODO: refactor
            // Check if current field itself is a dependent
            if (dependencies !== null && Object.keys(dependencies).length > 0) {
                for (const field in dependencies) {
                    if (dependencies.hasOwnProperty(field)) {
                        let fieldDependencies = dependencies[field]

                        if (!Array.isArray(fieldDependencies)) {
                            // get the required arrays from the dependency objects and set as an array
                            for (const dependencyType in fieldDependencies) {
                                if (fieldDependencies.hasOwnProperty(dependencyType)) {
                                    fieldDependencies = fieldDependencies[dependencyType].reduce((acc, x) => {
                                        return acc.concat(x.required)
                                    }, [])
                                }
                            }
                        }

                        if (fieldDependencies.includes(fieldName)) {
                            isDependency = true
                            break;
                        }
                    }
                }
            }

            let field = this.constructor.new(
                fieldId,
                fieldName,
                resolvedProps[fieldName],
                fieldOptions,
                this, // parent
                fieldRequired,
                fieldDependsOn,
                isDependency,
            )

            if (!field) {
                throw new Error(
                    `Unable to create "${fieldId}" on ${id} (ObjectField)!`
                )
            }

            if (!field.getSortOrder()) {
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

        for (const key of Object.keys(this.object)) {
            values[key] = this.object[key].value
        }

        return values
    }

    set value(values) {
        if (!values) {
            return
        }

        // Wo ist mein Object.isObject()??
        if (typeof values !== 'object') {
            throw new Error(
                'Unable to set object field value(s) from non-object!'
            )
        }

        for (let key of Object.keys(values)) {
            // TODO: Should we warn/error if we set keys that aren't
            // in field object?
            if (this.object.hasOwnProperty(key)) {
                this.object[key].value = values[key]
            }
        }
    }

    /**
     * Get the value in a serialized format.
     */
    getSerializedValue() {
        if (this.options.hasOwnProperty('serialize')) {
            const serializeArgs = this.options.serialize
            let serializeKey
            let serializeOptions = {}

            if (typeof serializeArgs === 'object') {
                serializeKey = serializeArgs.name
                serializeOptions = serializeArgs
            } else {
                serializeKey = serializeArgs
            }

            if (Mutt.config.hasSerializer(serializeKey)) {
                const Serializer = Mutt.config.getSerializer(serializeKey)
                return new Serializer(this.value, serializeOptions).serialize()
            }
        } else {
            let values = {}

            for (const key of Object.keys(this.object)) {
                values[key] = this.object[key].getSerializedValue()
            }

            return values
        }
    }

    /**
    * Validate the form field
    */
    validate() {
        let valid = true

        for (let key of Object.keys(this.object)) {
            let field = this.object[key]
            if (!field.isDependency && !field.validate()) {
                this._errors[key] = field.errors
                valid = false
            }
        }

        return valid
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
        for (const key of Object.keys(this.object)) {
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

        for (const key of Object.keys(this.object)) {
            let field = this.object[key]

            if (field.name === searchName) {
                const fieldProto = field.constructor.prototype
                if (pathParts.length === 0) {
                    return field
                } else if (fieldProto.hasOwnProperty('getFieldByPath')) {
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
