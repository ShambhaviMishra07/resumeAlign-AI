const express = require("express");
const router = express.Router();
const multer = require("multer");
const { protect } = require("../../middleware/auth.middleware");
const { analyzeATS, matchJob, aiFeedback } = require("./analyze.controller");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
 fileFilter: (req, file, cb) => {
    console.log("File:", file.originalname);
    console.log("MIME:", file.mimetype);

    const allowedMimeTypes = [
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/octet-stream"
    ];

    const allowedExtensions = [".pdf", ".docx"];
    const extension = require("path").extname(file.originalname).toLowerCase();

    if (
        allowedMimeTypes.includes(file.mimetype) &&
        allowedExtensions.includes(extension)
    ) {
        cb(null, true);
    } else {
        cb(new Error("Only PDF and DOCX files are allowed"));
    }
},
});

router.post("/ats", upload.single("resume"), analyzeATS);
router.post("/match", matchJob);
router.post("/ai-feedback", aiFeedback);


module.exports = router;