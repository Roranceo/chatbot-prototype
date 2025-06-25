'use client';

import { Editor } from '@monaco-editor/react';
import { useEffect, useState } from 'react';
import { FiCopy, FiCheck, FiX } from 'react-icons/fi';
import { useTheme } from '@/context/ThemeContext';
import Image from 'next/image';

interface CodeDrawerProps {
  code: string;
  isOpen: boolean;
  toggleDrawer: () => void;
  onCodeChange?: (value: string | undefined) => void;
  language?: string;
  tabTitle?: string;
}

interface Tab {
  id: string;
  title: string;
  code: string;
}

export default function CodeDrawer({
  code,
  isOpen,
  toggleDrawer,
  onCodeChange,
  language = 'typescript',
  tabTitle,
}: CodeDrawerProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [tabs, setTabs] = useState<Tab[]>([]);
  const [activeTabId, setActiveTabId] = useState<string>('');
  const [displayedCode, setDisplayedCode] = useState('');
  const { theme } = useTheme();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Add new tab when code changes
  useEffect(() => {
    if (code) {
      // Use tabTitle prop if provided, otherwise generate
      let title = tabTitle || 'Code Snippet';
      if (!tabTitle) {
        if (code.includes('PermissionSets')) title = 'Permission Sets';
        else if (code.includes('aws s3')) title = 'AWS S3';
        else if (code.includes('privacy policy')) title = 'Privacy Policy';
        else if (code.includes('Jira')) title = 'Jira Integration';
        else if (code.includes('MFA')) title = 'MFA Users';
        else if (code.includes('security checklist')) title = 'Security Checklist';
        else if (code.includes('DNS') || code.includes('SSL')) title = 'DNS-SSL';
      }
      const newTab: Tab = {
        id: Date.now().toString(),
        title,
        code: code
      };
      setTabs(prev => [...prev, newTab]);
      setActiveTabId(newTab.id);
    }
  }, [code, tabTitle]);

  // Add typing animation effect
  useEffect(() => {
    if (isOpen && activeTabId) {
      const activeTab = tabs.find(tab => tab.id === activeTabId);
      if (activeTab) {
        let currentIndex = 0;
        const typingSpeed = 10; // milliseconds per character
        setDisplayedCode('');
        const typingInterval = setInterval(() => {
          if (currentIndex <= activeTab.code.length) {
            setDisplayedCode(activeTab.code.slice(0, currentIndex));
            currentIndex++;
          } else {
            clearInterval(typingInterval);
          }
        }, typingSpeed);
        return () => clearInterval(typingInterval);
      }
    } else {
      setDisplayedCode(''); // Clear code when drawer closes
    }
  }, [isOpen, activeTabId, tabs]);

  const handleCopy = async () => {
    try {
      const activeTab = tabs.find(tab => tab.id === activeTabId);
      if (activeTab) {
        await navigator.clipboard.writeText(activeTab.code);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      }
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const closeTab = (tabId: string) => {
    setTabs(prev => {
      const newTabs = prev.filter(tab => tab.id !== tabId);
      if (newTabs.length === 0) {
        // If no tabs left, just clear the displayed code
        setDisplayedCode('');
        setActiveTabId('');
      } else if (tabId === activeTabId) {
        // If closing active tab, switch to the last tab
        setActiveTabId(newTabs[newTabs.length - 1].id);
      }
      return newTabs;
    });
  };

  if (!isMounted) {
    return null;
  }

  return (
    <>
      {/* Toggle button */}
      <button
        onClick={toggleDrawer}
        className={`fixed right-4 top-4 z-50 ${
          theme === 'dark' ? 'bg-accent-primary hover:bg-[#17631a]' : 'bg-accent-primary hover:bg-[#17631a]'
        } text-white p-2 rounded-lg transition-colors`}
        title={isOpen ? 'Hide code' : 'Show code'}
      >
        {/* ... existing code ... */}
      </button>

      {/* Drawer */}
      <div
        className={`fixed right-0 top-0 h-full ${
          theme === 'dark' ? 'bg-background-dark' : 'bg-background-light'
        } shadow-lg transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        } w-full sm:w-3/4 md:w-1/2 lg:w-1/3 xl:w-1/4 z-50`}
      >
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className={`p-3 md:p-4 border-b ${
            theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
          } flex items-center justify-between`}>
            <div className="flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-5 w-5 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                />
              </svg>
              <h2 className={`text-base md:text-lg font-semibold ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>OrgBot Code Viewer</h2>
            </div>
            <div className="flex items-center gap-2">
              {/* Copy button */}
              <button
                onClick={handleCopy}
                className={`${
                  theme === 'dark' ? 'text-gray-400 hover:text-white hover:bg-gray-800' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                } transition-colors p-2 rounded-lg`}
                title="Copy code"
              >
                {isCopied ? (
                  <FiCheck className="h-5 w-5 text-green-500" />
                ) : (
                  <FiCopy className="h-5 w-5" />
                )}
              </button>
              {/* Close button */}
              <button
                onClick={toggleDrawer}
                className={`${
                  theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                } transition-colors`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className={`flex border-b ${
            theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
          } overflow-x-auto`}>
            {tabs.map(tab => (
              <div
                key={tab.id}
                className={`flex items-center px-3 md:px-4 py-2 border-r ${
                  theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
                } cursor-pointer whitespace-nowrap ${
                  activeTabId === tab.id
                    ? theme === 'dark' ? 'bg-[#1e1e1e]' : 'bg-gray-100'
                    : theme === 'dark' ? 'bg-[#232323]' : 'bg-white'
                }`}
                onClick={() => setActiveTabId(tab.id)}
              >
                <span className={`text-xs md:text-sm ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>{tab.title}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    closeTab(tab.id);
                  }}
                  className={`ml-2 ${
                    theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  <FiX size={14} />
                </button>
              </div>
            ))}
          </div>

          {/* Editor */}
          <div className="flex-1 overflow-hidden">
            <Editor
              height="100%"
              defaultLanguage={language}
              theme={theme === 'dark' ? 'vs-dark' : 'light'}
              value={displayedCode}
              onChange={onCodeChange}
              options={{
                fontSize: 13,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                automaticLayout: true,
                scrollbar: {
                  vertical: 'visible',
                  horizontal: 'visible',
                  useShadows: false,
                  verticalScrollbarSize: 8,
                  horizontalScrollbarSize: 8,
                },
                lineNumbers: (lineNumber) => {
                  return lineNumber === 1 ? '' : (lineNumber - 1).toString();
                },
                renderLineHighlight: 'all',
                renderWhitespace: 'selection',
                wordWrap: 'on',
                wrappingStrategy: 'advanced',
                suggestOnTriggerCharacters: true,
                quickSuggestions: true,
                parameterHints: { enabled: true },
                formatOnPaste: true,
                formatOnType: true,
              }}
            />
          </div>
        </div>
      </div>
    </>
  );
}