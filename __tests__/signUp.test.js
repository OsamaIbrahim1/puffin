import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../db/models/user-model.js";
import { signUp } from "../src/modules/auth/auth-controller.js";
import httpMocks from "node-mocks-http";

jest.mock("bcryptjs");
jest.mock("jsonwebtoken");
jest.mock("../models/User");

describe("signUp Controller", () => {
  let req, res, next;

  beforeEach(() => {
    req = httpMocks.createRequest();
    res = httpMocks.createResponse();
    next = jest.fn();
  });

  it("should return 409 if the email already exists", async () => {
    req.body = { email: "osama@gmail.com", password: "abc123!@#" };

    // * if email already exists
    User.findOne.mockResolvedValue(true);

    await signUp(req, res, next);

    expect(next).toBeCalledWith(
      expect.objectContaining({
        message: "Email already exists, Please try another email",
        cause: 409,
      })
    );
  });

  it("should return 500 if password hashing fails", async () => {
    req.body = { email: "osama123@gmail.com", password: "password123!@#" };

    // * the email does not exist
    User.findOne.mockResolvedValue(null);
    // * password hashing fails
    bcryptjs.hashSync.mockReturnValue(null);

    await signUp(req, res, next);

    expect(next).toBeCalledWith(
      expect.objectContaining({
        message: "Error in hashing the password",
        cause: 500,
      })
    );
  });

  it("should return 500 if token generation fails", async () => {
    req.body = {
      email: "osama@gmail.com",
      password: "abc123!@#",
      role: "User",
    };

    User.findOne.mockResolvedValue(null);
    bcryptjs.hashSync.mockReturnValue("hashedPassword123");
    // * token generation fails
    jwt.sign.mockReturnValue(null);

    await signUp(req, res, next);

    expect(next).toBeCalledWith(
      expect.objectContaining({
        message: "Error in generating the token",
        cause: 500,
      })
    );
  });

  it("should return 500 if user creation fails", async () => {
    req.body = {
      name: "osama",
      email: "osama@gmail.com",
      password: "abc123!@#",
      role: "User",
    };

    User.findOne.mockResolvedValue(null);
    bcryptjs.hashSync.mockReturnValue("hashedPassword123");
    jwt.sign.mockReturnValue("mockedToken");
    // * user creation failure
    User.create.mockResolvedValue(null);

    await signUp(req, res, next);

    expect(next).toBeCalledWith(
      expect.objectContaining({
        message: "Error in creating the user",
        cause: 500,
      })
    );
  });

  it("should return 201 and a token when sign-up is successful", async () => {
    req.body = {
      name: "osama",
      email: "osama@gmail.com",
      password: "abc123!@#",
      role: "User",
    };

    User.findOne.mockResolvedValue(null);
    bcryptjs.hashSync.mockReturnValue("hashedPassword123");
    jwt.sign.mockReturnValue("mockedToken");
    // * successful user creation
    User.create.mockResolvedValue({
      id: 1,
      name: "osama",
      email: "osama@gmail.com",
    });

    await signUp(req, res, next);

    expect(res.statusCode).toBe(201);
    expect(res._getJSONData()).toEqual({
      message: "User created successfully",
      token: "mockedToken",
    });
  });
});
