const express = require("express");
const router = express.Router();
const { protect } = require("../../middleware/auth.middleware");
const { getResume, createResume, updateResume } = require("./resume.controller");

router.get("/", protect, getResume);
router.post("/", protect, createResume);
router.put("/", protect, updateResume);

module.exports = router;