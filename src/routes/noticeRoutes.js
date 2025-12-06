import express from "express";
import {
  createNotice,
  getNotices,
  deleteNotice,
  updateNotice,
} from "../controllers/noticeController.js";

const router = express.Router();

router.post("/", createNotice);
router.get("/", getNotices);
router.delete("/:id", deleteNotice);
router.patch("/:id", updateNotice);

export default router;
