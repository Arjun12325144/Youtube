import express from "express";
import { login, updateprofile } from "../controller/Auth.js";
import { getUserById } from "../controller/Auth.js";

const router = express.Router();

router.post("/login", login);
router.patch("/update/:id", updateprofile);
router.get("/:id", getUserById);

export default router;
