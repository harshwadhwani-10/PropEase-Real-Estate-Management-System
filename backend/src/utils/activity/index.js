// backend/src/utils/activity/index.js
import { ActivityType } from "../../enums/activity.js"; // keep your path
import {
  enquiryDescriptionCreate,
  enquiryDescriptionDelete,
  propertyDescriptionCreate,
  propertyDescriptionDelete,
  propertyDescriptionUpdate,
} from "./description.js";

/**
 * Enquiry activity description
 * @param {string} action
 * @param {Object} enquiry
 * @returns {string}
 */
export const activityEnquiryDescription = function (action, enquiry = {}) {
  switch (action) {
    case ActivityType.enquiry?.new:
      return enquiryDescriptionCreate(enquiry);
    case ActivityType.enquiry?.delete:
      return enquiryDescriptionDelete(enquiry);
    default:
      return "";
  }
};

/**
 * Property activity description
 * @param {string} action
 * @param {Object} property
 * @returns {string}
 */
export const activityPropertyDescription = function (action, property = {}) {
  switch (action) {
    case ActivityType.property?.new:
      return propertyDescriptionCreate(property);
    case ActivityType.property?.delete:
      return propertyDescriptionDelete(property);
    case ActivityType.property?.update:
      return propertyDescriptionUpdate(property);
    default:
      return "";
  }
};

export const activitySigninDescription = function (user = {}) {
  return `User ${user?.email ?? "unknown"} signed in.`;
};
