import React from 'react';

export function JobDescription() {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-xl font-semibold mb-4">Sample Job Description</h2>
      <div className="space-y-4">
        <div className="prose max-w-none">
          <h3 className="text-lg font-medium">Software Engineer</h3>
          <p className="text-gray-600">
            We are looking for an experienced Software Engineer to join our team. The ideal candidate will have:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-gray-600">
            <li>3+ years of experience in software development</li>
            <li>Strong proficiency in React and TypeScript</li>
            <li>Experience with modern web technologies</li>
            <li>Excellent problem-solving skills</li>
            <li>Strong communication abilities</li>
          </ul>
          <h4 className="text-md font-medium mt-4">Required Skills:</h4>
          <ul className="list-disc pl-5 space-y-2 text-gray-600">
            <li>JavaScript/TypeScript</li>
            <li>React.js</li>
            <li>Node.js</li>
            <li>Git</li>
            <li>REST APIs</li>
          </ul>
          <h4 className="text-md font-medium mt-4">Education:</h4>
          <p className="text-gray-600">
            Bachelor's degree in Computer Science or related field
          </p>
        </div>
      </div>
    </div>
  );
}