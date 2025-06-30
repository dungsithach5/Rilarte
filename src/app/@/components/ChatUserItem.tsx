interface ChatUserItemProps {
    name: string;
    message: string;
    time: string;
    avatar: string;
  }
  
  export function ChatUserItem({ name, message, time, avatar }: ChatUserItemProps) {
    return (
      <div className="flex items-start gap-3 px-3 py-2 hover:bg-gray-800 cursor-pointer">
        <img src={avatar} alt={name} className="w-10 h-10 rounded-full" />
        <div className="flex-1">
          <div className="flex justify-between text-white text-sm font-medium">
            <span>{name}</span>
            <span className="text-xs text-gray-400">{time}</span>
          </div>
          <p className="text-sm text-gray-400 truncate">{message}</p>
        </div>
      </div>
    );
  }