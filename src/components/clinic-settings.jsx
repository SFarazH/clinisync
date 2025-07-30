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
import { toast } from "@/hooks/use-toast";
import ClinicDayConfiguration from "./forms/clinic-day-configuration.form";
import { Button } from "@/components/ui/button";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { daysOfWeek } from "./data";
import { updateClinicConfig, getClinicConfig } from "@/lib";

export default function ClinicSettings() {
  const queryClient = useQueryClient();
  const [selectedDay, setSelectedDay] = useState("monday");
  const [clinicHours, setClinicHours] = useState({});
  const [originalClinicHours, setOriginalClinicHours] = useState({});
  const [isEditing, setIsEditing] = useState(false);

  // Query for clinic settings
  const { data: clinicSettings = {}, isLoading: loadingSettings } = useQuery({
    queryKey: ["clinicSettings"],
    queryFn: getClinicConfig,
  });

  // Mutation for updating clinic config
  const updateClinicConfigMutation = useMutation({
    mutationFn: updateClinicConfig,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clinicSettings"] });
      toast({ title: "Clinic hours updated successfully" });
      setIsEditing(false);
    },
    onError: (error) => {
      console.error("Update failed:", error);
      toast({
        title: "Update failed",
        description: "Please try again later.",
        variant: "destructive",
      });
    },
  });

  // Initialize clinic hours when data is loaded
  useEffect(() => {
    if (clinicSettings?.openingHours) {
      setClinicHours(clinicSettings.openingHours);
    }
  }, [clinicSettings]);

  // Store original hours when editing starts
  useEffect(() => {
    if (isEditing && Object.keys(clinicHours).length > 0) {
      setOriginalClinicHours({ ...clinicHours });
    }
  }, [isEditing, clinicHours]);

  // Memoized function to update clinic hours
  const updateClinicHours = useCallback((updatedConfig) => {
    setClinicHours(updatedConfig);
  }, []);

  // Generic function to update day fields
  const updateDayField = useCallback((day, field, value) => {
    setClinicHours((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value,
      },
    }));
  }, []);

  // Update day open/closed status
  const updateDayOpen = useCallback(
    (day, isOpen) => {
      updateDayField(day, "isOpen", isOpen);
    },
    [updateDayField]
  );

  // Shift management functions
  const addShift = useCallback((day) => {
    const newShift = { start: "09:00", end: "17:00" };
    setClinicHours((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        shifts: [...(prev[day]?.shifts || []), newShift],
      },
    }));
    toast({
      title: "Shift Added",
      description: "New shift has been added successfully.",
    });
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
        (_, index) => index !== shiftIndex
      );

      return {
        ...prev,
        [day]: {
          ...currentDayConfig,
          shifts: updatedShifts,
        },
      };
    });
    toast({
      title: "Shift Removed",
      description: "Shift has been removed successfully.",
    });
  }, []);

  // Break management functions
  const addBreak = useCallback((day) => {
    const newBreak = { start: "12:00", end: "13:00" };
    setClinicHours((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        breaks: [...(prev[day]?.breaks || []), newBreak],
      },
    }));
    toast({
      title: "Break Added",
      description: "New break has been added successfully.",
    });
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
        (_, index) => index !== breakIndex
      );

      return {
        ...prev,
        [day]: {
          ...currentDayConfig,
          breaks: updatedBreaks,
        },
      };
    });
    toast({
      title: "Break Removed",
      description: "Break has been removed successfully.",
    });
  }, []);

  // Save and cancel handlers
  const handleSave = useCallback(async () => {
    try {
      await updateClinicConfigMutation.mutateAsync({
        openingHours: clinicHours,
      });
      setOriginalClinicHours({ ...clinicHours });
    } catch (error) {
      // Error is handled in mutation's onError
    }
  }, [clinicHours, updateClinicConfigMutation]);

  const handleCancel = useCallback(() => {
    setClinicHours({ ...originalClinicHours });
    setIsEditing(false);
  }, [originalClinicHours]);

  const handleEdit = useCallback(() => {
    setIsEditing(true);
  }, []);

  // Memoized shift and break handlers object
  const shiftHandlers = useMemo(
    () => ({
      updateShift,
      addShift,
      removeShift,
    }),
    [updateShift, addShift, removeShift]
  );

  const breakHandlers = useMemo(
    () => ({
      updateBreak,
      addBreak,
      removeBreak,
    }),
    [updateBreak, addBreak, removeBreak]
  );

  // Check if there's clinic data available
  const hasClinicData = Object.keys(clinicHours).length > 0;

  if (loadingSettings) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-muted-foreground">
              Loading clinic settings...
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Clinic Working Hours & Shifts</CardTitle>
          <CardDescription>
            Configure your clinic's operating hours, shifts, and break times for
            each day
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-end mb-4">
            {!isEditing ? (
              <Button onClick={handleEdit} disabled={!hasClinicData}>
                Edit
              </Button>
            ) : (
              <div className="space-x-2">
                <Button variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={updateClinicConfigMutation.isPending}
                >
                  {updateClinicConfigMutation.isPending
                    ? "Saving..."
                    : "Save Changes"}
                </Button>
              </div>
            )}
          </div>

          {hasClinicData ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Select Day</h3>
                <div className="grid gap-2">
                  {daysOfWeek.map(({ key, label }) => (
                    <div
                      key={key}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedDay === key
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      onClick={() => setSelectedDay(key)}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{label}</span>
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={clinicHours[key]?.isOpen || false}
                            onCheckedChange={(checked) =>
                              updateDayOpen(key, checked)
                            }
                            onClick={(e) => e.stopPropagation()}
                            disabled={!isEditing}
                          />
                          <span className="text-sm text-muted-foreground">
                            {clinicHours[key]?.isOpen ? "Open" : "Closed"}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <ClinicDayConfiguration
                clinicHours={clinicHours}
                selectedDay={selectedDay}
                shift={shiftHandlers}
                breaks={breakHandlers}
                isEditing={isEditing}
              />
            </div>
          ) : (
            <div className="text-center text-muted-foreground">
              No clinic configuration data available.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
