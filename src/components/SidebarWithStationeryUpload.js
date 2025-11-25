import React, { useState } from "react";
import API from "../services/api";

const SidebarWithStationeryUpload = () => {
  const [title, setTitle] = useState("");
  const [pdfFile, setPdfFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [msgType, setMsgType] = useState(""); // success | error

  const themeColor = "#969195";
  const categories = ["Frames", "Stationery", "Printing", "Mirrors"];

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
    <div className="flex flex-col h-full w-64 bg-white border-r p-4">
      {/* Categories Section */}
      <div className="mb-6">
        <h3 className="font-semibold mb-3 text-lg" style={{ color: themeColor }}>
          Shop by Department
        </h3>
        <ul className="space-y-2 text-sm">
          {categories.map((cat, i) => (
            <li 
              key={i} 
              className="cursor-pointer hover:text-blue-700 transition-colors duration-200 py-1 px-2 rounded"
              style={{ color: themeColor }}
            >
              {cat}
            </li>
          ))}
        </ul>
      </div>

      {/* Stationery Upload Section */}
      <div
        className="rounded-md p-4 shadow-lg flex-1"
        style={{ backgroundColor: "#ffffff", border: `2px solid ${themeColor}` }}
      >
        <h3
          className="font-semibold text-lg mb-4"
          style={{ color: themeColor }}
        >
          Stationery Upload
        </h3>

        {/* Message Box */}
        {message && (
          <div
            className={`p-3 mb-4 rounded text-white text-sm`}
            style={{
              backgroundColor: msgType === "success" ? "#6c6a6f" : "#b94a48",
            }}
          >
            {message}
          </div>
        )}

        <div className="flex flex-col gap-3">
          <input
            type="text"
            placeholder="Enter PDF Title"
            className="rounded p-2 focus:ring-2 focus:outline-none text-sm border border-gray-300"
            style={{
              border: `1.5px solid ${themeColor}`,
            }}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => setPdfFile(e.target.files[0])}
            className="rounded p-2 focus:ring-2 focus:outline-none text-sm border border-gray-300"
            style={{
              border: `1.5px solid ${themeColor}`,
            }}
          />

          <button
            onClick={handleUpload}
            className="rounded py-2 text-white transition text-sm font-medium"
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
    </div>
  );
};

export default SidebarWithStationeryUpload;