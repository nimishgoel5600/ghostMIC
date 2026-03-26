import React, { useState } from 'react';
import { useAppStore } from '../../store/app-store';

export default function ProfileSettings() {
  const { settings, setSettings } = useAppStore();
  const [uploading, setUploading] = useState(false);
  const [parseStatus, setParseStatus] = useState<string | null>(null);

  const handleResumeUpload = async () => {
    setUploading(true);
    setParseStatus(null);
    try {
      const filePath = await window.electronAPI.openFileDialog([
        { name: 'Resume', extensions: ['pdf', 'docx'] },
      ]);
      if (!filePath) {
        setUploading(false);
        return;
      }

      setParseStatus('Parsing resume...');
      const fileBuffer = await window.electronAPI.readFile(filePath);

      // Parse resume in renderer (services handle parsing)
      const { parseResume } = await import('../../services/resume-parser');
      const parsed = await parseResume(fileBuffer, filePath);

      setSettings({ resumePath: filePath, resumeParsed: parsed });
      await window.electronAPI.setSettings({ resumePath: filePath, resumeParsed: parsed });
      setParseStatus('Resume parsed successfully!');
    } catch (err) {
      setParseStatus(`Error: ${err instanceof Error ? err.message : 'Failed to parse'}`);
    }
    setUploading(false);
  };

  const handleJDChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setSettings({ jobDescription: val });
    window.electronAPI.setSettings({ jobDescription: val });
  };

  const handleContextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setSettings({ additionalContext: val });
    window.electronAPI.setSettings({ additionalContext: val });
  };

  return (
    <div className="space-y-4">
      {/* Resume */}
      <div>
        <label className="block text-[10px] font-medium text-gray-400 mb-1">
          Resume (PDF / DOCX)
        </label>
        <button
          onClick={handleResumeUpload}
          disabled={uploading}
          className="w-full px-3 py-2 bg-gray-800 border border-dashed border-white/10 rounded-lg text-xs text-gray-400 hover:border-green-500/30 hover:text-green-400 transition-colors disabled:opacity-50"
        >
          {uploading ? 'Parsing...' : settings.resumePath ? '✓ Change Resume' : 'Upload Resume'}
        </button>
        {parseStatus && (
          <p className={`text-[10px] mt-1 ${parseStatus.startsWith('Error') ? 'text-red-400' : 'text-green-400'}`}>
            {parseStatus}
          </p>
        )}
        {settings.resumeParsed && (
          <div className="mt-2 p-2 bg-black/30 rounded text-[10px] text-gray-500 max-h-24 overflow-y-auto">
            <div className="text-gray-300 font-medium">{settings.resumeParsed.name}</div>
            <div>{settings.resumeParsed.skills.slice(0, 10).join(', ')}</div>
            <div>{settings.resumeParsed.experience.length} work experiences</div>
          </div>
        )}
      </div>

      {/* Job Description */}
      <div>
        <label className="block text-[10px] font-medium text-gray-400 mb-1">
          Job Description
        </label>
        <textarea
          value={settings.jobDescription}
          onChange={handleJDChange}
          placeholder="Paste the job description here..."
          rows={4}
          className="w-full px-2 py-1.5 bg-gray-800 border border-white/10 rounded text-xs text-gray-300 placeholder-gray-600 resize-none outline-none focus:border-green-500/30"
        />
      </div>

      {/* Additional Context */}
      <div>
        <label className="block text-[10px] font-medium text-gray-400 mb-1">
          Additional Context
        </label>
        <textarea
          value={settings.additionalContext}
          onChange={handleContextChange}
          placeholder="Extra info: 'I led a team of 5', 'Project handled 1M req/day'..."
          rows={3}
          className="w-full px-2 py-1.5 bg-gray-800 border border-white/10 rounded text-xs text-gray-300 placeholder-gray-600 resize-none outline-none focus:border-green-500/30"
        />
      </div>
    </div>
  );
}
