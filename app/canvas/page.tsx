"use client"

import { Editor } from "../components/Editor";
import { Avatars } from "../components/Avatars";
import { Status } from "../components/Status";
import { Message } from "ai";
import { Room } from "../[pageId]/Room";
import { useRouter } from "next/navigation";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { createRoomWithLexicalDocument } from "../actions/liveblocks";
import { getPageUrl } from "../config";
import Markdown from "markdown-to-jsx";
import { CreateIcon } from "../icons/CreateIcon";



function MessageLine({ message }: { message: Message }) {
    const router = useRouter();
  
    const [title, setTitle] = useState("");
    const [content, setContent] = useState(message.content);
    const [loading, setLoading] = useState(false);
  
    // If the message starts with an H1 heading (#), extract it as the title
    useEffect(() => {
      const match = message.content.match(/^#\s(.+)/);
      if (match) {
        setTitle(match[1]);
        setContent(message.content.replace(/^#\s.+/, "").trim());
      } else {
        setTitle("");
        setContent(message.content);
      }
    }, [message.content]);
  
    // Create new document with content/title and redirect
    const handleSubmit = useCallback(
      async (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const room = await createRoomWithLexicalDocument(
          content,
          title || "Untitled document"
        );
        router.push(getPageUrl(room.id));
      },
      [content, title]
    );
  
    return (
      <div key={message.id}>
        {message.role === "user" ? (
          // Your messages
          <div className="flex justify-end">
            <div className="bg-gray-100 rounded-full py-1.5 px-3">{content}</div>
          </div>
        ) : (
          // AI messages
          <div className="flex text-white flex-col gap-2">
            <div className="border rounded-2xl shadow-sm">
              {title ? (
                <div className="font-semibold border-b px-4 py-2 pr-2 text-sm flex justify-start items-center gap-1.5">
                  <span>{title}</span>
                  <form onSubmit={handleSubmit}>
                    <button
                      disabled={loading}
                      className="font-normal text-gray-500 hover:text-gray-700 hover:bg-gray-100 disabled:hover:text-gray-500 disabled:hover:bg-transparent transition-colors rounded-lg py-1 px-1.5 flex gap-1 items-center disabled:opacity-70"
                    >
                      <CreateIcon className="w-3 h-3 opacity-70" />
                      {loading ? "Creating…" : "Create"}
                    </button>
                  </form>
                </div>
              ) : null}
  
              {/*Render markdown message as HTML */}
              <div className="px-4">
                <Markdown options={{ forceBlock: true }}>{content}</Markdown>
              </div>
            </div>
  
            <form onSubmit={handleSubmit}>
              <button
                disabled={loading}
                className="bg-gray-100 hover:bg-gray-200 transition-colors rounded-full py-1.5 px-3 flex gap-1.5 items-center disabled:opacity-70 hover:disabled:bg-gray-100"
              >
                <CreateIcon className="w-4 h-4 opacity-70" />
                {loading ? "Creating…" : "Create document"}
              </button>
            </form>
          </div>
        )}
      </div>
    );
  }
  

function Chat() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
  
    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsLoading(true);
  
      try {
        // Add user message
        const userMessage: Message = {
          id: String(Date.now()),
          role: 'user',
          content: input
        };
        
        setMessages(prev => [...prev, userMessage]);
        
        // Make API request
        const response = await fetch('https://xfsned.buildship.run/getDoc/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ messages: [...messages, userMessage] })
        });
  
        const data = await response.text();
        
        // Add AI response
        const aiMessage: Message = {
          id: String(Date.now() + 1),
          role: 'assistant',
          content: data
        };
  
        setMessages(prev => [...prev, aiMessage]);
        setInput('');
  
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setIsLoading(false);
      }
    };
  
  return (
    <div className="relative bg-black w-full mx-auto h-full flex  flex-col">
    <div className="flex-1 overflow-y-auto ">
      <div className="max-w-[740px]  mx-auto flex-1 px-8 py-4 flex flex-col gap-2">
        {messages.map((message) => (
          <MessageLine key={message.id} message={message} />
        ))}
      </div>
    </div>

    <form onSubmit={handleSubmit} className="max-w-[740px] mx-auto w-full flex-0 my-0 relative">
      <div className="mx-8 m-4 relative">
        <input
          placeholder={isLoading ? "Generating…" : "Create a draft about…"}
          className="border block w-full p-2 pl-3 rounded-lg outline-none transition-all focus:outline-indigo-500 disabled:bg-gray-50 disabled:outline-none"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={isLoading}
          autoFocus
        />
      </div>
    </form>
  </div>
  );
}

 export default function Main({
  params: { pageId },
}: {
  params: { pageId: string };
}) {
  return (
    <Room pageId={pageId}>
      <div className="flex h-screen">
        {/* Left side - Editor */}
        <div className="w-[400px] border-l border-gray-200">
          <Chat />
        </div>
        <div className="flex-1 flex flex-col">
          <div className="sticky top-0 left-0 right-0 h-[60px] flex items-center justify-between px-4 z-20">
            <div className="absolute top-3 left-3">
              <Status />
            </div>
            <div />
            <Avatars />
          </div>
          <Editor />
        </div>

      </div>
    </Room>
  );
}


//export default function Page() {
//     return (
//       <ClientSideSuspense fallback={null}>
//         <Main />
//       </ClientSideSuspense>
//     );
//   }
  