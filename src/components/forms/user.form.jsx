"use client";
import React, { useEffect, useState, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { emptyUser } from "../data";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchDoctors, register, updateUserFunc } from "@/lib";
import Loader from "../loader";
import { Loader2, TriangleAlert } from "lucide-react";

export default function UserForm({ isOpen, onClose, user = null }) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState(user || emptyUser);
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  const isEditing = Boolean(user);

  useEffect(() => {
    setFormData(user || emptyUser);
    if (user?.doctorId) {
      setSelectedDoctor(user.doctorId);
    } else {
      setSelectedDoctor(null);
    }
  }, [user]);

  // Optimized close handler using useCallback
  const handleCloseModal = useCallback(() => {
    setFormData(emptyUser);
    setSelectedDoctor(null);
    onClose();
  }, [onClose]);

  const { data: doctorsData = [], isLoading: loadingDoctors } = useQuery({
    queryKey: ["doctors"],
    queryFn: () => fetchDoctors(true),
  });

  const registerMutation = useMutation({
    mutationFn: register,
    onSuccess: () => {
      handleCloseModal();
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: updateUserFunc,
    onSuccess: () => {
      handleCloseModal();
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });

  const onSubmit = async (e) => {
    e.preventDefault();
    let userData = { ...formData };

    if (formData.role === "doctor") {
      userData = {
        email: formData.email,
        doctorId: formData.doctorId,
        address: formData.address,
        role: formData.role,
      };
    }

    if (isEditing) {
      await updateUserMutation.mutateAsync({
        id: formData._id,
        userData,
      });
    } else {
      await registerMutation.mutateAsync(userData);
    }
  };

  useEffect(() => {
    if (selectedDoctor) {
      setFormData((prev) => ({
        ...prev,
        name: selectedDoctor.name,
        email: selectedDoctor.email,
        phoneNumber: selectedDoctor.phoneNumber ?? "",
        dob: selectedDoctor.dob ?? "",
        gender: selectedDoctor.gender ?? "",
      }));
    } else {
      setFormData(emptyUser);
    }
  }, [selectedDoctor]);

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          handleCloseModal();
        }
      }}
    >
      <DialogContent
        className="md:max-w-full sm:w-1/2"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit User" : "Add New User"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the user's information below."
              : "Enter the user's information below."}
            {formData.role === "doctor" && (
              <div className="mt-2 justify-center flex items-center gap-2 rounded-lg border border-red-300 bg-red-50 p-2 text-sm text-red-700 shadow-sm">
                <TriangleAlert className="h-4 w-4 flex-shrink-0 text-red-600" />
                <span>
                  To update disabled fields, please visit the <b>Doctor</b>{" "}
                  section.
                </span>
              </div>
            )}{" "}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit}>
          <div className="flex gap-2">
            <div className="grid gap-2 w-full">
              <Label htmlFor="role">Role</Label>
              <Select
                disabled={isEditing}
                value={formData?.role || ""}
                onValueChange={(value) => {
                  setFormData({
                    ...formData,
                    role: value,
                    doctorId: value === "doctor" ? formData.doctorId : null,
                  });
                  setSelectedDoctor(null);
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="receptionist">Receptionist</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="doctor">Doctor</SelectItem>
                  <SelectItem value="pharmacist">Pharmacist</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {!isEditing && formData.role === "doctor" && (
              <div className="grid gap-2 w-full">
                <Label htmlFor="doctorId">Doctor</Label>
                <Select
                  disabled={isEditing}
                  value={formData?.doctorId || ""}
                  onValueChange={(value) => {
                    setFormData({ ...formData, doctorId: value });
                    setSelectedDoctor(
                      doctorsData.find((doc) => doc._id === value)
                    );
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a doctor" />
                  </SelectTrigger>
                  <SelectContent>
                    {loadingDoctors ? (
                      <SelectItem key="disabled" disabled>
                        <div className="flex items-center space-x-2">
                          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                          <span>Loading doctors...</span>
                        </div>
                      </SelectItem>
                    ) : (
                      doctorsData.map((doctor) => (
                        <SelectItem key={doctor._id} value={doctor._id}>
                          <div className="flex items-center gap-2">
                            {doctor.name}
                          </div>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div className="grid gap-4 py-4">
            <div className="flex gap-2">
              {[
                { id: "name", label: "Name", type: "text" },
                { id: "email", label: "Email", type: "email" },
              ].map(({ id, label, type }) => (
                <div
                  key={id}
                  className={`${
                    selectedDoctor ? "cursor-not-allowed" : ""
                  } grid gap-2 w-full`}
                >
                  <Label htmlFor={id}>{label}</Label>
                  <Input
                    className={selectedDoctor && "bg-gray-200"}
                    disabled={selectedDoctor}
                    id={id}
                    type={type}
                    value={
                      selectedDoctor ? selectedDoctor[id] : formData?.[id] || ""
                    }
                    onChange={(e) =>
                      setFormData({ ...formData, [id]: e.target.value })
                    }
                    required={id !== "password" || !isEditing}
                  />
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <div
                className={`${
                  selectedDoctor ? "cursor-not-allowed" : ""
                } grid gap-2 w-full`}
              >
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input
                  className={selectedDoctor && "bg-gray-200"}
                  id="phoneNumber"
                  type="text"
                  disabled={selectedDoctor}
                  value={formData?.phoneNumber || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, phoneNumber: e.target.value })
                  }
                />
              </div>

              <div
                className={`${
                  selectedDoctor ? "cursor-not-allowed" : ""
                } grid gap-2 w-full`}
              >
                <Label htmlFor="dob">Date of Birth</Label>
                <Input
                  className={selectedDoctor && "bg-gray-200"}
                  id="dob"
                  type="date"
                  disabled={selectedDoctor}
                  value={
                    formData?.dob
                      ? new Date(formData?.dob).toISOString().split("T")[0]
                      : ""
                  }
                  onChange={(e) =>
                    setFormData({ ...formData, dob: e.target.value })
                  }
                />
              </div>

              <div className="grid gap-2 w-full">
                <Label htmlFor="gender">Gender</Label>
                <Select
                  value={formData?.gender || ""}
                  disabled={selectedDoctor}
                  onValueChange={(value) =>
                    setFormData({ ...formData, gender: value })
                  }
                >
                  <SelectTrigger
                    className={`${selectedDoctor && "bg-gray-200"} w-full`}
                  >
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                type="text"
                value={formData?.address || ""}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button type="submit">{isEditing ? "Update" : "Add"} User</Button>
          </DialogFooter>
        </form>
      </DialogContent>
      {(registerMutation.isPending || updateUserMutation.isPending) && (
        <Loader />
      )}
    </Dialog>
  );
}
