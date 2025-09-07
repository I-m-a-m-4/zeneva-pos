
"use client";

import type React from 'react';
import *as React from 'react';
import { usePathname } from 'next/navigation';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import Logo from '@/components/icons/logo';
import Link from 'next/link';
import {
  LayoutDashboard, Archive, Settings, ReceiptText, Bell, LogOut, ChevronDown, List, Tags, Percent, ShoppingCart, Globe, Repeat, Landmark, FileText, Users, UserCog, BarChartBig, FileSpreadsheet, Truck, Calculator, Package, Building, Briefcase, Users2, TrendingUp, Palette, ShieldCheck, Search as SearchIcon, FilePlus2, DollarSign, Home, CreditCard, UserPlus, AlertTriangle, CheckCircle2, InfoIcon, Store, Sparkles, Award, MailQuestion, GiftIcon, ActivityIcon, ShieldQuestion, Lightbulb, Loader2, ShieldAlert, Wrench, Moon, Sun
} from 'lucide-react';
import type { NavItem, NavItemGroup, SearchableAppItem, BusinessInstance, UserRole } from '@/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger } from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { useToast } from "@/hooks/use-toast";
import CalculatorModal from '@/components/shared/calculator-modal';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/auth-context';
import MobileBottomNav from '@/components/layout/mobile-bottom-nav';
import TrialExpiryBanner from '@/components/layout/trial-expiry-banner';
import { useTheme } from 'next-themes';
import NextTopLoader from 'nextjs-toploader';


const navItemsConfig: (NavItem | NavItemGroup)[] = [
  { title: 'Point of Sale', href: '/sales/pos/select-products', icon: ShoppingCart, type: 'item', roles: ['admin', 'manager'] },
  { title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, type: 'item', roles: ['admin', 'manager'] },
  {
    title: 'Products',
    icon: Package,
    type: 'group',
    roles: ['admin', 'manager', 'vendor_operator'],
    children: [
      { title: 'Inventory', href: '/inventory', icon: Archive, type: 'item', roles: ['admin', 'manager', 'vendor_operator'] },
      { title: 'Troubleshoot', href: '/inventory/troubleshoot', icon: Wrench, type: 'item', roles: ['admin', 'manager'] },
      { title: 'Product Items', href: '/product-items', icon: List, type: 'item', roles: ['admin', 'manager'] },
      { title: 'Categories', href: '/categories', icon: Tags, type: 'item', roles: ['admin', 'manager'] },
      { title: 'Waitlist', href: '/waitlist', icon: MailQuestion, type: 'item', roles: ['admin', 'manager'] },
    ],
  },
  {
    title: 'Sales & Orders',
    icon: CreditCard,
    type: 'group',
    roles: ['admin', 'manager'],
    children: [
      { title: 'Sales Transactions', href: '/sales', icon: ReceiptText, type: 'item', roles: ['admin', 'manager'] },
      { title: 'Receipts', href: '/receipts', icon: ReceiptText, type: 'item', roles: ['admin', 'manager'] },
      { title: 'Invoices', href: '/invoices', icon: FileSpreadsheet, type: 'item', roles: ['admin', 'manager'] },
      { title: 'Shipments', href: '/shipments', icon: Truck, type: 'item', roles: ['admin', 'manager'] },
      { title: 'Online Orders', href: '/online-orders', icon: Globe, type: 'item', roles: ['admin', 'manager'] },
    ],
  },
   {
    title: 'Financials',
    icon: DollarSign,
    type: 'group',
    roles: ['admin', 'manager'],
    children: [
      { title: 'Cash Flow', href: '/cash-flow', icon: Repeat, type: 'item', roles: ['admin', 'manager'] },
      { title: 'Expenses', href: '/expenses', icon: FileText, type: 'item', roles: ['admin', 'manager'] },
      { title: 'Other Incomes', href: '/other-incomes', icon: Landmark, type: 'item', roles: ['admin', 'manager'] },
    ],
  },
  { title: 'Customers (CRM)', href: '/customers', icon: Users2, type: 'item', roles: ['admin', 'manager'] },
  { title: 'Discount', href: '/discount', icon: Percent, type: 'item', roles: ['admin', 'manager'] },
  { title: 'Reports', href: '/reports', icon: BarChartBig, type: 'item', roles: ['admin', 'manager', 'vendor_operator'] },
  {
    title: 'Storefront (Pro)',
    icon: Store,
    type: 'group',
    label: 'Pro',
    roles: ['admin', 'manager'],
    children: [
        { title: 'View Store', href: '', icon: Store, type: 'item', roles: ['admin', 'manager'], external: true }, // Href will be dynamic
        { title: 'Customize', href: '/storefront/customize', icon: Palette, type: 'item', roles: ['admin', 'manager'] }
    ]
  },
  {
    title: 'Insights',
    icon: Lightbulb,
    type: 'group',
    roles: ['admin'],
    children: [
      { title: 'Business Insights', href: '/insights', icon: Lightbulb, type: 'item', roles: ['admin'] },
    ],
  },
  {
    title: 'Growth',
    icon: ActivityIcon,
    type: 'group',
    roles: ['admin', 'manager'],
    children: [
      { title: 'Referrals & Rewards', href: '/referrals', icon: GiftIcon, type: 'item', roles: ['admin', 'manager'] },
    ],
  },
  {
    title: 'Administration',
    icon: Briefcase,
    type: 'group',
    roles: ['admin'],
    children: [
      { title: 'User & Staff', href: '/users-staff', icon: UserCog, type: 'item', roles: ['admin'] },
      { title: 'Settings', href: '/settings', icon: Settings, type: 'item', roles: ['admin'] },
      { title: 'Audit Logs', href: '/audit-logs', icon: ShieldQuestion, type: 'item', roles: ['admin'] },
    ],
  }
];

const searchableAppItems: SearchableAppItem[] = [
  { id: 'pos_select_products', title: 'Point of Sale (New Sale)', href: '/sales/pos/select-products', icon: ShoppingCart, keywords: ['pos', 'new sale', 'start sale', 'checkout', 'add products to sale'] },
  { id: 'dashboard', title: 'Dashboard Overview', href: '/dashboard', icon: LayoutDashboard, keywords: ['home', 'overview', 'summary', 'main', 'stats', 'dashboard page'] },
  { id: 'inventory', title: 'Inventory List', href: '/inventory', icon: Archive, keywords: ['products', 'stock', 'items', 'manage inventory', 'view stock', 'inventory page'] },
  { id: 'add_product', title: 'Add New Product', href: '/inventory/add', icon: FilePlus2, keywords: ['create product', 'new item', 'add stock', 'new product form'] },
  { id: 'insights_main', title: 'Business Insights Dashboard', href: '/insights', icon: Lightbulb, keywords: ['intelligence', 'analytics dashboard', 'data insights', 'competitor analysis', 'growth suggestions'] },
  { id: 'users_staff', title: 'User & Staff Management', href: '/users-staff', icon: UserCog, keywords: ['accounts', 'permissions', 'team', 'add user', 'manage staff', 'user roles'] },
  { id: 'audit_logs', title: 'Audit Logs', href: '/audit-logs', icon: ShieldQuestion, keywords: ['activity log', 'user actions', 'system events', 'security trail', 'transaction log'] },
  { id: 'settings_main', title: 'Settings', href: '/settings', icon: Settings, keywords: ['configuration', 'preferences', 'options', 'app settings', 'general settings'] },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { toast } = useToast();
  const pathname = usePathname();
  const { user, status, userBusinessRoles, currentBusinessId, currentRole, currentBusiness, selectBusiness, logout } = useAuth();
  const { setTheme } = useTheme();

  const [unreadAlertsCount, setUnreadAlertsCount] = React.useState(0);
  const [isCalculatorOpen, setIsCalculatorOpen] = React.useState(false);

  const [searchTerm, setSearchTerm] = React.useState("");
  const [searchResults, setSearchResults] = React.useState<SearchableAppItem[]>([]);
  const [isSearchPopoverOpen, setIsSearchPopoverOpen] = React.useState(false);
  const searchInputRef = React.useRef<HTMLInputElement>(null);
  
  if (status !== 'authenticated') {
    return null;
  }
  
  const handleCalculatorClick = () => setIsCalculatorOpen(true);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const term = event.target.value;
    setSearchTerm(term);
    if (term.length > 1) {
      const lowerCaseTerm = term.toLowerCase();
      const filteredResults = searchableAppItems.filter(item =>
        item.title.toLowerCase().includes(lowerCaseTerm) ||
        item.keywords.some(keyword => keyword.toLowerCase().includes(lowerCaseTerm))
      );
      setSearchResults(filteredResults);
      setIsSearchPopoverOpen(true);
    } else {
      setSearchResults([]);
      setIsSearchPopoverOpen(false);
    }
  };

  const handleSearchResultClick = () => {
    setSearchTerm("");
    setSearchResults([]);
    setIsSearchPopoverOpen(false);
    searchInputRef.current?.blur();
  };
  
  const handleSearchInputFocus = () => {
    if (searchTerm.length > 1 && searchResults.length > 0) {
      setIsSearchPopoverOpen(true);
    }
  };

  const handleSearchInputBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    setTimeout(() => {
      if (!searchInputRef.current?.contains(document.activeElement) &&
          !document.querySelector('[data-radix-popper-content-wrapper=""]')?.contains(document.activeElement)) {
        setIsSearchPopoverOpen(false);
      }
    }, 150);
  };
  
  const handleLogout = () => {
    logout();
    toast({title: "Logged Out", description:"You have been successfully logged out of Zeneva."});
  };

  const filterNavItemsByRole = (items: (NavItem | NavItemGroup)[], role: UserRole | null): (NavItem | NavItemGroup)[] => {
    if (!role) return [];
    return items.map(item => {
      if (item.roles && !item.roles.includes(role)) {
        return null;
      }
      if (item.type === 'group') {
        const accessibleChildren = item.children.filter(child => !child.roles || child.roles.includes(role));
        if (accessibleChildren.length === 0) return null;
        return { ...item, children: accessibleChildren };
      }
      return item;
    }).filter(item => item !== null) as (NavItem | NavItemGroup)[];
  };

  const visibleNavItems = filterNavItemsByRole(navItemsConfig, currentRole);
  const currentBusinessName = userBusinessRoles.find(r => r.businessId === currentBusinessId)?.businessName || "Select Business";

  return (
    <>
      <NextTopLoader
        color="hsl(var(--primary))"
        initialPosition={0.08}
        crawlSpeed={200}
        height={3}
        crawl={true}
        showSpinner={false}
        easing="ease"
        speed={200}
        shadow="0 0 10px hsl(var(--primary)),0 0 5px hsl(var(--primary))"
      />
      <TooltipProvider>
        <SidebarProvider defaultOpen>
          <Sidebar variant="sidebar" collapsible="icon">
            <SidebarHeader className="p-4 flex items-center gap-2 justify-between">
              <Link href="/dashboard" className="flex items-center gap-2 text-sidebar-foreground hover:text-sidebar-primary transition-colors">
                <Logo size={28} />
                <span className="text-2xl font-semibold group-data-[collapsible=icon]/sidebar:hidden">Zeneva</span>
              </Link>
            </SidebarHeader>

            <SidebarContent className="p-2">
              <ScrollArea className="h-full">
                 {userBusinessRoles.length > 1 && (
                   <div className="px-2 py-1 group-data-[collapsible=icon]/sidebar:px-0 group-data-[collapsible=icon]/sidebar:py-1">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="w-full justify-start group-data-[collapsible=icon]/sidebar:justify-center p-2 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
                          <Building className="h-4 w-4 mr-2 group-data-[collapsible=icon]/sidebar:mr-0" />
                          <span className="truncate group-data-[collapsible=icon]/sidebar:hidden" title={currentBusinessName}>{currentBusinessName}</span>
                          <ChevronDown className="ml-auto h-4 w-4 group-data-[collapsible=icon]/sidebar:hidden" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent side="bottom" align="start" className="w-56">
                        <DropdownMenuLabel>Switch Business</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {userBusinessRoles.map(br => (
                          <DropdownMenuItem key={br.businessId} onClick={() => selectBusiness(br.businessId)} disabled={br.businessId === currentBusinessId}>
                            {br.businessName} <Badge variant="outline" className="ml-auto text-xs">{br.role}</Badge>
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                   </div>
                 )}
                <Separator className="my-2 bg-sidebar-border group-data-[collapsible=icon]/sidebar:hidden" />
                {currentRole ? (
                  <Accordion type="multiple" className="w-full" defaultValue={['Products', 'Sales & Orders', 'Financials', 'Growth', 'Administration', 'Insights', 'Storefront (Pro)']}>
                    {visibleNavItems.map((item) =>
                      item.type === 'group' ? (
                        <AccordionItem value={item.title} key={item.title} className="border-none">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <AccordionTrigger className="p-2 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground rounded-md text-sm font-normal justify-start group-data-[collapsible=icon]/sidebar:!p-2.5 group-data-[collapsible=icon]/sidebar:justify-center">
                                <div className="flex items-center gap-2 w-full group-data-[collapsible=icon]/sidebar:justify-center">
                                  <item.icon className="group-data-[collapsible=icon]/sidebar:mx-auto group-data-[collapsible=icon]/sidebar:size-5" />
                                  <span className="group-data-[collapsible=icon]/sidebar:hidden">{item.title}</span>
                                </div>
                              </AccordionTrigger>
                            </TooltipTrigger>
                            <TooltipContent side="right" align="center" className="group-data-[collapsible=icon]/sidebar:block hidden">
                              <p>{item.title}</p>
                            </TooltipContent>
                          </Tooltip>
                          <AccordionContent className="pb-0 pl-4 group-data-[collapsible=icon]/sidebar:hidden">
                            <SidebarMenu>
                              {(item.children || []).map((child) => (
                                <SidebarMenuItem key={child.title}>
                                  <Link href={child.external ? `/b/${currentBusinessId}/products` : child.href} legacyBehavior passHref>
                                    <SidebarMenuButton
                                      tooltip={{ children: child.title, side: "right", align: "center" }}
                                      asChild
                                      size="sm"
                                      isActive={pathname === child.href}
                                    >
                                      <a target={child.external ? "_blank" : undefined}>
                                        <child.icon />
                                        <span>{child.title}</span>
                                      </a>
                                    </SidebarMenuButton>
                                  </Link>
                                </SidebarMenuItem>
                              ))}
                            </SidebarMenu>
                          </AccordionContent>
                        </AccordionItem>
                      ) : (
                        <SidebarMenu key={item.title} className="px-0">
                          <SidebarMenuItem>
                            <Link href={item.href} legacyBehavior passHref>
                              <SidebarMenuButton
                                tooltip={{ children: item.title, side: "right", align: "center" }}
                                asChild
                                isActive={pathname === item.href}
                              >
                                <a>
                                  <item.icon />
                                  <span className="flex items-center justify-between w-full">
                                    {item.title}
                                    {item.label === 'Pro' && (
                                      <Badge variant="outline" className="ml-auto text-xs bg-accent text-accent-foreground border-accent group-data-[collapsible=icon]/sidebar:hidden">
                                        <Sparkles className="h-3 w-3 mr-1"/> PRO
                                      </Badge>
                                    )}
                                  </span>
                                </a>
                              </SidebarMenuButton>
                            </Link>
                          </SidebarMenuItem>
                        </SidebarMenu>
                      )
                    )}
                  </Accordion>
                ) : (
                  <div className="p-4 text-center text-sidebar-foreground/70 text-sm group-data-[collapsible=icon]/sidebar:hidden">
                    No role assigned for this business or business not selected.
                  </div>
                )}
              </ScrollArea>
            </SidebarContent>
            <SidebarFooter className="p-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="w-full justify-start group-data-[collapsible=icon]/sidebar:justify-center p-2 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.photoURL || ""} alt={user?.displayName || user?.email || "User"} data-ai-hint="person avatar placeholder"/>
                      <AvatarFallback>{user?.displayName?.charAt(0) || user?.email?.charAt(0) || 'Z'}</AvatarFallback>
                    </Avatar>
                    <span className="ml-2 group-data-[collapsible=icon]/sidebar:hidden truncate" title={user?.displayName || user?.email || "User Profile"}>{user?.displayName || user?.email}</span>
                    <ChevronDown className="ml-auto h-4 w-4 group-data-[collapsible=icon]/sidebar:hidden" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent side="top" align="start" className="w-56">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {currentRole === 'admin' && user?.email === 'bimex4@gmail.com' && (
                      <DropdownMenuItem asChild>
                          <Link href="/imamshaffy">
                              <ShieldAlert className="mr-2 h-4 w-4" />
                              <span>Platform Admin</span>
                          </Link>
                      </DropdownMenuItem>
                   )}
                  <DropdownMenuItem asChild>
                       <Link href="/settings">
                          <Settings className="mr-2 h-4 w-4" />
                          <span>Settings</span>
                      </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                        <Sun className="h-4 w-4 mr-2 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                        <Moon className="absolute h-4 w-4 mr-2 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                        <span>Toggle theme</span>
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent>
                      <DropdownMenuItem onClick={() => setTheme("light")}>Light</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setTheme("dark")}>Dark</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setTheme("system")}>System</DropdownMenuItem>
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarFooter>
          </Sidebar>
          <main className="flex-1">
             <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 py-4">
              <SidebarTrigger className="md:hidden"/>
              <div className="relative flex-1 md:grow-0">
                <Popover open={isSearchPopoverOpen} onOpenChange={setIsSearchPopoverOpen}>
                  <PopoverTrigger asChild>
                    <div className="relative">
                       <SearchIcon className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        ref={searchInputRef}
                        type="search"
                        placeholder="Search Zeneva..."
                        className="w-full md:w-[300px] lg:w-[400px] bg-muted pl-8"
                        value={searchTerm}
                        onChange={handleSearchChange}
                        onFocus={handleSearchInputFocus}
                        onBlur={handleSearchInputBlur}
                        data-ai-hint="global app search input"
                      />
                    </div>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-[--radix-popover-trigger-width] p-0 max-h-[300px] overflow-y-auto"
                    align="start"
                    onOpenAutoFocus={(e) => e.preventDefault()}
                    >
                    {searchResults.length > 0 ? (
                      <div className="py-1">
                        {searchResults.map((item) => (
                          <Link
                            key={item.id}
                            href={item.href}
                            className="flex items-center gap-3 px-3 py-2.5 text-sm hover:bg-accent rounded-md"
                            onClick={handleSearchResultClick}
                          >
                            <item.icon className="h-4 w-4 text-muted-foreground" />
                            <span>{item.title}</span>
                          </Link>
                        ))}
                      </div>
                    ) : (
                      searchTerm.length > 1 && (
                        <p className="p-4 text-sm text-center text-muted-foreground">No results found for "{searchTerm}"</p>
                      )
                    )}
                  </PopoverContent>
                </Popover>
              </div>
              <div className="flex items-center gap-1 md:gap-2 ml-auto">
                <Tooltip>
                  <TooltipTrigger asChild>
                     <Button variant="ghost" size="icon" aria-label="Calculator" onClick={handleCalculatorClick}>
                      <Calculator className="h-5 w-5" />
                      <span className="sr-only">Open Calculator</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Calculator</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="ghost" size="icon" aria-label="Notifications">
                          <Bell className="h-5 w-5" />
                          {unreadAlertsCount > 0 && (
                            <Badge variant="destructive" className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-xs">
                              {unreadAlertsCount}
                            </Badge>
                          )}
                          <span className="sr-only">Toggle notifications</span>
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent align="end" className="w-80 p-0">
                        <div className="p-4 font-medium border-b">Notifications</div>
                        <ScrollArea className="h-[300px]">
                            <p className="p-4 text-sm text-muted-foreground text-center">No new notifications.</p>
                        </ScrollArea>
                      </PopoverContent>
                    </Popover>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Notifications</p>
                  </TooltipContent>
                </Tooltip>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full md:flex">
                      <Avatar className="h-8 w-8">
                         <AvatarImage src={user?.photoURL || ""} alt={user?.displayName || user?.email || "User"} data-ai-hint="person avatar placeholder"/>
                         <AvatarFallback>{user?.displayName?.charAt(0) || user?.email?.charAt(0) || 'Z'}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none truncate" title={user?.displayName || ""}>{user?.displayName || "Zeneva User"}</p>
                        <p className="text-xs leading-none text-muted-foreground truncate" title={user?.email || ""}>
                          {user?.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/settings">
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Settings</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </header>
            <div className="flex-1 p-4 sm:p-6 overflow-auto md:pb-6 pb-24">
               <TrialExpiryBanner currentBusiness={currentBusiness} />
              {children}
            </div>
          </main>
        </SidebarProvider>
      </TooltipProvider>
      <MobileBottomNav />
      <CalculatorModal isOpen={isCalculatorOpen} onOpenChange={setIsCalculatorOpen} />
    </>
  );
}
