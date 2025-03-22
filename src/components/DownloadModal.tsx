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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Download Optimized Resume</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-6">
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

        <div className="space-y-4">
          <button
            onClick={() => onDownload('pdf')}
            className="w-full flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center">
              <FileText className="h-5 w-5 text-red-500 mr-3" />
              <span className="font-medium">PDF Format</span>
            </div>
            <Download className="h-5 w-5 text-gray-400" />
          </button>

          <button
            onClick={() => onDownload('docx')}
            className="w-full flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center">
              <FileText className="h-5 w-5 text-blue-500 mr-3" />
              <span className="font-medium">Word Document</span>
            </div>
            <Download className="h-5 w-5 text-gray-400" />
          </button>

          <button
            onClick={() => onDownload('txt')}
            className="w-full flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center">
              <FileText className="h-5 w-5 text-gray-500 mr-3" />
              <span className="font-medium">Plain Text</span>
            </div>
            <Download className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        <Button
          variant="outline"
          className="w-full mt-6"
          onClick={onClose}
        >
          Close
        </Button>
      </div>
    </div>
  );
}