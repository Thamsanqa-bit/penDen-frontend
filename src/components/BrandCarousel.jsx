import React, { useState } from "react";
import API from "../services/api";

export default function BrandCarousel() {
  const [title, setTitle] = useState("");
  const [pdfFile, setPdfFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [msgType, setMsgType] = useState(""); // success | error

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
    <div className="mt-6 bg-white rounded-md p-6 shadow-lg border border-green-200">
      <h3 className="font-semibold text-xl mb-4 text-green-700">
        Product List Upload
      </h3>

      {/* Message Box */}
      {message && (
        <div
          className={`p-3 mb-4 rounded text-white ${
            msgType === "success" ? "bg-green-600" : "bg-red-600"
          }`}
        >
          {message}
        </div>
      )}

      <div className="flex flex-col gap-4">

        <input
          type="text"
          placeholder="Enter PDF Title"
          className="border border-green-300 rounded p-2 focus:ring-2 focus:ring-green-500 focus:outline-none"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <input
          type="file"
          accept="application/pdf"
          onChange={(e) => setPdfFile(e.target.files[0])}
          className="border border-green-300 p-2 rounded focus:ring-2 focus:ring-green-500 focus:outline-none"
        />

        <button
          onClick={handleUpload}
          className={`rounded py-2 text-white transition ${
            loading
              ? "bg-green-300 cursor-not-allowed"
              : "bg-green-600 hover:bg-green-700"
          }`}
          disabled={loading}
        >
          {loading ? "Uploading..." : "Upload PDF"}
        </button>
      </div>
    </div>
  );
}
