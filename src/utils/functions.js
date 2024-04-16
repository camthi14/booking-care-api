import _ from "lodash";
import dateFormat from "dateformat";

/**
 *
 * @param {object} obj
 * @returns
 */
export function deleteKeyObjectNull(obj) {
  Object.keys(obj).forEach((key) => {
    if (
      (Array.isArray(obj[key]) && !obj[key]?.length) ||
      (typeof obj[key] !== "number" && _.isEmpty(obj[key])) ||
      !obj[key]
    ) {
      delete obj[key];
    }
  });

  return obj;
}

export function formatDateUnder(date) {
  let today = new Date(date);
  let formattedDate = today.toISOString().slice(0, 10);
  return formattedDate;
}

export function generateToken() {
  // Tạo ra một mảng chứa các số từ 0 đến 9
  const numbers = Array.from({ length: 10 }, (_, i) => i);
  // Trộn ngẫu nhiên các số trong mảng
  numbers.sort(() => Math.random() - 0.5);
  // Lấy 6 số đầu tiên từ mảng đã trộn
  const tokenNumbers = numbers.slice(0, 6);
  // Chuyển các số thành chuỗi và ghép lại để tạo mã token
  const token = tokenNumbers.join("");
  return token;
}

export function sortObject(obj) {
  let sorted = {};
  let str = [];
  let key;

  for (key in obj) {
    if (obj.hasOwnProperty(key)) {
      str.push(encodeURIComponent(key));
    }
  }

  str.sort();

  for (key = 0; key < str.length; key++) {
    sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
  }

  return sorted;
}

export function generateOrderId(date = "") {
  let now = new Date();
  if (date) {
    now = new Date(date);
  }
  return dateFormat(now, "yyyymmddHHmmss");
}
