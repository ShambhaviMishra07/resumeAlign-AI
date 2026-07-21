const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");

const parseResume = async (file) => {
  const ext = file.originalname.split(".").pop().toLowerCase();

  if (ext === "pdf") {
    const data = await pdfParse(file.buffer);
    return data.text;
  }

  if (ext === "docx") {
    const result = await mammoth.extractRawText({ buffer: file.buffer });
    return result.value;
  }

  throw new Error("Unsupported file type. Please upload PDF or DOCX only.");
};

module.exports = parseResume;