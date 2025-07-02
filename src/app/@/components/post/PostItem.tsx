interface PostItemProps {
    name: string;
    time: string;
    text: string;
    image: string;
  }
  
  export default function PostItem({ name, time, text, image }: PostItemProps) {
    return (
      <div className="mx-auto">
        <img src={image} alt="Post" className="w-full rounded-lg object-cover" />
        <div className="grid grid-cols-1 gap-3 mt-2">
          <div className="flex items-center gap-2">
            <img src="https://www.parents.com/thmb/lmejCapkkBYa0LQoezl2RxBi1Z0=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/GettyImages-911983386-d50a1de241d44f829b17053ace814f4e.jpg" alt={name} className="w-10 h-10 rounded-full object-cover" />
            <strong>{name}</strong>
          </div>
        </div>
      </div>
    );
  }
  