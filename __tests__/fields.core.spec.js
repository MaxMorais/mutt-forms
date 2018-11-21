/*
 * Core Field Tests
 */

"use strict";

import Mutt from "../src/index";

describe("Field", () => {
    var TestField;

    beforeEach(() => {
        TestField = new Mutt.fields.Field({
            id: "test-field",
            name: "TestField",
            label: "Test Field"
        });
    });

    describe("#refreshValidationState()", () => {
        test("reset the validation state of the field & widget", () => {
            TestField._errors.push("Test Error");
            TestField.widget.errors.push("Test Error");

            TestField.refreshValidationState(false);

            expect(TestField._errors.length).toEqual(0);
            expect(TestField.widget.errors.length).toEqual(0);
        });
    });

    describe("#getWidget()", () => {
        test("return the base widget used for the field", () => {
            expect(TestField.getWidget()).toBe(Mutt.widgets.TextInput);

            let AnotherTestField = new Mutt.fields.Field({
                id: "test-field",
                name: "TestField",
                label: "Test Field",
                widget: Mutt.widgets.HiddenInput
            });

            // Overides should be applied but this function only returns
            // the default
            expect(AnotherTestField.getWidget()).toBe(Mutt.widgets.TextInput);
            expect(AnotherTestField.widget.constructor).toBe(
                Mutt.widgets.HiddenInput
            );
        });
    });

    describe("#getSortOrder()", () => {
        test("return the order value", () => {
            expect(TestField.getSortOrder()).toEqual(null);
            TestField.setSortOrder(1);
            expect(TestField.getSortOrder()).toEqual(1);
        });
    });

    describe("#setSortOrder()", () => {
        test("alter the order value", () => {
            expect(TestField.getSortOrder()).toEqual(null);
            TestField.setSortOrder(1);
            expect(TestField.sortOrder).toEqual(1);
        });
    });

    describe("#toString()", () => {
        test("return a string representation of the field", () => {
            expect(TestField.toString()).toEqual("Field <TestField field>");
        });
    });

    describe("#new()", () => {
        test("return a field with configured attributes", () => {
            let schema = { type: "string" };
            let field = Mutt.fields.Field.new("test-id", "test-name", schema);

            expect(field.id).toEqual("test-id");
            expect(field.name).toEqual("test-name");
            expect(field.type).toEqual("string");
            expect(field.validators.length).toEqual(0);
        });

        test("return a field as required", () => {
            let schema = { type: "string" };
            let requiredField = Mutt.fields.Field.new(
                "test-id",
                "test-name",
                schema,
                {},
                null,
                true
            );

            expect(requiredField.validators.length).toEqual(1);
            expect(requiredField.validators[0].constructor).toBe(
                Mutt.validators.RequiredValidator
            );

            // Check the option config
            let optionsRequiredField = Mutt.fields.Field.new(
                "test-id",
                "test-name",
                schema,
                { required: true }
            );

            expect(optionsRequiredField.validators.length).toEqual(1);
            expect(optionsRequiredField.validators[0].constructor).toEqual(
                Mutt.validators.RequiredValidator
            );
        });
    });

    describe("#getSerializedValue()", () => {
        test("returns value as expect without a serializer", () => {
            const schema = {
                type: "string"
            };
            const field = Mutt.fields.Field.new("test-id", "test-name", schema);

            const testValue = " Some test value ";
            field.value = testValue;

            expect(field.getSerializedValue()).toEqual(testValue);
        });

        test("returns a serialized value when configured", () => {
            const schema = {
                type: "string"
            };
            const options = {
                serialize: "trim"
            };
            const field = Mutt.fields.Field.new(
                "test-id",
                "test-name",
                schema,
                options
            );

            const testValue = " Some test value ";
            field.value = testValue;

            expect(field.getSerializedValue()).toEqual("Some test value");
        });
    });
});
