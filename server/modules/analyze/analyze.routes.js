const express = require("express");
const router = express.Router();
const multer = require("multer");
const { protect } = require("../../middleware/auth.middleware");
const { analyzeATS, matchJob, aiFeedback } = require("./analyze.controller");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    allowed.includes(file.mimetype)
      ? cb(null, true)
      : cb(new Error("Only PDF and DOCX files are allowed"));
  },
});

router.post("/ats", protect, upload.single("resume"), analyzeATS);
router.post("/match", protect, matchJob);
router.post("/ai-feedback", protect, aiFeedback);


module.exports = router;