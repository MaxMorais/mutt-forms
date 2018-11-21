"use strict";

import Mutt from "../src/index";
import { Fieldset } from "../src/fieldsets/core";

describe("Fieldset", () => {
    test("returns the expected data without a serializer", () => {
        const TestField = new Mutt.fields.Field({
            id: "test-id",
            name: "test",
            label: "Test"
        });

        TestField.value = " Some test field ";

        const fieldset = new Fieldset({});
        fieldset.addField(TestField);

        expect(fieldset.data()).toEqual({ test: " Some test field " });
    });

    test("returns the expected data with a serializer", () => {
        const TestField = new Mutt.fields.Field({
            id: "test-id",
            name: "test",
            label: "Test",
            options: {
                serialize: "trim"
            }
        });

        TestField.value = " Some test field ";

        const fieldset = new Fieldset({});
        fieldset.addField(TestField);

        expect(fieldset.data()).toEqual({ test: "Some test field" });
    });
});
