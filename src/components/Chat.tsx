import { useState, useRef, useEffect } from 'react';
import { useQuery, useAction } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Doc } from '../../convex/_generated/dataModel';
import { SendHorizonal, Loader2, FileWarning } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface ChatProps {
  document: Doc<"documents">;
  setPageNumber: (page: number) => void;
}

export default function Chat({ document, setPageNumber }: ChatProps) {
  const [message, setMessage] = useState('');
  const messages = useQuery(api.chat.getMessages, { documentId: document._id });
  const sendMessage = useAction(api.chat.sendMessage);
  const [isSending, setIsSending] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to the bottom of the chat container when new messages arrive
    if (chatContainerRef.current) {
        chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() === '' || isSending) return;

    setIsSending(true);
    const currentMessage = message;
    setMessage('');

    try {
        await sendMessage({ message: currentMessage, documentId: document._id });
    } catch (error) {
        console.error("Failed to send message:", error);
        setMessage(currentMessage); 
    } finally {
        setIsSending(false);
    }
  };
  
  const parseAndRenderCitations = (text: string) => {
    const citationRegex = /\[Page: (\d+)\]/g;
    const parts = text.split(citationRegex);

    return parts.map((part, index) => {
        if (index % 2 === 1) { 
            const pageNum = parseInt(part, 10);
            return (
                <button
                    key={index}
                    onClick={() => setPageNumber(pageNum)}
                    className="bg-blue-100 text-blue-800 font-semibold px-2 py-0.5 rounded-md hover:bg-blue-200 transition-colors mx-1"
                >
                    Page {pageNum}
                </button>
            );
        } else {
          
        return (
    <div key={index} className="prose prose-sm max-w-none">
        <ReactMarkdown>{part}</ReactMarkdown>
    </div>
);   
        }
    });
  }

  if (document.parsingStatus === 'processing' || document.parsingStatus === 'pending') {
      return (
          <div className="w-full h-full flex flex-col items-center justify-center text-gray-600 bg-white border rounded-xl">
            <Loader2 className="w-12 h-12 animate-spin mb-4" />
            <h2 className="text-xl font-semibold">Processing Document</h2>
            <p>Please wait while we analyze your PDF...</p>
          </div>
      )
  }

  if (document.parsingStatus === 'failed') {
    return (
        <div className="w-full h-full flex flex-col items-center justify-center text-red-600 bg-red-50 border rounded-xl p-4 text-center">
            <FileWarning className="w-12 h-12 mb-4" />
            <h2 className="text-xl font-semibold">Parsing Failed</h2>
            <p>We couldn't process this PDF. It might be corrupted or in an unsupported format. Please try another file.</p>
        </div>
    )
}

  return (
    <div className="flex flex-col h-full bg-white border rounded-xl">
      <div ref={chatContainerRef} className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages?.map((msg, index) => (
          <div key={index} className={`flex my-2 ${msg.isUser ? 'justify-end' : 'justify-start'}`}>
            <div className={`p-3 rounded-lg max-w-xl ${msg.isUser ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-900'}`}>
              {msg.isUser ? msg.text : <div className="space-y-2">{parseAndRenderCitations(msg.text)}</div>}
            </div>
          </div>
        ))}
         {isSending && (
            <div className="flex my-2 justify-start">
              <div className="p-3 rounded-lg bg-gray-100 text-gray-900">
                <Loader2 className="w-4 h-4 animate-spin"/>
              </div>
            </div>
          )}
      </div>
      <form onSubmit={handleSendMessage} className="p-4 border-t flex items-center gap-2">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Ask a question about the document..."
          className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isSending}
        />
        <button type="submit" disabled={isSending || message.trim() === ''} className="p-2 bg-blue-600 text-white rounded-lg disabled:bg-gray-400 hover:bg-blue-700 transition-colors">
          <SendHorizonal />
        </button>
      </form>
    </div>
  );
}