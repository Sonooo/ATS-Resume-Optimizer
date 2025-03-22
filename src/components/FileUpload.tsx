import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, X } from 'lucide-react';
import { Button } from './ui/button';

interface FileUploadProps {
  onFileUpload: (file: File) => void;
}

export function FileUpload({ onFileUpload }: FileUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setSelectedFile(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: '.pdf,.doc,.docx,.txt',
    maxFiles: 1
  });

  const handleUpload = () => {
    if (selectedFile) {
      setIsUploading(true);
      onFileUpload(selectedFile);
      setIsUploading(false);
    }
  };

  const handleRemove = () => {
    setSelectedFile(null);
  };

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-4 sm:p-8 text-center cursor-pointer transition-colors
          ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-500'}`}
      >
        <input {...getInputProps()} />
        <Upload className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-4 text-gray-400" />
        <h3 className="text-base sm:text-lg font-semibold mb-2">Upload Your Resume</h3>
        <p className="text-sm sm:text-base text-gray-500 mb-2 sm:mb-4">
          Drag & drop your resume here, or click to select files
        </p>
        <p className="text-xs sm:text-sm text-gray-400">
          Supported formats: PDF, DOCX, DOC, TXT
        </p>
      </div>

      {selectedFile && (
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-gray-500" />
            <span className="text-sm text-gray-700 truncate max-w-[200px] sm:max-w-none">
              {selectedFile.name}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleRemove}
              className="text-red-500 hover:text-red-700 p-1"
              aria-label="Remove file"
            >
              <X className="w-4 h-4" />
            </button>
            <Button
              onClick={handleUpload}
              disabled={isUploading}
              className="text-sm sm:text-base py-1 px-3"
            >
              {isUploading ? 'Processing...' : 'Upload'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}