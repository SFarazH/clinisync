"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import ClinicDayConfiguration from "./forms/clinic-day-configuration.form";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { daysOfWeek } from "./data";
import Loader from "./loader";
import { useMutationWrapper, useQueryWrapper } from "./wrappers";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  getClinicById,
  getClinicConfig,
  getClinicsApi,
  updateClinicApi,
  updateClinicConfig,
} from "@/lib";
import { useAuth } from "./context/authcontext";
import {
  ChevronDown,
  Clock,
  Settings2,
  MessageSquare,
  AlertTriangle,
} from "lucide-react";
import Image from "next/image";
import { Alert, AlertDescription } from "./ui/alert";

export default function ClinicSettings() {
  const queryClient = useQueryClient();
  const [selectedDay, setSelectedDay] = useState("monday");
  const [clinicHours, setClinicHours] = useState({});
  const [isTimingsOpen, setIsTimingsOpen] = useState(false);
  const [isClinicOpen, setIsClinicOpen] = useState(false);
  const [originalClinicHours, setOriginalClinicHours] = useState({});
  const [isEditingTimings, setIsEditingTimings] = useState(false);
  const [isEditingClinic, setIsEditingClinic] = useState(false);
  const [clinicData, setClinicData] = useState({});
  const [originalClinicData, setOriginalClinicData] = useState({});
  const [errors, setErrors] = useState({});
  const [isTemplatesOpen, setIsTemplatesOpen] = useState(false);
  const [activeTemplate, setActiveTemplate] = useState(
    "clinisync_appointment_location",
  );

  const validateForm = () => {
    const nextErrors = {};

    const requiredFields = [
      { field: "name", label: "Clinic name" },
      { field: "clinicName", label: "Clinic display name" },
      { field: "databaseName", label: "Database name" },
      { field: "phone", label: "Phone" },
      { field: "addressLine1", label: "Address line 1" },
      { field: "city", label: "City" },
      { field: "state", label: "State" },
    ];

    requiredFields.forEach(({ field, label }) => {
      if (!clinicData[field] || String(clinicData[field]).trim() === "") {
        nextErrors[field] = `${label} is required`;
      }
    });

    if (clinicData.phone && !/^[0-9]{10}$/.test(clinicData.phone.trim())) {
      nextErrors.phone = "Phone must be a 10 digit number";
    }

    if (
      clinicData.googleMapsLink &&
      !/^https?:\/\/(www\.)?(google\.[a-z.]+\/maps\/.+|maps\.app\.goo\.gl\/.+)/.test(
        clinicData.googleMapsLink.trim(),
      )
    ) {
      nextErrors.googleMapsLink = "Enter a valid Google Maps URL";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const { authClinic } = useAuth();

  const { data: clinicSettingsObject = {}, isLoading: loadingSettings } =
    useQueryWrapper({
      queryKey: ["clinicSettings"],
      queryFn: getClinicConfig,
    });

  const { data: clinicObject = {}, isLoading: loadingClinic } = useQueryWrapper(
    {
      queryKey: ["clinic"],
      queryFn: getClinicById,
      params: { id: authClinic?._id },
    },
  );

  const clinicSettings = clinicSettingsObject?.data;
  const clinic = clinicObject?.data;

  const updateClinicConfigMutation = useMutationWrapper({
    mutationFn: updateClinicConfig,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clinicSettings"] });
      setIsEditingTimings(false);
    },
  });

  const updateClinicMutation = useMutationWrapper({
    mutationFn: updateClinicApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clinic"] });
      setIsEditingClinic(false);
    },
  });

  useEffect(() => {
    if (clinicSettings?.openingHours) {
      setClinicHours(clinicSettings.openingHours);
    }
  }, [clinicSettings]);

  useEffect(() => {
    if (clinic) {
      setClinicData(clinic);
      // const {
      //   name,
      //   clinicName,
      //   phone,
      //   email,
      //   addressLine1,
      //   addressLine2,
      //   city,
      //   state,
      //   postalCode,
      //   country,
      // } = clinic;
      // setClinicData({
      //   name,
      //   clinicName,
      //   phone,
      //   email,
      //   addressLine1,
      //   addressLine2,
      //   city,
      //   state,
      //   postalCode,
      //   country,
      // });
    }
  }, [clinic]);

  useEffect(() => {
    if (isEditingTimings && Object.keys(clinicHours).length > 0) {
      setOriginalClinicHours({ ...clinicHours });
    }
  }, [isEditingTimings, clinicHours]);

  useEffect(() => {
    if (isEditingClinic && Object.keys(clinicData).length > 0) {
      setOriginalClinicData({ ...clinicData });
    }
  }, [isEditingClinic, clinicData]);

  const updateDayField = useCallback((day, field, value) => {
    setClinicHours((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value,
      },
    }));
  }, []);

  const updateDayOpen = useCallback(
    (day, isOpen) => {
      updateDayField(day, "isOpen", isOpen);
    },
    [updateDayField],
  );

  const addShift = useCallback((day) => {
    const newShift = { start: "09:00", end: "17:00" };
    setClinicHours((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        shifts: [...(prev[day]?.shifts || []), newShift],
      },
    }));
  }, []);

  const updateShift = useCallback((day, shiftIndex, field, value) => {
    setClinicHours((prev) => {
      const currentDayConfig = prev[day];
      if (!currentDayConfig?.shifts) return prev;

      const updatedShifts = [...currentDayConfig.shifts];
      updatedShifts[shiftIndex] = {
        ...updatedShifts[shiftIndex],
        [field]: value,
      };

      return {
        ...prev,
        [day]: {
          ...currentDayConfig,
          shifts: updatedShifts,
        },
      };
    });
  }, []);

  const removeShift = useCallback((day, shiftIndex) => {
    setClinicHours((prev) => {
      const currentDayConfig = prev[day];
      if (!currentDayConfig?.shifts) return prev;

      const updatedShifts = currentDayConfig.shifts.filter(
        (_, index) => index !== shiftIndex,
      );

      return {
        ...prev,
        [day]: {
          ...currentDayConfig,
          shifts: updatedShifts,
        },
      };
    });
  }, []);

  const addBreak = useCallback((day) => {
    const newBreak = { start: "12:00", end: "13:00" };
    setClinicHours((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        breaks: [...(prev[day]?.breaks || []), newBreak],
      },
    }));
  }, []);

  const updateBreak = useCallback((day, breakIndex, field, value) => {
    setClinicHours((prev) => {
      const currentDayConfig = prev[day];
      if (!currentDayConfig?.breaks) return prev;

      const updatedBreaks = [...currentDayConfig.breaks];
      updatedBreaks[breakIndex] = {
        ...updatedBreaks[breakIndex],
        [field]: value,
      };

      return {
        ...prev,
        [day]: {
          ...currentDayConfig,
          breaks: updatedBreaks,
        },
      };
    });
  }, []);

  const removeBreak = useCallback((day, breakIndex) => {
    setClinicHours((prev) => {
      const currentDayConfig = prev[day];
      if (!currentDayConfig?.breaks) return prev;

      const updatedBreaks = currentDayConfig.breaks.filter(
        (_, index) => index !== breakIndex,
      );

      return {
        ...prev,
        [day]: {
          ...currentDayConfig,
          breaks: updatedBreaks,
        },
      };
    });
  }, []);

  const handleSaveTimings = useCallback(async () => {
    try {
      await updateClinicConfigMutation.mutateAsync({
        configData: clinicHours,
      });
      setOriginalClinicHours({ ...clinicHours });
    } catch (error) {}
  }, [clinicHours, updateClinicConfigMutation]);

  const handleCancelTimings = useCallback(() => {
    setClinicHours({ ...originalClinicHours });
    setIsEditingTimings(false);
  }, [originalClinicHours]);

  const handleSaveClinic = useCallback(async () => {
    if (!validateForm()) return;
    try {
      await updateClinicMutation.mutateAsync({
        clinicData,
        id: clinic._id,
      });
      setOriginalClinicData({ ...clinicData });
    } catch (error) {}
  }, [clinicData, clinic, updateClinicMutation]);

  const handleCancelClinic = useCallback(() => {
    setClinicData({ ...originalClinicData });
    setIsEditingClinic(false);
  }, [originalClinicData]);

  const handleClinicFieldChange = useCallback((field, value) => {
    setClinicData((prev) => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  const shiftHandlers = useMemo(
    () => ({
      updateShift,
      addShift,
      removeShift,
    }),
    [updateShift, addShift, removeShift],
  );

  const breakHandlers = useMemo(
    () => ({
      updateBreak,
      addBreak,
      removeBreak,
    }),
    [updateBreak, addBreak, removeBreak],
  );

  const hasClinicData = Object.keys(clinicHours).length > 0;

  return (
    <div className="space-y-4">
      <Collapsible open={isTimingsOpen} onOpenChange={setIsTimingsOpen}>
        <CollapsibleTrigger asChild className="cursor-pointer">
          <button className="w-full flex items-center justify-between px-4 py-3 rounded-lg border border-input bg-background hover:bg-accent transition-colors">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-primary" />
              <span className="text-base font-semibold">Clinic Timings</span>
            </div>
            <ChevronDown
              className={`w-5 h-5 transition-transform ${
                isTimingsOpen ? "rotate-180" : ""
              }`}
            />
          </button>
        </CollapsibleTrigger>

        <CollapsibleContent className="mt-3">
          <Card className="border">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle>Working Hours & Shifts</CardTitle>
                  <CardDescription>
                    Configure your clinic&apos;s operating hours, shifts, and
                    break times
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  {!isEditingTimings ? (
                    <Button
                      onClick={() => setIsEditingTimings(true)}
                      disabled={!hasClinicData}
                      size="sm"
                    >
                      Edit
                    </Button>
                  ) : (
                    <>
                      <Button
                        variant="outline"
                        onClick={handleCancelTimings}
                        size="sm"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleSaveTimings}
                        disabled={updateClinicConfigMutation.isPending}
                        size="sm"
                      >
                        {updateClinicConfigMutation.isPending
                          ? "Saving..."
                          : "Save"}
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardHeader>

            <CardContent>
              {hasClinicData ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* LEFT - Day Selection */}
                  <div className="lg:col-span-1">
                    <h3 className="text-sm font-semibold mb-3 text-foreground">
                      Days of Week
                    </h3>
                    <div className="grid gap-2">
                      {daysOfWeek.map(({ key, label }) => (
                        <div
                          key={key}
                          className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                            selectedDay === key
                              ? "border-primary bg-primary/10 shadow-sm"
                              : "border-input hover:border-primary/50"
                          }`}
                          onClick={() => setSelectedDay(key)}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">{label}</span>
                            <Switch
                              checked={clinicHours[key]?.isOpen || false}
                              onCheckedChange={(checked) =>
                                updateDayOpen(key, checked)
                              }
                              disabled={!isEditingTimings}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* RIGHT - Day Configuration */}
                  <div className="lg:col-span-2">
                    <ClinicDayConfiguration
                      clinicHours={clinicHours}
                      selectedDay={selectedDay}
                      shift={shiftHandlers}
                      breaks={breakHandlers}
                      isEditing={isEditingTimings}
                    />
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p className="text-sm">
                    No clinic configuration data available.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </CollapsibleContent>
      </Collapsible>

      <Collapsible open={isClinicOpen} onOpenChange={setIsClinicOpen}>
        <CollapsibleTrigger asChild className="cursor-pointer">
          <button className="w-full flex items-center justify-between px-4 py-3 rounded-lg border border-input bg-background hover:bg-accent transition-colors">
            <div className="flex items-center gap-3">
              <Settings2 className="w-5 h-5 text-primary" />
              <span className="text-base font-semibold">Clinic Details</span>
            </div>
            <ChevronDown
              className={`w-5 h-5 transition-transform ${
                isClinicOpen ? "rotate-180" : ""
              }`}
            />
          </button>
        </CollapsibleTrigger>

        <CollapsibleContent className="mt-3">
          <Card className="border">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle>Update Clinic Information</CardTitle>
                  <CardDescription>
                    Manage your clinic&apos;s basic information and contact
                    details
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  {!isEditingClinic ? (
                    <Button
                      onClick={() => setIsEditingClinic(true)}
                      disabled={!clinic}
                      size="sm"
                    >
                      Edit
                    </Button>
                  ) : (
                    <>
                      <Button
                        variant="outline"
                        onClick={handleCancelClinic}
                        size="sm"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleSaveClinic}
                        disabled={updateClinicMutation.isPending}
                        size="sm"
                      >
                        {updateClinicMutation.isPending ? "Saving..." : "Save"}
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardHeader>

            <CardContent>
              {clinic ? (
                <div className="space-y-6">
                  {/* Basic Information */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-foreground">
                      Basic Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label
                          htmlFor="name"
                          className="text-xs text-muted-foreground"
                        >
                          Name
                        </Label>
                        <Input
                          id="name"
                          placeholder="Clinic name"
                          value={clinicData.name || ""}
                          onChange={(e) =>
                            handleClinicFieldChange("name", e.target.value)
                          }
                          disabled={!isEditingClinic}
                          className="h-9"
                        />
                        {errors.name && (
                          <p className="text-red-500 text-xs mt-1">
                            {errors.name}
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label
                          htmlFor="clinicName"
                          className="text-xs text-muted-foreground"
                        >
                          Display Name
                        </Label>
                        <Input
                          id="clinicName"
                          placeholder="Display name"
                          value={clinicData.clinicName || ""}
                          onChange={(e) =>
                            handleClinicFieldChange(
                              "clinicName",
                              e.target.value,
                            )
                          }
                          disabled={!isEditingClinic}
                          className="h-9"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-foreground">
                      Contact Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label
                          htmlFor="phone"
                          className="text-xs text-muted-foreground"
                        >
                          Phone
                        </Label>
                        <Input
                          id="phone"
                          placeholder="Phone number"
                          value={clinicData.phone || ""}
                          onChange={(e) =>
                            handleClinicFieldChange("phone", e.target.value)
                          }
                          disabled={!isEditingClinic}
                          className="h-9"
                        />
                        {errors.phone && (
                          <p className="text-red-500 text-xs mt-1">
                            {errors.phone}
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label
                          htmlFor="email"
                          className="text-xs text-muted-foreground"
                        >
                          Email
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="Email address"
                          value={clinicData.email || ""}
                          onChange={(e) =>
                            handleClinicFieldChange("email", e.target.value)
                          }
                          disabled={!isEditingClinic}
                          className="h-9"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-foreground">
                      Address
                    </h3>
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <Label
                          htmlFor="addressLine1"
                          className="text-xs text-muted-foreground"
                        >
                          Address Line 1
                        </Label>
                        <Input
                          id="addressLine1"
                          placeholder="Address line 1"
                          value={clinicData.addressLine1 || ""}
                          onChange={(e) =>
                            handleClinicFieldChange(
                              "addressLine1",
                              e.target.value,
                            )
                          }
                          disabled={!isEditingClinic}
                          className="h-9"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label
                          htmlFor="addressLine2"
                          className="text-xs text-muted-foreground"
                        >
                          Address Line 2
                        </Label>
                        <Input
                          id="addressLine2"
                          placeholder="Address line 2"
                          value={clinicData.addressLine2 || ""}
                          onChange={(e) =>
                            handleClinicFieldChange(
                              "addressLine2",
                              e.target.value,
                            )
                          }
                          disabled={!isEditingClinic}
                          className="h-9"
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label
                            htmlFor="city"
                            className="text-xs text-muted-foreground"
                          >
                            City
                          </Label>
                          <Input
                            id="city"
                            placeholder="City"
                            value={clinicData.city || ""}
                            onChange={(e) =>
                              handleClinicFieldChange("city", e.target.value)
                            }
                            disabled={!isEditingClinic}
                            className="h-9"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label
                            htmlFor="state"
                            className="text-xs text-muted-foreground"
                          >
                            State
                          </Label>
                          <Input
                            id="state"
                            placeholder="State"
                            value={clinicData.state || ""}
                            onChange={(e) =>
                              handleClinicFieldChange("state", e.target.value)
                            }
                            disabled={!isEditingClinic}
                            className="h-9"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label
                            htmlFor="postalCode"
                            className="text-xs text-muted-foreground"
                          >
                            Postal Code
                          </Label>
                          <Input
                            id="postalCode"
                            placeholder="Postal code"
                            value={clinicData.postalCode || ""}
                            onChange={(e) =>
                              handleClinicFieldChange(
                                "postalCode",
                                e.target.value,
                              )
                            }
                            disabled={!isEditingClinic}
                            className="h-9"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label
                          htmlFor="country"
                          className="text-xs text-muted-foreground"
                        >
                          Country
                        </Label>
                        <Input
                          id="country"
                          placeholder="Country"
                          value={clinicData.country || ""}
                          onChange={(e) =>
                            handleClinicFieldChange("country", e.target.value)
                          }
                          disabled={!isEditingClinic}
                          className="h-9"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-foreground">
                      Maps
                    </h3>
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <Label
                          htmlFor="addressLine1"
                          className="text-xs text-muted-foreground"
                        >
                          Google Maps Link
                        </Label>
                        <Input
                          id="googleMapsLink"
                          placeholder="https://maps.google.com/..."
                          value={clinicData.googleMapsLink || ""}
                          onChange={(e) =>
                            handleClinicFieldChange(
                              "googleMapsLink",
                              e.target.value,
                            )
                          }
                          disabled={!isEditingClinic}
                          className="h-9"
                        />
                        {errors.googleMapsLink && (
                          <p className="text-red-500 text-xs mt-1">
                            {errors.googleMapsLink}
                          </p>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label
                            htmlFor="latitude"
                            className="text-xs text-muted-foreground"
                          >
                            Latitude
                          </Label>
                          <Input
                            id="latitude"
                            placeholder="Latitude"
                            value={clinicData.latitude || ""}
                            onChange={(e) =>
                              handleClinicFieldChange(
                                "latitude",
                                e.target.value,
                              )
                            }
                            disabled={!isEditingClinic}
                            className="h-9"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label
                            htmlFor="longitude"
                            className="text-xs text-muted-foreground"
                          >
                            Longitude
                          </Label>
                          <Input
                            id="longitude"
                            placeholder="Longitude"
                            value={clinicData.longitude || ""}
                            onChange={(e) =>
                              handleClinicFieldChange(
                                "longitude",
                                e.target.value,
                              )
                            }
                            disabled={!isEditingClinic}
                            className="h-9"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label
                            htmlFor="postalCode"
                            className="text-xs text-muted-foreground"
                          >
                            Postal Code
                          </Label>
                          <Input
                            id="postalCode"
                            placeholder="Postal code"
                            value={clinicData.postalCode || ""}
                            onChange={(e) =>
                              handleClinicFieldChange(
                                "postalCode",
                                e.target.value,
                              )
                            }
                            disabled={!isEditingClinic}
                            className="h-9"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label
                          htmlFor="country"
                          className="text-xs text-muted-foreground"
                        >
                          Country
                        </Label>
                        <Input
                          id="country"
                          placeholder="Country"
                          value={clinicData.country || ""}
                          onChange={(e) =>
                            handleClinicFieldChange("country", e.target.value)
                          }
                          disabled={!isEditingClinic}
                          className="h-9"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p className="text-sm">No clinic data available.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </CollapsibleContent>
      </Collapsible>

      <Collapsible open={isTemplatesOpen} onOpenChange={setIsTemplatesOpen}>
        <CollapsibleTrigger asChild className="cursor-pointer">
          <button className="w-full flex items-center justify-between px-4 py-3 rounded-lg border border-input bg-background hover:bg-accent transition-colors">
            <div className="flex items-center gap-3">
              <MessageSquare className="w-5 h-5 text-primary" />
              <span className="text-base font-semibold">
                WhatsApp Template Active
              </span>
            </div>
            <ChevronDown
              className={`w-5 h-5 transition-transform ${
                isTemplatesOpen ? "rotate-180" : ""
              }`}
            />
          </button>
        </CollapsibleTrigger>

        <CollapsibleContent className="mt-3">
          <Card className="border">
            <CardHeader className="pb-3">
              <div>
                <CardTitle>Select WhatsApp Template</CardTitle>
                <CardDescription>
                  Choose which appointment reminder template to use for WhatsApp
                  notifications
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Template 1: With Location Header */}
                <div
                  onClick={() => {
                    // if (isBasicTemplateDisabled) return;
                    setActiveTemplate("clinisync_appointment_location");
                  }}
                  className={`cursor-pointer rounded-lg border-2 p-3 transition-all ${
                    activeTemplate === "clinisync_appointment_location"
                      ? "border-primary bg-primary/5"
                      : "border-input hover:border-primary/50"
                  }`}
                >
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold">
                      clinisync_appointment_location
                    </h3>
                    <div className="relative w-full h-64 rounded-lg overflow-hidden bg-muted">
                      {/* <Image
                        src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-CXkqTC9Cyg2KAubJgMZ7tjvFHD6y9S.png"
                        alt="WhatsApp template with location header"
                        fill
                        className="object-cover"
                      /> */}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Includes location header with map and address display
                    </p>
                    <Alert variant="destructive" className="mt-2 py-2">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription className="text-xs">
                        Enter latitude and longitude in Edit Clinic
                      </AlertDescription>
                    </Alert>
                    <div
                      className={`h-3 rounded-full transition-colors ${
                        activeTemplate === "clinisync_appointment_location"
                          ? "bg-primary"
                          : "bg-input"
                      }`}
                    />
                  </div>
                </div>

                {/* Template 2: With Google Maps Link */}
                <div
                  onClick={() => {
                    // if (isBasicTemplateDisabled) return;
                    setActiveTemplate("clinisync_appointment_location");
                  }}
                  className={`cursor-pointer rounded-lg border-2 p-3 transition-all ${
                    activeTemplate === "clinisync_appointment_gmap"
                      ? "border-primary bg-primary/5"
                      : "border-input hover:border-primary/50"
                  }`}
                >
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold">
                      clinisync_appointment_gmap
                    </h3>
                    <div className="relative w-full h-64 rounded-lg overflow-hidden bg-muted">
                      {/* <Image
                        src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-Uw2XEdUOJjxqoJPGyWKlo67dLSzbHT.png"
                        alt="WhatsApp template with Google Maps link"
                        fill
                        className="object-cover"
                      /> */}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Includes clickable Google Maps link in message
                    </p>
                    <Alert variant="destructive" className="mt-2 py-2">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription className="text-xs">
                        Enter Google Maps Link in Edit Clinic
                      </AlertDescription>
                    </Alert>

                    <div
                      className={`h-3 rounded-full transition-colors ${
                        activeTemplate === "clinisync_appointment_gmap"
                          ? "bg-primary"
                          : "bg-input"
                      }`}
                    />
                  </div>
                </div>

                {/* Template 3: Basic (No Location) */}
                <div
                  onClick={() => {
                    // if (isBasicTemplateDisabled) return;
                    setActiveTemplate("clinisync_appointment_location");
                  }}
                  className={`cursor-pointer rounded-lg border-2 p-3 transition-all ${
                    activeTemplate === "clinisync_appointment"
                      ? "border-primary bg-primary/5"
                      : "border-input hover:border-primary/50"
                  }`}
                >
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold">
                      clinisync_appointment
                    </h3>
                    <div className="relative w-full h-64 rounded-lg overflow-hidden bg-muted">
                      {/* <Image
                        src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-ALY0ncQagvvviWQnfNLRmf3G8WUGVL.png"
                        alt="WhatsApp template basic"
                        fill
                        className="object-cover"
                      /> */}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Basic template without location details
                    </p>
                    <div
                      className={`h-3 rounded-full transition-colors ${
                        activeTemplate === "clinisync_appointment"
                          ? "bg-primary"
                          : "bg-input"
                      }`}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 rounded-lg bg-muted/50 border border-input">
                <p className="text-sm font-medium">Active Template:</p>
                <p className="text-sm text-primary font-semibold mt-1">
                  {activeTemplate}
                </p>
              </div>
            </CardContent>
          </Card>
        </CollapsibleContent>
      </Collapsible>

      {(loadingSettings || loadingClinic) && <Loader />}
    </div>
  );
}
