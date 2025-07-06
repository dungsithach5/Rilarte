import { Button } from "../components/ui/button-user"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu"
import Link from "next/link";
import Cookies from "js-cookie"
import { useRouter } from "next/navigation"
import { useDispatch } from "react-redux"
import { logout } from "../../context/userSlice"


interface Props {
  avatar: React.ReactNode;
}

export default function DropdownMenuDemo({ avatar }: Props) {
  const dispatch = useDispatch()
  const router = useRouter();

  const handleLogout = () => {
    dispatch(logout());
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
          <Link href="/profile">
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
