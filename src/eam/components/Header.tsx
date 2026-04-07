import { Bell, ChevronDown, Menu, Settings, Search, Sun, Moon } from "lucide-react";
import { useAuth } from "@eam/hooks/useAuth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@eam/components/ui/button";
import { useToast } from "@eam/hooks/use-toast";
import { apiRequest } from "@eam/lib/queryClient";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@eam/components/ui/dropdown-menu";
import { useState } from "react";

interface HeaderProps {
  onMenuToggle: () => void;
}

export default function Header({ onMenuToggle }: HeaderProps) {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDarkMode, setIsDarkMode] = useState(false);

  const logoutMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("/api/logout", {
        method: "POST",
      });
    },
    onSuccess: () => {
      queryClient.clear();
      toast({
        title: "Success",
        description: "Logged out successfully",
      });
      setLocation("/");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Logout failed",
        variant: "destructive",
      });
    },
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <nav className="glass border-b border-white/20 backdrop-blur-md fixed w-full top-0 z-50 animate-fade-in">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden p-2 hover:bg-white/10 transition-all duration-200"
              onClick={onMenuToggle}
            >
              <Menu className="h-5 w-5 text-gray-700 dark:text-gray-300" />
            </Button>
            
            <div className="flex items-center space-x-3">
              <div className="relative">
                <img 
                  src="/images/logo.svg" 
                  alt="EAM Logo" 
                  className="h-8 w-8"
                />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white animate-pulse-slow"></div>
              </div>
              
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                  Enterprise Asset Management
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400 -mt-1">
                  NNPC Refinery Operations
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* Search Bar */}
            <div className="hidden md:flex items-center relative">
              <Search className="absolute left-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search assets, work orders..."
                className="pl-10 pr-4 py-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 w-64"
              />
            </div>

            {/* Dark Mode Toggle */}
            <Button
              variant="ghost"
              size="sm"
              className="p-2 hover:bg-white/10 transition-all duration-200"
              onClick={toggleDarkMode}
            >
              {isDarkMode ? (
                <Sun className="h-5 w-5 text-yellow-500" />
              ) : (
                <Moon className="h-5 w-5 text-gray-600" />
              )}
            </Button>

            {/* Notifications */}
            <Button 
              variant="ghost" 
              size="sm" 
              className="relative p-2 hover:bg-white/10 transition-all duration-200"
            >
              <Bell className="h-5 w-5 text-gray-700 dark:text-gray-300" />
              <span className="absolute -top-1 -right-1 h-5 w-5 bg-gradient-to-r from-red-500 to-pink-500 rounded-full text-xs text-white flex items-center justify-center font-medium animate-pulse-slow">
                3
              </span>
            </Button>
            
            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="flex items-center space-x-3 hover:bg-white/10 transition-all duration-200 p-2"
                >
                  <div className="relative">
                    <div className="h-9 w-9 rounded-full gradient-primary text-white flex items-center justify-center text-sm font-semibold shadow-lg">
                      {user?.username ? user.username.charAt(0).toUpperCase() : "U"}
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
                  </div>
                  
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {user?.firstName && user?.lastName 
                        ? `${user.firstName} ${user.lastName}`
                        : user?.username || user?.email || "User"
                      }
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {user?.role || "Administrator"}
                    </p>
                  </div>
                  
                  <ChevronDown className="h-4 w-4 text-gray-400 transition-transform duration-200" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                align="end" 
                className="w-56 glass border-white/20 backdrop-blur-md"
              >
                <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {user?.firstName && user?.lastName 
                      ? `${user.firstName} ${user.lastName}`
                      : user?.username || user?.email || "User"
                    }
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {user?.email || "user@nnpc.com"}
                  </p>
                </div>
                
                <DropdownMenuItem 
                  onClick={handleLogout} 
                  disabled={logoutMutation.isPending}
                  className="flex items-center space-x-2 p-3 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
                >
                  {logoutMutation.isPending ? (
                    <>
                      <div className="loading-spinner"></div>
                      <span>Logging out...</span>
                    </>
                  ) : (
                    <>
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      <span>Logout</span>
                    </>
                  )}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  );
}
