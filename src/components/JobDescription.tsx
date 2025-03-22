import React, { useState } from 'react';
import { Edit2, Save, X } from 'lucide-react';

interface JobDescriptionProps {
  onJobDescriptionChange: (description: string) => void;
}

export function JobDescription({ onJobDescriptionChange }: JobDescriptionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [description, setDescription] = useState(`Software Engineer

We are looking for an experienced Software Engineer to join our team. The ideal candidate will have:

• 3+ years of experience in software development
• Strong proficiency in React and TypeScript
• Experience with modern web technologies
• Excellent problem-solving skills
• Strong communication abilities

Required Skills:
• JavaScript/TypeScript
• React.js
• Node.js
• Git
• REST APIs

Education:
• Bachelor's degree in Computer Science or related field`);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    setIsEditing(false);
    onJobDescriptionChange(description);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg sm:text-xl font-semibold">Job Description</h2>
        {!isEditing ? (
          <button
            onClick={handleEdit}
            className="text-blue-600 hover:text-blue-800 flex items-center space-x-1 text-sm sm:text-base"
          >
            <Edit2 className="w-4 h-4" />
            <span>Edit</span>
          </button>
        ) : (
          <div className="space-x-2">
            <button
              onClick={handleSave}
              className="text-green-600 hover:text-green-800 flex items-center space-x-1 text-sm sm:text-base"
            >
              <Save className="w-4 h-4" />
              <span>Save</span>
            </button>
            <button
              onClick={handleCancel}
              className="text-red-600 hover:text-red-800 flex items-center space-x-1 text-sm sm:text-base"
            >
              <X className="w-4 h-4" />
              <span>Cancel</span>
            </button>
          </div>
        )}
      </div>
      {isEditing ? (
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full h-48 sm:h-96 p-3 sm:p-4 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-xs sm:text-sm resize-none"
          placeholder="Paste the job description here..."
        />
      ) : (
        <div className="prose max-w-none">
          <div className="whitespace-pre-wrap font-mono text-xs sm:text-sm">{description}</div>
        </div>
      )}
    </div>
  );
}