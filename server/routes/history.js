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
  removeHistory, // Add this
} from "../controller/history.js";

const routes = express.Router();
routes.get("/user/:userId", getallhistoryVideo); // Changed route
routes.post("/views/:videoId", handleview);
routes.post("/:videoId", handlehistory);
routes.delete("/:historyId", removeHistory); // Add delete route
export default routes;