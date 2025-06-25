# OrgBot

OrgBot is a compliance and operations assistant prototype designed to help organizations automate and streamline cloud security, policy, and integration tasks. **This is a prototype, not a production system.** It features a chat-based interface, code generation, voice input, and a code viewer with syntax highlighting and copy functionality.

---

**Created by Rory O'Flynn**

---

## Features
- **Chat-based assistant** for compliance and operations queries
- **OrgBot-branded UI** with woodland green accent
- **Voice input** (speech-to-text) for hands-free operation
- **Prompt buttons** for common compliance tasks (e.g., S3 bucket checks, MFA, Jira integration)
- **Auto-generated code snippets** (Bash, Python, AWS CLI, etc.)
- **Animated code viewer** (typing effect, tabbed, copy-to-clipboard)
- **Dark and light theme support**

## Setup

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd chatbot-prototype
   ```
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Run the development server:**
   ```bash
   npm run dev
   ```
4. **Open in your browser:**
   Visit [http://localhost:3000](http://localhost:3000)

## Usage
- Type or speak a compliance/operations question or select a prompt.
- OrgBot will respond with guidance and, when appropriate, offer to show code.
- Click "Yes" to view the code in the animated code drawer, where you can copy or review it.
- Use the theme toggle to switch between dark and light modes.

## Tech Stack
- **Next.js** (App Router)
- **React 19**
- **Tailwind CSS**
- **Monaco Editor** (for code viewing)
- **react-speech-recognition** (voice input)
- **TypeScript**

## Customization
- **Branding colors**: Edit `tailwind.config.js` for accent colors.
- **Prompts and code**: Update `SCRIPTED_INTERACTIONS` in `src/components/ChatWindow.tsx`.
- **Logo**: Replace SVGs in `/public` as needed.

## License

[Add your license here]
