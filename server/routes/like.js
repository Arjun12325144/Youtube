import express from "express";
import { handlelike, getallLikedVideo } from "../controller/like.js";

const routes = express.Router();
// Keep legacy route for backward compatibility and also expose explicit /user/:userId
routes.get("/user/:userId", getallLikedVideo);
routes.get("/:userId", getallLikedVideo);
routes.post("/:videoId", handlelike);
export default routes;