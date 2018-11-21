/**
 * @file Text Field
 */

"use strict";

import Mutt from "../index";
import { Field } from "./core";

/**
 * String Field, used to input text values
 * @class
 */
export class StringField extends Field {
    getWidget() {
        return Mutt.config.getWidget("text");
    }
}
