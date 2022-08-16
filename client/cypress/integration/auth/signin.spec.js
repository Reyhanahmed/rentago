/// <reference types="cypress" />

describe("Signin Page", () => {
  beforeEach(() => {
    cy.intercept("GET", "**/auth/me", {
      statusCode: 401,
      body: {
        status: "fail",
        statusCode: 401,
        data: ["Unauthorized"],
      },
    }).as("me");
    cy.visit("/signin");
  });

  describe("when visiting the page", () => {
    it("should show the signin page", () => {
      cy.contains("Sign in to your account");
    });
  });

  describe("when clicking the signup link", () => {
    it("should route to the signup page", () => {
      cy.get("a.chakra-link").click();

      cy.url().should("include", "/signup");
    });
  });

  describe("when the data is invalid", () => {
    beforeEach(() => {
      cy.intercept("**/auth/signin", {
        statusCode: 400,
        body: {
          statusCode: 400,
          status: "fail",
          data: ["Wrong credentials provided"],
        },
      });
    });

    it("should show error message and not allow user to proceed", () => {
      cy.get("input[name=email]").type("test@test.com");
      cy.get("input[name=password]").type("123456{enter}");

      cy.url().should("include", "/signin");

      cy.contains("Wrong credentials provided");
    });
  });

  describe("when the data is valid", () => {
    beforeEach(() => {
      cy.intercept("**/auth/signin", {
        statusCode: 200,
        body: {
          status: "success",
          statusCode: 200,
          data: { id: 1, name: "John doe", email: "test@test.com" },
        },
      }).as("signin");
    });
    it("should login and allow user to the home page", () => {
      cy.get("input[name=email]").type("test@test.com");
      cy.get("input[name=password]").type("123456{enter}");

      cy.url().should("not.include", "/signin");
    });
  });
});
