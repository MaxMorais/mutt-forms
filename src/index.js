/**
 * @file Main Mutt API
 * @author Nick Snell <nick@boughtbymany.com>
 * @copyright Bought By Many 2018
 */

"use strict";

import MuttForm from "./mutt";
import MuttConfig from "./config";
import { logger, mixin } from "./utils";

import * as fields from "./fields";
import * as widgets from "./widgets";
import * as validators from "./validators";
import * as serializers from "./serializers";

/**
 * Main Mutt API.
 * @returns {MuttForm} Returns an instance of a MuttForm
 * @example
 * let form = new Mutt({ name: { type: 'string' } })
 */
function Mutt(schema, options = {}, debug = false) {
    if (debug) {
        this.config.setSetting("debug", true);
    }

    if (schema === undefined) {
        throw new Error("You must specify a Schema!");
    }

    // Setup a new form instance if called directly
    return new MuttForm(schema, options);
}

/**
 * Internal setup for Mutt API
 * @private
 */
function initApi(Mutt) {
    // Setup the config
    const config = new MuttConfig();
    Mutt.config = config;

    // Setup plugin interface
    Mutt.use = function(plugins) {
        if (!Array.isArray(plugins)) {
            plugins = [plugins];
        }

        for (const plugin of plugins) {
            Mutt.config.use(plugin);
        }
    };

    // Setup Utilities
    Mutt.logger = logger;
    Mutt.mixin = mixin;

    // Add in hooks for fields, widgets & validators
    Mutt.fields = fields;
    Mutt.widgets = widgets;
    Mutt.validators = validators;
    Mutt.serializers = serializers;
}

initApi(Mutt);

Mutt.version = "1.11.0";

export default Mutt;
