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
import { daysOfWeek, defaultClinicSettings, whatsappTemplates } from "./data";
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
  CircleCheck,
} from "lucide-react";
import Image from "next/image";
import { Alert, AlertDescription } from "./ui/alert";

export default function ClinicSettings() {
  const queryClient = useQueryClient();
  const [selectedDay, setSelectedDay] = useState("monday");
  const [clinicHours, setClinicHours] = useState({});
  const [isTimingsOpen, setIsTimingsOpen] = useState(false);
  const [isClinicOpen, setIsClinicOpen] = useState(false);
  const [isEditingTimings, setIsEditingTimings] = useState(false);
  const [isEditingClinic, setIsEditingClinic] = useState(false);
  const [clinicData, setClinicData] = useState({});
  const [errors, setErrors] = useState({});
  const [isTemplatesOpen, setIsTemplatesOpen] = useState(false);
  const [isEditingWhatsapp, setIsEditingWhatsapp] = useState(false);

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

  const handleConfigChange = (field, value) => {
    setClinicData((prev) => ({
      ...prev,
      whatsappMsgFrequency: {
        ...prev.whatsappMsgFrequency,
        [field]: value,
      },
    }));
  };

  const handleTemplateChange = (template) => {
    setClinicData((prev) => ({
      ...prev,
      whatsappTemplate: template,
    }));
  };

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

  const handleSaveWhatsapp = async () => {
    try {
      await updateClinicMutation.mutateAsync({
        clinicData,
        id: clinic._id,
      });

      setIsEditingWhatsapp(false);
    } catch (err) {}
  };

  const handleCancelWhatsapp = () => {
    setIsEditingWhatsapp(false);
    setClinicData(clinic);
  };

  useEffect(() => {
    if (clinicSettings?.openingHours) {
      setClinicHours(clinicSettings.openingHours);
    }
  }, [clinicSettings]);

  useEffect(() => {
    if (clinic && !isEditingClinic && !isEditingWhatsapp) {
      setClinicData(clinic);
    }
  }, [clinic, isEditingClinic, isEditingWhatsapp]);

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
    } catch (error) {}
  }, [clinicHours, updateClinicConfigMutation]);

  const handleCancelTimings = useCallback(() => {
    setClinicHours(clinicSettings.openingHours);
    setIsEditingTimings(false);
  }, []);

  const handleSaveClinic = useCallback(async () => {
    if (!validateForm()) return;
    try {
      await updateClinicMutation.mutateAsync({
        clinicData,
        id: clinic._id,
      });
    } catch (error) {}
  }, [clinicData, clinic, updateClinicMutation]);

  const handleCancelClinic = useCallback(() => {
    setClinicData(clinic);
    setIsEditingClinic(false);
  }, []);

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

  const isTemplateDisabled = (template, clinicData) => {
    switch (template) {
      case "clinisync_appointment_location":
        return !clinicData?.latitude || !clinicData?.longitude;

      case "clinisync_appointment_gmap":
        return !clinicData?.googleMapsLink;

      default:
        return false;
    }
  };

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
                      className="cursor-pointer"
                      onClick={() => setIsEditingTimings(true)}
                      disabled={!hasClinicData}
                      size="sm"
                    >
                      Edit
                    </Button>
                  ) : (
                    <>
                      <Button
                        className="cursor-pointer"
                        variant="outline"
                        onClick={() =>
                          setClinicHours(defaultClinicSettings.openingHours)
                        }
                        size="sm"
                      >
                        Default
                      </Button>
                      <Button
                        className="cursor-pointer"
                        variant="outline"
                        onClick={handleCancelTimings}
                        size="sm"
                      >
                        Cancel
                      </Button>
                      <Button
                        className="cursor-pointer"
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
                      className="cursor-pointer"
                      onClick={() => setIsEditingClinic(true)}
                      disabled={!clinic}
                      size="sm"
                    >
                      Edit
                    </Button>
                  ) : (
                    <>
                      <Button
                        className="cursor-pointer"
                        variant="outline"
                        onClick={handleCancelClinic}
                        size="sm"
                      >
                        Cancel
                      </Button>
                      <Button
                        className="cursor-pointer"
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
              <span className="text-base font-semibold">WhatsApp Template</span>
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
            <CardHeader className="">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle>Select WhatsApp Template</CardTitle>
                  <CardDescription>
                    Choose which appointment reminder template to use
                  </CardDescription>
                </div>

                <div className="flex gap-2">
                  {!isEditingWhatsapp ? (
                    <Button
                      className="cursor-pointer"
                      onClick={() => setIsEditingWhatsapp(true)}
                      size="sm"
                    >
                      Edit
                    </Button>
                  ) : (
                    <>
                      <Button
                        className="cursor-pointer"
                        variant="outline"
                        onClick={handleCancelWhatsapp}
                        size="sm"
                      >
                        Cancel
                      </Button>
                      <Button
                        className="cursor-pointer"
                        onClick={handleSaveWhatsapp}
                        size="sm"
                      >
                        Save
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardHeader>

            <CardContent>
              {/* message frequency  */}
              <div className="space-y-4 mb-4 w-fit border p-3 rounded-lg">
                <h3 className="text-lg font-semibold m-0">Message Frequency</h3>
                <p className="text-xs">
                  Select how frequently you want messages to be sent
                </p>

                <div className="flex items-center gap-2">
                  <Switch
                    checked={
                      clinicData?.whatsappMsgFrequency?.onBooking || false
                    }
                    onCheckedChange={(val) =>
                      handleConfigChange("onBooking", val)
                    }
                    disabled={!isEditingWhatsapp}
                    className="
              h-6 w-13
    data-[state=checked]:bg-green-500 
    data-[state=unchecked]:bg-red-500
    disabled:bg-red-400 
    disabled:opacity-100

    [&>span]:h-5
    [&>span]:w-5
    [&>span]:bg-white
    [&>span]:transition-transform
    data-[state=checked]:[&>span]:translate-x-7
    data-[state=unchecked]:[&>span]:translate-x-0.5
  "
                  />
                  <span className="text-md font-semibold">Send on Booking</span>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={
                      clinicData?.whatsappMsgFrequency?.onAppointmentDay ||
                      false
                    }
                    onCheckedChange={(val) =>
                      handleConfigChange("onAppointmentDay", val)
                    }
                    disabled={!isEditingWhatsapp}
                    className="
              h-6 w-13
    data-[state=checked]:bg-green-500 
    data-[state=unchecked]:bg-red-500
    disabled:bg-red-400 
    disabled:opacity-100

    [&>span]:h-5
    [&>span]:w-5
    [&>span]:bg-white
    [&>span]:transition-transform
    data-[state=checked]:[&>span]:translate-x-7
    data-[state=unchecked]:[&>span]:translate-x-0.5
  "
                  />
                  <span className="text-md font-semibold">
                    Send on Appointment Day
                  </span>
                </div>
              </div>

              {clinicData?.whatsappTemplate && (
                <p className="border p-2 w-fit mb-4 rounded-md border-gray-500 font-semibold flex gap-1">
                  <CircleCheck color="green" /> Active Template:{" "}
                  {
                    whatsappTemplates.find(
                      (t) => t.key === clinicData?.whatsappTemplate,
                    ).title
                  }
                </p>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {whatsappTemplates.map((template) => {
                  const isDisabled = isTemplateDisabled(
                    template.key,
                    clinicData,
                  );
                  return (
                    <div
                      key={template.key}
                      onClick={() => {
                        if (!isEditingWhatsapp) return;
                        if (isDisabled) return;
                        handleTemplateChange(template.key);
                      }}
                      className={`rounded-lg border p-2 transition-all ${
                        clinicData?.whatsappTemplate === template.key
                          ? "bg-primary/3 border-2 border-black"
                          : "border-input"
                      } ${isEditingWhatsapp ? (isDisabled ? "cursor-not-allowed" : "cursor-pointer hover:border-primary/50") : ""}`}
                    >
                      <div className="space-y-3 flex flex-col justify-between h-full">
                        <h3 className="text-md font-semibold">
                          {template.title}
                        </h3>

                        <div className="w-8/12 mx-auto rounded-lg flex flex-1 items-center justify-center">
                          {template.image && (
                            <Image
                              src={template.image}
                              alt={template.title}
                              width={300}
                              height={300}
                              className="rounded-lg"
                            />
                          )}
                        </div>

                        <div className="flex flex-col gap-2 justify-end">
                          {isDisabled && template.warning && (
                            <Alert variant="destructive" className="">
                              <AlertTriangle className="h-4 w-4" />
                              <AlertDescription className="text-sm">
                                {template.warning}
                              </AlertDescription>
                            </Alert>
                          )}

                          <div
                            className={`h-3 mt-2 rounded-full transition-colors ${
                              clinicData?.whatsappTemplate === template.key
                                ? "bg-primary"
                                : "bg-input"
                            }`}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </CollapsibleContent>
      </Collapsible>

      {(loadingSettings ||
        loadingClinic ||
        updateClinicConfigMutation.isPending ||
        updateClinicMutation.isPending) && <Loader />}
    </div>
  );
}
