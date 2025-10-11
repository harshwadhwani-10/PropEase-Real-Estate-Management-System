// backend/src/utils/activity/description.js

/**
 * Helper to format property price & name
 */

const propertyPrice = function (currency = "", price = 0, transactionType = "sale", paymentFrequency = "") {
  return `for ${transactionType} at ${currency} ${price}${transactionType === "sale" ? "." : " [" + (paymentFrequency || "") + "]"}`;
};

const propertyName = function (name = "") {
  if (typeof name !== "string") return "";
  return name.length > 10 ? name.slice(0, 10) + "..." : name;
};

export const propertyDescriptionCreate = function (property = {}) {
  const { name = "", transactionType = "sale", price = 0, paymentFrequency = "", currency = "" } = property;
  return `Created a Property named [${propertyName(name)}] ${propertyPrice(currency, price, transactionType, paymentFrequency)}`;
};

export const propertyDescriptionDelete = function (property = {}) {
  const { transactionType = "sale", name = "" } = property;
  return `Deleted a Property listed for ${transactionType} named [${propertyName(name)}].`;
};

export const propertyDescriptionUpdate = function (property = {}) {
  const { name = "", transactionType = "sale", price = 0, paymentFrequency = "", currency = "" } = property;
  return `Updated a Property listed for ${transactionType} named [${propertyName(name)}] ${propertyPrice(currency, price, transactionType, paymentFrequency)}.`;
};

export const enquiryDescriptionCreate = function (enquiry = {}) {
  const { topic = "", property = {} } = enquiry;
  return `Enquiry sent to property [${property.name ? propertyName(property.name) : (property.property_id || "")}] regarding a topic about ${topic}.`;
};

export const enquiryDescriptionDelete = function (enquiry = {}) {
  const { topic = "", property = {} } = enquiry;
  return `Deleted an Enquiry that was sent to property [${property.name ? propertyName(property.name) : (property.property_id || "")}] regarding a topic about ${topic}.`;
};
