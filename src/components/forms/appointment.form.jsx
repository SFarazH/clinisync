import { ChevronsUpDown } from "lucide-react";
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

export default function AppointmentForm({
  dialogOptions,
  handleSubmit,
  handleDelete,
  popoverOptions,
  formDetails,
  data,
}) {
  const { isDialogOpen, setIsDialogOpen } = dialogOptions;
  const { open, setOpen } = popoverOptions;
  const {
    patientsData,
    doctorsData,
    proceduresData,
    formData,
    setFormData,
    timeOptions,
  } = data;
  const {
    selectedDate,
    selectedTime,
    setSelectedDate,
    setSelectedTime,
    isFromCalendarSlot,
    setIsFromCalendarSlot,
    editingAppointment,
    setEditingAppointment,
    errorMessage,
    setErrorMessage,
  } = formDetails;
  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogContent className="sm:max-w-[425px]">
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

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="patient">Patient</Label>
              <Popover open={open} onOpenChange={setOpen} className="w-full">
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between font-normal"
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
                            {patient.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            <div className="grid gap-2">
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
                  {doctorsData.map((doctor) => (
                    <SelectItem key={doctor._id} value={doctor._id}>
                      <div className="flex items-center gap-2">
                        {doctor.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="procedure">Appointment Type</Label>
              <Select
                value={formData.procedureId}
                onValueChange={(value) =>
                  setFormData({ ...formData, procedureId: value })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select appointment type" />
                </SelectTrigger>
                <SelectContent>
                  {proceduresData.map((type) => (
                    <SelectItem key={type._id} value={type._id}>
                      {type.name} ({type.duration} min)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {editingAppointment && (
              <div className="grid gap-2">
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
                    {Object.entries(appointmentStatusConfig).map(([status, config]) => {
                      const IconComponent = config.icon;
                      return (
                        <SelectItem key={status} value={status}>
                          <div className="flex items-center gap-2">
                            <IconComponent className="w-4 h-4" />
                            {config.label}
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
            )}

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
              <>
                <div className="grid gap-2">
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    required
                  />
                </div>

                <div className="grid gap-2">
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
              </>
            )}

            <div className="grid gap-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
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
                type="button"
                variant="outline"
                onClick={() => {
                  setIsDialogOpen(false);
                  setEditingAppointment(null);
                  setFormData(emptyAppointment);
                  setErrorMessage("");
                  setIsFromCalendarSlot(false);
                }}
              >
                Cancel
              </Button>
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
