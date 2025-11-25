import React, { useState } from "react";
import API from "../services/api";

export default function BrandCarousel() {
  const [title, setTitle] = useState("");
  const [pdfFile, setPdfFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [msgType, setMsgType] = useState(""); // success | error

  const themeColor = "#969195";

  const handleUpload = async () => {
    if (!title || !pdfFile) {
      setMsgType("error");
      setMessage("Please enter a title and select a PDF file.");
      return;
    }

    setLoading(true);
    setMessage("");

    const formData = new FormData();
    formData.append("title", title);
    formData.append("pdf_file", pdfFile);

    try {
      await API.post("upload-pdf/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setMsgType("success");
      setMessage("PDF uploaded successfully!");

      setTitle("");
      setPdfFile(null);
    } catch (error) {
      console.error(error);
      setMsgType("error");
      setMessage("Upload failed. Please login first.");
    }

    setLoading(false);
  };

  return (
    <div
      className="mt-6 rounded-md p-6 shadow-lg"
      style={{ backgroundColor: "#ffffff", border: `3px solid ${themeColor}` }}
    >
      <h3
        className="font-semibold text-xl mb-4"
        style={{ color: themeColor }}
      >
        Stationery Upload
      </h3>

      {/* Message Box */}
      {message && (
        <div
          className={`p-3 mb-4 rounded text-white`}
          style={{
            backgroundColor: msgType === "success" ? "#6c6a6f" : "#b94a48",
          }}
        >
          {message}
        </div>
      )}

      <div className="flex flex-col gap-4">
        <input
          type="text"
          placeholder="Enter PDF Title"
          className="rounded p-2 focus:ring-2 focus:outline-none"
          style={{
            border: `2px solid ${themeColor}`,
            focusRingColor: themeColor,
          }}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <input
          type="file"
          accept="application/pdf"
          onChange={(e) => setPdfFile(e.target.files[0])}
          className="rounded p-2 focus:ring-2 focus:outline-none"
          style={{
            border: `2px solid ${themeColor}`,
            focusRingColor: themeColor,
          }}
        />

        <button
          onClick={handleUpload}
          className="rounded py-2 text-white transition"
          style={{
            backgroundColor: loading ? "#c8c7c9" : themeColor,
            cursor: loading ? "not-allowed" : "pointer",
          }}
          disabled={loading}
        >
          {loading ? "Uploading..." : "Upload PDF"}
        </button>
      </div>
    </div>
  );
}
