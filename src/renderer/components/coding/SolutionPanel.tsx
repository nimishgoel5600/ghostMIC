import React, { useState } from 'react';
import { useAppStore } from '../../store/app-store';
import CodeBlock from './CodeBlock';

export default function SolutionPanel() {
  const { currentSolution, isSolving, currentCode } = useAppStore();
  const [copiedAll, setCopiedAll] = useState(false);

  const handleCopyCode = async () => {
    if (currentSolution) {
      await navigator.clipboard.writeText(currentSolution.code);
    }
  };

  const handleCopyAll = async () => {
    if (!currentSolution) return;
    const full = `## Understanding\n${currentSolution.understanding}\n\n## Approach\n${currentSolution.approach}\n\n## Solution\n\`\`\`${currentSolution.language}\n${currentSolution.code}\n\`\`\`\n\n## Complexity\n- Time: ${currentSolution.timeComplexity}\n- Space: ${currentSolution.spaceComplexity}\n\n## Edge Cases\n${currentSolution.edgeCases.map((e) => `- ${e}`).join('\n')}`;
    await navigator.clipboard.writeText(full);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 1500);
  };

  if (!currentSolution && !isSolving) {
    return (
      <div className="flex items-center justify-center h-full text-gray-600 text-xs">
        Solution will appear here
      </div>
    );
  }

  if (isSolving && !currentSolution) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse-dot mb-2" />
        <span className="text-xs text-gray-500">Solving...</span>
        {currentCode && (
          <div className="mt-2 px-3 w-full">
            <pre className="text-[10px] text-gray-400 overflow-x-auto streaming-cursor">
              {currentCode}
            </pre>
          </div>
        )}
      </div>
    );
  }

  if (!currentSolution) return null;

  return (
    <div className="flex flex-col h-full overflow-y-auto px-3 py-2 space-y-2">
      {/* Understanding */}
      <Section title="Understanding" accent="cyan">
        <p className="text-[11px] text-gray-400 leading-relaxed">
          {currentSolution.understanding}
        </p>
      </Section>

      {/* Approach */}
      <Section title="Approach" accent="cyan">
        <p className="text-[11px] text-gray-400 leading-relaxed">
          {currentSolution.approach}
        </p>
      </Section>

      {/* Code */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] font-medium text-cyan-400">Solution</span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyCode}
              className="text-[9px] text-gray-500 hover:text-gray-300 transition-colors"
            >
              Copy Code
            </button>
            <button
              onClick={handleCopyAll}
              className="text-[9px] text-gray-500 hover:text-gray-300 transition-colors"
            >
              {copiedAll ? '✓ Copied' : 'Copy All'}
            </button>
          </div>
        </div>
        <CodeBlock code={currentSolution.code} language={currentSolution.language} />
      </div>

      {/* Complexity */}
      <Section title="Complexity" accent="cyan">
        <div className="text-[11px] text-gray-400 space-y-0.5">
          <div>Time: {currentSolution.timeComplexity}</div>
          <div>Space: {currentSolution.spaceComplexity}</div>
        </div>
      </Section>

      {/* Edge Cases */}
      {currentSolution.edgeCases.length > 0 && (
        <Section title="Edge Cases" accent="cyan">
          <ul className="text-[11px] text-gray-400 space-y-0.5 list-disc list-inside">
            {currentSolution.edgeCases.map((ec, i) => (
              <li key={i}>{ec}</li>
            ))}
          </ul>
        </Section>
      )}
    </div>
  );
}

function Section({
  title,
  accent,
  children,
}: {
  title: string;
  accent: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(true);
  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className={`text-[10px] font-medium text-${accent}-400 flex items-center gap-1 mb-0.5`}
      >
        <span className="text-gray-600">{open ? '▼' : '▶'}</span>
        {title}
      </button>
      {open && children}
    </div>
  );
}
