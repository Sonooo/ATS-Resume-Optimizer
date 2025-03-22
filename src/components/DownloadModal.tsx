import React from 'react';
import { X, FileText, Download } from 'lucide-react';
import { Button } from './ui/button';

interface DownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDownload: (format: 'pdf' | 'docx' | 'txt') => void;
  score: number;
}

export function DownloadModal({ isOpen, onClose, onDownload, score }: DownloadModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg p-4 sm:p-6 max-w-md w-full mx-4 my-8">
        <div className="flex justify-between items-center mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-xl font-semibold">Download Optimized Resume</h2>
          <button 
            onClick={onClose} 
            className="text-gray-500 hover:text-gray-700 p-2"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-4 sm:mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">ATS Score</span>
            <span className="text-sm font-semibold text-blue-600">{score}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 rounded-full h-2 transition-all duration-300"
              style={{ width: `${score}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4">
          <Button
            onClick={() => onDownload('pdf')}
            className="w-full text-sm sm:text-base py-2"
          >
            <FileText className="w-4 h-4 mr-2" />
            PDF
          </Button>
          <Button
            onClick={() => onDownload('docx')}
            className="w-full text-sm sm:text-base py-2"
          >
            <FileText className="w-4 h-4 mr-2" />
            DOCX
          </Button>
          <Button
            onClick={() => onDownload('txt')}
            className="w-full text-sm sm:text-base py-2"
          >
            <FileText className="w-4 h-4 mr-2" />
            TXT
          </Button>
        </div>
      </div>
    </div>
  );
}