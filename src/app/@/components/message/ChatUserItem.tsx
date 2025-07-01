interface ChatUserItemProps {
    name: string;
    message: string;
    time: string;
    avatar: string;
  }
  
  export function ChatUserItem({ name, message, time, avatar }: ChatUserItemProps) {
    return (
      <div className="flex items-start gap-3 px-3 py-2 hover:bg-gray-200 cursor-pointer">
        <img src={avatar} alt={name} className="w-12 h-12 rounded-full" />
        <div className="flex-1">
          <div className="flex justify-between font-medium">
            <span>{name}</span>
            <span className="text-xs text-gray-500">{time}</span>
          </div>
          <p className="text-sm text-gray-500 truncate">{message}</p>
        </div>
      </div>
    );
  }