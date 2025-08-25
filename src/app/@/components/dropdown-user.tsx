import { useDispatch } from "react-redux";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Cookies from "js-cookie";
import { logout } from "../../context/userSlice";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button-user";

interface Props {
  avatar: React.ReactNode;
  userId?: number | string;
}

export default function DropdownMenuDemo({ avatar, userId }: Props) {
  const dispatch = useDispatch()
  const router = useRouter();
  const profileLink = userId ? `/profile/${userId}` : '/profile';

  const handleLogout = async () => {
    dispatch(logout());
    await signOut({ callbackUrl: '/auth' })
    Cookies.remove("token");
    router.push("/auth");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">{avatar}</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem>
          <Link href={profileLink}>
            Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleLogout}>
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
