import { useChat } from '@ai-sdk/react';
import React from 'react';
import { Send, Terminal } from 'lucide-react';

export default function ChatUI() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/chat',
  });

  const extractCode = (content: string) => {
    const match = content.match(/```tsx?\s*\n([\s\S]*?)\n```/);
    return match ? match[1] : null;
  };

  return (
    <div className="flex h-screen bg-background text-foreground font-sans">
      <div className="w-1/3 border-r border-border flex flex-col bg-background">
        <header className="p-4 border-b border-border flex items-center gap-2">
          <Terminal className="w-6 h-6 text-primary" />
          <h1 className="font-bold text-lg">v0 Clone Workspace</h1>
        </header>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((m) => (
            <div key={m.id} className={`p-4 rounded-lg ${m.role === 'user' ? 'bg-secondary ml-8' : 'bg-muted mr-8'}`}>
              <div className="text-xs text-muted-foreground mb-2 uppercase tracking-wider">{m.role}</div>
              <div className="whitespace-pre-wrap text-sm">{m.content}</div>
            </div>
          ))}
          {isLoading && <div className="text-muted-foreground animate-pulse text-sm">Synthesizing components...</div>}
        </div>

        <form onSubmit={handleSubmit} className="p-4 border-t border-border">
          <div className="relative">
            <input
              value={input}
              onChange={handleInputChange}
              placeholder="Design a dashboard widget..."
              className="w-full bg-input border border-border rounded-md py-3 pl-4 pr-12 focus:outline-none focus:ring-2 focus:ring-ring text-sm"
            />
            <button type="submit" disabled={isLoading || !input} className="absolute right-2 top-2 p-1.5 bg-primary text-primary-foreground hover:opacity-90 rounded-md disabled:opacity-50 transition-opacity">
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>

      <div className="w-2/3 bg-muted p-8 flex flex-col">
        <div className="flex-1 bg-background rounded-xl overflow-hidden shadow-2xl ring-1 ring-border relative">
           {messages.filter(m => m.role === 'assistant').slice(-1).map((m) => {
             const code = extractCode(m.content);
             if (!code) return <div key={m.id} className="p-8 text-muted-foreground">Waiting for implementation...</div>;

             // Create a data URL or blob URL for the sandboxed iframe
             const htmlContent = `
               <!DOCTYPE html>
               <html>
                 <head>
                   <meta charset="utf-8">
                   <meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline' https://unpkg.com; style-src 'unsafe-inline' https://cdn.tailwindcss.com; font-src 'self' data:; connect-src 'none'; img-src data: https:;">
                   <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
                   <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
                   <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
                   <script src="https://cdn.tailwindcss.com"></script>
                 </head>
                 <body>
                   <div id="root"></div>
                   <script type="text/babel">
                     const { useState, useEffect } = React;
                     // Wrap user code to handle potential exports or render calls
                     try {
                       ${code.replace(/import\s+.*?from\s+['"].*?['"];?/g, '')} // Remove imports for basic sandboxing

                       const App = typeof App !== 'undefined' ? App : (typeof defaultExport !== 'undefined' ? defaultExport : (() => <div>Component not found</div>));
                       const rootElement = document.getElementById('root');
                       const root = ReactDOM.createRoot(rootElement);
                       root.render(<App />);
                     } catch (err) {
                       document.getElementById('root').innerHTML = '<div style="color: red; font-family: monospace; padding: 1rem;">' + err.toString() + '</div>';
                     }
                   </script>
                 </body>
               </html>
             `;

             return (
               <iframe
                 key={m.id}
                 sandbox="allow-scripts"
                 srcDoc={htmlContent}
                 className="w-full h-full border-0"
                 title="Preview"
               />
             );
           })}
        </div>
      </div>
    </div>
  );
}
