import "dotenv/config";
import config from "./src/config/index.js";
import app from "./src/app.js";

const PORT = config.app.port;

app.listen(PORT, (req, res) => {
  console.log(`API RUNNING http://localhost:${PORT}/ `);
});
