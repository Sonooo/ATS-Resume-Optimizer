import { useState } from 'react';
import { Upload, FileText, Download, RefreshCw, Edit2, Save } from 'lucide-react';
import { processResume, generateDownloadFile } from '../lib/resumeProcessor';

export function ResumeUploader() {
  const [file, setFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [tempJobDescription, setTempJobDescription] = useState('');
  const [processedResume, setProcessedResume] = useState<{
    content: string;
    keywords: string[];
    score: number;
  } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
      processFile(selectedFile);
    }
  };

  const handleJobDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTempJobDescription(e.target.value);
  };

  const handleEditClick = () => {
    setTempJobDescription(jobDescription);
    setIsEditing(true);
  };

  const handleSaveClick = () => {
    setJobDescription(tempJobDescription);
    setIsEditing(false);
    if (file) {
      processFile(file);
    }
  };

  const handleCancelEdit = () => {
    setTempJobDescription(jobDescription);
    setIsEditing(false);
  };

  const processFile = async (fileToProcess: File) => {
    setIsProcessing(true);
    setError(null);
    try {
      const result = await processResume(fileToProcess);
      setProcessedResume(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process resume');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = async (format: 'pdf' | 'docx' | 'txt') => {
    if (!processedResume) return;

    try {
      const blob = await generateDownloadFile(processedResume.content, format);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `optimized-resume.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate download file');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-4">Upload Resume</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-center w-full">
            <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-10 h-10 mb-2 text-gray-400" />
                <p className="mb-2 text-sm text-gray-500">
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-gray-500">PDF, DOCX, or TXT (MAX. 5MB)</p>
              </div>
              <input
                type="file"
                className="hidden"
                accept=".pdf,.docx,.txt"
                onChange={handleFileChange}
                disabled={isProcessing}
              />
            </label>
          </div>

          {file && (
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-gray-500" />
                <span className="text-sm text-gray-700">{file.name}</span>
              </div>
              <button
                onClick={() => setFile(null)}
                className="text-red-500 hover:text-red-700"
                disabled={isProcessing}
              >
                Remove
              </button>
            </div>
          )}

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-700">Job Description</label>
              {!isEditing ? (
                <button
                  onClick={handleEditClick}
                  className="text-blue-600 hover:text-blue-800 flex items-center space-x-1"
                >
                  <Edit2 className="w-4 h-4" />
                  <span>Edit</span>
                </button>
              ) : (
                <div className="space-x-2">
                  <button
                    onClick={handleSaveClick}
                    className="text-green-600 hover:text-green-800 flex items-center space-x-1"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save</span>
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
            {isEditing ? (
              <textarea
                value={tempJobDescription}
                onChange={handleJobDescriptionChange}
                className="w-full h-32 p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Paste the job description here..."
              />
            ) : (
              <div className="w-full h-32 p-2 border rounded-md bg-gray-50 overflow-auto">
                {jobDescription || 'No job description provided'}
              </div>
            )}
          </div>

          {error && (
            <div className="p-4 bg-red-50 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          {isProcessing && (
            <div className="flex items-center justify-center space-x-2 text-gray-600">
              <RefreshCw className="w-5 h-5 animate-spin" />
              <span>Processing resume...</span>
            </div>
          )}

          {processedResume && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Optimized Resume</h3>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleDownload('pdf')}
                    className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    <Download className="w-4 h-4" />
                    <span>PDF</span>
                  </button>
                  <button
                    onClick={() => handleDownload('docx')}
                    className="flex items-center space-x-1 px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    <Download className="w-4 h-4" />
                    <span>DOCX</span>
                  </button>
                  <button
                    onClick={() => handleDownload('txt')}
                    className="flex items-center space-x-1 px-3 py-1 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                  >
                    <Download className="w-4 h-4" />
                    <span>TXT</span>
                  </button>
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="mb-4">
                  <h4 className="font-semibold text-gray-700 mb-2">ATS Score: {processedResume.score}%</h4>
                  <div className="flex flex-wrap gap-2">
                    {processedResume.keywords.map((keyword, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="prose max-w-none">
                  <div className="whitespace-pre-wrap">{processedResume.content}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 