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
import { Check, ChevronsUpDown, Edit, Plus, Trash2 } from "lucide-react";
import { emptyMedicationItem, emptyPrescription } from "../data";
import Loader from "../loader";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";

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
  const [openPopover, setOpenPopover] = useState({});
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showOtherFields, setShowOtherFields] = useState(false);

  const resetQuery = () => {
    setQuery("");
    setPage(1);
    setShowOtherFields(false);
  };

  const togglePopover = (index, value) => {
    setOpenPopover((prev) => ({
      ...prev,
      [index]: value,
    }));
  };

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

  const fetchMedicines = async (q, newPage = 1) => {
    if (q.length < 3) {
      setResults([]);
      setHasMore(false);
      return;
    }
    try {
      setLoading(true);
      const res = await fetch(
        `https://begv3q4egbx6trux2xmibfbmle0effyz.lambda-url.ap-south-1.on.aws/search?q=${q}&limit=20&page=${newPage}`
      );
      const data = await res.json();

      if (newPage === 1) {
        setResults(data.results);
      } else {
        setResults((prev) => [...prev, ...data.results]);
      }

      setHasMore(newPage < data.totalPages);
    } catch (err) {
      console.error("Error fetching medicines:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delay = setTimeout(() => {
      setPage(1);
      fetchMedicines(query, 1);
    }, 400);
    return () => clearTimeout(delay);
  }, [query]);

  if (!appointment) return null;

  const isCompleted = appointment.status === "completed";

  const handleAddMedication = () => {
    setCurrentPrescription((prev) => ({
      ...prev,
      medications: [...prev.medications, emptyMedicationItem],
    }));
  };

  const handleSelect = (index, value) => {
    if (value === "other") {
      setShowOtherFields(true);

      // clear out medicine if selecting Other
      handleMedicationChange(index, "medicineName", "", true);
      handleMedicationChange(index, "shortComposition1", "", true);
      handleMedicationChange(index, "shortComposition2", "", true);
    } else {
      setShowOtherFields(false);

      handleMedicationChange(index, "medicineName", value.name, true);
      handleMedicationChange(
        index,
        "shortComposition1",
        value.shortComposition1,
        true
      );
      handleMedicationChange(
        index,
        "shortComposition2",
        value.shortComposition2,
        true
      );
    }
    setOpenPopover((prev) => ({ ...prev, [index]: false }));
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

  // const handleMedicationChange = (field, value) => {
  //   // setCurrentPrescription((prev) => {
  //   //   const newMeds = [...prev.medications];
  //   //   newMeds[index] = { ...newMeds[index], [field]: value };
  //   //   return {
  //   //     ...prev,
  //   //     medications: newMeds,
  //   //   };
  //   // });
  // };

  const handleMedicationChange = (
    index,
    field,
    value,
    isMedicineField = false
  ) => {
    setCurrentPrescription((prev) => {
      const newMeds = [...prev.medications];

      if (isMedicineField) {
        // update inside medicine object
        newMeds[index] = {
          ...newMeds[index],
          medicine: {
            ...newMeds[index].medicine,
            [field]: value,
          },
        };
      } else {
        // update top-level fields (frequency, duration, instructions)
        newMeds[index] = { ...newMeds[index], [field]: value };
      }

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
            resetQuery();
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
                    <div className={`grid grid-cols-1 md:grid-cols-4 gap-3`}>
                      <div className="md:col-span-2">
                        <div className="">
                          <Label className="text-xs text-gray-600 mb-1">
                            Medicine
                          </Label>
                          <Popover
                            open={!!openPopover[index]}
                            onOpenChange={(val) => togglePopover(index, val)}
                          >
                            <PopoverTrigger
                              className="h-8 text-sm focus-visible:ring-0"
                              asChild
                            >
                              <Button
                                variant="outline"
                                role="combobox"
                                className="w-full justify-between font-normal truncate"
                              >
                                {med.medicine?.medicineName
                                  ? med.medicine.medicineName
                                  : "Select medicine"}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </PopoverTrigger>

                            <PopoverContent className="w-[var(--radix-popover-trigger-width)]">
                              <Command shouldFilter={false}>
                                <CommandInput
                                  placeholder="Search medicine..."
                                  value={query}
                                  onValueChange={setQuery}
                                />
                                <CommandList
                                  onWheel={(e) => {
                                    e.stopPropagation();
                                  }}
                                  className="max-h-60 overflow-y-auto"
                                  onScroll={(e) => {
                                    const {
                                      scrollTop,
                                      scrollHeight,
                                      clientHeight,
                                    } = e.currentTarget;
                                    const isNearBottom =
                                      scrollHeight - scrollTop - clientHeight <
                                      50;
                                    if (isNearBottom && hasMore && !loading) {
                                      const nextPage = page + 1;
                                      setPage(nextPage);
                                      fetchMedicines(query, nextPage);
                                    }
                                  }}
                                >
                                  <CommandEmpty>
                                    No medicines found.
                                  </CommandEmpty>
                                  <CommandGroup>
                                    <CommandItem
                                      value="other"
                                      onSelect={() =>
                                        handleSelect(index, "other")
                                      }
                                    >
                                      ➕ Other
                                    </CommandItem>
                                    {med.medicine.medicineName &&
                                      query === "" && (
                                        <CommandItem
                                          value={med.medicine.medicineName}
                                          key={med.medicine.medicineName}
                                          disabled={true}
                                        >
                                          {med.medicine.medicineName}
                                        </CommandItem>
                                      )}
                                    {results.map((medicine) => (
                                      <CommandItem
                                        className="w-full"
                                        key={medicine._id}
                                        value={medicine}
                                        onSelect={() =>
                                          handleSelect(index, medicine)
                                        }
                                      >
                                        {medicine.name}
                                      </CommandItem>
                                    ))}
                                    {loading && (
                                      <div className="p-2 text-sm text-muted-foreground">
                                        Loading...
                                      </div>
                                    )}
                                  </CommandGroup>
                                </CommandList>
                              </Command>
                            </PopoverContent>
                          </Popover>
                        </div>
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

                    {/* {isCompleted && !isEditing && (
                      <div className="text-xs text-gray-700 my-2">
                        {med.medicine.medicineName}
                      </div>
                    )} */}

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 w-full md:col-span-4">
                      {showOtherFields && (
                        <div>
                          <Label className="text-xs text-gray-600 mb-1">
                            Medicine Name
                          </Label>
                          <Input
                            placeholder="Medicine name"
                            className="h-8 text-sm focus-visible:ring-0"
                            value={med.medicine?.medicineName}
                            onChange={(e) =>
                              handleMedicationChange(
                                index,
                                "medicineName",
                                e.target.value,
                                true
                              )
                            }
                            disabled={isCompleted && !isEditing}
                          />
                        </div>
                      )}
                      <div>
                        <Label className="text-xs text-gray-600 mb-1">
                          Composition 1
                        </Label>
                        <Input
                          className="h-8 text-sm focus-visible:ring-0"
                          placeholder="Composition 1"
                          value={med?.medicine?.shortComposition1}
                          onChange={(e) =>
                            handleMedicationChange(
                              index,
                              "shortComposition1",
                              e.target.value,
                              true
                            )
                          }
                          disabled={
                            (isCompleted && !isEditing) || !showOtherFields
                          }
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-gray-600 mb-1">
                          Composition 2
                        </Label>
                        <Input
                          className="h-8 text-sm focus-visible:ring-0"
                          placeholder="Composition 2"
                          value={med?.medicine?.shortComposition2}
                          onChange={(e) =>
                            handleMedicationChange(
                              index,
                              "shortComposition2",
                              e.target.value,
                              true
                            )
                          }
                          disabled={
                            (isCompleted && !isEditing) || !showOtherFields
                          }
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
