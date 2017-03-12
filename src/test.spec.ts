import { expect } from "chai";
// if you used the '@types/mocha' method to install mocha type definitions, uncomment the following line
import "mocha";

describe("Dummy test", () => {
    it("1 equals 1", () => {
    const result = 1;
    expect(result).to.equal(1);
});
});
