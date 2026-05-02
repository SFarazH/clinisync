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
import { AlertTriangle, Edit } from "lucide-react";
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
import { Switch } from "../ui/switch";
import { Alert, AlertDescription } from "../ui/alert";

export default function ClinicModal({ isOpen, clinic, onClose }) {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(emptyClinic);
  const [errors, setErrors] = useState({});

  const isNew = !clinic;
  const canEdit = isNew || isEditing;
  const existingAdmin = clinic?.admin;
  const hasAdmin = !!existingAdmin;

  const { data: unallottedUsersObject = {}, isLoading: loadingUsers } =
    useQueryWrapper({
      queryKey: ["users"],
      queryFn: getUnallottedUsersListApi,
    });
  const unallottedUsers = unallottedUsersObject?.data ?? [];

  const validateForm = () => {
    const nextErrors = {};

    const requiredFields = [
      { field: "clinicName", label: "Clinic name" },
      { field: "databaseName", label: "Database name" },
      { field: "phone", label: "Phone" },
      { field: "addressLine1", label: "Address line 1" },
      { field: "city", label: "City" },
      { field: "state", label: "State" },
    ];

    requiredFields.forEach(({ field, label }) => {
      if (!formData[field] || String(formData[field]).trim() === "") {
        nextErrors[field] = `${label} is required`;
      }
    });

    if (formData.phone && !/^[0-9]{10}$/.test(formData.phone.trim())) {
      nextErrors.phone = "Phone must be a 10 digit number";
    }

    if (
      formData.googleMapsLink &&
      !/^https?:\/\/(www\.)?google\.[a-z.]+\/maps\/.+/.test(
        formData.googleMapsLink,
      )
    ) {
      nextErrors.googleMapsLink = "Enter a valid Google Maps URL";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

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
    if (!validateForm()) {
      return;
    }

    try {
      setErrors({});

      if (isNew) {
        addClinicMutation.mutate({
          clinicData: formData,
        });
      } else {
        updateClinicMutation.mutateAsync({
          clinicData: {
            ...formData,
            admin: formData.admin?._id || formData.admin,
          },
          id: clinic._id,
        });
      }
      setIsEditing(false);
    } catch (err) {
      console.error(err);
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
                <Label className="text-xs text-gray-600 mb-1">
                  Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  className="h-8 text-sm focus-visible:ring-0"
                  placeholder="Clinic name"
                  value={formData.name}
                  onChange={(e) => handleFieldChange("name", e.target.value)}
                  disabled={!canEdit}
                />
                {errors.name && (
                  <p className="text-[12px] text-red-500 mt-1">{errors.name}</p>
                )}
              </div>
              <div>
                <Label className="text-xs text-gray-600 mb-1">
                  Clinic Display Name <span className="text-red-500">*</span>
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
                {errors.clinicName && (
                  <p className="text-[12px] text-red-500 mt-1">
                    {errors.clinicName}
                  </p>
                )}
              </div>
              <div>
                <Label className="text-xs text-gray-600 mb-1">
                  Database Name <span className="text-red-500">*</span>
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
                {errors.databaseName && (
                  <p className="text-[12px] text-red-500 mt-1">
                    {errors.databaseName}
                  </p>
                )}
              </div>
              <div>
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
              </div>
            </div>
            <div className="">
              <h3 className="text-base font-medium">Status</h3>
              <div className="flex items-center gap-3 rounded p-2">
                <Switch
                  className="h-6 w-13 disabled:bg-red-400 disabled:opacity-100 data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-red-500 [&>span]:h-5 [&>span]:w-5 [&>span]:bg-white [&>span]:transition-transform data-[state=checked]:[&>span]:translate-x-7 data-[state=unchecked]:[&>span]:translate-x-0.5"
                  checked={formData.isLiveClinic || false}
                  onCheckedChange={(checked) =>
                    handleFieldChange("isLiveClinic", checked)
                  }
                  disabled={!canEdit}
                />
                <Label className="cursor-pointer text-sm">Live Clinic</Label>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="text-base font-medium">Contact Information</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <Label className="mb-1 text-xs text-gray-600">
                  <p>
                    Phone <span className="text-red-500">*</span>{" "}
                  </p>

                  <Alert
                    variant="warning"
                    className="my-1 w-fit p-1 font-normal text-orange-500"
                  >
                    <AlertTriangle className="" />
                    <AlertDescription className="text-xs text-orange-800">
                      Required for Whatsapp reminders
                    </AlertDescription>
                  </Alert>
                </Label>
                <Input
                  className="h-8 text-sm focus-visible:ring-0"
                  placeholder="10 digit number"
                  value={formData.phone}
                  onChange={(e) => handleFieldChange("phone", e.target.value)}
                  disabled={!canEdit}
                  maxLength={10}
                />
                {errors.phone && (
                  <p className="mt-1 text-[12px] text-red-500">
                    {errors.phone}
                  </p>
                )}
              </div>
              <div>
                <Label className="mb-1 text-xs text-gray-600">Email</Label>
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
                  <Label className="mb-1 text-xs text-gray-600">Admin</Label>
                  <Select
                    value={hasAdmin ? existingAdmin._id : formData.admin}
                    onValueChange={(value) => handleFieldChange("admin", value)}
                    disabled={!canEdit || hasAdmin}
                  >
                    <SelectTrigger className="!h-8 w-full">
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
              <Label className="mb-1 text-xs text-gray-600">
                Address Line 1 <span className="text-red-500">*</span>
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
              {errors.addressLine1 && (
                <p className="mt-1 text-[12px] text-red-500">
                  {errors.addressLine1}
                </p>
              )}
            </div>
            <div>
              <Label className="mb-1 text-xs text-gray-600">
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
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <Label className="mb-1 text-xs text-gray-600">
                  City <span className="text-red-500">*</span>
                </Label>
                <Input
                  className="h-8 text-sm focus-visible:ring-0"
                  placeholder="City"
                  value={formData.city}
                  onChange={(e) => handleFieldChange("city", e.target.value)}
                  disabled={!canEdit}
                />
                {errors.city && (
                  <p className="mt-1 text-[12px] text-red-500">{errors.city}</p>
                )}
              </div>
              <div>
                <Label className="mb-1 text-xs text-gray-600">
                  State <span className="text-red-500">*</span>
                </Label>
                <Input
                  className="h-8 text-sm focus-visible:ring-0"
                  placeholder="State"
                  value={formData.state}
                  onChange={(e) => handleFieldChange("state", e.target.value)}
                  disabled={!canEdit}
                />
                {errors.state && (
                  <p className="mt-1 text-[12px] text-red-500">
                    {errors.state}
                  </p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <Label className="mb-1 text-xs text-gray-600">
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
                <Label className="mb-1 text-xs text-gray-600">Country</Label>
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
              <Label className="mb-1 text-xs text-gray-600">
                Google Maps Link
                <Alert
                  variant="warning"
                  className="my-1 w-fit p-1 font-normal text-orange-500"
                >
                  <AlertTriangle className="" />
                  <AlertDescription className="text-xs text-orange-800">
                    Required for Whatsapp reminders with link
                  </AlertDescription>
                </Alert>
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
              {errors.googleMapsLink && (
                <p className="mt-1 text-[12px] text-red-500">
                  {errors.googleMapsLink}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="flex items-center gap-2 text-base font-medium">
              Latitude / Longitude{" "}
              <Alert
                variant="warning"
                className="my-1 w-fit p-1 font-normal text-orange-500"
              >
                <AlertTriangle className="" />
                <AlertDescription className="text-xs text-orange-800">
                  Required for Whatsapp reminders with address
                </AlertDescription>
              </Alert>
            </h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <Label className="mb-1 text-xs text-gray-600">Latitude</Label>
                <Input
                  className="h-8 text-sm focus-visible:ring-0"
                  placeholder="Latitude"
                  value={formData.latitude}
                  onChange={(e) =>
                    handleFieldChange("latitude", e.target.value)
                  }
                  disabled={!canEdit}
                />
              </div>
              <div>
                <Label className="mb-1 text-xs text-gray-600">Longitude</Label>
                <Input
                  className="h-8 text-sm focus-visible:ring-0"
                  placeholder="Longitude"
                  value={formData.longitude}
                  onChange={(e) =>
                    handleFieldChange("longitude", e.target.value)
                  }
                  disabled={!canEdit}
                />
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="space-y-4">
            <h3 className="text-base font-medium">Features</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {Object.entries(formData.features).map(([feature, enabled]) => (
                <label
                  key={feature}
                  className="flex cursor-pointer items-center gap-3 rounded p-2 hover:bg-gray-50"
                >
                  <input
                    type="checkbox"
                    checked={enabled}
                    onChange={() => handleFeatureToggle(feature)}
                    disabled={!canEdit}
                    className="h-4 w-4 cursor-pointer rounded border-gray-300"
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

        <DialogFooter className="flex justify-between gap-2 pt-4">
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
