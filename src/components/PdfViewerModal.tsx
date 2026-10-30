import React from 'react';
import { X, ExternalLink, Download, FileText } from 'lucide-react';

interface PdfViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  pdfPath: string | null;
  pdfTitle: string | null;
}

export const PdfViewerModal: React.FC<PdfViewerModalProps> = ({
  isOpen,
  onClose,
  pdfPath,
  pdfTitle
}) => {
  if (!isOpen || !pdfPath) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-sm overflow-hidden">
      <div className="relative w-full max-w-5xl bg-[#1f2833] border border-[#45a29e] rounded-lg shadow-[0_0_35px_rgba(102,252,241,0.25)] flex flex-col h-[92vh] overflow-hidden">
        
        {/* Top Bar */}
        <div className="p-4 bg-[#0b0c10] border-b border-[#45a29e]/50 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 truncate">
            <div className="w-7 h-7 rounded bg-[#1f2833] border border-[#66fcf1] flex items-center justify-center text-[#66fcf1] shrink-0">
              <FileText className="w-4 h-4" />
            </div>
            <div className="truncate">
              <h3 className="text-sm font-bold text-white truncate font-mono">
                {pdfTitle || 'Official SOP Reference Guide'}
              </h3>
              <p className="text-[11px] text-[#45a29e] font-mono truncate">
                {pdfPath}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <a
              href={pdfPath}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0b0c10] hover:bg-[#1f2833] text-[#66fcf1] border border-[#45a29e] rounded text-xs transition-colors"
              title="Open PDF in new tab"
            >
              <span>Open in New Tab</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <a
              href={pdfPath}
              download
              className="p-1.5 bg-[#0b0c10] hover:bg-[#1f2833] text-[#c5c6c7] hover:text-white border border-[#45a29e] rounded transition-colors"
              title="Download PDF"
            >
              <Download className="w-4 h-4" />
            </a>

            <button
              onClick={onClose}
              className="p-1.5 bg-[#0b0c10] hover:bg-[#1f2833] text-[#c5c6c7] hover:text-[#ff4d4d] border border-[#45a29e] rounded transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Embedded PDF iframe / fallback */}
        <div className="flex-1 bg-[#0b0c10] relative">
          <iframe
            src={`${pdfPath}#toolbar=1`}
            title={pdfTitle || 'PDF Guide'}
            className="w-full h-full border-none"
          />
        </div>

      </div>
    </div>
  );
};
