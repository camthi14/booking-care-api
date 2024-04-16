import OtpGenerator from "otp-generator";
import bcrypt from "bcrypt";

function createOTP() {
  const OTP = OtpGenerator.generate(6, {
    digits: true,
    lowerCaseAlphabets: false,
    upperCaseAlphabets: false,
    specialChars: false,
  });
  return OTP;
}

async function hashOTP(otp) {
  try {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(otp, salt);
  } catch (error) {
    Promise.reject(error);
  }
}

async function compareOTP(otp, hash) {
  try {
    return await bcrypt.compare(otp, hash);
  } catch (error) {
    Promise.reject(error);
  }
}

export { createOTP, hashOTP, compareOTP };
