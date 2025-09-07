"use client";

import *as React from 'react';
import { useRouter } from 'next/navigation';
import PageTitle from '@/components/shared/page-title';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserCog, UserPlus, ShieldCheck, KeyRound, Activity, Search, Info, LockKeyhole, Eye, EyeOff, MoreVertical, Edit, Trash2, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import type { UserStaff, UserRole } from '@/types';
import { useAuth } from '@/context/auth-context';
import { db } from '@/lib/firebase';
import { collection, addDoc, updateDoc, deleteDoc, serverTimestamp, query, where, getDocs, doc } from "firebase/firestore";


const OWNER_ACCESS_KEY_STORAGE = "zeneva-inventory-owner-access-key";
const DEFAULT_FALLBACK_OWNER_PASSWORD = "zenevaaccess123";

const rolesWithCapabilities: { name: string; value: UserRole; capabilities: string[] }[] = [
  {
    name: "Administrator (Owner)",
    value: "admin",
    capabilities: [
      "Full access to all Zeneva features and settings.",
      "Can manage users, roles, and permissions.",
      "Can configure business details, financial settings, and vendor policies.",
      "Has oversight of all inventory, sales, financial data, and reports.",
    ],
  },
  {
    name: "Manager",
    value: "manager",
    capabilities: [
      "Can perform all day-to-day operations.",
      "Manages POS, inventory, sales, customers, and discounts.",
      "Can view financial reports (cash flow, expenses).",
      "Cannot manage users or core business/system settings.",
    ],
  },
  {
    name: "Vendor/Operator",
    value: "vendor_operator",
    capabilities: [
      "Highly restricted access, defined by the business owner.",
      "Can be granted view-only access to specific reports or inventory data.",
      "Typically cannot perform sales or manage general inventory.",
      "Requires adherence to vendor policy if enabled by the owner.",
    ],
  },
];


export default function UsersStaffPage() {
  const [usersStaff, setUsersStaff] = React.useState<UserStaff[]>([]);
  const [isAddUserModalOpen, setIsAddUserModalOpen] = React.useState(false);
  const [editingUser, setEditingUser] = React.useState<UserStaff | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  
  const [isAccessGranted, setIsAccessGranted] = React.useState(false); // Set to true to bypass password for dev
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = React.useState(true);
  const [passwordInput, setPasswordInput] = React.useState("");
  const [passwordError, setPasswordError] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  
  const router = useRouter();
  const { toast } = useToast();
  const { currentBusinessId, currentRole, status: authStatus } = useAuth(); // Get current business context

  const [newUserForm, setNewUserForm] = React.useState({ fullName: "", email: "", role: "manager" as UserRole, password: "" });

  const getOwnerAccessPassword = React.useCallback(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(OWNER_ACCESS_KEY_STORAGE) || DEFAULT_FALLBACK_OWNER_PASSWORD;
    }
    return DEFAULT_FALLBACK_OWNER_PASSWORD;
  }, []);

  React.useEffect(() => {
    if (authStatus !== 'loading' && currentRole !== 'admin') { 
        toast({ variant: "destructive", title: "Access Denied", description: "You do not have permission to manage users." });
        router.replace('/dashboard');
        return;
    }
    if (!isAccessGranted && currentRole === 'admin') {
      setIsPasswordDialogOpen(true);
    }
    if (currentBusinessId && currentRole === 'admin' && isAccessGranted) {
        fetchStaffForBusiness(currentBusinessId);
    }
  }, [isAccessGranted, currentBusinessId, currentRole, router, toast, authStatus]);


  const fetchStaffForBusiness = async (businessId: string) => {
    setIsLoading(true);
    try {
        const q = query(collection(db, "users"), where("businessId", "==", businessId));
        const querySnapshot = await getDocs(q);
        const staffList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as UserStaff));
        setUsersStaff(staffList);

    } catch (error) {
        console.error("Error fetching staff:", error);
        toast({ variant: "destructive", title: "Error Fetching Staff", description: "Could not load staff members." });
    } finally {
        setIsLoading(false);
    }
  };


  const handlePasswordSubmit = () => {
    const correctPassword = getOwnerAccessPassword();
    if (passwordInput === correctPassword) {
      setIsAccessGranted(true);
      setIsPasswordDialogOpen(false);
      setPasswordError("");
       if (correctPassword === DEFAULT_FALLBACK_OWNER_PASSWORD && (typeof window !== 'undefined' && !localStorage.getItem(OWNER_ACCESS_KEY_STORAGE))) {
        toast({
          title: "Default Password Used",
          description: "Consider setting a custom owner access password in Zeneva Inventory Settings for better security.",
          duration: 7000,
        });
      }
    } else {
      setPasswordError("Incorrect password. Access denied.");
       toast({
        variant: "destructive",
        title: "Access Denied",
        description: "The password you entered is incorrect.",
      });
    }
  };

  const handlePasswordDialogClose = (isOpen: boolean) => {
      if (!isOpen && !isAccessGranted) {
        router.push('/dashboard');
      }
  };

  const handleOpenAddModal = () => {
    setEditingUser(null);
    setNewUserForm({ fullName: "", email: "", role: "manager", password: "" });
    setIsAddUserModalOpen(true);
  };

  const handleOpenEditModal = (user: UserStaff) => {
    setEditingUser(user);
    setNewUserForm({ fullName: user.fullName || "", email: user.email, role: user.role, password: "" });
    setIsAddUserModalOpen(true);
  }

  const handleAddEditUserSubmit = async () => {
    if (!currentBusinessId) {
        toast({ variant: "destructive", title: "Error", description: "No business selected." });
        return;
    }
    if (!newUserForm.fullName || !newUserForm.email || !newUserForm.role) {
        toast({ variant: "destructive", title: "Validation Error", description: "Full name, email, and role are required." });
        return;
    }
    if (!editingUser && !newUserForm.password) {
        toast({ variant: "destructive", title: "Validation Error", description: "Password is required for new users." });
        return;
    }

    setIsLoading(true);

    const staffData = {
        fullName: newUserForm.fullName,
        email: newUserForm.email,
        role: newUserForm.role,
        status: "active" as "active" | "inactive",
        businessId: currentBusinessId,
        updatedAt: serverTimestamp(),
    };

    try {
        if (editingUser) { // Update existing user
            const userRef = doc(db, 'users', editingUser.id);
            await updateDoc(userRef, staffData);
            toast({ title: "User Updated", description: `${newUserForm.fullName}'s details updated.` });
        } else { // Add new user - This requires backend logic to create Firebase Auth user
            toast({ title: "Action Not Implemented", description: `In a real app, a backend function would create an auth user for ${newUserForm.email} before adding them to Firestore.` });
            console.log("Simulating adding new user:", staffData);
            // In a real app, you would use a Cloud Function to create the auth user
            // then create the Firestore document.
        }
        fetchStaffForBusiness(currentBusinessId); // Refresh list
        setIsAddUserModalOpen(false);
        setEditingUser(null);
    } catch (error) {
        console.error("Error saving user/staff:", error);
        toast({ variant: "destructive", title: "Save Failed", description: `Could not save user. ${(error as Error).message}` });
    } finally {
        setIsLoading(false);
    }
  };

  const handleDeleteUser = async (userToDelete: UserStaff) => {
    if (!currentBusinessId) return;
    if (!confirm(`Are you sure you want to delete ${userToDelete.fullName}? This cannot be undone.`)) return;
    
    setIsLoading(true);
    try {
        // This should also be a backend function to delete from Firebase Auth too
        await deleteDoc(doc(db, "users", userToDelete.id));
        toast({ variant: "destructive", title: "User Deleted", description: `${userToDelete.fullName} has been removed.` });
        fetchStaffForBusiness(currentBusinessId);
    } catch (error) {
        console.error("Error deleting user:", error);
        toast({ variant: "destructive", title: "Delete Failed", description: `Could not delete user. ${(error as Error).message}` });
    } finally {
        setIsLoading(false);
    }
  };

  if (authStatus === 'loading') {
    return <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /> <span className="ml-2">Verifying access...</span></div>;
  }
  
  if (!isAccessGranted && currentRole === 'admin') {
    return (
      <Dialog open={isPasswordDialogOpen} onOpenChange={handlePasswordDialogClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
                <LockKeyhole className="h-6 w-6 text-primary" /> Owner Access Required
            </DialogTitle>
            <DialogDescription>
              Please enter the owner access password to manage users and staff for Zeneva Inventory.
              {getOwnerAccessPassword() === DEFAULT_FALLBACK_OWNER_PASSWORD && (typeof window !== 'undefined' && !localStorage.getItem(OWNER_ACCESS_KEY_STORAGE)) && (
                <span className="mt-2 block text-xs">
                  Current default is: <code>{DEFAULT_FALLBACK_OWNER_PASSWORD}</code>. It's recommended to change this in Settings.
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="ownerPassword">Password</Label>
              <div className="relative">
                <Input
                  id="ownerPassword"
                  type={showPassword ? "text" : "password"}
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="Enter owner password"
                  onKeyPress={(e) => e.key === 'Enter' && handlePasswordSubmit()}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                  onClick={() => setShowPassword(!showPassword)}
                  type="button"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              {passwordError && <p className="text-sm text-destructive mt-1">{passwordError}</p>}
            </div>
          </div>
          <DialogFooter>
             <Button variant="outline" onClick={() => {
                setIsPasswordDialogOpen(false);
                router.push('/dashboard');
             }}>Cancel</Button>
            <Button onClick={handlePasswordSubmit}>Unlock Access</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }


  return (
    <div className="flex flex-col gap-6">
      <PageTitle title="User & Staff Management" subtitle="Administer user accounts, roles, and permissions within Zeneva Inventory.">
        <Dialog open={isAddUserModalOpen} onOpenChange={(open) => {
            setIsAddUserModalOpen(open);
            if (!open) setEditingUser(null);
        }}>
            <DialogTrigger asChild>
                <Button onClick={handleOpenAddModal}>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Add New User/Staff
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>{editingUser ? "Edit User/Staff" : "Add New User/Staff to Zeneva Inventory"}</DialogTitle>
                    <DialogDescription>
                        {editingUser ? "Update the user's details and role." : "Enter the details for the new user or staff member."}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={(e) => { e.preventDefault(); handleAddEditUserSubmit(); }} className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-3">
                    <div className="space-y-2">
                        <Label htmlFor="fullName">Full Name</Label>
                        <Input id="fullName" value={newUserForm.fullName} onChange={e => setNewUserForm(p => ({...p, fullName: e.target.value}))} placeholder="e.g., Ada Eze" data-ai-hint="full name input" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input id="email" type="email" value={newUserForm.email} onChange={e => setNewUserForm(p => ({...p, email: e.target.value}))} placeholder="e.g., ada.eze@example.com" data-ai-hint="email input" />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="role">Assign Role</Label>
                        <Select name="role" value={newUserForm.role} onValueChange={value => setNewUserForm(p => ({...p, role: value as UserRole}))}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select a role" />
                            </SelectTrigger>
                            <SelectContent>
                                {rolesWithCapabilities.map(role => (
                                    <SelectItem key={role.value} value={role.value}>
                                        {role.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    {!editingUser && (
                        <div className="space-y-2">
                            <Label htmlFor="password">Set Password</Label>
                            <Input id="password" type="password" value={newUserForm.password} onChange={e => setNewUserForm(p => ({...p, password: e.target.value}))} placeholder="Enter a strong password" data-ai-hint="password input" />
                        </div>
                    )}
                     <DialogFooter>
                        <DialogClose asChild>
                            <Button type="button" variant="outline" disabled={isLoading}>Cancel</Button>
                        </DialogClose>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : null}
                            {editingUser ? "Save Changes" : "Add User/Staff"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
      </PageTitle>

      <Card>
        <CardHeader>
          <CardTitle>User and Staff Account Control</CardTitle>
          <CardDescription>
            Manage accounts for your team members. Assign roles and define specific permissions
            to control access to different features and data within the Zeneva Inventory system.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading && !usersStaff.length ? (
            <div className="flex justify-center items-center h-40"><Loader2 className="h-8 w-8 animate-spin text-primary"/></div>
          ) : usersStaff.length > 0 ? (
             <>
              <div className="mb-4 flex items-center gap-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <input type="text" placeholder="Search users by name or role..." className="w-full md:w-1/2 p-2 border rounded-md bg-background"/>
              </div>
              <div className="space-y-3">
                {usersStaff.map(user => (
                  <Card key={user.id} className="p-4 hover:shadow-md transition-shadow">
                    <div className="flex flex-col sm:flex-row justify-between items-start">
                      <div>
                        <h4 className="font-semibold text-foreground">{user.fullName}</h4>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                        <p className="text-xs text-muted-foreground">
                            Role: {rolesWithCapabilities.find(r => r.value === user.role)?.name || user.role}
                            {user.lastLogin && ` | Last Login: ${new Date(user.lastLogin).toLocaleDateString()}`}
                        </p>
                      </div>
                       <div className="flex items-center gap-2 mt-2 sm:mt-0">
                        <Badge variant={user.status === 'active' ? 'secondary' : 'destructive'}
                          className={user.status === 'active' ? 'bg-green-100 text-green-700 border-green-300' : ''}
                        >
                            {user.status}
                        </Badge>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4"/></Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleOpenEditModal(user)}><Edit className="mr-2 h-4 w-4"/> Edit User/Role</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => alert(`Password reset for ${user.fullName} would be handled via Firebase Auth.`)}><KeyRound className="mr-2 h-4 w-4"/> Reset Password</DropdownMenuItem>
                                <DropdownMenuItem className="text-destructive focus:text-destructive focus:bg-destructive/10" onClick={() => handleDeleteUser(user)}><Trash2 className="mr-2 h-4 w-4"/> Delete User</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                       </div>
                    </div>
                  </Card>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-10 border-2 border-dashed border-muted rounded-lg">
              <UserCog className="mx-auto h-16 w-16 text-muted-foreground opacity-50 mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">No Users or Staff Added Yet for this Business</h3>
              <p className="text-muted-foreground mb-4 max-w-lg mx-auto">
                Secure your Zeneva Inventory system and delegate tasks effectively by creating accounts for your staff.
              </p>
              <Button onClick={handleOpenAddModal}>
                Add Your First User/Staff Member
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
            <CardTitle className="flex items-center gap-2"><Info className="h-5 w-5 text-primary"/> Understanding User Roles & Capabilities</CardTitle>
            <CardDescription>
                Assigning appropriate roles is crucial for security and efficient operations. Here's a general guideline:
            </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            {rolesWithCapabilities.map(role => (
                <div key={role.value} className="p-3 border rounded-md bg-muted/30">
                    <h4 className="font-semibold text-foreground">{role.name}</h4>
                    <ul className="list-disc list-inside text-sm text-muted-foreground mt-1 space-y-0.5">
                        {role.capabilities.map((cap, index) => (
                            <li key={index}>{cap.replace("Zeneva Inventory", "").replace("Zeneva", "")}</li>
                        ))}
                    </ul>
                </div>
            ))}
        </CardContent>
      </Card>
    </div>
  );
}
