import express from "express";
import { getallvideo, uploadvideo, getVideosByUploader, updateVideo } from "../controller/video.js";
import upload from "../filehelper/filehelper.js";

const routes = express.Router();

routes.post("/upload", upload.single("file"), uploadvideo);
routes.get("/getall", getallvideo);
routes.get("/by-uploader/:uploaderId", getVideosByUploader);
// Update video (description etc.)
routes.put("/:id", updateVideo);

export default routes;