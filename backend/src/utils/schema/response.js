// backend/src/utils/schema/response.js

const defaultSuccess = {
  status: 200,
  message: "Success!",
  data: {}
};

export const responseSuccess = (def = {}) => {
  return {
    status: def.status ?? defaultSuccess.status,
    statusCode: def.status ?? defaultSuccess.status,
    message: def.message ?? defaultSuccess.message,
    data: def.data ?? defaultSuccess.data
  };
};

const defaultError = {
  status: 400,
  error: "error",
  message: "Something went wrong, please try again later."
};

export const responseError = (def = {}) => {
  return {
    status: def.status ?? defaultError.status,
    statusCode: def.status ?? defaultError.status,
    error: def.error ?? defaultError.error,
    message: def.message ?? defaultError.message
  };
};
