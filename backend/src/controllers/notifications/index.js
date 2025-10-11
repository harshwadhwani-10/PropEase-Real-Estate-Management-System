import { User } from "../../models/user.js";
import { removeExpiredNotifications } from "../../services/notification.js";

export const getNotifications = async (req, res) => {
  const user_id = req.user.id;
  try {
    const user = await User.findOne({ user_id }).select("notifications");
    if (!user) return res.status(404).send({ message: "Error: User not found." });

    if (user.notifications.length) {
      const hasExpired = removeExpiredNotifications(user);
      if (hasExpired) await user.save();
    }

    return res.status(200).send({
      status: 200,
      message: "Returns list of Notifications",
      data: user?.notifications || [],
    });
  } catch (error) {
    return res.status(400).send({
      message: "Error: Something went wrong, Please try again later.",
    });
  }
};

export const readNotification = async (req, res) => {
  const user_id = req.user.id;
  const param_id = req.body.id;

  try {
    const user = await User.findOne({ user_id }).select("notifications");
    if (!user) return res.status(404).send({ message: "Error: User not found." });
    if (!user.notifications.length) return res.status(404).send({});

    removeExpiredNotifications(user);

    const ids = Array.isArray(param_id) ? param_id : [param_id];
    const updatedNotifications = [];

    ids.forEach((id) => {
      const notification = user.notifications.find(
        (item) => item.notification_id === id && !item.read
      );
      if (notification) {
        notification.read = true;
        updatedNotifications.push(notification);
      }
    });

    if (!updatedNotifications.length)
      return res
        .status(400)
        .send({ message: "Error: Some or all notifications have already been read." });

    await user.save();
    return res.status(200).send({
      status: 200,
      message: "Success: Notification has been set to read!",
      data: updatedNotifications,
    });
  } catch (error) {
    console.log("\n Read notification error:", error);
    return res.status(400).send({
      message: "Error: Something went wrong please try again later.",
    });
  }
};

export const deleteNotification = async (req, res) => {
  const user_id = req.user.id;
  const ids = req.body.id;

  try {
    const user = await User.findOne({ user_id }).select("notifications");
    if (!user) return res.status(404).send({ message: "Error: User not found." });
    if (!user.notifications.length)
      return res
        .status(400)
        .send({ message: "Error: User notifications are empty." });

    removeExpiredNotifications(user);

    user.notifications = user.notifications.filter((item) => {
      if (Array.isArray(ids)) return !ids.includes(item.notification_id);
      return item.notification_id !== ids;
    });

    await user.save();

    return res.status(200).send({
      status: 200,
      message: "Success: Notification has been deleted!",
    });
  } catch (error) {
    console.log("\n Delete Error:", error);
    return res.status(400).send({
      message: "Error: Something went wrong please try again later.",
    });
  }
};
