import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const SettingsPage = () => {
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
                <AvatarImage src="/placeholder.svg" alt="User avatar" />
                <AvatarFallback>AD</AvatarFallback>
              </Avatar>
              <Button variant="outline">Upload Photo</Button>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" defaultValue="Admin User" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" defaultValue="admin@oniotech.com" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="organization">Organization</Label>
              <Input id="organization" defaultValue="OnioTech Inc." />
            </div>
            <Button>Save Profile</Button>
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
              <TableRow>
                <TableCell>Admin User</TableCell>
                <TableCell><Badge>Admin</Badge></TableCell>
                <TableCell><Badge variant="success">Active</Badge></TableCell>
                <TableCell><Button variant="link" size="sm">Edit</Button></TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Farmer John</TableCell>
                <TableCell><Badge variant="secondary">Farmer</Badge></TableCell>
                <TableCell><Badge variant="success">Active</Badge></TableCell>
                <TableCell><Button variant="link" size="sm">Edit</Button></TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Trader Jane</TableCell>
                <TableCell><Badge variant="secondary">Trader</Badge></TableCell>
                <TableCell><Badge variant="destructive">Inactive</Badge></TableCell>
                <TableCell><Button variant="link" size="sm">Edit</Button></TableCell>
              </TableRow>
            </TableBody>
          </Table>
          <Button className="mt-4">Add New User</Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsPage;
