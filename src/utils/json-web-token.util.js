import jwt from "jsonwebtoken";
import APIError from "./api-error.util.js";

function signJSWebToken({ privateKey, data, options }) {
  return jwt.sign(data, privateKey, {
    ...(options && options),
  });
}

function verifyJSWebToken({ privateKey, token }) {
  return new Promise((resolve, reject) => {
    try {
      const decode = jwt.verify(token, privateKey);
      const { user } = decode;
      resolve(user);
    } catch (error) {
      reject(new APIError(403, error.message));
    }
  });
}

export { signJSWebToken, verifyJSWebToken };
