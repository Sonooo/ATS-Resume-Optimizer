import React, { useState } from 'react';
import { FileUpload } from './components/FileUpload';
import { JobDescription } from './components/JobDescription';
import { DownloadModal } from './components/DownloadModal';
import { FileText, Settings, CheckCircle, AlertCircle } from 'lucide-react';
import { processResume, generateDownloadFile, type ProcessedResume } from './lib/resumeProcessor';

function App() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [processedResume, setProcessedResume] = useState<ProcessedResume | null>(null);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = async (file: File) => {
    try {
      setProcessing(true);
      setError(null);
      setUploadedFile(file);
      
      const processed = await processResume(file);
      setProcessedResume(processed);
      setShowDownloadModal(true);
    } catch (err) {
      setError('Error processing resume. Please try again.');
      console.error(err);
    } finally {
      setProcessing(false);
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
      setError('Error downloading file. Please try again.');
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-blue-600" />
              <h1 className="ml-2 text-2xl font-bold text-gray-900">
                ATS Resume Optimizer
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-8">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-xl font-semibold mb-4">Upload Resume</h2>
              <FileUpload onFileUpload={handleFileUpload} />
              {error && (
                <div className="mt-4 p-4 bg-red-50 rounded-md flex items-center text-red-700">
                  <AlertCircle className="h-5 w-5 mr-2" />
                  <span>{error}</span>
                </div>
              )}
            </div>
            <JobDescription />
          </div>

          {/* Right Column */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Optimization Status</h2>
            <div className="space-y-4">
              <div className="flex items-center text-gray-600">
                <Settings className={`h-5 w-5 mr-2 ${processing ? 'animate-spin' : ''}`} />
                <span>
                  {processing ? 'Processing resume...' : 'Ready to analyze'}
                </span>
              </div>
              {processedResume && (
                <div className="flex items-center text-gray-600">
                  <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
                  <span>Resume processed successfully</span>
                </div>
              )}
              {processedResume?.keywords.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">
                    Detected Keywords
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {processedResume.keywords.map((keyword, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-sm"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <DownloadModal
        isOpen={showDownloadModal}
        onClose={() => setShowDownloadModal(false)}
        onDownload={handleDownload}
        score={processedResume?.score || 0}
      />
    </div>
  );
}

export default App;