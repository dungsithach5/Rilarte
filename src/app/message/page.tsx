import React from 'react';
import { ChatHeader } from '../@/components/ChatHeader';
import { ChatUserItem } from '../@/components/ChatUserItem';
import { ChatBubble } from '../@/components/ChatBubble';

export default function ChatPage() {
  const users = [
    {
      name: 'Stephen Yustiono',
      message: "Nice. I don't know why people get all worked up about hawaiian pizza.",
      time: '9:36 AM',
      avatar: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS4igm3370WzfBZWqhO5MDgp4pmfPbXjEz1YA&s',
    },
    {
      name: 'Erin Steed',
      message: 'Sad fact: you cannot search for a gif of the word “gif”, just gives you gifs.',
      time: '9:36 AM',
      avatar: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS4igm3370WzfBZWqhO5MDgp4pmfPbXjEz1YA&s',
    },
  ];

  const messages = [
    { message: 'Hey, did you finish the report?', isSender: false, avatar: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS4igm3370WzfBZWqhO5MDgp4pmfPbXjEz1YA&s' },
    { message: 'Almost! Just polishing up the last section. You?', isSender: true },
    { message: 'Done and sent. Took me forever though 😂', isSender: false, avatar: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS4igm3370WzfBZWqhO5MDgp4pmfPbXjEz1YA&s' },
    { message: 'Lucky you! I got distracted by a cat video for like... 30 minutes 😂', isSender: true },
    { message: 'Classic Jamie  Need any help?', isSender: false, avatar: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS4igm3370WzfBZWqhO5MDgp4pmfPbXjEz1YA&s' },
    { message: ",Nah, I'm good. Thanks though!", isSender: true },
  ];

  return (
    <div className="flex h-screen bg-black">
      <div className="w-72 h-full bg-[#0f0f0f] border-r border-gray-800 text-white overflow-y-auto">
        <div className="flex items-center justify-between px-4 py-4">
          <h2 className="font-bold text-lg">Chats</h2>
          <input
            type="text"
            placeholder="Search"
            className="bg-[#1e1e1e] text-sm text-white px-2 py-1 rounded-md outline-none w-40"
          />
        </div>
        {users.map((user, index) => (
          <ChatUserItem key={index} {...user} />
        ))}
      </div>
      <div className="flex flex-col flex-1">
        <ChatHeader name="Stephen Yustiono" avatar="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS4igm3370WzfBZWqhO5MDgp4pmfPbXjEz1YA&s" />
        <div className="flex-1 h-full overflow-y-auto bg-[#0f0f0f] pt-4">
          {messages.map((msg, index) => (
            <ChatBubble key={index} {...msg} />
          ))}
        </div>
        <div className="p-4 border-t border-gray-700 bg-[#121212]">
          <input
            type="text"
            placeholder="Write a message"
            className="w-full px-4 py-2 rounded bg-[#1e1e1e] text-white text-sm outline-none"
          />
        </div>
      </div>
    </div>
  );
}
