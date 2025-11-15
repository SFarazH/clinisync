"use client";

import { ChevronsUpDown, Loader2, Upload, Image } from "lucide-react";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Label } from "../ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../ui/command";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { appointmentStatusConfig } from "../data";
import { formatDOB } from "@/utils/helper";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { s3GetImage, s3UploadApi } from "@/lib/s3Api";
import { useMutationWrapper } from "../wrappers";
import { useAuth } from "../context/authcontext";

export default function AppointmentForm({
  dialogOptions,
  handleSubmit,
  handleDelete,
  popoverOptions,
  formDetails,
  loaders,
  data,
}) {
  const { authClinic } = useAuth();
  const { isDialogOpen, setIsDialogOpen } = dialogOptions;
  const { open, setOpen } = popoverOptions;
  const {
    patientsData,
    doctorsData,
    proceduresData,
    formData,
    setFormData,
    timeOptions,
    selectedDoctorId,
    attachments,
  } = data;
  const {
    selectedDate,
    selectedTime,
    setSelectedDate,
    setSelectedTime,
    isFromCalendarSlot,
    editingAppointment,
    errorMessage,
  } = formDetails;
  const { loadingPatients, loadingDoctors, loadingProcedures } = loaders;
  const queryClient = useQueryClient();

  const [attachmentToAdd, setAttachmentToAdd] = useState(null);

  const uploadImageMutation = useMutationWrapper({
    mutationFn: s3UploadApi,
    onSuccess: () => {
      queryClient.invalidateQueries(["appointments"]);
      setAttachmentToAdd(null);
      setIsDialogOpen(false);
    },
  });

  const handleImageClick = async (key) => {
    try {
      const { bufferResponse, contentType } = await s3GetImage({
        key: key,
        dbName: authClinic.databaseName,
      });
      const blob = new Blob([bufferResponse], { type: contentType });
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");
    } catch (error) {
      console.error("Failed to open image:", error);
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogContent className="md:max-w-1/2">
        <DialogHeader>
          <DialogTitle>
            {editingAppointment ? "Edit Appointment" : "Schedule Appointment"}
          </DialogTitle>
          <DialogDescription>
            {editingAppointment ? "Edit" : "Schedule a new"} appointment details
            below.
          </DialogDescription>
        </DialogHeader>

        {errorMessage && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
            <div className="flex">
              <div className="text-red-800 text-sm">{errorMessage}</div>
            </div>
          </div>
        )}

        {selectedDoctorId !== "all" && (
          <div className="flex justify-center">
            <div className="font-medium text-lg">
              {
                doctorsData?.filter((doc) => doc._id === selectedDoctorId)[0]
                  ?.name
              }
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="flex gap-4">
              <div className="grid gap-2 w-full">
                <Label htmlFor="patient">Patient</Label>
                <Popover open={open} onOpenChange={setOpen} className="w-full">
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={open}
                      className="w-full justify-between font-normal bg-transparent"
                    >
                      {formData.patientId
                        ? patientsData.find((p) => p._id === formData.patientId)
                            ?.name
                        : "Select Patient"}
                      <ChevronsUpDown className="opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[var(--radix-popover-trigger-width)]">
                    <Command className="w-full">
                      {loadingPatients ? (
                        <CommandList>
                          <CommandItem disabled>
                            <div className="flex items-center space-x-2">
                              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                              <span>Loading patients...</span>
                            </div>
                          </CommandItem>
                        </CommandList>
                      ) : (
                        <>
                          <CommandInput placeholder="Search Patient" />
                          <CommandList>
                            <CommandEmpty>No patient found.</CommandEmpty>
                            <CommandGroup>
                              {patientsData.map((patient) => (
                                <CommandItem
                                  key={patient._id}
                                  value={patient.name.toLowerCase()}
                                  onSelect={() => {
                                    setFormData({
                                      ...formData,
                                      patientId: patient._id,
                                    });
                                    setOpen(false);
                                  }}
                                  className={
                                    formData.patientId === patient._id
                                      ? "bg-gray-200"
                                      : ""
                                  }
                                >
                                  {patient.name} - ({formatDOB(patient.dob)})
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </>
                      )}
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              {selectedDoctorId === "all" && (
                <div className="grid gap-2 w-full">
                  <Label htmlFor="doctor">Doctor</Label>
                  <Select
                    value={formData.doctorId}
                    onValueChange={(value) =>
                      setFormData({ ...formData, doctorId: value })
                    }
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

            <div className="flex gap-4">
              <div className="grid gap-2 w-full">
                <Label htmlFor="procedure">Procedures</Label>
                <Select
                  value={formData.procedureId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, procedureId: value })
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select procedure" />
                  </SelectTrigger>
                  <SelectContent>
                    {loadingProcedures ? (
                      <SelectItem key="disabledprocedures" disabled>
                        <div className="flex items-center space-x-2">
                          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                          <span>Loading procedures...</span>
                        </div>
                      </SelectItem>
                    ) : (
                      proceduresData.map((type) => (
                        <SelectItem key={type._id} value={type._id}>
                          {type.name} ({type.duration} min)
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              {editingAppointment && (
                <div className="grid gap-2 w-full">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) =>
                      setFormData({ ...formData, status: value })
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(appointmentStatusConfig).map(
                        ([status, config]) => {
                          const IconComponent = config.icon;
                          return (
                            <SelectItem key={status} value={status}>
                              <div className="flex items-center gap-2">
                                <IconComponent className="w-4 h-4" />
                                {config.label}
                              </div>
                            </SelectItem>
                          );
                        }
                      )}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            {isFromCalendarSlot && !editingAppointment ? (
              <>
                <div className="gap-2">
                  <div className="p-3 bg-blue-50 border rounded-md flex justify-between">
                    <div className="font-medium text-blue-900 ">
                      {new Date(selectedDate).toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </div>
                    <div className="text-blue-700">{selectedTime}</div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex justify-between gap-4">
                <div className="grid gap-2 w-1/2">
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    required
                  />
                </div>

                <div className="grid gap-2 w-1/2">
                  <Label htmlFor="time">Start Time</Label>
                  <Select value={selectedTime} onValueChange={setSelectedTime}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select start time" />
                    </SelectTrigger>
                    <SelectContent>
                      {timeOptions.length > 0 ? (
                        timeOptions.map((time) => (
                          <SelectItem key={time} value={time}>
                            {time}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="na" disabled>
                          Please select a date
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {authClinic?.features?.attachments && editingAppointment && (
              <div className="grid gap-3">
                <Label htmlFor="attachment">Attachments</Label>

                {attachments && attachments.length > 0 && (
                  <div className="space-y-2">
                    <div className="grid grid-cols-4 gap-2">
                      {attachments.map((file, index) => (
                        <div
                          key={index}
                          onClick={() => handleImageClick(file.s3FileKey)}
                          className="group relative flex flex-col items-center justify-center p-3 border border-border rounded-lg bg-muted/30 hover:bg-muted/50 transition cursor-pointer"
                        >
                          <Image className="w-6 h-6 text-muted-foreground mb-1" />
                          <p className="text-xs text-center truncate w-full px-1 text-foreground font-medium">
                            {file.fileName}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Upload Area */}
                <div className="space-y-2">
                  {attachmentToAdd ? (
                    <div className="relative flex flex-col items-center justify-center p-4 border-2 border-dashed border-primary rounded-lg bg-primary/5">
                      <img
                        src={
                          URL.createObjectURL(attachmentToAdd) ||
                          "/placeholder.svg"
                        }
                        alt={attachmentToAdd.name}
                        className="w-20 h-20 object-cover rounded-md mb-2"
                      />
                      <p className="text-xs text-center text-foreground font-medium truncate max-w-xs">
                        {attachmentToAdd.name}
                      </p>

                      <div className="flex gap-2 mt-3">
                        <button
                          type="button"
                          onClick={() => setAttachmentToAdd(null)}
                          className="px-3 py-1.5 text-xs font-medium bg-muted text-foreground rounded-md hover:bg-muted/80 transition"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (attachmentToAdd) {
                              const formDataToSend = new FormData();
                              formDataToSend.append("file", attachmentToAdd);
                              formDataToSend.append(
                                "appointmentId",
                                editingAppointment.id
                              );
                              uploadImageMutation.mutateAsync({
                                formData: formDataToSend,
                              });
                            }
                          }}
                          disabled={uploadImageMutation.isPending}
                          className="px-3 py-1.5 text-xs font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition disabled:opacity-50"
                        >
                          {uploadImageMutation.isPending ? (
                            <>
                              <Loader2 className="w-3 h-3 inline mr-1 animate-spin" />
                              Uploading...
                            </>
                          ) : (
                            <>
                              <Upload className="w-3 h-3 inline mr-1" />
                              Upload
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      onClick={() =>
                        document.getElementById("attachment").click()
                      }
                      className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-border rounded-lg bg-muted/20 hover:bg-muted/40 hover:border-primary transition cursor-pointer"
                    >
                      <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                      <p className="text-sm font-medium text-foreground">
                        Add Attachment
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Click to select an image
                      </p>
                    </div>
                  )}

                  <input
                    type="file"
                    accept="image/*"
                    id="attachment"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setAttachmentToAdd(file);
                      }
                    }}
                  />
                </div>
              </div>
            )}

            <div className="grid gap-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                placeholder="Additional notes..."
              />
            </div>
          </div>
          <DialogFooter className="flex justify-between">
            {editingAppointment && (
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
              >
                Delete
              </Button>
            )}
            <div className="flex gap-2">
              <Button
                type="submit"
                disabled={
                  !formData.patientId ||
                  !formData.doctorId ||
                  !formData.procedureId ||
                  !selectedTime
                }
              >
                {editingAppointment ? "Update" : "Schedule"} Appointment
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
