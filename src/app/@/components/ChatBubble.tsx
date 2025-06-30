interface ChatBubbleProps {
    message: string;
    isSender?: boolean;
    avatar?: string;
  }
  
  export function ChatBubble({ message, isSender, avatar }: ChatBubbleProps) {
    return (
      <div className={`flex ${isSender ? 'justify-end' : 'justify-start'} mb-2 px-4`}>
        {!isSender && avatar && (
          <img src={avatar} alt="avatar" className="w-8 h-8 rounded-full mr-2 self-end" />
        )}
        <div
          className={`px-4 py-2 text-sm rounded-xl max-w-xs text-white ${
            isSender ? 'bg-[#3a3a3a]' : 'bg-[#1f1f1f]'
          }`}
        >
          {message}
        </div>
      </div>
    );
  }
  