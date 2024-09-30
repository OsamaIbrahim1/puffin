import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../db/models/user-model.js";
import httpMocks from "node-mocks-http";

jest.mock("bcryptjs");
jest.mock("jsonwebtoken");
jest.mock("../models/User");

describe("signIn Controller", () => {
  let req, res, next;

  beforeEach(() => {
    req = httpMocks.createRequest();
    res = httpMocks.createResponse();
    next = jest.fn();
  });

  it("should return 404 if the user is not found", async () => {
    req.body = { email: "osama1@gmail.com", password: "abc123!@#" };

    // *  user not found
    User.findOne.mockResolvedValue(null);
    await signIn(req, res, next);

    expect(next).toBeCalledWith(
      expect.objectContaining({
        message: "User not found",
        cause: 404,
      })
    );
  });

  it("should return 401 if the password is incorrect", async () => {
    req.body = { email: "osama@gmail.com", password: "abc123!@#$$" };

    const mockUser = {
      email: "osama@gmail.com",
      password: "hashedpassword123",
    };
    // * user found
    User.findOne.mockResolvedValue(mockUser);
    // * incorrect password
    bcryptjs.compareSync.mockReturnValue(false);

    await signIn(req, res, next);

    expect(next).toBeCalledWith(
      expect.objectContaining({
        message: "Password is incorrect",
        cause: 401,
      })
    );
  });

  it("should return 500 if token generation fails", async () => {
    req.body = { email: "osama@gmail.com", password: "abc123!@#" };

    const mockUser = {
      _id: "123",
      email: "osama@gmail.com",
      password: "hashedpassword123",
      role: "User",
    };
    User.findOne.mockResolvedValue(mockUser);
    // * correct password
    bcryptjs.compareSync.mockReturnValue(true);
    // * token generation failure
    jwt.sign.mockReturnValue(null);

    await signIn(req, res, next);

    expect(next).toBeCalledWith(
      expect.objectContaining({
        message: "Error in generating the token",
        cause: 500,
      })
    );
  });

  it("should return 200 and a token when sign-in is successful", async () => {
    req.body = { email: "osama@gmail.com", password: "abc123!@#" };

    const mockUser = {
      _id: "123",
      email: "osama@gmail.com",
      password: "hashedpassword123",
      role: "User",
      save: jest.fn(),
    };
    User.findOne.mockResolvedValue(mockUser);
    // * correct password
    bcryptjs.compareSync.mockReturnValue(true);
    // * successful token generation
    jwt.sign.mockReturnValue("mockedToken");

    await signIn(req, res, next);

    // *Check if token is updated
    expect(mockUser.token).toBe("mockedToken");
    // * Ensure the save method is called to update the token
    expect(mockUser.save).toHaveBeenCalled();

    expect(res.statusCode).toBe(200);
    expect(res._getJSONData()).toEqual({
      message: "User signed in successfully",
      token: "mockedToken",
    });
  });
});

