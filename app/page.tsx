'use client';

import Image from "next/image";
import React, { useState } from "react";

export default function Home() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [pdfUrl, setPdfUrl] = useState('')

    const handleSubmit = async () => {
    setLoading(true)
    const res = await fetch('/api/transcribe', {
      method: 'POST',
      body: JSON.stringify({ url }),
    })
    const { text } = await res.json()

    const pdfRes = await fetch('/api/generate-pdf', {
      method: 'POST',
      body: JSON.stringify({ text }),
    })
    const blob = await pdfRes.blob()
    const pdfBlobUrl = URL.createObjectURL(blob)
    setPdfUrl(pdfBlobUrl)
    setLoading(false)
  }

  return (
    <div className="bg-backgroundcolor w-full h-screen flex flex-col items-center justify-center">
      <div className="flex flex-col gap-4">
        <h1 className="text-white text-6xl font-bold">Make <span className="bg-gradient-to-r from-primaryColor via-secondaryColor to-accentColor bg-clip-text text-transparent ">Yotube to Book!</span></h1>
        <p className="text-center text-lg font-semibold">Put youtube url video bellow</p>
        <div className="flex flex-col gap-2 items-center">
          <input
          type="text"
          placeholder="Paste YouTube URL here..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="border border-primaryColor rounded-xl p-2 w-full my-4"
          />
          <button onClick={handleSubmit} className="bg-primaryColor border-accentColor text-white px-4 py-2 rounded-xl cursor-pointer hover:bg-primaryColor/80 transition-all duration-300">
            {loading ? 'Processing...' : 'Generate PDF'}
          </button>
        </div>
      </div>
      {pdfUrl && (
        <div className="mt-4">
          <a href={pdfUrl} download="transcript.pdf" className="underline text-blue-600">Download PDF</a>
        </div>
      )}
    </div>  
  );
}
