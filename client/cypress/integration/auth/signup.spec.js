/// <reference types="cypress" />

describe("Signup Page", () => {
  beforeEach(() => {
    cy.intercept("GET", "**/auth/me", {
      statusCode: 401,
      body: {
        status: "fail",
        statusCode: 401,
        data: ["Unauthorized"],
      },
    }).as("me");
    cy.visit("/signup");
  });

  describe("when visiting the page", () => {
    it("should show the signup page", () => {
      cy.contains("Create an account");
    });
  });

  describe("when clicking the signin link", () => {
    it("should route to the sigin page", () => {
      cy.get("a.chakra-link").click();

      cy.url().should("include", "/signin");
    });
  });

  describe("when the email is already taken", () => {
    beforeEach(() => {
      cy.intercept("**/auth/signup", {
        statusCode: 400,
        body: {
          statusCode: 400,
          status: "fail",
          data: ["User with email address already exists"],
        },
      });
    });

    it("should show error message and not allow user to proceed", () => {
      cy.get("input[name=firstName]").type("John");
      cy.get("input[name=lastName]").type("Doe");

      cy.get("input[name=email]").type("test@test.com");
      cy.get("input[name=password]").type("123456{enter}");

      cy.url().should("include", "/signup");

      cy.contains("User with email address already exists");
    });
  });

  describe("when the data is valid", () => {
    beforeEach(() => {
      cy.intercept("**/auth/signup", {
        statusCode: 200,
        body: {
          status: "success",
          statusCode: 201,
          data: {
            email: "test@test.com",
            name: "abc  def",
            role: 1,
            photo:
              "https://www.pngitem.com/pimgs/m/30-307416_profile-icon-png-image-free-download-searchpng-employee.png",
            updatedAt: "2021-09-17T11:01:46.192Z",
            id: 31,
            createdAt: "2021-09-17T11:01:46.192Z",
          },
        },
      }).as("signin");
    });
    it("should login and allow user to the home page", () => {
      cy.get("input[name=firstName]").type("John");
      cy.get("input[name=lastName]").type("Doe");
      cy.get("input[name=email]").type("test@test.com");
      cy.get("input[name=password]").type("123456{enter}");

      cy.url().should("not.include", "/signup");
    });
  });
});
