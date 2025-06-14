import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Search, 
  MessageCircle, 
  Bell, 
  User, 
  Settings, 
  LogOut,
  Menu
} from "lucide-react";

export default function Navigation() {
  const { user } = useAuth();
  const [location] = useLocation();

  const { data: unreadCount } = useQuery({
    queryKey: ["/api/messages/unread/count"],
    enabled: !!user,
  });

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  const isFreelancer = user?.userType === 'freelancer';

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Main Navigation */}
          <div className="flex items-center">
            <Link href="/">
              <div className="flex-shrink-0 cursor-pointer">
                <h1 className="text-2xl font-bold text-upwork-green">FreelanceConnect</h1>
              </div>
            </Link>
            
            <div className="hidden md:block ml-10">
              <div className="flex items-baseline space-x-4">
                {isFreelancer ? (
                  <>
                    <Link href="/browse-jobs">
                      <Button 
                        variant="ghost" 
                        className={`${location === '/browse-jobs' ? 'text-upwork-green' : 'text-gray-700'} hover:text-upwork-green`}
                      >
                        Find Work
                      </Button>
                    </Link>
                    <Link href="/dashboard">
                      <Button 
                        variant="ghost" 
                        className={`${location === '/dashboard' ? 'text-upwork-green' : 'text-gray-700'} hover:text-upwork-green`}
                      >
                        My Jobs
                      </Button>
                    </Link>
                  </>
                ) : (
                  <>
                    <Link href="/browse-talent">
                      <Button 
                        variant="ghost" 
                        className="text-gray-700 hover:text-upwork-green"
                      >
                        Find Talent
                      </Button>
                    </Link>
                    <Link href="/dashboard">
                      <Button 
                        variant="ghost" 
                        className={`${location === '/dashboard' ? 'text-upwork-green' : 'text-gray-700'} hover:text-upwork-green`}
                      >
                        My Projects
                      </Button>
                    </Link>
                  </>
                )}
                <Button variant="ghost" className="text-gray-700 hover:text-upwork-green">
                  Reports
                </Button>
              </div>
            </div>
          </div>

          {/* Right side navigation */}
          <div className="flex items-center space-x-4">
            {/* Search */}
            <Button variant="ghost" size="sm" className="hidden md:flex">
              <Search className="w-4 h-4" />
            </Button>

            {/* Messages */}
            <Button variant="ghost" size="sm" className="relative">
              <MessageCircle className="w-4 h-4" />
              {unreadCount?.count > 0 && (
                <Badge className="absolute -top-1 -right-1 bg-red-500 text-white text-xs min-w-[16px] h-4 flex items-center justify-center p-0">
                  {unreadCount.count > 9 ? '9+' : unreadCount.count}
                </Badge>
              )}
            </Button>

            {/* Notifications */}
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="w-4 h-4" />
              <Badge className="absolute -top-1 -right-1 bg-red-500 text-white text-xs min-w-[16px] h-4 flex items-center justify-center p-0">
                3
              </Badge>
            </Button>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.profileImageUrl || ""} alt={user?.firstName || ""} />
                    <AvatarFallback>
                      {user?.firstName?.[0]}{user?.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <div className="flex flex-col space-y-1 p-2">
                  <p className="text-sm font-medium leading-none">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email}
                  </p>
                </div>
                <DropdownMenuSeparator />
                <Link href="/dashboard">
                  <DropdownMenuItem className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                </Link>
                <DropdownMenuItem className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="cursor-pointer text-red-600 focus:text-red-600"
                  onClick={handleLogout}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <Button variant="ghost" size="sm">
                <Menu className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
