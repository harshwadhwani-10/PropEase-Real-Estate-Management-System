import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    avatar: {
      type: String,
      default:
        "https://ui-avatars.com/api/?name=U&background=2A4365&color=fff&size=200&length=1",
    },
    role: {
      type: String,
      enum: ["buyer", "owner", "admin"],
      default: "buyer",
    },
  },
  { timestamps: true }
);

const User = mongoose.model('User', userSchema);

export default User;
