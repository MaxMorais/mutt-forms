/**
 * @file Utilities
 */

"use strict";

import Mutt from "./index";
import merge from "deepmerge";

/**
 * Function to provide mixin support to classes
 */
export function mixin(target, source) {
    target = target.prototype;
    source = source.prototype;

    Object.getOwnPropertyNames(source).forEach(function(name) {
        if (name !== "constructor") {
            Object.defineProperty(
                target,
                name,
                Object.getOwnPropertyDescriptor(source, name)
            );
        }
    });
}

/**
 * Resolve a schema
 */
export function resolveSchema(schema) {
    // Merge all of the allOf declerations together
    if (schema.hasOwnProperty("allOf")) {
        schema = mergeAllOf(schema.allOf);
    }

    // TODO: other *Of syntax
    // TODO: $ref definitions

    return schema;
}

/**
 * Merge allOf properties together. As Mutt uses certain properties
 * to construct the Field objects, it can't allow for ambiguious
 * declarations, so it will always take that last definition in the all
 * of array. That means, should you add duplicate types, this will
 * be ignored and the last type will win.
 */
export function mergeAllOf(allOfList) {
    return merge.all(allOfList);
}

/**
 * Log a message to the console, used for debugging
 * @param message a message to be logged
 */
export function logger(message) {
    if (Mutt.config.getSetting("debug")) {
        console.log("Mutt :: ", message); // eslint-disable-line no-console
    }
}
