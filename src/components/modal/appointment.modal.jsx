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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Edit, Plus, Trash2 } from "lucide-react";
import { emptyMedicationItem, emptyPrescription } from "../data";

export default function AppointmentDetailsModal({
  isOpen,
  onClose,
  appointment,
  addPrescriptionMutation,
  updatePrescriptionMutation,
}) {
  const [currentPrescription, setCurrentPrescription] =
    useState(emptyPrescription);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (appointment) {
      if (appointment.prescription) {
        setCurrentPrescription(appointment.prescription);
      } else {
        setCurrentPrescription({
          medications: [],
          generalNotes: "",
          appointment: appointment._id,
          patient: appointment.patientId._id,
        });
      }
    }
  }, [appointment]);

  if (!appointment) return null;

  const isCompleted = appointment.status === "completed";

  const handleAddMedication = () => {
    setCurrentPrescription((prev) => ({
      ...prev,
      medications: [...prev.medications, emptyMedicationItem],
    }));
  };

  const handleRemoveMedication = (index) => {
    setCurrentPrescription((prev) => {
      const newMeds = [...prev.medications];
      newMeds.splice(index, 1);
      return {
        ...prev,
        medications: newMeds,
      };
    });
  };

  const handleMedicationChange = (index, field, value) => {
    setCurrentPrescription((prev) => {
      const newMeds = [...prev.medications];
      newMeds[index] = { ...newMeds[index], [field]: value };
      return {
        ...prev,
        medications: newMeds,
      };
    });
  };

  const handleGeneralNotesChange = (value) => {
    setCurrentPrescription((prev) => ({
      ...prev,
      generalNotes: value,
    }));
  };

  const handleSave = () => {
    if (isEditing) {
      updatePrescriptionMutation.mutateAsync({
        id: currentPrescription._id,
        prescriptionData: currentPrescription,
      });
    } else {
      addPrescriptionMutation.mutateAsync(currentPrescription);
    }
    setIsEditing(false);
    onClose();
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
      <DialogContent className="sm:max-w-[800px] max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Appointment Details - {appointment.patientId.name}
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          <div>
            <p className="text-muted-foreground mb-1">Procedure</p>
            <p className="text-base font-medium">
              {appointment.procedureId.name}
            </p>
          </div>

          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">
              {isCompleted ? "Prescription" : "Add Prescription"}
            </h3>
            {isCompleted && !isEditing && (
              <Button
                size="sm"
                variant="secondary"
                className="gap-1"
                onClick={() => setIsEditing(true)}
              >
                <Edit className="w-4 h-4" />
                Edit
              </Button>
            )}
          </div>

          {currentPrescription?.medications?.length === 0 ? (
            <div className="bg-yellow-50 text-yellow-800 text-sm p-3 rounded border border-yellow-200">
              No medications added. Click "Add Another Medication" to begin.
            </div>
          ) : (
            <div className="space-y-6">
              <h4 className="text-md font-medium text-gray-700">Medications</h4>
              {currentPrescription.medications?.map((med, index) => (
                <div
                  key={index}
                  className="border rounded-lg p-5 bg-white shadow-sm space-y-4 relative"
                >
                  <h5 className="text-sm font-semibold text-gray-600 mb-2">
                    Medication #{index + 1}
                  </h5>

                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                      <Label className="mb-1" htmlFor={`medicine-${index}`}>
                        Medicine
                      </Label>
                      <Input
                        className={(isEditing || !isCompleted) && "bg-white"}
                        id={`medicine-${index}`}
                        placeholder="Amoxicillin"
                        value={med.medicine}
                        onChange={(e) =>
                          handleMedicationChange(
                            index,
                            "medicine",
                            e.target.value
                          )
                        }
                        disabled={isCompleted && !isEditing}
                      />
                    </div>
                    <div className="w-full md:w-1/4">
                      <Label className="mb-1" htmlFor={`frequency-${index}`}>
                        Frequency
                      </Label>
                      <Input
                        className={(isEditing || !isCompleted) && "bg-white"}
                        id={`frequency-${index}`}
                        placeholder="BD"
                        value={med.frequency}
                        onChange={(e) =>
                          handleMedicationChange(
                            index,
                            "frequency",
                            e.target.value
                          )
                        }
                        disabled={isCompleted && !isEditing}
                      />
                    </div>
                    <div className="w-full md:w-1/4">
                      <Label className="mb-1" htmlFor={`duration-${index}`}>
                        Duration
                      </Label>
                      <Input
                        className={(isEditing || !isCompleted) && "bg-white"}
                        id={`duration-${index}`}
                        placeholder="7 days"
                        value={med.duration}
                        onChange={(e) =>
                          handleMedicationChange(
                            index,
                            "duration",
                            e.target.value
                          )
                        }
                        disabled={isCompleted && !isEditing}
                      />
                    </div>
                  </div>

                  <div className="flex justify-between items-center gap-4">
                    <div className="w-full">
                      <Label className="mb-1" htmlFor={`instructions-${index}`}>
                        Instructions
                      </Label>
                      <Input
                        className={(isEditing || !isCompleted) && "bg-white"}
                        id={`instructions-${index}`}
                        placeholder="e.g., Take with food"
                        value={med.instructions}
                        onChange={(e) =>
                          handleMedicationChange(
                            index,
                            "instructions",
                            e.target.value
                          )
                        }
                        disabled={isCompleted && !isEditing}
                      />
                    </div>
                    {!isCompleted && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-500 hover:bg-red-100"
                        onClick={() => handleRemoveMedication(index)}
                        title="Remove Medication"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {(isEditing || !isCompleted) && (
            <Button
              variant="outline"
              className="w-full flex items-center gap-2"
              onClick={handleAddMedication}
            >
              <Plus className="w-4 h-4" /> Add Another Medication
            </Button>
          )}

          <div className="mt-2">
            <Label htmlFor="general-notes">General Prescription Notes</Label>
            <Textarea
              id="general-notes"
              placeholder="Any overall notes for the patient regarding this prescription."
              value={currentPrescription.generalNotes}
              onChange={(e) => handleGeneralNotesChange(e.target.value)}
              disabled={isCompleted && !isEditing}
            />
          </div>
        </div>

        <DialogFooter className="flex justify-between mt-4">
          <Button
            variant="outline"
            onClick={() => {
              if (isEditing) {
                setIsEditing(false);
                if (appointment?.prescription) {
                  setCurrentPrescription(appointment.prescription);
                } else {
                  setCurrentPrescription({
                    medications: [],
                    generalNotes: "",
                    appointment: appointment._id,
                    patient: appointment.patientId._id,
                  });
                }
              } else {
                onClose();
                setIsEditing(false);
              }
            }}
          >
            {isCompleted ? (isEditing ? "Cancel" : "Close") : "Cancel"}
          </Button>

          {(!isCompleted || isEditing) && (
            <Button
              className="bg-primary text-white hover:bg-primary/90"
              onClick={handleSave}
            >
              {isEditing ? "Update" : "Save Prescription"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
