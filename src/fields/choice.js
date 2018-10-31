/**
 * @file Choice Field
 */

'use strict'

import Mutt from '../index'
import {Field} from './core'

/**
 * Choice Field, used as a base to capture inputs from
 * a range of values
 * @class
 */
export class ChoiceField extends Field {
    constructor({id, name, label = null, initial = null, widget = null,
        validators = [], attribs = {}, description = null, options = {},
        order = null, parent = null, choices = [], dependencies = null}) {
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

        this.choices = choices

        if (options.hasOwnProperty('choices')) {
            this.choices = options.choices
        }

        if (this.widget.hasOwnProperty('setChoices')) {
            this.widget.setChoices(this.choices)
        }
    }

    /**
    * Get the widget used to display the field
    * @return {SelectInput} widget to display
    */
    getWidget() {
        if (this.options.hasOwnProperty('widget') &&
            this.options.widget === 'checkboxlist') {
            return Mutt.config.getWidget('checkboxlist')
        } else {
            return Mutt.config.getWidget('select')
        }
    }
}
