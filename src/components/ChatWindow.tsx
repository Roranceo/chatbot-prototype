'use client';

import { useState, useEffect, useRef } from 'react';
import { getResponse, type Response } from '@/data/chatbotMock';
import { FiMic, FiUpload, FiArrowRight, FiLoader, FiSquare, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { useTheme } from '@/context/ThemeContext';
import Image from 'next/image';
import CodeDrawer from '@/components/CodeDrawer';

interface Message {
  text: string;
  sender: 'user' | 'bot';
  code?: string;
  timestamp: string;
}

interface ChatWindowProps {
  onMessage: (message: string) => void;
  setDrawerCode: (drawer: { code: string; tabTitle: string }) => void;
  setDrawerOpen: (isOpen: boolean) => void;
}

interface ScriptedInteraction {
  message: string;
  code: string;
}

const PROMPTS = [
  'Check for public S3 buckets',
  'Connect Jira to OrgBot',
  'Upload latest privacy policy',
  'List users without MFA',
  'Generate a security checklist'
];

const SCRIPTED_INTERACTIONS: Record<string, ScriptedInteraction> = {
  "Check for public S3 buckets": {
    message: `To check for public S3 buckets, you can use the AWS CLI or Python (boto3). Would you like to see a sample script?`,
    code: `# Bash (AWS CLI)
aws s3api list-buckets --query "Buckets[].Name" --output text | xargs -I {} aws s3api get-bucket-acl --bucket {} --query "Grants[?Grantee.URI=='http://acs.amazonaws.com/groups/global/AllUsers']"

# Python (boto3)
import boto3

s3 = boto3.client('s3')
for bucket in s3.list_buckets()['Buckets']:
    acl = s3.get_bucket_acl(Bucket=bucket['Name'])
    for grant in acl['Grants']:
        if grant.get('Grantee', {}).get('URI') == 'http://acs.amazonaws.com/groups/global/AllUsers':
            print(f"Public bucket found: {bucket['Name']}")
`
  },
  "Connect Jira to OrgBot": {
    message: `To connect Jira to OrgBot, generate an API token in your Atlassian account and add it to OrgBot's integrations. Would you like to see a sample integration script?`,
    code: `# Python (requests)
import requests

JIRA_URL = "https://your-domain.atlassian.net"
API_TOKEN = "your_api_token"
EMAIL = "your_email"

headers = {
    "Authorization": f"Basic {EMAIL}:{API_TOKEN}",
    "Content-Type": "application/json"
}

response = requests.get(f"{JIRA_URL}/rest/api/3/project", headers=headers)
print(response.json())
`
  },
  "Upload latest privacy policy": {
    message: `To upload your latest privacy policy, drag and drop the file or use the upload button. Would you like to see a sample upload handler?`,
    code: `// JavaScript (Node.js/Express)
const express = require('express');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

const app = express();
app.post('/upload', upload.single('policy'), (req, res) => {
  res.send('Privacy policy uploaded: ' + req.file.originalname);
});
`
  },
  "List users without MFA": {
    message: `To list users without MFA, you can use the AWS CLI or Python (boto3). Would you like to see a sample script?`,
    code: `# Bash (AWS CLI)
aws iam list-users --query 'Users[*].UserName' --output text | xargs -I {} bash -c 'aws iam list-mfa-devices --user-name {} --query "MFADevices" --output text | grep -q . || echo {}'

# Python (boto3)
import boto3

iam = boto3.client('iam')
for user in iam.list_users()['Users']:
    mfa = iam.list_mfa_devices(UserName=user['UserName'])
    if not mfa['MFADevices']:
        print(f"User without MFA: {user['UserName']}")
`
  },
  "Generate a security checklist": {
    message: `Here's a basic security checklist you can use to assess your cloud environment. Would you like to see a Python script that generates this checklist as a markdown file?`,
    code: `# security_checklist_generator.py

checklist = [
    "1. Ensure all S3 buckets are private",
    "2. Enable MFA for all users",
    "3. Rotate IAM credentials regularly",
    "4. Review security group rules",
    "5. Enable GuardDuty and CloudTrail",
    "6. Audit unused IAM roles and users",
    "7. Enforce strong password policies",
    "8. Check for public AMIs",
    "9. Enable logging for all resources",
    "10. Review third-party app permissions"
]

with open("security_checklist.md", "w") as f:
    f.write("# Security Checklist\n\n")
    for item in checklist:
        f.write(f"- {item}\n")

print("Security checklist generated: security_checklist.md")
`
  }
};

const PERMISSION_SETS_CODE = `// 🔧 Update targetGroups and managedPolicies with your team-specific values.

const teamA = new PermissionSets(this, 'TeamAPermissionSet', {
  instanceArn,
  permissionSetName: 'TeamAAccess',
  managedPolicies: ['arn:aws:iam::aws:policy/PowerUserAccess'],
  targetGroups: ['TeamA']
});

const teamB = new PermissionSets(this, 'TeamBPermissionSet', {
  instanceArn,
  permissionSetName: 'TeamBAccess',
  managedPolicies: ['arn:aws:iam::aws:policy/ViewOnlyAccess'],
  targetGroups: ['TeamB']
});`;

export default function ChatWindow({
  onMessage,
  setDrawerCode,
  setDrawerOpen
}: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { theme } = useTheme();

  // Add this ref for the chat messages container
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Update textarea in real-time as user speaks and adjust height
  useEffect(() => {
    if (listening) {
      setInput(transcript);
      // Adjust textarea height after a short delay
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.style.height = 'auto';
          textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
      }, 0);
    }
  }, [transcript, listening]);

  // Sync isListening state with actual listening state
  useEffect(() => {
    setIsListening(listening);
  }, [listening]);

  // Add auto-submit after pause
  useEffect(() => {
    let timeoutId: NodeJS.Timeout | undefined;

    if (listening && transcript) {
      // Clear any existing timeout
      if (timeoutId) clearTimeout(timeoutId);

      // Set new timeout for 2 seconds
      timeoutId = setTimeout(() => {
        if (transcript.trim()) {
          SpeechRecognition.stopListening();
          resetTranscript();
          
          // Add user message
          const userMessage: Message = {
            text: transcript,
            sender: 'user',
            timestamp: new Date().toISOString()
          };
          setMessages(prev => [...prev, userMessage]);

          // Add loading message
          const loadingMessage: Message = {
            text: 'loading',
            sender: 'bot',
            timestamp: new Date().toISOString()
          };
          setMessages(prev => [...prev, loadingMessage]);

          // Wait for 1.5 seconds
          setTimeout(() => {
            // Get bot response
            const response = getResponse(transcript);
            const botMessage: Message = {
              text: response.text,
              sender: 'bot',
              code: response.code,
              timestamp: new Date().toISOString()
            };

            // Replace loading message with actual response
            setMessages(prev => {
              const newMessages = [...prev];
              const loadingIndex = newMessages.findIndex(msg => msg.text === 'loading');
              if (loadingIndex !== -1) {
                newMessages[loadingIndex] = botMessage;
              }
              return newMessages;
            });

            // Clear the input field
            setInput('');
          }, 1500);
        }
      }, 2000);
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [transcript, listening]);

  // Auto-scroll to latest message
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Add user message
    const userMessage: Message = {
      text: input,
      sender: 'user',
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, userMessage]);
    onMessage(input);

    // Check if the last bot message is a prompt for code and user replied 'yes'
    const lastBotMsg = messages.slice().reverse().find(m => m.sender === 'bot');
    if (/^yes$/i.test(input.trim()) && lastBotMsg && /would you like/i.test(lastBotMsg.text)) {
      console.log('[OrgBot Debug] User input:', input);
      console.log('[OrgBot Debug] Last bot message:', lastBotMsg);
      // Try fuzzy match to any SCRIPTED_INTERACTIONS message
      const normalize = (str: string) => str.toLowerCase().replace(/[^a-z0-9 ]/gi, '').replace(/\s+/g, ' ').trim();
      const normalizedBotMsg = normalize(lastBotMsg.text);
      let found = false;
      for (const [key, val] of Object.entries(SCRIPTED_INTERACTIONS)) {
        const normalizedScripted = normalize(val.message);
        if (
          normalizedBotMsg.includes(normalizedScripted) ||
          normalizedScripted.includes(normalizedBotMsg) ||
          normalizedBotMsg.startsWith(normalizedScripted.split('would you like')[0].trim())
        ) {
          console.log('[OrgBot Debug] setDrawer with code:', val.code);
          console.log('[OrgBot Debug] setDrawer with tabTitle:', key);
          setDrawerCode({ code: '\n' + val.code, tabTitle: key });
          setDrawerOpen(true);
          console.log('[OrgBot Debug] Code drawer opened with fuzzy SCRIPTED_INTERACTIONS:', key);
          found = true;
          break;
        }
      }
      if (found) return;
      // Fallback: last bot message's code
      if (lastBotMsg.code && lastBotMsg.code.trim().length > 0) {
        setDrawerCode({ code: '\n' + lastBotMsg.code, tabTitle: 'Code' });
        setDrawerOpen(true);
        console.log('[OrgBot Debug] Code drawer opened with lastBotMsg.code (direct approach)');
        return;
      }
      // Fallback: previous bot messages with code
      const prevBotWithCode = messages.slice().reverse().find(m => m.sender === 'bot' && m.code && m.code.trim().length > 0);
      if (prevBotWithCode) {
        setDrawerCode({ code: '\n' + prevBotWithCode.code, tabTitle: 'Code' });
        setDrawerOpen(true);
        console.log('[OrgBot Debug] Code drawer opened with previous bot message with code (direct approach)');
        return;
      }
      // If still not found, show a user-facing error in the chat
      setMessages(prev => [...prev, {
        text: "Sorry, I couldn't find any code to show for this prompt.",
        sender: 'bot' as const,
        timestamp: new Date().toISOString()
      }]);
      console.error('[OrgBot Debug] Code drawer NOT opened: no code property on any bot message (direct approach).');
      return;
    }

    // Add loading message
    const loadingMessage: Message = {
      text: 'loading',
      sender: 'bot',
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, loadingMessage]);

    // Wait for 1.5 seconds
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Check for the specific permission sets question
    const permissionSetsQuestion = input.toLowerCase().includes('how do i assign different permission sets to two teams of users across multiple aws account') ||
      input.toLowerCase().includes('how do i sign different permission sets to two teams of users across multiple aws account') ||
      input.toLowerCase().includes('how do i send different permission sets to two teams of users across multiple aws account');

    if (permissionSetsQuestion) {
      const response = {
        text: `To assign different permission sets to two teams of users across multiple AWS accounts, you can use Chatbot's PermissionSets. Here's how:

1. Define permission sets for each team
2. Assign the permission sets to the appropriate AWS accounts
3. Map users to their respective teams

Would you like to see how the code implementation works?`,
        sender: 'bot',
        timestamp: new Date().toISOString()
      };

      // Replace loading message with actual response
      setMessages(prev => {
        const newMessages = [...prev];
        const loadingIndex = newMessages.findIndex(msg => msg.text === 'loading');
        if (loadingIndex !== -1) {
          newMessages[loadingIndex] = response;
        }
        return newMessages;
      });
      return;
    }

    // Get bot response for other queries
    const response = getResponse(input) as { text: string; code: string; sender: 'user' | 'bot' };
    const botMessage: Message = {
      text: response.text,
      sender: 'bot' as const,
      code: response.code,
      timestamp: new Date().toISOString()
    };

    // Replace loading message with actual response
    setMessages(prev => {
      const newMessages = [...prev];
      const loadingIndex = newMessages.findIndex(msg => msg.text === 'loading');
      if (loadingIndex !== -1) {
        newMessages[loadingIndex] = botMessage;
      }
      return newMessages;
    });

    // Clear input
    setInput('');
  };

  const handleUpload = () => {
    // Implement document upload logic here
    alert('Document upload clicked!');
  };

  const handleMic = () => {
    if (listening) {
      SpeechRecognition.stopListening();
      resetTranscript();
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    } else {
      setInput(''); // Clear input when starting new recording
      SpeechRecognition.startListening({ continuous: true });
    }
  };

  const handlePromptClick = async (prompt: string) => {
    // Add user message
    const userMessage: Message = {
      text: prompt,
      sender: 'user' as const,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, userMessage]);

    // Add loading message
    const loadingMessage: Message = {
      text: 'loading',
      sender: 'bot' as const,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, loadingMessage]);

    // Wait for 1.5 seconds
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Get the interaction for this prompt
    const interaction = SCRIPTED_INTERACTIONS[prompt];
    if (interaction) {
      // Replace loading message with actual response
      setMessages(prev => {
        const newMessages = [...prev];
        const loadingIndex = newMessages.findIndex(msg => msg.text === 'loading');
        if (loadingIndex !== -1) {
          const botMessage: Message = {
            text: interaction.message,
            sender: 'bot' as const,
            code: interaction.code,
            timestamp: new Date().toISOString()
          };
          newMessages[loadingIndex] = botMessage;
        }
        return newMessages;
      });
    }
  };

  if (!browserSupportsSpeechRecognition) {
    return null;
  }

  return (
    <div className="flex w-full relative">
      {/* Chat History Panel */}
      <div
        className={`fixed left-0 top-0 h-full ${
          theme === 'dark' ? 'bg-[#1a1a1a] border-gray-800' : 'bg-gray-100 border-gray-200'
        } border-r transition-transform duration-300 ease-in-out ${
          isHistoryOpen ? 'translate-x-0' : '-translate-x-full'
        } w-[280px] md:w-[320px] z-40`}
      >
        <div className="p-4 pt-48">
          <h3 className={`font-semibold mb-4 text-lg tracking-wide text-center mx-auto ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Chat History</h3>
          <div className="space-y-2">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`p-2 rounded-lg cursor-pointer transition-colors ${
                  message.sender === 'user'
                    ? theme === 'dark' ? 'bg-[#232323]' : 'bg-gray-200'
                    : theme === 'dark' ? 'bg-[#1e1e1e]' : 'bg-white'
                }`}
                onClick={() => {
                  const element = document.getElementById(`message-${index}`);
                  element?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                <p className={`text-sm truncate ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  {message.sender === 'user' ? 'You: ' : 'Assistant: '}
                  {message.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Toggle button for history panel */}
      <button
        onClick={() => setIsHistoryOpen(!isHistoryOpen)}
        className={`fixed top-1/2 transform -translate-y-1/2 z-50 ${
          theme === 'dark' ? 'bg-[#1a1a1a] border-gray-800' : 'bg-gray-100 border-gray-200'
        } text-${theme === 'dark' ? 'white' : 'gray-900'} p-2 rounded-r-lg border border-l-0 hover:${
          theme === 'dark' ? 'bg-[#232323]' : 'bg-gray-200'
        } transition-colors ${
          isHistoryOpen ? 'left-[280px] md:left-[320px]' : 'left-0'
        }`}
      >
        {isHistoryOpen ? <FiChevronLeft size={20} /> : <FiChevronRight size={20} />}
      </button>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col items-center transition-all duration-300 px-4 md:px-0">
        <div className="flex flex-col items-start w-full max-w-2xl mb-2">
          <h1 className={`text-2xl md:text-3xl font-bold text-center w-full ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>OrgBot Assistant</h1>
          <p className={`text-left mt-6 mb-8 text-sm md:text-base ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}>Try a compliance or operations prompt, like connecting Jira, uploading a privacy policy, or checking for public S3 buckets.</p>
        </div>

        {/* Chat messages */}
        <div className="w-full max-w-2xl mb-4 space-y-4">
          {messages.map((message, index) => (
            <div
              id={`message-${index}`}
              key={index}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[90%] md:max-w-[80%] rounded-lg p-3 md:p-4 ${
                  message.sender === 'user'
                    ? 'bg-[#228B22] text-white'
                    : theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-900'
                }`}
              >
                {message.text === 'loading' ? (
                  <div className="flex justify-center">
                    <FiLoader className="animate-spin h-4 w-4 text-gray-400" style={{ animationDuration: '2s' }} />
                  </div>
                ) : (
                  <>
                    <p className="text-sm md:text-base whitespace-pre-wrap break-words">{message.text}</p>
                    {message.sender === 'bot' &&
                      message.text.includes('Would you like to see how the code implementation works?') && (
                        <div className="mt-2 flex space-x-2">
                          <button
                            onClick={() => {
                              const isDNSSSL = message.text.includes('DNS and SSL certificates');
                              const codeWithSpace = isDNSSSL
                                ? '\n' + SCRIPTED_INTERACTIONS["Check for public S3 buckets"].code
                                : '\n' + PERMISSION_SETS_CODE;
                              setDrawerCode({ code: codeWithSpace, tabTitle: 'Check for public S3 buckets' });
                              setDrawerOpen(true);
                            }}
                            className="px-4 md:px-5 py-2 rounded-full bg-[#228B22] text-white font-semibold text-sm hover:bg-[#17631a] transition-colors"
                          >
                            Yes
                          </button>
                          <button
                            onClick={() => {
                              setMessages(prev =>
                                prev.map((msg, i) =>
                                  i === index
                                    ? {
                                        ...msg,
                                        text: msg.text.replace('Would you like to see how the code implementation works?', '')
                                      }
                                    : msg
                                )
                              );
                            }}
                            className="px-4 md:px-5 py-2 rounded-full bg-[#232323] border border-gray-600 text-white font-semibold text-sm hover:bg-[#2d2d2d] transition-colors"
                          >
                            No
                          </button>
                        </div>
                      )}
                  </>
                )}
              </div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        <form
          onSubmit={handleSubmit}
          className="w-full max-w-2xl flex flex-col gap-2"
          autoComplete="off"
        >
          <div className="flex flex-col w-full">
            <div className={`flex items-center ${
              theme === 'dark' ? 'bg-[#232323]' : 'bg-gray-100'
            } rounded-2xl px-4 md:px-6 py-3 md:py-4 w-full shadow-md`}>
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={isListening ? "Listening..." : "Ask me anything about OrgBot"}
                className={`flex-1 bg-transparent ${
                  theme === 'dark' ? 'text-white placeholder:text-gray-400' : 'text-gray-900 placeholder:text-gray-500'
                } outline-none text-sm md:text-base resize-none overflow-hidden min-h-[24px] max-h-[200px]`}
                rows={1}
              />
              {/* Upload button */}
              <button
                type="button"
                onClick={handleUpload}
                className={`ml-2 ${theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-400 hover:text-gray-900'} rounded-full p-2 transition-colors focus:outline-none`}
                aria-label="Upload document"
              >
                <FiUpload size={20} />
              </button>
              {/* Mic button */}
              <button
                type="button"
                onClick={handleMic}
                className={`ml-2 ${theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-400 hover:text-gray-900'} rounded-full p-2 transition-colors focus:outline-none`}
                aria-label={isListening ? "Stop listening" : "Start listening"}
              >
                <FiMic size={20} className={isListening ? "text-accent-secondary" : ""} />
              </button>
              {/* Send button */}
              <button
                type="submit"
                disabled={!input.trim() && !isListening}
                className={`ml-2 ${
                  theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-400 hover:text-gray-900'
                } rounded-full p-2 transition-colors focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed`}
                aria-label="Send message"
              >
                <FiArrowRight size={20} />
              </button>
            </div>
          </div>
        </form>

        {/* Prompt buttons row */}
        <div className="w-full max-w-2xl mx-auto flex flex-wrap gap-2 md:gap-3 gap-y-3 mt-3 mb-6 justify-start overflow-x-auto">
          {PROMPTS.map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => handlePromptClick(prompt)}
              className={`${
                theme === 'dark'
                  ? 'bg-[#232323] text-white hover:bg-[#2d2d2d]'
                  : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
              } px-3 md:px-4 py-2 rounded-full transition-colors text-sm md:text-base`}
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}