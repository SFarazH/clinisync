"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Edit } from "lucide-react";
import { emptyClinic } from "../data";
import { useMutationWrapper, useQueryWrapper } from "../wrappers";
import {
  addClinicApi,
  getUnallottedUsersListApi,
  updateClinicApi,
} from "@/lib";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { useQueryClient } from "@tanstack/react-query";

export default function ClinicModal({ isOpen, clinic, onClose }) {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(emptyClinic);

  const isNew = !clinic;
  const canEdit = isNew || isEditing;
  const existingAdmin = clinic?.admin;
  const hasAdmin = !!existingAdmin;

  const { data: unallottedUsers = [], isLoading: loadingUsers } =
    useQueryWrapper({
      queryKey: ["users"],
      queryFn: getUnallottedUsersListApi,
    });

  const addClinicMutation = useMutationWrapper({
    mutationFn: addClinicApi,
    onSuccess: () => {
      queryClient.invalidateQueries(["clinics"]);
      onClose();
    },
  });

  const updateClinicMutation = useMutationWrapper({
    mutationFn: updateClinicApi,
    onSuccess: () => {
      queryClient.invalidateQueries(["appointments"]);
      onClose();
    },
  });

  useEffect(() => {
    if (clinic) {
      setFormData(clinic);
    } else {
      setFormData(emptyClinic);
    }
  }, [clinic, isOpen]);

  const handleFieldChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleFeatureToggle = (feature) => {
    setFormData((prev) => ({
      ...prev,
      features: {
        ...prev.features,
        [feature]: !prev.features[feature],
      },
    }));
  };

  const handleSave = async () => {
    try {
      if (isNew) {
        addClinicMutation.mutate({
          clinicData: formData,
        });
      } else {
        updateClinicMutation.mutateAsync({
          clinicData: { ...formData, admin: formData.admin._id },
          id: clinic._id,
        });
      }
      setIsEditing(false);
    } finally {
      //to handle saving
    }
  };

  const handleClose = () => {
    if (isEditing && clinic) {
      setFormData(clinic);
      setIsEditing(false);
    } else {
      onClose();
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          setIsEditing(false);
          onClose();
        }
      }}
    >
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-3">
          <DialogTitle className="text-lg">
            {formData.clinicName || "Add New Clinic"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-medium">Basic Information</h3>
              {!canEdit && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 px-2 text-xs"
                  onClick={() => setIsEditing(true)}
                >
                  <Edit className="w-3 h-3 mr-1" />
                  Edit
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-gray-600 mb-1">Name</Label>
                <Input
                  className="h-8 text-sm focus-visible:ring-0"
                  placeholder="Clinic name"
                  value={formData.name}
                  onChange={(e) => handleFieldChange("name", e.target.value)}
                  disabled={!canEdit}
                />
              </div>
              <div>
                <Label className="text-xs text-gray-600 mb-1">
                  Clinic Display Name
                </Label>
                <Input
                  className="h-8 text-sm focus-visible:ring-0"
                  placeholder="Display name"
                  value={formData.clinicName}
                  onChange={(e) =>
                    handleFieldChange("clinicName", e.target.value)
                  }
                  disabled={!canEdit}
                />
              </div>
              <div>
                <Label className="text-xs text-gray-600 mb-1">
                  Database Name
                </Label>
                <Input
                  className="h-8 text-sm focus-visible:ring-0"
                  placeholder="Database name"
                  value={formData.databaseName}
                  onChange={(e) =>
                    handleFieldChange("databaseName", e.target.value)
                  }
                  disabled={!isNew}
                />
              </div>
              {/* <div>
                <Label className="text-xs text-gray-600 mb-1">Plan</Label>
                <select
                  className="h-8 text-sm border border-input rounded px-3 w-full focus-visible:ring-0 disabled:opacity-50"
                  value={formData.plan}
                  onChange={(e) => handleFieldChange("plan", e.target.value)}
                  disabled={!canEdit}
                >
                  <option value="basic">Basic</option>
                  <option value="pro">Pro</option>
                </select>
              </div> */}
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="text-base font-medium">Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-gray-600 mb-1">Phone</Label>
                <Input
                  className="h-8 text-sm focus-visible:ring-0"
                  placeholder="10 digit number"
                  value={formData.phone}
                  onChange={(e) => handleFieldChange("phone", e.target.value)}
                  disabled={!canEdit}
                  maxLength={10}
                />
                <p className="text-[12px] text-red-500">
                  Required for Whatsapp reminders
                </p>
              </div>
              <div>
                <Label className="text-xs text-gray-600 mb-1">Email</Label>
                <Input
                  className="h-8 text-sm focus-visible:ring-0"
                  type="email"
                  placeholder="Email address"
                  value={formData.email}
                  onChange={(e) => handleFieldChange("email", e.target.value)}
                  disabled={!canEdit}
                />
              </div>
              {!isNew && (
                <div>
                  <Label className="text-xs text-gray-600 mb-1">Admin</Label>
                  <Select
                    value={hasAdmin ? existingAdmin._id : formData.admin}
                    onValueChange={(value) => handleFieldChange("admin", value)}
                    disabled={!canEdit || hasAdmin}
                  >
                    <SelectTrigger className="w-full !h-8">
                      <SelectValue
                        placeholder={
                          hasAdmin ? existingAdmin.name : "Select Admin"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {hasAdmin ? (
                        <SelectItem value={existingAdmin._id}>
                          {existingAdmin.name}
                        </SelectItem>
                      ) : loadingUsers ? (
                        <SelectItem disabled value="loading">
                          Loading...
                        </SelectItem>
                      ) : unallottedUsers.length > 0 ? (
                        unallottedUsers.map((user) => (
                          <SelectItem key={user._id} value={user._id}>
                            {user.name}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem disabled value="none">
                          No user found!
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </div>

          {/* Address Information */}
          <div className="space-y-4">
            <h3 className="text-base font-medium">Address</h3>
            <div>
              <Label className="text-xs text-gray-600 mb-1">
                Address Line 1
              </Label>
              <Input
                className="h-8 text-sm focus-visible:ring-0"
                placeholder="Address line 1"
                value={formData.addressLine1}
                onChange={(e) =>
                  handleFieldChange("addressLine1", e.target.value)
                }
                disabled={!canEdit}
              />
            </div>
            <div>
              <Label className="text-xs text-gray-600 mb-1">
                Address Line 2
              </Label>
              <Input
                className="h-8 text-sm focus-visible:ring-0"
                placeholder="Address line 2"
                value={formData.addressLine2}
                onChange={(e) =>
                  handleFieldChange("addressLine2", e.target.value)
                }
                disabled={!canEdit}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-gray-600 mb-1">City</Label>
                <Input
                  className="h-8 text-sm focus-visible:ring-0"
                  placeholder="City"
                  value={formData.city}
                  onChange={(e) => handleFieldChange("city", e.target.value)}
                  disabled={!canEdit}
                />
              </div>
              <div>
                <Label className="text-xs text-gray-600 mb-1">State</Label>
                <Input
                  className="h-8 text-sm focus-visible:ring-0"
                  placeholder="State"
                  value={formData.state}
                  onChange={(e) => handleFieldChange("state", e.target.value)}
                  disabled={!canEdit}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-gray-600 mb-1">
                  Postal Code
                </Label>
                <Input
                  className="h-8 text-sm focus-visible:ring-0"
                  placeholder="Postal code"
                  value={formData.postalCode}
                  onChange={(e) =>
                    handleFieldChange("postalCode", e.target.value)
                  }
                  disabled={!canEdit}
                />
              </div>
              <div>
                <Label className="text-xs text-gray-600 mb-1">Country</Label>
                <Input
                  className="h-8 text-sm focus-visible:ring-0"
                  placeholder="Country"
                  value={formData.country}
                  onChange={(e) => handleFieldChange("country", e.target.value)}
                  disabled={!canEdit}
                />
              </div>
            </div>
            <div>
              <Label className="text-xs text-gray-600 mb-1">
                Google Maps Link
              </Label>
              <Input
                className="h-8 text-sm focus-visible:ring-0"
                placeholder="https://maps.google.com/..."
                value={formData.googleMapsLink}
                onChange={(e) =>
                  handleFieldChange("googleMapsLink", e.target.value)
                }
                disabled={!canEdit}
              />
              <p className="text-[12px] text-red-500">
                Required for Whatsapp reminders (with address)
              </p>
            </div>
          </div>

          {/* Features */}
          <div className="space-y-4">
            <h3 className="text-base font-medium">Features</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(formData.features).map(([feature, enabled]) => (
                <label
                  key={feature}
                  className="flex items-center gap-3 p-2 rounded hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={enabled}
                    onChange={() => handleFeatureToggle(feature)}
                    disabled={!canEdit}
                    className="w-4 h-4 rounded border-gray-300 cursor-pointer"
                  />
                  <span className="text-sm capitalize">
                    {feature.replace("-", " ")}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Status */}
          {/* <div className="space-y-4">
            <h3 className="text-base font-medium">Status</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="flex items-center gap-3 p-2 rounded hover:bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isClinicActive}
                  onChange={(e) =>
                    handleFieldChange("isClinicActive", e.target.checked)
                  }
                  disabled={!canEdit}
                  className="w-4 h-4 rounded border-gray-300 cursor-pointer"
                />
                <span className="text-sm">Clinic Active</span>
              </label>
              <label className="flex items-center gap-3 p-2 rounded hover:bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isTrialActive}
                  onChange={(e) =>
                    handleFieldChange("isTrialActive", e.target.checked)
                  }
                  disabled={!canEdit}
                  className="w-4 h-4 rounded border-gray-300 cursor-pointer"
                />
                <span className="text-sm">Trial Active</span>
              </label>
            </div>
          </div> */}
        </div>

        <DialogFooter className="flex justify-between pt-4 gap-2">
          <Button variant="outline" size="sm" onClick={handleClose}>
            {isEditing ? "Cancel" : "Close"}
          </Button>

          {(isEditing || isNew) && (
            <Button
              size="sm"
              onClick={handleSave}
              // disabled={isSaving}
            >
              {isEditing ? "Update" : "Save"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
