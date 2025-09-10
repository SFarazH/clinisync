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
import { Check, Edit, Plus, Trash2 } from "lucide-react";
import { emptyMedicationItem, emptyPrescription } from "../data";
import Loader from "../loader";

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
  };

  return (
    <>
      <Dialog
        open={isOpen}
        onOpenChange={(open) => {
          if (!open) {
            setIsEditing(false);
            setCurrentPrescription(emptyPrescription);
            onClose();
          }
        }}
      >
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader className="pb-3">
            <DialogTitle className="text-lg">
              {appointment.patientId.name} - {appointment.procedureId.name}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-medium">
                {isCompleted ? "Prescription" : "Add Prescription"}
              </h3>
              {currentPrescription.delivered ? (
                <p className="flex items-center bg-green-200 w-fit py-1.5 px-2 rounded-2xl gap-1">
                  Delivered <Check height={22} width={22} />
                </p>
              ) : (
                isCompleted &&
                !isEditing && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 px-2 text-xs"
                    onClick={() => setIsEditing(true)}
                  >
                    <Edit className="w-3 h-3 mr-1" />
                    Edit
                  </Button>
                )
              )}
            </div>

            {currentPrescription?.medications?.length === 0 ? (
              <div className="bg-gray-50 text-gray-600 text-sm p-3 rounded border">
                No medications added yet
              </div>
            ) : (
              <div className="space-y-3">
                {currentPrescription.medications?.map((med, index) => (
                  <div
                    key={index}
                    className="border rounded p-3 bg-gray-50/50 space-y-3"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                      <div className="md:col-span-2">
                        <Label className="text-xs text-gray-600 mb-1">
                          Medicine
                        </Label>
                        <Input
                          className="h-8 text-sm focus-visible:ring-0"
                          placeholder="Medicine name"
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
                      <div>
                        <Label className="text-xs text-gray-600 mb-1">
                          Frequency
                        </Label>
                        <Input
                          className="h-8 text-sm focus-visible:ring-0"
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
                      <div>
                        <Label className="text-xs text-gray-600 mb-1">
                          Duration
                        </Label>
                        <Input
                          className="h-8 text-sm focus-visible:ring-0"
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

                    <div className="flex gap-3 items-end">
                      {(isEditing ||
                        (!isEditing && med.instructions !== null)) && (
                        <div className="flex-1">
                          <Label className="text-xs text-gray-600 mb-1">
                            Instructions
                          </Label>
                          <Input
                            className="h-8 text-sm focus-visible:ring-0"
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
                      )}

                      {(isEditing || !isCompleted) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-red-500 hover:bg-red-50 focus-visible:ring-red-300 focus-visible:ring-2"
                          onClick={() => handleRemoveMedication(index)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {(isEditing || !isCompleted) && (
              <div className="flex items-center">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs bg-transparent focus-visible:ring-0 cursor-pointer w-fit mx-auto"
                  onClick={handleAddMedication}
                >
                  <Plus className="w-3 h-3 mr-1" /> Add Medication
                </Button>
              </div>
            )}

            {(isEditing ||
              (!isEditing && currentPrescription.generalNotes !== null)) && (
              <div>
                <Label className="text-xs text-gray-600 mb-1">
                  General Instructions
                </Label>
                <Textarea
                  className="text-sm min-h-[60px]"
                  value={currentPrescription.generalNotes}
                  onChange={(e) => handleGeneralNotesChange(e.target.value)}
                  disabled={isCompleted && !isEditing}
                />
              </div>
            )}
          </div>

          <DialogFooter className="flex justify-between pt-4 gap-2">
            <Button
              variant="outline"
              size="sm"
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
              <Button size="sm" onClick={handleSave}>
                {isEditing ? "Update" : "Save"}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
        {(addPrescriptionMutation.isPending ||
          updatePrescriptionMutation.isPending) && <Loader />}
      </Dialog>
    </>
  );
}
