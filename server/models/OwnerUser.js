import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import slug from "mongoose-slug-generator";
mongoose.plugin(slug);

const OwnerUserSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "Please provide a first name"],
      maxLength: 20,
    },
    lastName: {
      type: String,
      required: [true, "Please provide a last name"],
      maxLength: 20,
    },
    slug: {
      type: String,
      slug: ["firstName", "lastName"],
      slug_padding_size: 4,
      unique: true,
    },
    email: {
      type: String,
      required: [true, "Please provide an email"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    address: {
      type: String,
      required: [true, "Please provide an address"],
    },
    phoneNumber: {
      type: String,
      required: [true, "Please provide a phone number"],
      unique: true,
      match: [/^[9]+[7-8]+\d{8}$/, "Please provide a valid phone number"],
    },
    dateOfBirth: {
      type: String,
      required: [true, "Please provide a date of birth"],
    },
    gender: {
      type: String,
      enum: {
        values: ["Male", "Female", "Other"],
        message: "{VALUE} is not supported",
      },
    },
    profileImage: {
      type: String,
      required: [true, "Please provide a profile image"],
    },
    password: {
      type: String,
      required: [true, "Please provide a password"],
      minlength: 5,
      select: false,
    },
  },
  { timestamps: true }
);

// Hash password before saving to database
OwnerUserSchema.pre("save", async function () {
  if (!this.isModified("password")) return; //avoid re-hashing of password

  const salt = await bcrypt.genSalt(10); // generate salt
  this.password = await bcrypt.hash(this.password, salt); // hash password
});

// Compare entered password with hashed password in database
OwnerUserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password); // return true if passwords match else false
};

// create JWT Access token for owner user authentication
OwnerUserSchema.methods.createAccessToken = function () {
  // return JWT token with user id
  return jwt.sign(
    { userId: this._id, userType: "owner" },
    process.env.ACCESS_TOKEN_SECRET_OWNER,
    {
      expiresIn: process.env.ACCESS_LIFETIME,
    }
  );
};

// create JWT Refresh token for owner user authentication
OwnerUserSchema.methods.createRefreshToken = function () {
  // return JWT token with user id
  return jwt.sign(
    { userId: this._id, userType: "owner" },
    process.env.REFRESH_TOKEN_SECRET_OWNER,
    {
      expiresIn: process.env.REFRESH_LIFETIME,
    }
  );
};

export default mongoose.model("OwnerUser", OwnerUserSchema);
