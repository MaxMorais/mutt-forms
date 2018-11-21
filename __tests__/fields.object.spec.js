"use strict";

import Mutt from "../src/index";

describe("Object Field", () => {
    test("test objects serialize correctly", () => {
        const schema = {
            type: "object",
            properties: {
                name: {
                    type: "string"
                },
                email: {
                    type: "string"
                }
            }
        };

        const options = {
            email: {
                serialize: "trim"
            }
        };

        const field = Mutt.fields.ObjectField.new(
            "test",
            "test",
            schema,
            options
        );

        field.value = {
            name: "Testing",
            email: " test@example.com "
        };

        expect(field.getSerializedValue()).toEqual({
            name: "Testing",
            email: "test@example.com"
        });
    });

    test("objects support anyOf syntax for child components", () => {
        const schema = {
            type: "object",
            properties: {
                allOf: [
                    {
                        name: {
                            type: "string"
                        },
                        other: {
                            type: "string"
                        }
                    },
                    {
                        telephone: {
                            type: "string"
                        }
                    }
                ]
            }
        };

        const field = Mutt.fields.ObjectField.new("test", "test", schema, {});

        // To test this, we expect that each item accepts both
        // a name and telephone
        field.value = {
            name: "example",
            other: "test",
            telephone: "01234567890"
        };

        const nameField = field.getFieldByPath("name");
        const otherField = field.getFieldByPath("other");
        const telField = field.getFieldByPath("telephone");

        expect(nameField.value).toEqual("example");
        expect(otherField.value).toEqual("test");
        expect(telField.value).toEqual("01234567890");
    });
});
