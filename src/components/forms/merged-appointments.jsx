import { getAppointmentColor } from "@/utils/helper";
import { appointmentStatusConfig } from "../data";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../ui/dialog";

export default function MergedAppointmentsDialog({
  dialogOptions,
  data,
  handleAppointmentClick,
}) {
  const { overlappingAppointmentsDialog, setOverlappingAppointmentsDialog } =
    dialogOptions;
  const { patientsData, proceduresData, doctorsData } = data;
  return (
    <Dialog
      open={overlappingAppointmentsDialog.isOpen}
      onOpenChange={(open) =>
        setOverlappingAppointmentsDialog((prev) => ({
          ...prev,
          isOpen: open,
        }))
      }
    >
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Overlapping Appointments</DialogTitle>
          <DialogDescription>
            Multiple appointments scheduled for{" "}
            {new Date(overlappingAppointmentsDialog.date).toLocaleDateString(
              "en-US",
              {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              }
            )}{" "}
            at {overlappingAppointmentsDialog.timeSlot}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 max-h-1/2">
          {overlappingAppointmentsDialog.appointments.map((appointment) => {
            const patient = patientsData.find(
              (p) => p._id === appointment.patientId
            );
            const doctor = doctorsData.find(
              (d) => d._id === appointment.doctorId
            );
            const procedure = proceduresData.find(
              (t) => t._id === appointment.procedureId
            );
            const status = appointment.status || "scheduled";
            const StatusIcon = appointmentStatusConfig[status].icon;

            return (
              <div
                key={appointment.id}
                className="border rounded-lg p-4 space-y-2"
                style={{
                  backgroundColor:
                    status === "completed"
                      ? "#D0F0C0"
                      : status === "missed"
                      ? "#FDBCB4"
                      : "",
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{
                        backgroundColor: getAppointmentColor(
                          appointment,
                          proceduresData
                        ),
                      }}
                    />
                    <span className="font-medium">{patient?.name}</span>
                    <span title={appointmentStatusConfig[status].label}>
                      <StatusIcon />
                    </span>
                  </div>
                  <div className="text-sm text-gray-500">
                    {appointment.startTime} - {appointment.endTime}
                  </div>
                </div>

                <div className="text-sm space-y-1">
                  <div>
                    <strong>Doctor:</strong> {doctor?.name}
                  </div>
                  <div>
                    <strong>Type:</strong> {procedure?.name} (
                    {procedure?.duration} min)
                  </div>
                  {appointment.notes && (
                    <div>
                      <strong>Notes:</strong> {appointment.notes}
                    </div>
                  )}
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      console.log(appointment);
                        setOverlappingAppointmentsDialog((prev) => ({
                          ...prev,
                          isOpen: false,
                        }));
                        handleAppointmentClick(appointment);
                    }}
                  >
                    Edit
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() =>
              setOverlappingAppointmentsDialog((prev) => ({
                ...prev,
                isOpen: false,
              }))
            }
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
