import { Enquiry } from "../../models/enquiry.js";
import { v4 as uuidV4 } from "uuid";
import { User } from "../../models/user.js";
import { sendTargetedNotification } from "../../websocket/index.js";
import { SocketNotificationType } from "../../enums/notifications.js";
import { addActivity } from "../../services/activity.js";
import { ActivityType } from "../../enums/activity.js";
import { activityEnquiryDescription } from "../../utils/activity/index.js";

export const createEnquiry = async (req, res) => {
  const { title, content, topic, email, userTo, property } = req.body;
  if (!title || !content || !topic || !email || !userTo)
    return res.status(400).send({ message: "Some fields are missing!" });

  const userFrom = req.user.id;
  if (userFrom === userTo)
    return res
      .status(400)
      .send({ message: "Not allowed to send enquiry to yourself." });

  const users = await User.find({
    $or: [{ user_id: userFrom }, { user_id: userTo }],
  });
  if (users.length < 2)
    return res.status(404).send({ message: "Target users are not found." });

  try {
    const newEnquiry = new Enquiry({
      enquiry_id: uuidV4(),
      read: false,
      users: {
        from: { user_id: userFrom, keep: true },
        to: { user_id: userTo, keep: true },
      },
      property,
      ...req.body,
    });

    await newEnquiry.save();

    const user = users.find((item) => item.user_id === userFrom);
    const activity = addActivity(user, {
      action: ActivityType.enquiry.new,
      description: activityEnquiryDescription(
        ActivityType.enquiry.new,
        newEnquiry
      ),
      enquiry_id: newEnquiry.enquiry_id,
    });
    await user.save();

    if (activity)
      sendTargetedNotification(
        SocketNotificationType.activity,
        activity,
        userFrom
      );

    sendTargetedNotification(
      SocketNotificationType.enquiry,
      newEnquiry,
      userTo
    );

    return res.status(201).send({ data: newEnquiry });
  } catch (error) {
    return res.status(400).send(error);
  }
};

export const getEnquiries = async (req, res) => {
  const user_id = req.user.id;
  try {
    const list = await Enquiry.find({
      $or: [
        { "users.from.user_id": user_id, "users.from.keep": true },
        { "users.to.user_id": user_id, "users.to.keep": true },
      ],
    });
    return res.status(200).send({ data: list });
  } catch (error) {
    return res.status(400).send(error);
  }
};

export const getEnquiry = async (req, res) => {
  const { id } = req.params;
  const user_id = req.user?.id;

  try {
    const enquiry = await Enquiry.findOne({
      enquiry_id: id,
      $or: [
        { "users.from.user_id": user_id, "users.from.keep": true },
        { "users.to.user_id": user_id, "users.to.keep": true },
      ],
    });

    if (!enquiry)
      return res.status(200).send({ message: "Can't find Enquiry." });

    return res.status(200).send({ data: enquiry });
  } catch (error) {
    return res.status(400).send(error);
  }
};

export const updateEnquiry = async (req, res) => {
  const enquiry_id = req.params.id;
  if (!enquiry_id)
    return res.status(404).send({ message: "Can't find Enquiry." });

  const user_id = req.user.id;
  const { content, title, topic, read } = req.body;

  const $set = {
    ...(content !== undefined && { content }),
    ...(title !== undefined && { title }),
    ...(topic !== undefined && { topic }),
    ...(read !== undefined && { read }),
  };

  try {
    const enquiry = await Enquiry.findOneAndUpdate(
      {
        $or: [
          { "users.from.user_id": user_id, enquiry_id },
          { "users.to.user_id": user_id, enquiry_id },
        ],
      },
      { $set },
      { new: true }
    );

    if (!enquiry)
      return res.status(404).send({ message: "Can't find Enquiry." });

    return res.status(201).send({ data: enquiry });
  } catch (error) {
    return res.status(400).send(error);
  }
};

export const deleteEnquiry = async (req, res) => {
  const { id } = req.params;
  const user_id = req.user.id;

  try {
    const enquiry = await Enquiry.findOne({ enquiry_id: id });
    if (!enquiry) return res.status(404).send({});

    if (
      enquiry.users.from.user_id !== user_id &&
      enquiry.users.to.user_id !== user_id
    )
      return res.status(400).send({ message: "Not allowed." });

    if (enquiry.users.from.user_id === user_id)
      enquiry.users.from.keep = false;
    if (enquiry.users.to.user_id === user_id)
      enquiry.users.to.keep = false;

    if (!enquiry.users.from.keep && !enquiry.users.to.keep)
      await enquiry.delete();
    else await enquiry.save();

    const user = await User.findOne({ user_id });
    const activity = addActivity(user, {
      action: ActivityType.enquiry.delete,
      description: activityEnquiryDescription(
        ActivityType.enquiry.delete,
        enquiry
      ),
    });
    await user.save();

    if (activity)
      sendTargetedNotification(
        SocketNotificationType.activity,
        activity,
        user_id
      );

    return res.status(200).send({ data: enquiry });
  } catch (error) {
    return res.status(400).send(error);
  }
};
