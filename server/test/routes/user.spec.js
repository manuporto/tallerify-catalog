const request = require("request");

const base_url = "http://localhost:3000/api/";

describe("User routes", () => {
  describe("GET /api/users endpoint", () => {
    it("Returns status code 200", () => {
      request.get(base_url.concat("users"), (error, res, body) => {
        expect(res.statusCode).toBe(201);
        done();
      })
    })
  })
})
