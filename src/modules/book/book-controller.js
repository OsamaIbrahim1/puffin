import Book from "../../../db/models/book-model.js";
import { APIFeature } from "../../utils/api-features.js";
import cloudinaryConnection from "../../utils/cloudinary.js";
import generateUniqueString from "../../utils/generate-Unique-String.js";

//============================== create book ==============================//
/**
 * * description the data from the request body
 * * description the data from the request headers
 * * check if image book uploaded
 * * upload the image book to cloudinary
 * * generate the objBook
 * * create the book
 * * response success message and book
 * 
 */
export const createBook = async (req, res, next) => {
  // * destructuring the data from the request body
  const { title, author, pages, price, summary } = req.body;

  // * destructuring the data from the request headers
  const { _id } = req.authUser;

  // * check if image book uploaded
  if (!req.file) {
    return next(new Error(`Please upload the image book`, { cause: 400 }));
  }
  const folderId = generateUniqueString(4);
  const { secure_url, public_id } = await cloudinaryConnection().uploader.upload(
    req.file.path,
    {
      folder: `${process.env.MAIN_FOLDER}/Books/${folderId}`,
    }
  );

  // * generate the objBook
  const objBook = {
    title,
    author,
    pages,
    price,
    Image: { secure_url, public_id },
    folderId,
    summary,
    addedBy: _id,
  };

  // * create the book
  const book = await Book.create(objBook);
  if (!book) {
    return next(new Error(`Error in creating the book`, { cause: 500 }));
  }

  // * response success message and book
  res.status(201).json({ message: "Book created successfully", book });
};

//============================== update book ==============================//
/**
 * * description the data from the request body
 * * description the data from the request headers
 * * description the data from the request params
 * * check if book exist
 * * check if admin want to update title
 * * check if admin want to update author
 * * check if admin want to update pages
 * * check if admin want to update price
 * * check if admin want to update summary
 * * check if admin want to update image
 * * save the book
 * * response success message and book
 */
export const updateBook = async (req, res, next) => {
  // * destructuring the data from the request body
  const { title, author, pages, price, summary, oldPublicId } = req.body;

  // * destructuring the data from the request headers
  const { _id } = req.authUser;

  // * desctructuring the data from the request params
  const { bookId } = req.params;

  // * chesck if book exist
  const book = await Book.findOne({ _id: bookId, addedBy: _id });
  if (!book) {
    return next(new Error(`Book not found`, { cause: 404 }));
  }

  // * check if admin want to update title
  if (title) {
    book.title = title;
  }

  // * check if admin want to update author
  if (author) {
    book.author = author;
  }

  // * check if admin want to update pages
  if (pages) {
    book.pages = pages;
  }

  // * check if admin want to update price
  if (price) {
    book.price = price;
  }

  // * check if admin want to update summary
  if (summary) {
    book.summary = summary;
  }

  // * check if admin want to update image
  if (oldPublicId) {
    if (!req.file) {
      return next(new Error(`Please upload the image book`, { cause: 400 }));
    }

    const newPublicId = oldPublicId.split(`${book.folderId}/`)[1];

    // * update image and use same public id  and folder id
    const { secure_url, public_id } =
      await cloudinaryConnection().uploader.upload(req.file.path, {
        folder: `${process.env.MAIN_FOLDER}/Books/${book.folderId}`,
        public_id: newPublicId,
      });
    book.Image.secure_url = secure_url;
  }

  // * save the book
  await book.save();

  // * response success message and book
  res.status(200).json({ message: "Book updated successfully", book });
};

//============================== delete book ==============================//
/**
 * * description the data from the request headers
 * * description the data from the request params
 * * chesck if book exist
 * * delete image and folder of image book
 * * response success message
 */
export const deleteBook = async (req, res, next) => {
  // * destructuring the data from the request headers
  const { _id } = req.authUser;

  // * desctructuring the data from the request params
  const { bookId } = req.params;

  // * chesck if book exist
  const book = await Book.findOneAndDelete({ _id: bookId, addedBy: _id });
  if (!book) {
    return next(new Error(`Book not found`, { cause: 404 }));
  }

  // * delete image and folder of image book
  await cloudinaryConnection().api.delete_resources_by_prefix(
    `${process.env.MAIN_FOLDER}/Books/${book.folderId}`
  );
  await cloudinaryConnection().api.delete_folder(
    `${process.env.MAIN_FOLDER}/Books/${book.folderId}`
  );

  // * response success message
  res.status(200).json({ message: "Book deleted successfully" });
};

//================================= get book by id ================================//
/**
 * * description the data from the request params
 * * chesck if book exist
 * * response success message and book
 */
export const getBookById = async (req, res, next) => {
  // * desctructuring the data from the request params
  const { bookId } = req.params;

  // * chesck if book exist
  const book = await Book.findById(bookId);
  if (!book) {
    return next(new Error(`Book not found`, { cause: 404 }));
  }

  // * response success message and book
  res.status(200).json({ message: "get book successfully", book });
};

//================================= get all books ================================//
/**
 * * description the query
 * * find all books and paginate it
 * * response success message and books
 */
export const getAllBooks = async (req, res, next) => {
  // * destructuring the query
  const { page, size } = req.query;

  // * find all books and paginate it
  const features = new APIFeature(req.query, Book.find()).pagination({
    page,
    size,
  });

  const books = await features.mongooseQuery;

  // * response success message and books
  res.status(200).json({ message: "get all books successfully", books });
};
