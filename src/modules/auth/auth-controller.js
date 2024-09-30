import bcryptjs from "bcryptjs";
import User from "../../../db/models/user-model.js";
import jwt from "jsonwebtoken";

//============================== sign up ==============================//
/**
 * * description the request body
 * * check if email is already exist
 * * hashing the password
 * * generate objUser
 * * create the user
 * * response success message and token
 */
export const signUp = async (req, res, next) => {
  // * destructuring the request body
  const { name, email, password, role } = req.body;

  // * check if email is already exist
  const checkEmail = await User.findOne({ email });
  if (checkEmail) {
    return next(
      new Error(`Email already exists, Please try another email`, {
        cause: 409,
      })
    );
  }

  // * hashing the password
  const hashedPassword = bcryptjs.hashSync(password, +process.env.SALTROUNDS);
  if (!hashedPassword) {
    return next(new Error(`Error in hashing the password`, { cause: 500 }));
  }

  // * generate token for user
  const token = jwt.sign({ email, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.TOKEN_EXPIRATION,
  });
  if (!token) {
    return next(new Error(`Error in generating the token`, { cause: 500 }));
  }

  // * generate objUser
  const objUser = {
    name,
    email,
    password: hashedPassword,
    role,
    token,
  };

  // * create the user
  const user = await User.create(objUser);
  if (!user) {
    return next(new Error(`Error in creating the user`, { cause: 500 }));
  }

  // * response success and token
  res.status(201).json({ message: "User created successfully", token });
};

//============================== sign in ==============================//
/**
 * * description the request body
 * * check if email is already exist
 * * compare the password
 * * generate token for user
 * * update the token
 * * response success and token
 */
export const signIn = async (req, res, next) => {
  // * destructuring the request body
  const { email, password } = req.body;

  // * check if email is already exist
  const user = await User.findOne({ email });
  if (!user) {
    return next(new Error(`User not found`, { cause: 404 }));
  }

  // * compare the password
  const comparePassword = bcryptjs.compareSync(password, user.password);
  if (!comparePassword) {
    return next(new Error(`Password is incorrect`, { cause: 401 }));
  }

  // * generate token for user
  const token = jwt.sign(
    { id: user._id, email, role: user.role },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.TOKEN_EXPIRATION,
    }
  );
  if (!token) {
    return next(new Error(`Error in generating the token`, { cause: 500 }));
  }

  // * update the token
  user.token = token;
  await user.save();

  // * response success and token
  res.status(200).json({ message: "User signed in successfully", token });
};

