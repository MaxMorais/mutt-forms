/**
 * @file Button Field
 */

"use strict";

import Mutt from "../index";
import { Field } from "./core";

/**
 * Button field, used to add custom actions to form elements
 * @class
 */
export class ButtonField extends Field {
    /**
     * Get the widget for the field
     * @returns {Widget}
     */
    getWidget() {
        return Mutt.config.getWidget("button");
    }
}
