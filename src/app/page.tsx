'use client';

import { useState, useEffect } from 'react';
import ChatWindow from '@/components/ChatWindow';
import CodeDrawer from '@/components/CodeDrawer';
import { ThemeToggle } from '@/components/ThemeToggle';
import Image from 'next/image';
import { useTheme } from '@/context/ThemeContext';

export default function Home() {
  const [drawer, setDrawer] = useState<{ code: string; tabTitle: string }>({ code: '', tabTitle: '' });
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const { theme } = useTheme();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleMessage = (message: string) => {
    // Handle any additional message processing here
    console.log('New message:', message);
  };

  if (!isMounted) {
    return null;
  }

  return (
    <main className="min-h-screen grid-background">
      {/* Top-left logo */}
      <div className="fixed top-0 left-1 z-50 flex items-center">
        <Image
          src={theme === 'dark' ? "/org_bot_white.svg" : "/org_bot_black.svg"}
          alt="OrgBot Logo"
          width={180}
          height={40}
          priority
        />
      </div>

      {/* Top-right controls: always fixed outside the drawer */}
      <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
        <button
          onClick={() => setIsDrawerOpen((open) => !open)}
          className="bg-accent-primary hover:bg-[#17631a] text-white p-2 rounded-lg transition-colors"
          title={isDrawerOpen ? 'Hide code' : 'Show code'}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`h-6 w-6 transform transition-transform ${isDrawerOpen ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
        <ThemeToggle />
      </div>

      <div className="container mx-auto px-4 py-8 mt-16 md:mt-0">
        <div className="flex justify-center items-center min-h-[calc(100vh-12rem)]">
          <ChatWindow
            onMessage={handleMessage}
            setDrawerCode={setDrawer}
            setDrawerOpen={setIsDrawerOpen}
          />
        </div>
      </div>

      <CodeDrawer
        code={drawer.code}
        isOpen={isDrawerOpen}
        toggleDrawer={() => setIsDrawerOpen(!isDrawerOpen)}
        onCodeChange={(newCode) => setDrawer({ ...drawer, code: newCode || '' })}
        tabTitle={drawer.tabTitle}
      />
    </main>
  );
}
