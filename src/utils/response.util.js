function responseAPI(data, message = "", options = {}) {
  return {
    data,
    message,
    status: "Success",
    ...options,
  };
}

export default responseAPI;
