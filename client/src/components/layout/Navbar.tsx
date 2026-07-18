import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, LogOut, User as UserIcon } from 'lucide-react';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { useAuth } from '@/features/auth/context/AuthContext';
import toast from 'react-hot-toast';

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, logout, user } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Resume Checker', path: '/analyzer', protected: true },
    { name: 'Job Tracker', path: '/jobs', protected: true },
  ];

  const handleProtectedNavigation = (e: React.MouseEvent<HTMLAnchorElement>, _path: string, isProtected?: boolean) => {
    if (isProtected && !isAuthenticated) {
      e.preventDefault();
      toast.error('Please log in or create an account to use this feature');
      navigate('/login');
      if (isOpen) setIsOpen(false);
    } else {
      if (isOpen) setIsOpen(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      navigate('/');
    } catch (err: any) {
      toast.error('Failed to logout');
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  return (
    <nav 
      className={`sticky top-0 z-50 w-full transition-all duration-200 border-b ${
        scrolled 
          ? 'bg-surface/90 backdrop-blur-md border-border shadow-sm' 
          : 'bg-surface border-border/40'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <span className="text-primary font-bold text-lg">C</span>
              </div>
              <span className="text-xl font-bold tracking-tight">Codex<span className="text-primary">AI</span></span>
            </Link>
          </div>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex md:items-center md:space-x-1">
            {navLinks.map((link) => {
              const isActive = link.path === '/' ? location.pathname === '/' : location.pathname.startsWith(link.path);
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={(e) => handleProtectedNavigation(e, link.path, link.protected)}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
            
            {/* User Controls */}
            {isAuthenticated ? (
              <div className="ml-4 pl-4 border-l border-border flex items-center">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0">
                      <Avatar className="h-9 w-9 border-border/50 hover:border-primary/50 transition-colors">
                        <AvatarImage src={user?.profileImage} alt={user?.name || 'User'} />
                        <AvatarFallback className="bg-primary/5 text-primary">{getInitials(user?.name)}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none truncate">{user?.name}</p>
                        <p className="text-xs leading-none text-muted-foreground truncate">
                          {user?.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild className="cursor-pointer">
                      <Link to="/profile" className="flex items-center w-full">
                        <UserIcon className="mr-2 h-4 w-4" />
                        <span>Profile Settings</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10"
                      onClick={handleLogout}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="ml-4 pl-4 border-l border-border flex items-center gap-3">
                <Link
                  to="/login"
                  className={`text-sm font-medium transition-colors ${
                    location.pathname === '/login'
                      ? 'text-primary'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Log in
                </Link>
                <Button
                  asChild
                  size="sm"
                  variant={location.pathname === '/register' ? 'outline' : 'default'}
                  className={location.pathname === '/register' ? 'border-primary/50 text-primary' : ''}
                >
                  <Link to="/register">Sign Up</Link>
                </Button>
              </div>
            )}
          </div>
          
          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle navigation menu"
              className="text-muted-foreground hover:text-foreground"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden border-t border-border bg-background/95 backdrop-blur-md">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navLinks.map((link) => {
              const isActive = link.path === '/' ? location.pathname === '/' : location.pathname.startsWith(link.path);
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={(e) => handleProtectedNavigation(e, link.path, link.protected)}
                  className={`block px-3 py-2.5 rounded-md text-base font-medium transition-colors ${
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
            
            <div className="my-2 border-t border-border" />
            
            {isAuthenticated ? (
              <>
                <div className="px-3 py-3 flex items-center gap-3">
                  <Avatar className="h-10 w-10 border-border/50">
                    <AvatarImage src={user?.profileImage} alt={user?.name || 'User'} />
                    <AvatarFallback className="bg-primary/10 text-primary">{getInitials(user?.name)}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-foreground truncate">{user?.name}</span>
                    <span className="text-xs text-muted-foreground truncate">{user?.email}</span>
                  </div>
                </div>

                <Link
                  to="/profile"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center px-3 py-2.5 rounded-md text-base font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                >
                  <UserIcon className="mr-3 h-5 w-5" />
                  Profile Settings
                </Link>
                
                <button
                  onClick={() => {
                    setIsOpen(false);
                    handleLogout();
                  }}
                  className="flex items-center w-full text-left px-3 py-2.5 rounded-md text-base font-medium text-destructive hover:bg-destructive/10 transition-colors"
                >
                  <LogOut className="mr-3 h-5 w-5" />
                  Log out
                </button>
              </>
            ) : (
              <div className="px-3 py-3 space-y-3">
                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className={`flex w-full items-center justify-center px-3 py-2.5 rounded-md text-base font-medium border transition-colors ${
                    location.pathname === '/login'
                      ? 'border-primary/50 bg-primary/10 text-primary'
                      : 'border-border hover:bg-muted'
                  }`}
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsOpen(false)}
                  className={`flex w-full items-center justify-center px-3 py-2.5 rounded-md text-base font-medium transition-colors ${
                    location.pathname === '/register'
                      ? 'border border-primary/50 bg-primary/10 text-primary'
                      : 'bg-primary text-primary-foreground hover:bg-primary/90'
                  }`}
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
