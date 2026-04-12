import {
    Avatar,
    AvatarFallback,
    AvatarImage,
  } from "@/components/ui/avatar"
  import { Button } from "@/components/ui/button"
  import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuShortcut,
    DropdownMenuTrigger,
  } from "@/components/ui/dropdown-menu"
  import { useAuth } from "@/context/AuthContext"
  import { useNavigate } from "react-router-dom"
  
  export function UserNav() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
  
    const handleLogout = async () => {
      await logout();
      navigate("/");
    };
  
    if (!user) return null;
  
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-8 w-8 border border-zinc-200">
              <AvatarImage src="/avatars/01.png" alt={user.name} />
              <AvatarFallback className="bg-zinc-950 text-white text-[10px] font-black">{user.name.charAt(0)}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56 rounded-2xl border-none shadow-2xl p-2" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1 p-2">
              <p className="text-sm font-black leading-none tracking-tight">{user.name}</p>
              <p className="text-[10px] leading-none text-zinc-400 font-bold uppercase tracking-widest leading-loose mt-1">
                {user.role || 'Member'}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-zinc-100" />
          <DropdownMenuGroup className="p-1">
            <DropdownMenuItem className="rounded-xl font-bold text-xs py-2.5" onClick={() => navigate('/account')}>
              Account Settings
              <DropdownMenuShortcut>⌘P</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem className="rounded-xl font-bold text-xs py-2.5" onClick={() => navigate('/')}>
              Storefront View
              <DropdownMenuShortcut>⌘H</DropdownMenuShortcut>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator className="bg-zinc-100" />
          <DropdownMenuItem className="rounded-xl font-bold text-xs py-2.5 text-rose-500 focus:text-rose-500 focus:bg-rose-50" onClick={handleLogout}>
            Sign Out
            <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }
