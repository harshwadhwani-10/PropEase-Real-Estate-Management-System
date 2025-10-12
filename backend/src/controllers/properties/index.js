import fs from "fs";
import path from "path";
import util from "util";
import { pipeline } from "stream";
import { v4 as uuidv4 } from "uuid";
import { fileURLToPath } from "url";
import { Property } from "../../models/property.js";
import { User } from "../../models/user.js";
import { addActivity } from "../../services/activity.js";
import { activityPropertyDescription } from "../../utils/activity/index.js"; // ✅ FIXED
import { sendTargetedNotification } from "../../websocket/index.js"; // ✅ FIXED
import { ActivityType } from "../../enums/activity.js"; // ✅ FIXED
import { SocketNotificationType } from "../../enums/notifications.js"; // ✅ FIXED
import { io } from "../../index.js";

const pump = util.promisify(pipeline);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const createProperty = async (req, res) => {
  const { name, address, type, position } = req.body;
  if (!name || !address || !type || !position)
    return res.status(400).json({ message: "Error: Required fields are missing." });

  const user_id = req.user.id;

  try {
    const newProperty = new Property({ property_id: uuidv4(), user_id, ...req.body });
    const user = await User.findOne({ user_id });
    if (!user) return res.status(404).json({ message: "Error: User not found." });

    const activity = addActivity(user, {
      action: ActivityType.property.new,
      description: activityPropertyDescription(ActivityType.property.new, newProperty),
      property_id: newProperty.property_id,
    });

    user.properties.push(newProperty.property_id);
    await user.save();

    if (activity)
      sendTargetedNotification(io, SocketNotificationType.activity, activity, user_id);

    await newProperty.save();
    res.status(201).json({ 
      message: "Property created successfully", 
      data: newProperty 
    });
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: error.message });
  }
};

export const getProperties = async (req, res) => {
  const {
    search = "",
    filter = "",
    sort = "latest",
    limit = 4,
    lastCreatedAt,
    lastPrice,
    lastName,
  } = req.query;

  const { sortOrder, sortField } = composeSort(sort);
  const rangeQuery = composeRangeQuery(sort, { lastCreatedAt, lastPrice, lastName });
  const filterQuery = composeFilterQuery(filter, search);
  const query = { ...filterQuery, ...rangeQuery };

  try {
    const properties = await Property.find(query)
      .limit(parseInt(limit))
      .sort({ [sortField]: sortOrder, _id: 1 })
      .collation({ locale: "en", strength: 2 });

    const { price, name, createdAt } = properties[properties.length - 1] || {};
    res.status(200).json({
      data: {
        items: properties,
        ...(sort === "price" && { lastPrice: price }),
        ...(sort === "name" ? { lastName: name } : { lastCreatedAt: createdAt }),
        hasMore: !!(price || name || createdAt),
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMyProperties = async (req, res) => {
  const user_id = req.user?.id;
  if (!user_id)
    return res.status(400).json({ message: "Invalid request missing user id" });

  try {
    const properties = await Property.find({ user_id });
    res.status(200).json({ data: properties });
  } catch (error) {
    res.status(500).json({ message: "Error: Something went wrong" });
  }
};

export const getProperty = async (req, res) => {
  const { id } = req.params;
  try {
    const property = await Property.findOne({ property_id: id });
    if (!property) return res.status(404).json({});
    res.status(200).json({ data: property });
  } catch (error) {
    res.status(400).json({ message: "Error: Something went wrong" });
  }
};

export const updateProperty = async (req, res) => {
  const property_id = req.params.id;
  if (!property_id)
    return res.status(404).json({ message: "Error: Can't update unknown property" });

  const {
    name,
    address,
    description,
    type,
    position,
    price,
    paymentFrequency,
    features,
    currency,
    contactNumber,
    transactionType,
    contactEmail,
  } = req.body;

  const $set = {
    ...(name !== undefined && { name }),
    ...(address !== undefined && { address }),
    ...(description !== undefined && { description }),
    ...(type !== undefined && { type }),
    ...(transactionType !== undefined && { transactionType }),
    ...(position !== undefined && { position }),
    ...(price !== undefined && { price }),
    ...(paymentFrequency !== undefined && { paymentFrequency }),
    ...(features !== undefined && { features }),
    ...(currency !== undefined && { currency }),
    ...(contactNumber !== undefined && { contactNumber }),
    ...(contactEmail !== undefined && { contactEmail: contactEmail.toLowerCase() }),
  };

  try {
    const user_id = req.user.id;
    const user = await User.findOne({ user_id });
    if (!user) return res.status(404).json({ message: "Error: User not found." });

    const property = await Property.findOneAndUpdate(
      { property_id, user_id },
      { $set },
      { new: true, runValidators: true }
    );
    if (!property)
      return res.status(404).json({ message: "Error: Can't update unknown property" });

    const activity = addActivity(user, {
      action: ActivityType.property.update,
      description: activityPropertyDescription(ActivityType.property.update, property),
      property_id: property.property_id,
    });

    await user.save();
    if (activity)
      sendTargetedNotification(SocketNotificationType.activity, activity, user_id);

    res.status(200).json({
      data: property,
      message: "Success: Property is updated.",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteProperty = async (req, res) => {
  const { id } = req.params;
  const user_id = req.user.id;

  try {
    const user = await User.findOne({ user_id });
    if (!user) return res.status(404).json({ message: "Error: User not found." });

    const property = await Property.findOneAndDelete({ property_id: id, user_id });
    if (!property) return res.status(404).json({});

    if (property.images?.length) unlinkImages(property.images);

    user.properties = user.properties.filter((i) => i !== id);
    const activity = addActivity(user, {
      action: ActivityType.property.delete,
      description: activityPropertyDescription(ActivityType.property.delete, property),
      property_id: id,
    });
    await user.save();

    if (activity)
      sendTargetedNotification(SocketNotificationType.activity, activity, user_id);

    res.status(200).json({ data: property.toObject() });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const addImagesProperty = async (req, res) => {
  const property_id = req.params.id;
  try {
    const property = await Property.findOne({ property_id });
    if (!property)
      return res.status(404).json({ message: "Error: Can't find property." });

    if (property.user_id !== req.user.id)
      return res.status(401).json({ message: "Error: you do not own the property." });

    const files = req.files;
    if (!files || files.length === 0)
      return res.status(400).json({ message: "No images uploaded." });

    for (const file of files) {
      const imgName = Date.now() + "-" + file.originalname;
      const uploadsDir = path.join(__dirname, "..", "uploads");
      const uploadPath = path.join(uploadsDir, imgName);
      
      // Ensure uploads directory exists
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
      
      // Write file to disk
      fs.writeFileSync(uploadPath, file.buffer);
      
      const image = `${req.protocol}://${req.headers.host}/uploads/${imgName}`;
      property.images.push(image);
    }

    await property.save();
    res.status(201).json({ 
      message: "Images uploaded successfully",
      data: property.images 
    });
  } catch (error) {
    console.error('Image upload error:', error);
    res.status(500).json({ message: error.message });
  }
};

export const deleteImagesProperty = async (req, res) => {
  const property_id = req.params.id;
  const { images } = req.body;
  try {
    const property = await Property.findOne({ property_id });
    if (!property)
      return res.status(404).json({ message: "Error: Can't find property." });

    if (property.user_id !== req.user.id)
      return res.status(401).json({ message: "Error: you do not own the property." });

    property.images = property.images.filter((img) => !images.includes(img));
    await property.save();

    unlinkImages(images);
    res.status(200).json({ data: images });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const unlinkImages = (propertyImages = []) => {
  const images = propertyImages.map((img) => {
    const parts = img.split("/");
    return parts[parts.length - 1];
  });
  images.forEach((img) => {
    const filePath = path.join(process.cwd(), "uploads", img);
    fs.unlink(filePath, (err) => {
      if (err) console.error("Failed to delete image:", img, err.message);
    });
  });
};

const composeFilterQuery = (filter, search) => {
  const filterQuery = {};
  if (filter) {
    const transactionTypes = [];
    const propertyTypes = [];
    filter.split(",").forEach((t) =>
      t === "sale" || t === "rent"
        ? transactionTypes.push(t)
        : propertyTypes.push(t)
    );
    if (propertyTypes.length) filterQuery.type = { $in: propertyTypes };
    if (transactionTypes.length)
      filterQuery.transactionTypes = { $in: transactionTypes };
  }
  if (search) {
    filterQuery.$or = [
      { name: { $regex: search, $options: "i" } },
      { address: { $regex: search, $options: "i" } },
    ];
  }
  return filterQuery;
};

const composeRangeQuery = (sort, { lastCreatedAt, lastPrice, lastName } = {}) => {
  if (sort === "price" && lastPrice && lastCreatedAt)
    return { price: { $lte: lastPrice }, createdAt: { $ne: new Date(lastCreatedAt) } };
  else if (sort === "latest" && lastCreatedAt)
    return { createdAt: { $lt: new Date(lastCreatedAt) } };
  else if (sort === "name" && lastName)
    return { name: { $gt: lastName } };
  return {};
};

const composeSort = (sort) => {
  switch (sort) {
    case "name":
      return { sortField: "name", sortOrder: 1 };
    case "price":
      return { sortField: "price", sortOrder: -1 };
    default:
      return { sortField: "createdAt", sortOrder: -1 };
  }
};
