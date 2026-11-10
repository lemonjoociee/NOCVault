import React from 'react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function Navbar({ activeTab, setActiveTab }: NavbarProps) {
  return (
    <header className="header" id="header">
        <nav className="nav-container">
            <a href="#home" className="logo" onClick={(e) => { e.preventDefault(); setActiveTab('knowledge'); }}>
                <div className="logo-icon">
                    <div className="logo-prism">
                        <div className="prism-shape"></div>
                    </div>
                </div>
                <span className="logo-text">
                    <span className="prism">NOC</span>
                    <span className="flux">VAULT</span>
                </span>
            </a>
            
            <ul className="nav-menu" id="navMenu">
                <li>
                  <a href="#home" className={`nav-link ${activeTab === 'knowledge' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setActiveTab('knowledge'); }}>
                    Knowledge Base
                  </a>
                </li>
                <li>
                  <a href="#escalation" className={`nav-link ${activeTab === 'escalation' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setActiveTab('escalation'); }}>
                    Escalation Matrix
                  </a>
                </li>
                <li>
                  <a href="#admin" className={`nav-link ${activeTab === 'admin' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setActiveTab('admin'); }}>
                    Admin
                  </a>
                </li>
            </ul>
        </nav>
    </header>
  );
}