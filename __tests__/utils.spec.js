"use strict";

import { mergeAllOf } from "../src/utils";

describe("Utils", () => {
    describe("#mergeAllOf()", () => {
        test("merge object schema definitions as expected", () => {
            const schema = {
                allOf: [
                    {
                        type: "string"
                    },
                    {
                        maxLength: 5
                    }
                ]
            };

            expect(mergeAllOf(schema.allOf)).toEqual({
                type: "string",
                maxLength: 5
            });
        });

        test("merge object schema definitions and override duplicates", () => {
            const schema = {
                allOf: [
                    {
                        type: "string"
                    },
                    {
                        maxLength: 5
                    },
                    {
                        type: "number"
                    }
                ]
            };

            expect(mergeAllOf(schema.allOf)).toEqual({
                type: "number",
                maxLength: 5
            });
        });

        test("merge object schema definitions and extend definitions", () => {
            const schema = {
                allOf: [
                    {
                        type: "object",
                        properties: {
                            name: {
                                type: "string"
                            },
                            address: {
                                type: "string"
                            }
                        },
                        required: ["name"]
                    },
                    {
                        required: ["address"]
                    }
                ]
            };

            expect(mergeAllOf(schema.allOf)).toEqual({
                type: "object",
                properties: {
                    name: {
                        type: "string"
                    },
                    address: {
                        type: "string"
                    }
                },
                required: ["name", "address"]
            });
        });
    });
});
