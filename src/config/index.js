const config = {
  app: {
    port: process.env.PORT || 5000,
    clientURL: process.env.URL_CLIENT,
  },
  db: {
    username: process.env.DB_USERNAME || "root",
    password: process.env.DB_PASSWORD || "",
    host: process.env.DB_HOST || "localhost",
    database: process.env.DB_DATABASE || "test",
    port: process.env.DB_PORT || 3306,
  },
  cloudinary: {
    cloudName: process.env.CLOUDINARY_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_SECRET,
  },
  jwt: {
    privateKeyAccessToken: process.env.PRIVATE_KEY_ACCESS_TOKEN || "private-key1",
    privateKeyRefreshToken: process.env.PRIVATE_KEY_REFRESH_TOKEN || "private-key2",
    expiredAccessToken: process.env.EXPIRED_ACCESS_TOKEN || "3h",
    expiredRefreshToken: process.env.EXPIRED_REFRESH_TOKEN || "1w",
  },
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    redirectUrl: process.env.GOOGLE_REDIRECT_URL,
    refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
  },
  vnp: {
    vnp_TmnCode: process.env.VNP_TMNCODE,
    vnp_HashSecret: process.env.VNP_HASH_SECRET,
    vnp_Url: process.env.VNP_URL,
    vnp_Api: process.env.VNP_API,
    vnp_ReturnUrl: process.env.VNP_RETURN_URL,
    currCode: "VND",
  },
  location: "vn",
};
export default config;
