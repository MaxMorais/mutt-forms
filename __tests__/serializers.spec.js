"use strict";

import * as serializers from "../src/serializers";

describe("TrimSerializer", () => {
    test("trims a field", () => {
        const testValue = " Some test value ";
        const trim = new serializers.TrimSerializer(testValue);
        expect(trim.serialize()).toBe("Some test value");
    });
});
