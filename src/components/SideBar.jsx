import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

export default function SidebarWithStationeryUpload() {
  const [title, setTitle] = useState("");
  const [pdfFile, setPdfFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [msgType, setMsgType] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigate = useNavigate();
  const themeColor = "#969195";

  const categories = [
    { name: "Frames", value: "Frames" },
    { name: "Stationery", value: "Stationeries" },
    { name: "Printing", value: "Printing" },
    { name: "Mirrors", value: "Mirrors" },
  ];

  const handleCategoryClick = (category) => {
    navigate("/?category=" + category);
  };

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
    } catch {
      setMsgType("error");
      setMessage("Upload failed. Please login first.");
    }

    setLoading(false);
  };

  return (
    <div className="w-full">

      {/* MOBILE DROPDOWN BUTTON */}
      <div className="md:hidden w-full bg-gray-100 p-3 border flex justify-between items-center"
           onClick={() => setSidebarOpen(!sidebarOpen)}>
        <span className="font-semibold text-gray-700">
          Shop by Category
        </span>

        {sidebarOpen ? <ChevronUp /> : <ChevronDown />}
      </div>

      {/* SIDEBAR CONTAINER */}
      <div
        className={`md:block ${
          sidebarOpen ? "block" : "hidden"
        } bg-white border-r p-4 w-full md:max-w-64`}
      >
        {/* CATEGORY LIST */}
        <div className="mb-6">
          <h3 className="font-semibold mb-3 text-lg" style={{ color: themeColor }}>
            Shop by Department
          </h3>

          <ul className="space-y-2 text-sm">
            {categories.map((category, index) => (
              <li
                key={index}
                onClick={() => handleCategoryClick(category.value)}
                className="cursor-pointer bg-gray-100 hover:bg-gray-200 py-2 px-3 rounded-lg flex justify-between items-center transition group"
              >
                <span className="font-medium text-gray-700">
                  {category.name}
                </span>

                <svg
                  className="w-4 h-4 text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M9 5l7 7-7 7" 
                  />
                </svg>
              </li>
            ))}
          </ul>
        </div>

        {/* UPLOAD SECTION */}
        <div
          className="rounded-md p-4 shadow-lg flex flex-col"
          style={{
            backgroundColor: "#ffffff",
            border: `2px solid ${themeColor}`,
          }}
        >
          <h3 className="font-semibold text-lg mb-4" style={{ color: themeColor }}>
            Upload Stationery List
          </h3>

          {message && (
            <div
              className={`p-3 mb-4 rounded text-white text-sm ${
                msgType === "success" ? "bg-green-600" : "bg-red-600"
              }`}
            >
              {message}
            </div>
          )}

          <div className="flex flex-col gap-4">

            {/* Title Input */}
            <input
              type="text"
              placeholder="Enter PDF Title"
              className="w-full rounded-lg p-3 border text-base placeholder-gray-500 focus:ring-2 focus:outline-none"
              style={{ border: `1.5px solid ${themeColor}` }}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            {/* File Input */}
            <div className="relative">
              <input
                type="file"
                accept="application/pdf"
                onChange={(e) => setPdfFile(e.target.files[0])}
                className="w-full h-full cursor-pointer opacity-0 absolute inset-0 z-10"
              />

              <label
                className="w-full rounded-lg p-3 border flex items-center justify-center gap-2 cursor-pointer bg-white text-sm"
                style={{ border: `1.5px solid ${themeColor}`, color: themeColor }}
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>

                <span>
                  {pdfFile ? pdfFile.name : "Choose File"}
                </span>
              </label>
            </div>

            {/* Upload Button */}
            <button
              onClick={handleUpload}
              className="w-full rounded-lg py-2 px-4 text-white text-sm font-medium transition shadow-sm hover:shadow-md active:scale-95 disabled:opacity-50"
              style={{ backgroundColor: loading ? "#b3b3b3" : themeColor }}
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center gap-2 justify-center">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Uploading...
                </div>
              ) : (
                "Upload PDF"
              )}
            </button>
          </div>
        </div>
      </div>

      {/* IMAGE GRID FOR MOBILE */}
      <div className="mt-6 grid grid-cols-2 gap-3 px-3 md:hidden">
        {/* Example images — replace with your dynamic images */}
        <img src="https://via.placeholder.com/150" className="rounded-lg w-full" alt="" />
        <img src="https://via.placeholder.com/150" className="rounded-lg w-full" alt="" />

        <img src="https://via.placeholder.com/150" className="rounded-lg w-full" alt="" />
        <img src="https://via.placeholder.com/150" className="rounded-lg w-full" alt="" />
      </div>

    </div>
  );
}
