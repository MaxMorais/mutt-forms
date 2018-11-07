/**
 * @file Base widget interface
 */

'use strict'

/**
 * Base Widget interface
 * @class
 */
export class Widget {
    /**
     * Base Widget interface
     * @constructor
     * @param {Field} field - fields object widget is bound too
     * @param {string} type - name of field type
     * @param {string} id - ID of the field (used in HTML)
     * @param {string} name - name of the field (used in HTML)
     * @param [string] label - optional label for the field
     * @param [object] attribs - optional HTML attributes for the field
     * @param [object] options - optional values to configure the widget
     * @param [string] value - initial value for the widget
     */
    constructor(field, type, id, name, label,
        attribs = {}, options = {}, initial = null) {
        this._field = field
        this._rendered = false
        this.type = type
        this.id = id
        this.name = name
        this.label = label
        this.attribs = attribs
        this.options = options
        this.value = initial
        this.locked = false
        this.errors = []
    }

    /**
    * Render the HTML widget
    * @return {DocumentFragment} Rendered widget as a document fragment
    */
    render() {
        // Create a fragment for our widget
        let widgetFragment = document.createDocumentFragment()

        let wrapper = this.renderWrapper()
        let label = this.renderLabel()
        let field = this.renderField()
        let help = this.renderHelp()
        let errors = this.renderErrors()

        if (label) {
            wrapper.appendChild(label)
        }

        wrapper.appendChild(field)

        if (help) {
            wrapper.appendChild(help)
        }

        if (errors) {
            wrapper.appendChild(errors)
        }

        widgetFragment.appendChild(wrapper)

        // Set the internal notification flag so
        // we know the field has now been rendered
        // to the stage
        this._rendered = true

        return widgetFragment
    }

    /**
    * Remove the widget from the stage
    * @return true on success
    */
    destroy() {
        let wrapper = this.getElementWrapper()
        wrapper.parentNode.removeChild(wrapper)
        return true
    }

    /**
    * Callback to the widget after the widget has been rendered
    * to the stage
    * @return by default, nothing is returned.
    */
    postRender() {
        // Default is to do nothing...
        return
    }

    /**
     * Lock the widget - this places it in a read only state
     * @return {bool} returns true if lock is successful, false otherwise
     */
    lock() {
        if (this.locked) {
            return false
        }

        let wrapper = this.getElementWrapper()
        let element = this.getElement()

        // Clear the existing field...
        wrapper.removeChild(element)

        this.locked = true

        return true
    }

    /**
     * Unlock the widget - this removes any previous lock and returns
     * it to it's default state.
     * @return {bool} returns true if unlock is successful, false otherwise
     */
    unlock() {
        if (!this.locked) {
            return false
        }

        let wrapper = this.getElementWrapper()
        let element = this.getElement()

        // Clear the display field
        wrapper.removeChild(element)

        let field = this.renderField()
        wrapper.appendChild(field)

        this.locked = false

        return true
    }

    /**
     * Update the ID of the wrapper element
     */
    updateId(oldId, newId) {
        // Pass the old ID to ensure we can fetch it as expected
        let wrapper = this.getElementWrapper(oldId)
        wrapper.id = newId
        this.id = newId
    }

    /**
     * Update the name of the element
     */
    updateName(newName) {
        let element = this.getElement()
        element.name = newName
        this.name = newName
    }

    /**
    * Render the field HTML - intended to be overidden by a subclass
    * @throws an error will be thrown if not overridden
    */
    renderField() {
        /* */
        throw new Error('renderField should be overidden by a widget subclass!')
    }

    /**
    * Render the field wrapper
    * @return {HTMLElement} HTML element used for wrapping widget
    */
    renderWrapper() {
        let wrapper = document.createElement('div')
        wrapper.setAttribute('id', this.id)
        wrapper.className = this.getFieldWrapperClass()
        return wrapper
    }

    /**
    * Render the field label
    * @return {HTMLElement} returns a HTML label element or null if no
    * label is configured for the widget
    */
    renderLabel() {
        if (this.label) {
            let label = document.createElement('label')
            label.setAttribute('for', this.getFieldId())
            label.setAttribute('class', 'mutt-label')
            label.textContent = this.label
            return label
        }

        return null
    }

    /**
    * Render the help field
    * @return {HTMLElement} returns a HTML span element or null if no
    * help text is configured for the widget
    */
    renderHelp() {
        if (this.options.hasOwnProperty('help') && this.options.help) {
            let help = document.createElement('span')
            help.setAttribute('class', 'mutt-help')
            help.textContent = this.options.help
            return help
        }

        return null
    }

    /**
    * Render the field error information
    * @return {HTMLElement} returns a HTML list element with error
    * information of null if no errors are present
    */
    renderErrors() {
        if (this.errors.length > 0) {
            let errorList = document.createElement('ul')
            errorList.className = this.getErrorClass()

            for (let error of this.errors) {
                let errorItem = document.createElement('li')
                errorItem.textContent = error
                errorList.appendChild(errorItem)
            }

            return errorList
        }

        return null
    }

    /**
    * Refresh the elements error state - this will remove any
    * existing error elements and re-add if there are still errors
    * on the field
    * @params {array} errors - a list of errors to be displayed
    */
    refreshErrorState(errors) {
        this.errors = errors


        if (!this._rendered) {
            return
        }

        let elementWrapper = this.getElementWrapper()
        let errorElement = this.getElementError()
        let errorWrapperClass = this.getErrorWrapperClass()

        // Remove existing errors
        if (errorElement) {
            elementWrapper.classList.remove(errorWrapperClass)
            elementWrapper.removeChild(errorElement)
        }

        // Add errors if present
        if (this.errors.length > 0) {
            elementWrapper.classList.add(errorWrapperClass)
            let errors = this.renderErrors()

            if (errors) {
                elementWrapper.appendChild(errors)
            }
        }
    }

    /**
    * Get a handle on the elements wrapper on the stage
    * @params [string] id optional id overide to search DOM
    * @return {HTMLElement} the element's wrapper on the stage
    */
    getElementWrapper(id = null) {
        if (!id) {
            id = this.id
        }
        return document.querySelector(`#${id}`)
    }

    /**
    * Get a handle for the element on the stage
    * @return {HTMLElement} the element on the stage
    */
    getElement() {
        return this.getElementWrapper().querySelector('.mutt-field')
    }

    /**
    * Get a handle for the element error information
    * @return {HTMLElement} the error element on the stage
    */
    getElementError() {
        return document.querySelector(`#${this.id} > .mutt-error`)
    }

    /**
    * Get a handle for the elements label
    * @return {HTMLElement} the error element on the stage
    */
    getElementLabel() {
        return this.getElementWrapper().querySelector('.mutt-label')
    }

    /**
    * Get the value of an element on the stage. This is the raw value
    * as specified in the HTML.
    * @return {string} value of the element on the stage
    */
    getValue() {
        if (!this._rendered) {
            return this.value
        }

        let element = this.getElement()

        if (!element) {
            throw new Error('Unable to get element!')
        }

        this.value = element.value

        return this.value
    }

    /**
    * Set the value of an element on the stage.
    * @param {string} value - value to set the HTML element too
    */
    setValue(value) {
        this.value = value

        if (!this._rendered) {
            return
        }

        let element = this.getElement()

        if (element) {
            element.value = this.value
        }
    }

    /**
    * Get the class name for the widget element
    * @return {string} the class to use for the field element
    */
    getFieldClass() {
        if (this.attribs.hasOwnProperty('class')) {
            return `mutt-field ${this.attribs.class}`
        }

        return 'mutt-field'
    }

    /**
    * Get the class name for the widget wrapper
    * @return {string} the class to use for the wrapper element
    */
    getFieldWrapperClass() {
        return 'mutt-field-wrapper'
    }

    /**
    * Get the class name for the error
    * @return {string} the class to use for the error element
    */
    getErrorClass() {
        return 'mutt-error'
    }

    /**
    * Get the class name for the error wrapper
    * @return {string} the class to use for the error wrapper element
    */
    getErrorWrapperClass() {
        return 'mutt-error-wrapper'
    }

    /**
    * Get the field ID
    */
    getFieldId() {
        return this.name
    }
}
