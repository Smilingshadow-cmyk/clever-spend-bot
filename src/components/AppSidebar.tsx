import { LayoutDashboard, Shield, BarChart3, Database, Moon, Sun, BookOpen, User, LogOut, Inbox } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useTheme } from "@/hooks/use-theme";
import { useSpend } from "@/context/SpendContext";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Coins } from "lucide-react";

const navItems = [
  { title: "Overview", url: "/", icon: LayoutDashboard },
  { title: "Triage Queue", url: "/triage", icon: Inbox, showBadge: true },
  { title: "Auditor", url: "/auditor", icon: Shield },
  { title: "Rules & Categories", url: "/rules-and-categories", icon: BookOpen },
  { title: "Insights", url: "/insights", icon: BarChart3 },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { isDark, toggle } = useTheme();
  const { isLoaded, loadSeedData, currency, setCurrency, triageQueue } = useSpend();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="px-3 py-4">
            {!collapsed && (
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-md bg-primary flex items-center justify-center">
                  <Shield className="h-4 w-4 text-primary-foreground" />
                </div>
                <span className="font-semibold text-foreground text-sm">SpendGuard AI</span>
              </div>
            )}
            {collapsed && (
              <div className="h-7 w-7 rounded-md bg-primary flex items-center justify-center mx-auto">
                <Shield className="h-4 w-4 text-primary-foreground" />
              </div>
            )}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === "/"}
                      className="flex items-center gap-3 px-3 py-2 rounded-md text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
                      activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                    >
                      <div className="relative shrink-0">
                        <item.icon className="h-4 w-4" />
                        {("showBadge" in item && item.showBadge) && triageQueue.length > 0 && (
                          <span className="absolute -top-1.5 -right-1.5 h-3.5 min-w-[14px] rounded-full bg-rose-500 text-[9px] font-bold text-white flex items-center justify-center px-0.5">
                            {triageQueue.length}
                          </span>
                        )}
                      </div>
                      {!collapsed && <span className="text-sm">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-3 space-y-2">
        {!isLoaded && (
          <Button
            onClick={loadSeedData}
            size="sm"
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
          >
            <Database className="h-3.5 w-3.5" />
            {!collapsed && "Seed Data"}
          </Button>
        )}
        <Dialog>
          <DialogTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-sidebar-foreground hover:bg-sidebar-accent gap-2 justify-start px-3"
            >
              <Coins className="h-4 w-4" />
              {!collapsed && "Currency Settings"}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Currency Settings</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col space-y-4 py-4">
              <p className="text-sm text-muted-foreground">Select the currency symbol to use throughout the application.</p>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger>
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="$">$ (USD)</SelectItem>
                  <SelectItem value="₹">₹ (INR)</SelectItem>
                  <SelectItem value="€">€ (EUR)</SelectItem>
                  <SelectItem value="£">£ (GBP)</SelectItem>
                  <SelectItem value="¥">¥ (JPY)</SelectItem>
                  <SelectItem value="A$">A$ (AUD)</SelectItem>
                  <SelectItem value="C$">C$ (CAD)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </DialogContent>
        </Dialog>
        
        <Button
          onClick={toggle}
          variant="ghost"
          size="sm"
          className="w-full text-sidebar-foreground hover:bg-sidebar-accent gap-2 justify-start px-3"
        >
          {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          {!collapsed && (isDark ? "Light Mode" : "Dark Mode")}
        </Button>

        {/* Profile / User section */}
        {user && (
          <>
            <div className="h-px bg-sidebar-border" />
            <SidebarMenuButton asChild>
              <NavLink
                to="/profile"
                className="flex items-center gap-3 px-3 py-2 rounded-md text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
                activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium"
              >
                <User className="h-4 w-4 shrink-0" />
                {!collapsed && (
                  <span className="text-sm truncate max-w-[140px]">{user.email}</span>
                )}
              </NavLink>
            </SidebarMenuButton>
            <Button
              onClick={handleSignOut}
              variant="ghost"
              size="sm"
              className="w-full text-sidebar-foreground hover:bg-destructive/10 hover:text-destructive gap-2 justify-start px-3"
            >
              <LogOut className="h-4 w-4" />
              {!collapsed && "Sign Out"}
            </Button>
          </>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
