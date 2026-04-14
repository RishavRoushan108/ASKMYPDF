"use client";
import { FiUpload } from "react-icons/fi";
import axios from "axios";

import * as React from "react";

const FileUpload: React.FC = () => {
  const handlefileupload = async () => {
    const el = document.createElement("input");
    el.setAttribute("type", "file");
    el.setAttribute("accept", "application/pdf");
    el.addEventListener("change", async (ev) => {
      if (el.files && el.files.length > 0) {
        const file = el.files.item(0);
        if (file) {
          const formData = new FormData();
          formData.append("pdf", file);
          const res = await axios.post(
            process.env.NEXT_PUBLIC_BASE_URL + "/upload/pdf",
            formData,
            { withCredentials: true },
          );
          console.log("file uploaded successfully");
          console.log(res);
        }
      }
    });
    el.click();
  };
  return (
    <button
      className="flex flex-col items-center gap-2 py-5  md:gap-5 md:px-10 md:py-10 
                 bg-white/10 backdrop-blur-md 
                 text-gray-200 rounded-xl
                 border border-white/20
                 hover:bg-white/20 hover:text-white
                 transition-all duration-200
                 shadow-md hover:shadow-lg"
      onClick={handlefileupload}
    >
      <FiUpload size={48} className="text-blue-400" />
      <div className="text-xl md:text-2xl font-bold">Upload PDF</div>
    </button>
  );
};

export default FileUpload;
