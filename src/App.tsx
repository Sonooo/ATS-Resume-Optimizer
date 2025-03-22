import React, { useState } from 'react';
import { FileUpload } from './components/FileUpload';
import { JobDescription } from './components/JobDescription';
import { DownloadModal } from './components/DownloadModal';
import { FileText, Settings, CheckCircle, AlertCircle } from 'lucide-react';
import { processResume, generateDownloadFile, type ProcessedResume } from './lib/resumeProcessor';

function App() {
  const [file, setFile] = useState<File | null>(null);
  const [processedResume, setProcessedResume] = useState<ProcessedResume | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [jobDescription, setJobDescription] = useState('');
  const [downloading, setDownloading] = useState(false);

  const handleFileUpload = async (file: File) => {
    setFile(file);
    setError(null);
    setLoading(true);

    try {
      const result = await processResume(file, jobDescription);
      setProcessedResume(result);
    } catch (err) {
      setError('Error processing resume. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleJobDescriptionChange = (description: string) => {
    setJobDescription(description);
  };

  const handleDownload = async (format: 'pdf' | 'docx' | 'txt') => {
    if (!processedResume) return;

    try {
      setDownloading(true);
      const blob = await generateDownloadFile(processedResume.optimizedContent, format);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `optimized-resume.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading file:', error);
      setError('Failed to download file. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <FileText className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
              <h1 className="ml-2 text-xl sm:text-2xl font-bold text-gray-900">
                ATS Resume Optimizer
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8">
          {/* Left Column */}
          <div className="space-y-4 sm:space-y-8">
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm">
              <h2 className="text-lg sm:text-xl font-semibold mb-4">Upload Resume</h2>
              <FileUpload onFileUpload={handleFileUpload} />
              {error && (
                <div className="mt-4 p-3 sm:p-4 bg-red-50 rounded-md flex items-center text-red-700">
                  <AlertCircle className="h-5 w-5 mr-2" />
                  <span className="text-sm sm:text-base">{error}</span>
                </div>
              )}
            </div>
            <JobDescription onJobDescriptionChange={handleJobDescriptionChange} />
          </div>

          {/* Right Column */}
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm">
            <h2 className="text-lg sm:text-xl font-semibold mb-4">Optimization Status</h2>
            <div className="space-y-4">
              <div className="flex items-center text-gray-600">
                <Settings className={`h-5 w-5 mr-2 ${loading ? 'animate-spin' : ''}`} />
                <span className="text-sm sm:text-base">
                  {loading ? 'Processing resume...' : 'Ready to analyze'}
                </span>
              </div>
              {processedResume && (
                <div className="flex items-center text-gray-600">
                  <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
                  <span className="text-sm sm:text-base">Resume processed successfully</span>
                </div>
              )}
              {processedResume && processedResume.keywords && processedResume.keywords.length > 0 && (
                <div className="mt-4 sm:mt-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">
                    Detected Keywords
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {processedResume.keywords.map((keyword, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs sm:text-sm"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {processedResume && (
                <div className="mt-4 sm:mt-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">
                    ATS Score
                  </h3>
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 rounded-full h-2 transition-all duration-300"
                        style={{ width: `${processedResume.score}%` }}
                      />
                    </div>
                    <span className="text-sm font-semibold text-blue-600">
                      {processedResume.score}%
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <DownloadModal
        isOpen={processedResume !== null}
        onClose={() => setProcessedResume(null)}
        onDownload={handleDownload}
        score={processedResume?.score || 0}
      />
    </div>
  );
}

export default App;