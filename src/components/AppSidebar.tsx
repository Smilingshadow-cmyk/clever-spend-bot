import { LayoutDashboard, Shield, BarChart3, Settings, Database, Moon, Sun, Zap } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useTheme } from "@/hooks/use-theme";
import { useSpend } from "@/context/SpendContext";
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

const navItems = [
  { title: "Overview", url: "/", icon: LayoutDashboard },
  { title: "Auditor", url: "/auditor", icon: Shield },
  { title: "Insights", url: "/insights", icon: BarChart3 },
  { title: "Settings", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { isDark, toggle } = useTheme();
  const { isLoaded, loadSeedData } = useSpend();

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
                      <item.icon className="h-4 w-4 shrink-0" />
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
        <Button
          onClick={toggle}
          variant="ghost"
          size="sm"
          className="w-full text-sidebar-foreground hover:bg-sidebar-accent gap-2"
        >
          {isDark ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
          {!collapsed && (isDark ? "Light Mode" : "Dark Mode")}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
