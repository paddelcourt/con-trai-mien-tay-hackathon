'use client';

import { useEffect, useState } from 'react';
import { fetchDataset, DatasetEntry } from '@/services/api';

interface DatasetModalProps {
  onClose: () => void;
}

export default function DatasetModal({ onClose }: DatasetModalProps) {
  const [entries, setEntries] = useState<DatasetEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDataset = async () => {
      try {
        const data = await fetchDataset(100);
        setEntries(data);
      } catch (error) {
        console.error('Failed to fetch dataset:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDataset();
  }, []);

  const handleExportCSV = () => {
    if (entries.length === 0) return;

    const headers = ['ID', 'Username', 'Actual Prompt', 'User Guess', 'Score', 'Timestamp'];
    const csvContent = [
      headers.join(','),
      ...entries.map(e =>
        [e.id, e.username, `"${e.actualPrompt.replace(/"/g, '""')}"`, `"${e.userGuess.replace(/"/g, '""')}"`, e.score, e.timestamp].join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'guess-the-prompt-dataset.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportJSON = () => {
    if (entries.length === 0) return;

    const jsonContent = JSON.stringify(entries, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'guess-the-prompt-dataset.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-[100] p-4"
      onClick={onClose}
    >
      <div
        className="bg-[#2f2f2f] rounded-xl md:rounded-2xl p-4 md:p-5 w-full max-w-4xl max-h-[80vh] flex flex-col animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base md:text-lg font-semibold text-[#ececec]">
              Dataset
            </h2>
            <p className="text-[11px] text-[#8e8e8e] mt-0.5">
              {entries.length} prompt-response pairs collected
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-[#383838] transition-colors text-[#8e8e8e] hover:text-[#ececec]"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <span className="text-sm text-[#8e8e8e]">Loading dataset...</span>
            </div>
          ) : entries.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <span className="text-sm text-[#8e8e8e]">No data collected yet. Play some rounds!</span>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead className="sticky top-0 bg-[#2f2f2f]">
                <tr className="border-b border-[#383838]">
                  <th className="text-[11px] text-[#8e8e8e] font-medium py-2 px-2">User</th>
                  <th className="text-[11px] text-[#8e8e8e] font-medium py-2 px-2">Actual Prompt</th>
                  <th className="text-[11px] text-[#8e8e8e] font-medium py-2 px-2">User Guess</th>
                  <th className="text-[11px] text-[#8e8e8e] font-medium py-2 px-2">Score</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry) => (
                  <tr key={entry.id} className="border-b border-[#383838] hover:bg-[#383838]/50">
                    <td className="text-[12px] text-[#b4b4b4] py-2.5 px-2">{entry.username}</td>
                    <td className="text-[12px] text-[#ececec] py-2.5 px-2 max-w-[200px]">
                      <div className="truncate" title={entry.actualPrompt}>{entry.actualPrompt}</div>
                    </td>
                    <td className="text-[12px] text-[#b4b4b4] py-2.5 px-2 max-w-[200px]">
                      <div className="truncate" title={entry.userGuess}>{entry.userGuess}</div>
                    </td>
                    <td className="text-[12px] text-[#ececec] py-2.5 px-2 font-medium">{entry.score}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="mt-4 pt-3 border-t border-[#383838] flex items-center justify-between">
          <span className="text-[11px] text-[#8e8e8e]">
            Export as CSV or JSON for research purposes
          </span>
          <div className="flex gap-2">
            <button
              onClick={handleExportCSV}
              disabled={entries.length === 0}
              className="px-3 py-1.5 text-[11px] text-[#ececec] bg-[#383838] hover:bg-[#454545] rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Export CSV
            </button>
            <button
              onClick={handleExportJSON}
              disabled={entries.length === 0}
              className="px-3 py-1.5 text-[11px] text-[#ececec] bg-[#383838] hover:bg-[#454545] rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Export JSON
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export type { DatasetEntry };
