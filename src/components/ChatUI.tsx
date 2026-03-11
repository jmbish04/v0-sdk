import { useChat } from '@ai-sdk/react';
import React from 'react';
import { Send, Terminal } from 'lucide-react';
import { LiveProvider, LiveError, LivePreview } from 'react-live';

export default function ChatUI() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/chat',
  });

  const extractCode = (content: string) => {
    const match = content.match(/```tsx?\n([\s\S]*?)\n```/);
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
             return (
               <LiveProvider key={m.id} code={code} noInline={false}>
                 <div className="h-full w-full overflow-auto">
                   <LivePreview className="p-8" />
                 </div>
                 <LiveError className="absolute bottom-0 left-0 right-0 bg-destructive/90 text-destructive-foreground p-4 font-mono text-sm" />
               </LiveProvider>
             );
           })}
        </div>
      </div>
    </div>
  );
}
