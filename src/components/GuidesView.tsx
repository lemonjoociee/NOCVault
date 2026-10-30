import React from 'react';
import { FileText, ExternalLink, Download, BookOpen, Layers, CheckCircle2 } from 'lucide-react';

interface GuidesViewProps {
  onOpenPdf: (path: string, title: string) => void;
  onSelectCaseByNumber: (caseNum: string) => void;
}

export const GuidesView: React.FC<GuidesViewProps> = ({
  onOpenPdf,
  onSelectCaseByNumber
}) => {
  const guides = [
    {
      id: 'guide-gp',
      caseNum: 'CASE-101',
      title: 'Microsoft GP Dynamics 2016 Installation & ODBC Setup Guide',
      author: 'Rajeev Kumar (2022)',
      filename: 'GP_Dynamics_Guide_3a116d0b.pdf',
      path: '/assets/aistudio/GP_Dynamics_Guide_3a116d0b.pdf',
      pages: 25,
      sections: [
        '1.0 Microsoft GP Dynamics 2016 Installation (\\\\10.1.27.176\\Installers)',
        '2.0 ODBC Setup (32-bit odbcad32.exe, DSN: DYNAMICSGP, Server: KL-FINDBS1-VM\\DYNAMICSGP)',
        '3.0 Dynamics.set Deployment (32-bit & 64-bit architecture synchronization)',
        '4.0 Integration Manager & eConnect Service (Domain: SCICOM.MSC\\GPSERVICES)',
        '5.0 Integration Manager Installation & Registration (Site: SCICOM (MSC) BERHAD)',
        '6.0 Management Reporter (Client) Installation (Endpoint: http://kl-finapps1-vm:4712)',
        '7.0 Map Network Drive Z: (\\\\10.1.27.176\\GPSharedFiles) & GP Utilities Setup'
      ],
      description: 'Comprehensive 25-page visual installation and configuration runbook for finance workstations, covering full database connectivity, client credentials, and SQL Native Client verification.'
    },
    {
      id: 'guide-zoiper',
      caseNum: 'CASE-102',
      title: 'Zoiper5 Softphone Installation & Online Activation Guide',
      author: 'NOC Telecom Division',
      filename: 'Zoiper_Installation___Activation_Guide_0831cb34.pdf',
      path: '/assets/aistudio/Zoiper_Installation___Activation_Guide_0831cb34.pdf',
      pages: 6,
      sections: [
        '1.0 Setup Wizard (64-Bit Office Compatible, All Users Scope)',
        '2.0 Installation Directory (C:\\Program Files (x86)\\Zoiper5)',
        '3.0 PRO License Online Activation (icta@scicom.com.my)',
        '4.0 SIP Credential Entry & IP PBX Trunk Registration',
        '5.0 Troubleshooting Error 408 & UDP Port 5060 Audio Transport'
      ],
      description: 'Step-by-step visual documentation for provisioning Zoiper5 PRO softphones on agent terminals with centralized enterprise license credentials.'
    }
  ];

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-[#1f2833] border border-[#45a29e]/50 rounded-lg p-5 shadow-[0_0_15px_rgba(102,252,241,0.1)]">
        <div className="flex items-center gap-2 mb-1">
          <BookOpen className="w-5 h-5 text-[#66fcf1]" />
          <h2 className="text-base font-bold text-white tracking-wide uppercase font-mono">
            Original Technical Reference Manuals &amp; PDFs
          </h2>
        </div>
        <p className="text-xs text-[#c5c6c7]">
          Access the original engineering runbooks provided for Microsoft GP Dynamics 2016 and Zoiper Softphone VoIP infrastructure.
        </p>
      </div>

      {/* Guide Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {guides.map((g) => (
          <div
            key={g.id}
            className="bg-[#1f2833] border border-[#45a29e]/50 hover:border-[#66fcf1] rounded-lg p-5 shadow-[0_0_20px_rgba(102,252,241,0.08)] flex flex-col justify-between transition-all"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="font-mono text-xs font-bold text-[#66fcf1] px-2 py-0.5 rounded bg-[#0b0c10] border border-[#66fcf1]/40">
                  {g.caseNum} MANUAL
                </span>
                <span className="text-[11px] text-[#45a29e] font-mono flex items-center gap-1">
                  <Layers className="w-3 h-3" />
                  {g.pages} Pages
                </span>
              </div>

              <h3 className="text-base font-bold text-white mb-2 leading-snug">
                {g.title}
              </h3>
              
              <div className="text-[11px] text-[#45a29e] mb-3 font-mono">
                Author: {g.author} · Source File: {g.filename}
              </div>

              <p className="text-xs text-[#c5c6c7] leading-relaxed mb-4">
                {g.description}
              </p>

              {/* Sections Outline */}
              <div className="bg-[#0b0c10] p-3 rounded border border-[#45a29e]/30 space-y-1.5 mb-4">
                <div className="text-[10px] uppercase font-mono text-[#45a29e] font-semibold">
                  Key Manual Sections:
                </div>
                <div className="space-y-1 text-xs text-[#c5c6c7]">
                  {g.sections.map((sec, sIdx) => (
                    <div key={sIdx} className="flex items-start gap-1.5 text-[11px]">
                      <CheckCircle2 className="w-3 h-3 text-[#66fcf1] shrink-0 mt-0.5" />
                      <span className="truncate">{sec}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-[#45a29e]/30 flex flex-wrap items-center justify-between gap-2">
              <button
                onClick={() => onSelectCaseByNumber(g.caseNum)}
                className="text-xs text-[#66fcf1] hover:underline flex items-center gap-1"
              >
                <span>Jump to Interactive SOP Workflow</span>
              </button>

              <div className="flex items-center gap-2">
                <a
                  href={g.path}
                  download
                  className="p-1.5 rounded bg-[#0b0c10] hover:bg-[#141c24] text-[#c5c6c7] hover:text-white border border-[#45a29e]/40 transition-colors"
                  title="Download PDF"
                >
                  <Download className="w-4 h-4" />
                </a>

                <button
                  onClick={() => onOpenPdf(g.path, g.title)}
                  className="px-3 py-1.5 bg-[#45a29e] hover:bg-[#66fcf1] text-[#0b0c10] font-bold text-xs rounded transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Preview In-App</span>
                  <ExternalLink className="w-3 h-3 ml-0.5" />
                </button>
              </div>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
};
