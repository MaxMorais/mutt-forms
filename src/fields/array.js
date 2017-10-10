/**
* @file Array field
*/

'use strict'

import Mutt from '../index'
import { Field } from './core'

/**
* Array is a complex field type, which is essentially a list
* of other fields.
* @class
*/
export class ArrayField extends Field {

    /**
    *
    */
    constructor({id, name, label = null, initial = null, widget = null,
        validators = [], attribs = {}, description = null, options = {},
        order = null, parent = null, items = {}, minItems = 1, maxItems = null}) {
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

        // TODO: Sanity check min/max items

        this.minItems = minItems
        this.maxItems = maxItems
        this.itemSchema = items // schema to make new items
        this.itemOptions = options

        // We store the array fields as slots
        this.slots = []
        for(let i in Array.from(Array(this.minItems).keys())) { // eslint-disable-line
            this.addSlot(false)
        }

        // Store errors as an object
        this.errors = {}
    }

    /**
    * Add a new slot to the array field
    * @param [updateWidget] Update the widget attached to the field
    */
    addSlot(updateWidget = true) {
        let position = this.slots.length + 1
        let fieldId = this.getSlotId(position)
        let fieldName = this.getSlotName(position)

        // FIXME: This is a workaround, really should
        // get the correct option structure to this class
        let fieldOptions = Object.assign({
            order: position
        }, this.itemOptions)

        let field = this.constructor.new(
            fieldId,
            fieldName,
            this.itemSchema,
            fieldOptions,
            this // parent
        )

        this.slots.push(field)

        // FIXME: This shouldn't be at this level
        if(updateWidget && this.widget.hasOwnProperty('addSlot')) {
            this.widget.addSlot(field)
        }
    }

    /**
    * Remove slot
    * @param [updateWidget] Update the widget attached to the field
    * @returns {bool} success of the removal of a slot
    */
    removeSlot(updateWidget = true) {
        if(this.slots.length === 0) {
            return false
        }

        this.slots.pop()

        if(updateWidget && this.widget.hasOwnProperty('removeSlot')) {
            this.widget.removeSlot()
        }

        return true
    }

    /**
    * Remove a slot from inside the slot array
    * @param index Index of slot to remove from array
    * @param [updateWidget] Update the widget attached to the field
    * @returns {bool} success of the removal of a slot
    */
    spliceSlot(index, updateWidget = true) {
        if(this.slots.length === 0) {
            return false
        }

        for(let slotIndex in this.slots) {
            // ??
            slotIndex = parseInt(slotIndex)

            if(updateWidget && slotIndex === index) {
                this.slots[slotIndex].destroy()
            }
        }

        this.slots.splice(index, 1)

        for(let slotIndex in this.slots) {
            let position = parseInt(slotIndex) + 1
            let newId = this.getSlotId(position)
            let newName = this.getSlotName(position)
            let slot = this.slots[slotIndex]

            slot.updateId(newId, updateWidget)
            slot.updateName(newName, updateWidget)
        }

        return true
    }

    /**
    *
    */
    getSlotId(index) {
        return `${this.id}_item_${index}`
    }

    /**
    *
    */
    getSlotName(index) {
        return `${this.name}_${index}`
    }

    /**
    * Property - get/set value
    */
    get value() {
        let valueArray = []

        for(let slot of this.slots) {
            valueArray.push(slot.value)
        }

        return valueArray
    }

    set value(value) {
        if(!Array.isArray(value)) {
            throw new Error('Unable to set array field value(s) from non-array!')
        }

        // We may need to add or remove slots depending on the value
        // sent through, reset the slots and add as needed
        this.slots = []

        for(let _ in value) { // eslint-disable-line
            this.addSlot(false)
        }

        let fieldValueMap = this.slots.map(function(field, index) {
            return [field, value[index]]
        })

        for(let [field, value] of fieldValueMap) {
            field.value = value
        }
    }

    /**
    * Validate the form field
    * @returns {bool} returns sucess or failure of validation
    */
    validate() {
        let valid = true

        for(let field of this.slots) {
            if(!field.validate()) {
                this._errors[field.name] = field.errors
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
    * Triggers post render call on all fields in array
    */
    postRender() {
        for(let field of this.slots) {
            field.postRender()
        }
    }

    /**
    *
    */
    getWidget() {
        return Mutt.config.getWidget('array')
    }

    /**
    *
    */
    render() {
        return this.widget.renderList(this.slots)
    }

    /**
    *
    */
    getFieldByPath(path) {
        let pathParts = path.split('.')

        // It's expected that the search name is an integer as
        // it should be an index to an field in the array
        let searchIndex = parseInt(pathParts.shift())

        if(isNaN(searchIndex)) {
            return null
        } else if(searchIndex > this.slots.length) {
            return null
        }

        let field = this.slots[searchIndex]

        if(pathParts.length === 0) {
            return field
        }

        if(field.constructor.prototype.hasOwnProperty('getFieldByPath')) {
            return field.getFieldByPath(pathParts.join('.'))
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
            let field = this.slots[key]
            if(!field.isEmpty()) {
                return false
            }
        }
        return true
    }
}
