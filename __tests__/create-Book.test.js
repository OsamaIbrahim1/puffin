import request from "supertest";
import express from "express";
import multer from "multer";
import { createBook } from "../path/to/your/controller"; 
import Book from "../db/models/book-model.js";
import cloudinaryConnection from "../src/utils/cloudinary.js"; 

// Create an express app for testing
const app = express();
app.use(express.json());

// Mock Multer
const multerMiddleware = multer().single("image");
app.post("/createBook", multerMiddleware, createBook);

// Mocking Cloudinary
jest.mock("../../utils/cloudinary.js", () => ({
  cloudinaryConnection: jest.fn(() => ({
    uploader: {
      upload: jest.fn().mockResolvedValue({
        secure_url: "http://example.com/image.jpg",
        public_id: "sample-public-id",
      }),
    },
  })),
}));

// Mocking the Book model
jest.mock("../../../db/models/book-model.js");

describe("POST /createBook", () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {
        title: "Sample Book",
        author: "John Doe",
        pages: 200,
        price: 19.99,
        summary: "A sample book for testing.",
      },
      file: {
        path: "path/to/sample.jpg",
      },
      authUser: { _id: "123" }, // Simulate authenticated user
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  it("should create a book and respond with 201 status", async () => {
    // Mocking Book.create method
    Book.create.mockResolvedValue(req.body); // Simulate book creation

    await request(app)
      .post("/createBook")
      .set("Authorization", "Bearer token") // Simulate authorization if needed
      .send(req.body)
      .attach("image", req.file.path) // Simulating file upload
      .expect(201)
      .expect((res) => {
        expect(res.body.message).toBe("Book created successfully");
        expect(res.body.book).toEqual(req.body);
      });
  });

  it("should return 400 if no image is uploaded", async () => {
    delete req.file; // Simulate missing file

    await request(app)
      .post("/createBook")
      .send(req.body)
      .expect(400)
      .expect((res) => {
        expect(res.body).toEqual({ message: "Please upload the image book" });
      });
  });

  it("should return 500 if book creation fails", async () => {
    Book.create.mockRejectedValue(new Error("Database error")); // Simulate error

    await request(app)
      .post("/createBook")
      .set("Authorization", "Bearer token") // Simulate authorization if needed
      .send(req.body)
      .attach("image", req.file.path) // Simulating file upload
      .expect(500)
      .expect((res) => {
        expect(res.body.message).toBe("Error in creating the book");
      });
  });
});
