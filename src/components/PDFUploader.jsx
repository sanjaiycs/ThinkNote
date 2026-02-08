import React, { useState, useRef } from 'react';
import { Upload, FileText, X, Loader2 } from 'lucide-react';
import { extractTextFromPDF } from '../lib/pdf';

const PDFUploader = ({ onTextExtracted }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const inputRef = useRef(null);

    const handleFile = async (file) => {
        if (file && file.type === 'application/pdf') {
            setIsLoading(true);
            try {
                const text = await extractTextFromPDF(file);
                onTextExtracted(text, file.name);
            } catch (error) {
                console.error("Error extracting PDF text:", error);
                alert("Failed to extract text from PDF.");
            } finally {
                setIsLoading(false);
            }
        } else {
            alert("Please upload a valid PDF file.");
        }
    };

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    };

    const handleChange = (e) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
        }
    };

    const onButtonClick = () => {
        inputRef.current.click();
    };

    return (
        <div
            className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${dragActive ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 hover:border-indigo-400'}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={onButtonClick}
        >
            <input
                ref={inputRef}
                type="file"
                className="hidden"
                accept=".pdf"
                onChange={handleChange}
            />

            {isLoading ? (
                <div className="flex flex-col items-center gap-2 text-gray-500">
                    <Loader2 size={24} className="animate-spin text-indigo-600" />
                    <span className="text-sm">Extracting text...</span>
                </div>
            ) : (
                <div className="flex flex-col items-center gap-2 text-gray-500">
                    <Upload size={24} className="text-gray-400" />
                    <span className="text-sm">Click or drag PDF to add content</span>
                </div>
            )}
        </div>
    );
};

export default PDFUploader;
