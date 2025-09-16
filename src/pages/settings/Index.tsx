import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";
import { useState, useRef, useMemo } from 'react';
import { useToast } from "@/hooks/use-toast";

const SettingsPage = () => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [profile, setProfile] = useState({
    name: "Admin User",
    email: "admin@oniotech.com",
    organization: "OnioTech Inc."
  });
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [users, setUsers] = useState([
    { id: 1, name: "Admin User", role: "Admin", status: "Active" },
    { id: 2, name: "Farmer John", role: "Farmer", status: "Active" },
    { id: 3, name: "Trader Jane", role: "Trader", status: "Inactive" }
  ]);
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);
  const [isEditUserDialogOpen, setIsEditUserDialogOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    role: "",
    status: "Active"
  });
  const [editingUser, setEditingUser] = useState({
    id: 0,
    name: "",
    email: "",
    role: "",
    status: "Active"
  });
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [roleFilter, setRoleFilter] = useState<"all" | "Admin" | "Farmer" | "Trader" | "Viewer">("all");

  const handlePhotoUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid File Type",
          description: "Please select an image file (JPG, PNG, etc.).",
          variant: "destructive"
        });
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "Please select an image smaller than 5MB.",
          variant: "destructive"
        });
        return;
      }

      // Create preview URL
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageUrl = event.target?.result as string;
        setProfileImage(imageUrl);
        toast({
          title: "Photo Uploaded",
          description: `${file.name} has been uploaded successfully.`,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = () => {
    // Validate profile fields
    if (!profile.name.trim()) {
      toast({
        title: "Name Required",
        description: "Please enter your full name.",
        variant: "destructive"
      });
      return;
    }

    if (!profile.email.trim()) {
      toast({
        title: "Email Required",
        description: "Please enter your email address.",
        variant: "destructive"
      });
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(profile.email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive"
      });
      return;
    }

    if (!profile.organization.trim()) {
      toast({
        title: "Organization Required",
        description: "Please enter your organization name.",
        variant: "destructive"
      });
      return;
    }

    // Update the current user in the users list (assuming Admin User is ID 1)
    setUsers(prev => prev.map(user => 
      user.id === 1 
        ? { ...user, name: profile.name }
        : user
    ));

    // Save profile (in a real app, this would make an API call)
    toast({
      title: "Profile Saved Successfully",
      description: "Your profile information has been updated.",
    });
  };

  const handleEditUser = (userId: number, userName: string) => {
    const userToEdit = users.find(user => user.id === userId);
    if (userToEdit) {
      setEditingUser({
        id: userToEdit.id,
        name: userToEdit.name,
        email: `${userToEdit.name.toLowerCase().replace(' ', '.')}@oniotech.com`, // Generate email based on name
        role: userToEdit.role,
        status: userToEdit.status
      });
      setIsEditUserDialogOpen(true);
    }
  };

  const handleUpdateUser = () => {
    // Validate form
    if (!editingUser.name.trim()) {
      toast({
        title: "Name Required",
        description: "Please enter the user's full name.",
        variant: "destructive"
      });
      return;
    }

    if (!editingUser.email.trim()) {
      toast({
        title: "Email Required",
        description: "Please enter the user's email address.",
        variant: "destructive"
      });
      return;
    }

    if (!editingUser.role) {
      toast({
        title: "Role Required",
        description: "Please select a role for the user.",
        variant: "destructive"
      });
      return;
    }

    // Update user in the list
    setUsers(prev => prev.map(user => 
      user.id === editingUser.id 
        ? { id: user.id, name: editingUser.name, role: editingUser.role, status: editingUser.status }
        : user
    ));
    
    toast({
      title: "User Updated Successfully",
      description: `${editingUser.name}'s information has been updated.`,
    });

    // Reset form and close dialog
    setEditingUser({
      id: 0,
      name: "",
      email: "",
      role: "",
      status: "Active"
    });
    setIsEditUserDialogOpen(false);
  };

  const handleCancelEditUser = () => {
    setEditingUser({
      id: 0,
      name: "",
      email: "",
      role: "",
      status: "Active"
    });
    setIsEditUserDialogOpen(false);
  };

  // Filter users based on search query, status filter, and role filter
  const filteredUsers = useMemo(() => {
    let filtered = users;
    
    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(user => 
        statusFilter === "active" ? user.status === "Active" : user.status === "Inactive"
      );
    }
    
    // Apply role filter
    if (roleFilter !== "all") {
      filtered = filtered.filter(user => user.role === roleFilter);
    }
    
    // Apply search query
    if (userSearchQuery.trim()) {
      const query = userSearchQuery.toLowerCase();
      filtered = filtered.filter(user => 
        user.name.toLowerCase().includes(query) ||
        user.role.toLowerCase().includes(query) ||
        user.status.toLowerCase().includes(query)
      );
    }
    
    return filtered;
  }, [users, userSearchQuery, statusFilter, roleFilter]);

  const handleAddNewUser = () => {
    setIsAddUserDialogOpen(true);
  };

  const handleCreateUser = () => {
    // Validate form
    if (!newUser.name.trim()) {
      toast({
        title: "Name Required",
        description: "Please enter the user's full name.",
        variant: "destructive"
      });
      return;
    }

    if (!newUser.email.trim()) {
      toast({
        title: "Email Required",
        description: "Please enter the user's email address.",
        variant: "destructive"
      });
      return;
    }

    if (!newUser.role) {
      toast({
        title: "Role Required",
        description: "Please select a role for the user.",
        variant: "destructive"
      });
      return;
    }

    // Create new user
    const newUserId = Math.max(...users.map(u => u.id)) + 1;
    const userToAdd = {
      id: newUserId,
      name: newUser.name,
      role: newUser.role,
      status: newUser.status
    };

    setUsers(prev => [...prev, userToAdd]);
    
    toast({
      title: "User Created Successfully",
      description: `${newUser.name} has been added as a ${newUser.role}.`,
    });

    // Reset form and close dialog
    setNewUser({
      name: "",
      email: "",
      role: "",
      status: "Active"
    });
    setIsAddUserDialogOpen(false);
  };

  const handleCancelAddUser = () => {
    setNewUser({
      name: "",
      email: "",
      role: "",
      status: "Active"
    });
    setIsAddUserDialogOpen(false);
  };
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
      <div className="col-span-3 flex flex-col gap-4">
        <Card>
          <CardHeader>
            <CardTitle>User Profile</CardTitle>
            <CardDescription>Manage your personal and business information.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage 
                  src={profileImage || "/placeholder.svg"} 
                  alt="User avatar" 
                />
                <AvatarFallback>AD</AvatarFallback>
              </Avatar>
              <div className="flex flex-col gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <Button variant="outline" onClick={handlePhotoUpload}>
                  Upload Photo
                </Button>
                {profileImage && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => {
                      setProfileImage(null);
                      toast({
                        title: "Photo Removed",
                        description: "Profile photo has been removed.",
                      });
                    }}
                  >
                    Remove Photo
                  </Button>
                )}
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="name">Full Name</Label>
              <Input 
                id="name" 
                value={profile.name}
                onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                value={profile.email}
                onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="organization">Organization</Label>
              <Input 
                id="organization" 
                value={profile.organization}
                onChange={(e) => setProfile(prev => ({ ...prev, organization: e.target.value }))}
              />
            </div>
            <Button onClick={handleSaveProfile}>Save Profile</Button>
          </CardContent>
        </Card>
      </div>
      <Card className="col-span-4">
        <CardHeader>
          <CardTitle>System Settings</CardTitle>
          <CardDescription>Manage users and system configurations (Admin only).</CardDescription>
        </CardHeader>
        <CardContent>
          <h3 className="font-semibold mb-2">User Management</h3>
          
          {/* Search Bar */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search users by name, role, or status..."
              value={userSearchQuery}
              onChange={(e) => setUserSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filter Dropdowns */}
          <div className="flex gap-4 mb-4">
            <div className="flex items-center gap-2">
              <Label htmlFor="status-filter">Status:</Label>
              <Select value={statusFilter} onValueChange={(value: "all" | "active" | "inactive") => setStatusFilter(value)}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users ({users.length})</SelectItem>
                  <SelectItem value="active">Active ({users.filter(u => u.status === "Active").length})</SelectItem>
                  <SelectItem value="inactive">Inactive ({users.filter(u => u.status === "Inactive").length})</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center gap-2">
              <Label htmlFor="role-filter">Role:</Label>
              <Select value={roleFilter} onValueChange={(value: "all" | "Admin" | "Farmer" | "Trader" | "Viewer") => setRoleFilter(value)}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles ({users.length})</SelectItem>
                  <SelectItem value="Admin">Admin ({users.filter(u => u.role === "Admin").length})</SelectItem>
                  <SelectItem value="Farmer">Farmer ({users.filter(u => u.role === "Farmer").length})</SelectItem>
                  <SelectItem value="Trader">Trader ({users.filter(u => u.role === "Trader").length})</SelectItem>
                  <SelectItem value="Viewer">Viewer ({users.filter(u => u.role === "Viewer").length})</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map(user => (
                <TableRow key={user.id}>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>
                    <Badge variant={user.role === "Admin" ? "default" : "secondary"}>
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.status === "Active" ? "success" : "destructive"}>
                      {user.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button 
                      variant="link" 
                      size="sm"
                      onClick={() => handleEditUser(user.id, user.name)}
                    >
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Dialog open={isAddUserDialogOpen} onOpenChange={setIsAddUserDialogOpen}>
            <DialogTrigger asChild>
              <Button className="mt-4" onClick={handleAddNewUser}>
                Add New User
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add New User</DialogTitle>
                <DialogDescription>
                  Create a new user account. Fill in all required information below.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="new-user-name">Full Name</Label>
                  <Input
                    id="new-user-name"
                    placeholder="Enter full name"
                    value={newUser.name}
                    onChange={(e) => setNewUser(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="new-user-email">Email</Label>
                  <Input
                    id="new-user-email"
                    type="email"
                    placeholder="Enter email address"
                    value={newUser.email}
                    onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="new-user-role">Role</Label>
                  <Select value={newUser.role} onValueChange={(value) => setNewUser(prev => ({ ...prev, role: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Admin">Admin</SelectItem>
                      <SelectItem value="Farmer">Farmer</SelectItem>
                      <SelectItem value="Trader">Trader</SelectItem>
                      <SelectItem value="Viewer">Viewer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="new-user-status">Status</Label>
                  <Select value={newUser.status} onValueChange={(value) => setNewUser(prev => ({ ...prev, status: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={handleCancelAddUser}>
                  Cancel
                </Button>
                <Button onClick={handleCreateUser}>
                  Create User
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Edit User Dialog */}
          <Dialog open={isEditUserDialogOpen} onOpenChange={setIsEditUserDialogOpen}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Edit User</DialogTitle>
                <DialogDescription>
                  Update user information. Modify the fields below and save changes.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-user-name">Full Name</Label>
                  <Input
                    id="edit-user-name"
                    placeholder="Enter full name"
                    value={editingUser.name}
                    onChange={(e) => setEditingUser(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-user-email">Email</Label>
                  <Input
                    id="edit-user-email"
                    type="email"
                    placeholder="Enter email address"
                    value={editingUser.email}
                    onChange={(e) => setEditingUser(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-user-role">Role</Label>
                  <Select value={editingUser.role} onValueChange={(value) => setEditingUser(prev => ({ ...prev, role: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Admin">Admin</SelectItem>
                      <SelectItem value="Farmer">Farmer</SelectItem>
                      <SelectItem value="Trader">Trader</SelectItem>
                      <SelectItem value="Viewer">Viewer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-user-status">Status</Label>
                  <Select value={editingUser.status} onValueChange={(value) => setEditingUser(prev => ({ ...prev, status: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={handleCancelEditUser}>
                  Cancel
                </Button>
                <Button onClick={handleUpdateUser}>
                  Update User
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsPage;
