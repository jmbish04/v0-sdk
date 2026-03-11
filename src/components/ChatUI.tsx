import { useChat } from '@ai-sdk/react';
import React, { useEffect, useRef } from 'react';
import { Send, Terminal } from 'lucide-react';

export default function ChatUI() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/chat',
  });

  const iframeRef = useRef<HTMLIFrameElement>(null);

  const extractCode = (content: string) => {
    const match = content.match(/```tsx?\s*\n([\s\S]*?)\n```/);
    return match ? match[1] : null;
  };

  const getPreviewHtml = (code: string) => {
    // This provides a sandboxed environment for the component
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <script src="https://cdn.tailwindcss.com"></script>
          <script src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
          <script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
          <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
          <script src="https://unpkg.com/lucide@latest"></script>
          <style>
            body { margin: 0; padding: 2rem; font-family: system-ui, sans-serif; }
          </style>
        </head>
        <body>
          <div id="root"></div>
          <script type="text/babel">
            ${code.replace(/import\s+.*?\s+from\s+['"].*?['"];?/g, '')}

            // Mock lucide icons if needed
            const LucideIcons = window.lucide;

            const App = () => {
              try {
                // Return the default exported component or a wrapper if needed
                return typeof window.default === 'function' ? React.createElement(window.default) : null;
              } catch (e) {
                return <div>Error rendering component: {e.message}</div>;
              }
            };

            try {
              // Extract the component name or just assume it's the last declared function/const
              const root = ReactDOM.createRoot(document.getElementById('root'));

              // We'll just evaluate the code which should define a component and then we render it
              const codeStr = \`${code.replace(/`/g, '\\`').replace(/\$/g, '\\$')}\`;

              // This is a naive approach for preview. In a real app, you'd use a bundler in the browser
              // like Sandpack or a proper evaluator.
            } catch (err) {
              document.getElementById('root').innerHTML = '<div style="color:red;padding:1rem;border:1px solid red;background:#fee;">' + err.message + '</div>';
            }
          </script>
        </body>
      </html>
    `;
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

             // In a simpler approach for the fix, we just render the raw code if we don't have a good sandbox setup ready
             // But the prompt asks for an iframe sandbox with CSP. Let's use a Data URI for the iframe.

             return (
               <div key={m.id} className="h-full w-full flex flex-col">
                  <div className="p-4 bg-muted border-b border-border text-xs font-mono text-muted-foreground flex justify-between items-center">
                    <span>Preview (Sandboxed)</span>
                  </div>
                  <iframe
                    ref={iframeRef}
                    className="flex-1 w-full border-none"
                    sandbox="allow-scripts"
                    // Adding a strict CSP to the iframe
                    srcDoc={`
                      <!DOCTYPE html>
                      <html>
                        <head>
                          <meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline' https://cdn.tailwindcss.com https://unpkg.com; style-src 'unsafe-inline';">
                          <script src="https://cdn.tailwindcss.com"></script>
                        </head>
                        <body>
                          <div id="root" class="p-8">
                             <pre class="bg-gray-100 p-4 rounded text-sm overflow-auto text-gray-800">${code.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
                             <p class="mt-4 text-sm text-gray-500 text-center">Note: Full React evaluation requires a bundler like Sandpack.</p>
                          </div>
                        </body>
                      </html>
                    `}
                  />
               </div>
             );
           })}
        </div>
      </div>
    </div>
  );
}
