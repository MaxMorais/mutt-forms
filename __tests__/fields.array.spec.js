"use strict";

import Mutt from "../src/index";

describe("Array Field", () => {
    test("arrays serialize correctly", () => {
        const schema = {
            type: "array",
            items: {
                type: "object",
                properties: {
                    name: {
                        type: "string"
                    },
                    email: {
                        type: "string"
                    }
                }
            }
        };

        const options = {
            email: {
                serialize: "trim"
            }
        };

        const field = Mutt.fields.ArrayField.new(
            "test",
            "test",
            schema,
            options
        );

        field.value = [
            {
                name: "Testing",
                email: " test1@example.com "
            },
            {
                name: "Testing 2",
                email: " test2@example.com"
            },
            {
                name: "Testing 3",
                email: "test3@example.com"
            }
        ];

        expect(field.getSerializedValue()).toEqual([
            {
                name: "Testing",
                email: "test1@example.com"
            },
            {
                name: "Testing 2",
                email: "test2@example.com"
            },
            {
                name: "Testing 3",
                email: "test3@example.com"
            }
        ]);
    });

    test("arrays support anyOf syntax for child components", () => {
        const schema = {
            type: "array",
            items: {
                allOf: [
                    {
                        type: "object",
                        properties: {
                            name: {
                                type: "string"
                            },
                            other: {
                                type: "string"
                            }
                        },
                        required: ["name"]
                    },
                    {
                        properties: {
                            telephone: {
                                type: "string"
                            }
                        },
                        required: ["telephone"]
                    }
                ]
            }
        };

        const field = Mutt.fields.ArrayField.new("test", "test", schema, {});

        // To test this, we expect that each item accepts both
        // a name and telephone value and they are both valid
        field.value = [
            {
                name: "example",
                other: "test",
                telephone: "01234567890"
            }
        ];

        const nameField = field.getFieldByPath("0.name");
        const otherField = field.getFieldByPath("0.other");
        const telField = field.getFieldByPath("0.telephone");

        expect(nameField.value).toEqual("example");
        expect(otherField.value).toEqual("test");
        expect(telField.value).toEqual("01234567890");
        expect(nameField.validators.length).toEqual(1);
        expect(otherField.validators.length).toEqual(0);
        expect(telField.validators.length).toEqual(1);
    });
});
