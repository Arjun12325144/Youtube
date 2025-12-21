// import express from "express";
// import {
//   getallhistoryVideo,
//   handlehistory,
//   handleview,
// } from "../controller/history.js";

// const routes = express.Router();
// routes.get("/:userId", getallhistoryVideo);
// routes.post("/views/:videoId", handleview);
// routes.post("/:videoId", handlehistory);
// export default routes;
import express from "express";
import {
  getallhistoryVideo,
  handlehistory,
  handleview,
  removeHistory,
  clearAllHistory,
} from "../controller/history.js";

const routes = express.Router();
routes.get("/user/:userId", getallhistoryVideo);
routes.post("/views/:videoId", handleview);
routes.post("/:videoId", handlehistory);
routes.delete("/clear/:userId", clearAllHistory); // Clear all history route
routes.delete("/:historyId", removeHistory);
export default routes;