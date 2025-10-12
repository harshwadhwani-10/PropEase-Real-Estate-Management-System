import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../../models/user.js";
import { ActivityType } from "../../enums/activity.js";
import { NotificationType, SocketNotificationType } from "../../enums/notifications.js";
import { addActivity } from "../../services/activity.js";
import { addNotification } from "../../services/notification.js";
import { isPasswordValid } from "../../utils/users.js";
import { activitySigninDescription } from "../../utils/activity/index.js";
import { sendTargetedNotification } from "../../websocket/index.js";

// -------------------- SIGN IN --------------------
export const signIn = async (req, res) => {
  const { email, password } = req.body;
  try {
    const foundUser = await User.findOne({ email: email.toLowerCase() });
    if (!foundUser)
      return res.status(400).json({ message: "Error: Invalid Email or Password." });

    const validPassword = await bcrypt.compare(password, foundUser.password);
    if (!validPassword)
      return res.status(400).json({ message: "Error: Invalid Email or Password." });

    const { user_id } = foundUser;
    const accessToken = jwt.sign({ id: user_id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    // log user activity
    addActivity(foundUser, {
      action: ActivityType.user.login,
      description: activitySigninDescription(foundUser),
      user_id,
    });

    await foundUser.save();

    res.status(200).json({
      data: {
        ...foundUser.toObject(),
        accessToken,
      },
    });
  } catch (error) {
    console.error("SignIn Error:", error);
    res.status(500).json({ message: "Error: Something went wrong." });
  }
};

// -------------------- REGISTER --------------------
export const register = async (req, res) => {
  const { fullName, email, password } = req.body;
  if (!fullName || !email || !password)
    return res.status(400).json({ message: "Error: form is invalid" });

  if (!isPasswordValid(password))
    return res.status(400).json({ message: "Error: password is not valid" });

  try {
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser)
      return res.status(400).json({ message: "Error: Email already registered." });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      user_id: uuidv4(),
      fullName,
      email: email.toLowerCase(),
      password: hashedPassword,
    });

    await newUser.save();

    const accessToken = jwt.sign({ id: newUser.user_id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.status(201).json({
      data: {
        user_id: newUser.user_id,
        fullName,
        email: email.toLowerCase(),
        accessToken,
      },
    });
  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).json({ message: "Error: Something went wrong." });
  }
};

// -------------------- GOOGLE AUTH --------------------
export const googleAuth = async (req, res) => {
  const { credential } = req.body;
  if (!credential)
    return res.status(400).json({ message: "Error: Invalid request." });

  try {
    const decoded = jwt.decode(credential);
    const { sub, email, name: fullName, aud, iss, exp } = decoded;

    if (process.env.GOOGLE_AUTH_CLIENT_ID !== aud)
      return res.status(400).json({ message: "Error: Invalid Request." });
    if (iss !== "accounts.google.com" && iss !== "https://accounts.google.com")
      return res.status(400).json({ message: "Error: Invalid Request." });
    if (exp < Date.now() / 1000)
      return res.status(400).json({ message: "Error: Token expired." });

    let foundUser = await User.findOne({ user_id: sub });

    if (!foundUser) {
      foundUser = new User({
        user_id: sub,
        fullName,
        email: email.toLowerCase(),
      });
      await foundUser.save();
    }

    const accessToken = jwt.sign({ id: sub }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.status(200).json({
      data: {
        user_id: foundUser.user_id,
        fullName: foundUser.fullName,
        email: foundUser.email,
        accessToken,
      },
    });
  } catch (error) {
    console.error("Google Auth Error:", error);
    res.status(500).json({ message: "Error: Something went wrong." });
  }
};

// -------------------- CHANGE PASSWORD --------------------
export const changePassword = async (req, res) => {
  const { passwordCurrent, passwordNew } = req.body;
  const user_id = req.user?.id;

  if (!passwordCurrent)
    return res.status(400).json({ message: "Error: current password is missing" });
  if (!passwordNew)
    return res.status(400).json({ message: "Error: new password is missing" });
  if (passwordCurrent === passwordNew)
    return res.status(400).json({
      message: "Error: new password cannot be the same as current password.",
    });

  try {
    const foundUser = await User.findOne({ user_id });
    if (!foundUser)
      return res.status(404).json({ message: "Error: User not found." });

    const validPassword = await bcrypt.compare(passwordCurrent, foundUser.password);
    if (!validPassword)
      return res.status(400).json({ message: "Error: Current password is not valid." });

    if (!isPasswordValid(passwordNew))
      return res.status(400).json({ message: "Error: New password is not valid." });

    const hashedPassword = await bcrypt.hash(passwordNew, 10);
    foundUser.password = hashedPassword;

    // Add notification
    const notification = await addNotification(foundUser, {
      type: NotificationType.account,
      message: "Your account password has been successfully updated.",
    });
    sendTargetedNotification(SocketNotificationType.user, notification, user_id);

    // Add activity
    addActivity(foundUser, {
      action: ActivityType.user.update,
      description: "You changed your account password.",
    });

    await foundUser.save();
    res.status(200).json({ message: "Password changed successfully." });
  } catch (error) {
    console.error("Change Password Error:", error);
    res.status(500).json({ message: "Error: Something went wrong." });
  }
};
