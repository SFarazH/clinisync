import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";

import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Delete, Edit, Plus, Trash2 } from "lucide-react";
import { getUsers, getUsersByRole } from "@/lib";
import { useState, useMemo, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import Loader from "./loader";
import UserForm from "./forms/user.form";
import { getRoleIcon, getRoleStyle } from "@/utils/helper";

export default function UserManagement() {
  const [role, setRole] = useState(null);
  const [search, setSearch] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const { data: usersData = [], isLoading: loadingUsers } = useQuery({
    queryKey: ["users", role],
    queryFn: () => getUsers(role),
  });

  const { data: usersCount = [], isLoading: loadingCount } = useQuery({
    queryKey: ["usersCount"],
    queryFn: getUsersByRole,
  });

  const roleCount = useMemo(() => {
    if (!usersCount?.data) return {};
    return usersCount.data.reduce((acc, curr) => {
      acc[curr._id] = curr.count;
      return acc;
    }, {});
  }, [usersCount]);

  const filteredUsers = useMemo(() => {
    if (!usersData?.data) return [];
    const searchLower = search.toLowerCase();

    return usersData.data.filter((user) => {
      const matchesName = user.name?.toLowerCase().includes(searchLower);
      const matchesEmail = user.email?.toLowerCase().includes(searchLower);

      const matchesDoctor =
        user.doctorId &&
        (user.doctorId.name?.toLowerCase().includes(searchLower) ||
          user.doctorId.email?.toLowerCase().includes(searchLower));

      return matchesName || matchesEmail || matchesDoctor;
    });
  }, [usersData, search]);

  // Optimized handlers using useCallback
  const handleOpenAddForm = useCallback(() => {
    setSelectedUser(null);
    setIsFormOpen(true);
  }, []);

  const handleOpenEditForm = useCallback((user) => {
    setSelectedUser(user);
    setIsFormOpen(true);
  }, []);

  const handleCloseForm = useCallback(() => {
    setIsFormOpen(false);
    setSelectedUser(null);
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Users Management</h1>
          <p className="text-muted-foreground">
            Add and manage doctor and staff information
          </p>
        </div>
        <Button onClick={handleOpenAddForm}>
          <Plus className="w-4 h-4 mr-2" />
          Add User
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card className="bg-sky-100">
          <CardHeader className="flex items-center">
            <CardTitle className="text-md flex items-center justify-between font-medium w-full">
              <p className="flex items-center gap-1.5">
                {getRoleIcon("admin")}
                Admins
              </p>
              <p className="text-xl">{roleCount?.admin ?? 0}</p>
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="bg-orange-100">
          <CardHeader className="flex items-center">
            <CardTitle className="text-md flex items-center justify-between font-medium w-full">
              <p className="flex items-center gap-1.5">
                {getRoleIcon("doctor")} Doctors
              </p>
              <p className="text-xl">{roleCount?.doctor ?? 0}</p>
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="bg-green-100">
          <CardHeader className="flex items-center">
            <CardTitle className="text-md flex items-center justify-between font-medium w-full">
              <p className="flex items-center gap-1.5">
                {getRoleIcon("pharmacist")}
                Pharmacists
              </p>
              <p className="text-xl">{roleCount?.pharmacist ?? 0}</p>
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="bg-red-100">
          <CardHeader className="flex items-center">
            <CardTitle className="text-md flex items-center justify-between font-medium w-full">
              <p className="flex items-center gap-1.5">
                {getRoleIcon("receptionist")} Receptionists
              </p>
              <p className="text-xl">{roleCount?.receptionist ?? 0}</p>
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* User List Section */}
      <Card className="shadow-md border rounded-2xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">All Users</CardTitle>
            <Input
              placeholder="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="w-3/12">Name</TableHead>
                <TableHead className="w-3/12">Email</TableHead>
                <TableHead className="w-2/12">Contact</TableHead>
                <TableHead className="w-2/12">Role</TableHead>
                <TableHead className="w-1/12"></TableHead>
                <TableHead className="w-1/12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => {
                  const isDoctor = user.role === "doctor";
                  const doctor = user.doctorId; // populated doctor object

                  return (
                    <TableRow
                      key={user._id}
                      className="hover:bg-muted/50 transition"
                    >
                      <TableCell className="font-medium">
                        {isDoctor ? doctor?.name : user.name}
                      </TableCell>
                      <TableCell>
                        {isDoctor ? doctor?.email : user.email}
                      </TableCell>
                      <TableCell>
                        {isDoctor ? doctor?.phoneNumber : user.phoneNumber}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full w-10/12 justify-evenly ${getRoleStyle(
                            user.role
                          )}`}
                        >
                          {getRoleIcon(user.role)}
                          {user.role.charAt(0).toUpperCase() +
                            user.role.slice(1)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Button
                          className="cursor-pointer"
                          variant="outline"
                          size="icon"
                          onClick={() => handleOpenEditForm(user)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      </TableCell>
                      <TableCell>
                        <Button
                          className="cursor-pointer"
                          variant="destructive"
                          size="icon"
                          // onClick={() => handleDeleteUser(user._id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6">
                    No users found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <UserForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        user={selectedUser}
      />

      {loadingUsers && <Loader />}
    </div>
  );
}
