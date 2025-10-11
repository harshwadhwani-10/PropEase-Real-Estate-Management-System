import { User } from "../../models/user.js";

/**
 * Get current logged-in user
 */
export const getMe = async (req, res) => {
  const user_id = req.user.id;
  try {
    const user = await User.findOne({ user_id });
    return res.status(200).send({ data: user });
  } catch (error) {
    return res.status(500).send({ message: "Error fetching user", error });
  }
};

/**
 * Get single user by ID
 */
export const getUser = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findOne({ user_id: id });
    if (!user) {
      return res.status(404).send({ message: "Error: Can't find User." });
    }
    return res.status(200).send({ data: user });
  } catch (error) {
    return res.status(500).send({ message: "Error fetching user", error });
  }
};

/**
 * Get all users
 */
export const getUsers = async (_, res) => {
  try {
    const users = await User.find();
    return res.status(200).send({ data: users });
  } catch (error) {
    return res.status(500).send({ message: "Error fetching users", error });
  }
};

/**
 * Update current logged-in user
 */
export const updateMe = async (req, res) => {
  const user_id = req.user.id;
  const { fullName, about, address } = req.body;

  const $set = {
    ...(fullName !== undefined && { fullName }),
    ...(about !== undefined && { about }),
    ...(address !== undefined && { address }),
  };

  try {
    const options = { new: true, runValidators: true };
    const updatedUser = await User.findOneAndUpdate({ user_id }, { $set }, options);

    if (!updatedUser) {
      return res.status(404).send({ message: "Error: User not found." });
    }

    return res.status(200).send({
      message: "Success: updated user information.",
      data: updatedUser,
    });
  } catch (error) {
    return res
      .status(500)
      .send({ message: "Internal error, please try again later.", error });
  }
};
