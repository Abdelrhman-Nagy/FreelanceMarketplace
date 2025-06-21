
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Avatar, AvatarFallback } from './ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';
import { ModeToggle } from './mode-toggle';
import { useAuth } from '../contexts/AuthContext';
import { Briefcase, User, LogOut, Settings, Heart, FileText, DollarSign } from 'lucide-react';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <Briefcase className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-primary">FreelanceHub</span>
          </Link>

          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/jobs" className="text-foreground/80 hover:text-foreground transition-colors">
              Find Jobs
            </Link>
            {user && (
              <>
                <Link to="/dashboard" className="text-foreground/80 hover:text-foreground transition-colors">
                  Dashboard
                </Link>
                {user.userType === 'client' && (
                  <Link to="/post-job" className="text-foreground/80 hover:text-foreground transition-colors">
                    Post Job
                  </Link>
                )}
              </>
            )}
          </nav>

          <div className="flex items-center space-x-4">
            <ModeToggle />
            
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        {user.firstName?.[0]?.toUpperCase()}{user.lastName?.[0]?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium">{user.firstName} {user.lastName}</p>
                      <p className="w-[200px] truncate text-sm text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="w-full cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/projects" className="w-full cursor-pointer">
                      <Briefcase className="mr-2 h-4 w-4" />
                      Projects
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/contracts" className="w-full cursor-pointer">
                      <FileText className="mr-2 h-4 w-4" />
                      Contracts
                    </Link>
                  </DropdownMenuItem>
                  {user.userType === 'freelancer' && (
                    <>
                      <DropdownMenuItem asChild>
                        <Link to="/proposals" className="w-full cursor-pointer">
                          <FileText className="mr-2 h-4 w-4" />
                          My Proposals
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/saved-jobs" className="w-full cursor-pointer">
                          <Heart className="mr-2 h-4 w-4" />
                          Saved Jobs
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-2">
                <Button variant="ghost" asChild>
                  <Link to="/login">Login</Link>
                </Button>
                <Button asChild>
                  <Link to="/register">Sign Up</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
