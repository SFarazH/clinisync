"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Plus, Trash2 } from "lucide-react";

const availableMedicines = [
  "Amoxicillin",
  "Ibuprofen",
  "Paracetamol",
  "Lisinopril",
  "Metformin",
  "Atorvastatin",
  "Omeprazole",
  "Sertraline",
  "Albuterol",
  "Prednisone",
];

export default function AppointmentDetailsModal({
  isOpen,
  onClose,
  appointment,
  addPrescriptionMutation,
}) {
  const [currentPrescription, setCurrentPrescription] = useState({
    medications: [],
    generalNotes: "",
  });

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
      medications: [
        ...prev.medications,
        { medicine: "", frequency: "", duration: "", instructions: "" },
      ],
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
    console.log(currentPrescription);
    addPrescriptionMutation.mutateAsync(currentPrescription);
    console.log("clsoed");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Appointment Details - {appointment.patientId.name}
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-2 py-2">
          <div className="gap-12">
            <p>{appointment.procedureId.name}</p>
          </div>

          <h3 className="text-lg font-semibold pt-2">
            {isCompleted ? "Prescription" : "Add Prescription"}
          </h3>

          {currentPrescription?.medications?.length === 0 && !isCompleted && (
            <p className="text-muted-foreground text-sm">
              No medications added yet.
            </p>
          )}

          <div className="space-y-4">
            {currentPrescription.medications?.map((med, index) => (
              <div
                key={index}
                className="border rounded-xl p-4 shadow-sm relative space-y-4 bg-gray-50"
              >
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <Label className="mb-1" htmlFor={`medicine-${index}`}>
                      Medicine
                    </Label>
                    <Input
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
                      disabled={isCompleted}
                    />
                  </div>
                  <div className="w-full md:w-1/4">
                    <Label className="mb-1" htmlFor={`frequency-${index}`}>
                      Frequency
                    </Label>
                    <Input
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
                      disabled={isCompleted}
                    />
                  </div>
                  <div className="w-full md:w-1/4">
                    <Label className="mb-1" htmlFor={`duration-${index}`}>
                      Duration
                    </Label>
                    <Input
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
                      disabled={isCompleted}
                    />
                  </div>
                </div>

                <div className="flex justify-between items-center gap-4">
                  <div className="w-full">
                    <Label className="mb-1" htmlFor={`instructions-${index}`}>
                      Instructions
                    </Label>
                    <Input
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
                      disabled={isCompleted}
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
            {!isCompleted && (
              <Button
                variant="outline"
                className="w-full flex items-center gap-2"
                onClick={handleAddMedication}
              >
                <Plus className="w-4 h-4" /> Add Another Medication
              </Button>
            )}

            <div className="mt-4">
              <Label htmlFor="general-notes">General Prescription Notes</Label>
              <Textarea
                id="general-notes"
                placeholder="Any overall notes for the patient regarding this prescription."
                value={currentPrescription.generalNotes}
                onChange={(e) => handleGeneralNotesChange(e.target.value)}
                disabled={isCompleted}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {isCompleted ? "Close" : "Cancel"}
          </Button>
          {!isCompleted && (
            <Button onClick={handleSave}>Save Prescription</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
