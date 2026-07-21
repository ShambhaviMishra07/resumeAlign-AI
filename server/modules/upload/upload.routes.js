const express = require("express");
const router = express.Router();
const multer = require("multer");
const { protect } = require("../../middleware/auth.middleware");
const { parseResumeFile } = require("./upload.controller");

// Store file in memory — no disk writes needed
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (req, file, cb) => {
    const allowed = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only PDF and DOCX files are allowed"));
    }
  },
});

router.post("/parse", protect, upload.single("resume"), parseResumeFile);

module.exports = router;