"use strict";

import * as validators from "../src/validators";

describe("RequiredValidator", () => {
    test("returns true when a string value is present", () => {
        let validator = new validators.RequiredValidator();
        expect(validator.validate("test")).toBe(true);
    });

    test("returns true when a integer value is present", () => {
        let validator = new validators.RequiredValidator();
        expect(validator.validate(1)).toBe(true);
    });

    test("returns true when a integer value is zero", () => {
        let validator = new validators.RequiredValidator();
        expect(validator.validate(0)).toBe(true);
    });

    test("returns true when an array value is present", () => {
        let validator = new validators.RequiredValidator();
        expect(validator.validate([1, 2, 3])).toBe(true);
    });

    test("returns true when an object value is present", () => {
        let validator = new validators.RequiredValidator();
        expect(validator.validate({ a: 123 })).toBe(true);
    });

    test("returns false when a string value is not present", () => {
        let validator = new validators.RequiredValidator();
        expect(validator.validate("")).toBe(false);
    });

    test("returns false when a value is not present", () => {
        let validator = new validators.RequiredValidator();
        expect(validator.validate(null)).toBe(false);
    });
});

describe("LengthValidator", () => {
    test("returns true when a string is greater than min length", () => {
        let validator = new validators.LengthValidator({ min: 3 });
        expect(validator.validate("test")).toBe(true);
    });

    test("returns true when a string matches min length", () => {
        let validator = new validators.LengthValidator({ min: 3 });
        expect(validator.validate("tes")).toBe(true);
    });

    test("returns false when a string is less than min length", () => {
        let validator = new validators.LengthValidator({ min: 3 });
        expect(validator.validate("te")).toBe(false);
    });

    test("returns true when a string is less than max length", () => {
        let validator = new validators.LengthValidator({ max: 5 });
        expect(validator.validate("test")).toBe(true);
    });

    test("returns true when a string matches max length", () => {
        let validator = new validators.LengthValidator({ max: 5 });
        expect(validator.validate("test1")).toBe(true);
    });

    test("returns false when a string is greater than max length", () => {
        let validator = new validators.LengthValidator({ max: 3 });
        expect(validator.validate("test")).toBe(false);
    });
});

describe("RegexValidator", () => {
    test("returns true when a string value is present", () => {
        let validator = new validators.RegexValidator();
        expect(validator.validate("test")).toBe(true);
    });

    test("returns true when passing a regular expression", () => {
        let validator = new validators.RegexValidator(
            /([0-9][0-9])(-)([0-9][0-9])(-)([0-9][0-9])/
        );
        expect(validator.validate("00-00-00")).toBe(true);
    });

    test("returns false when a value is not present", () => {
        let validator = new validators.RegexValidator();
        expect(validator.validate(null)).toBe(false);
    });
});
