import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Calendar, FileText } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { fetchAppointments } from "@/lib";
import { statusColors } from "./data";
import Loader from "./loader";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import PrescriptionModal from "./modal/prescription.modal";

export default function ListAllAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [pagination, setPagination] = useState({});
  const [status, setStatus] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentPrescription, setCurrentPrescription] = useState(null);
  const [appointmentDetails, setAppointmentDetails] = useState(null);

  const resetPagination = () => {
    setCurrentPage(1);
    setLimit(10);
  };

  const { data: appointmentsData, isLoading } = useQuery({
    queryKey: ["appointments", currentPage, limit, status],
    queryFn: () =>
      fetchAppointments({
        page: currentPage,
        limit,
        isPaginate: true,
        status: status === "all" ? undefined : status,
      }),
    keepPreviousData: true,
  });

  useEffect(() => {
    if (appointmentsData) {
      setAppointments(appointmentsData.data);
      setPagination(appointmentsData.pagination);
    }
  }, [appointmentsData]);

  return (
    <>
      <div className="space-y-6">
        <Card>
          {" "}
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <CardTitle className="">Appointments</CardTitle>
                <CardDescription className="text-gray-600">
                  View all appointment details
                </CardDescription>
              </div>
              <div className="flex items-center gap-8 text-sm text-gray-500">
                <Select
                  value={status}
                  onValueChange={(value) => {
                    setStatus(value);
                    resetPagination();
                  }}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="missed">Missed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>Total: {appointmentsData?.total || 0}</span>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-1/16">#</TableHead>
                    <TableHead className="w-3/16">Patient</TableHead>
                    <TableHead className="w-3/16">Doctor</TableHead>
                    <TableHead className="w-2/16">Procedure</TableHead>
                    <TableHead className="w-2/16">Date</TableHead>
                    <TableHead className="w-2/16">Time</TableHead>
                    <TableHead className="w-2/16">Status</TableHead>
                    <TableHead className="w-1/16">Prescription</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {appointments.length > 0 ? (
                    appointments.map((appointment, index) => (
                      <TableRow key={appointment._id}>
                        <TableCell className="py-3">
                          {(currentPage - 1) * limit + index + 1}
                        </TableCell>
                        <TableCell className="py-3">
                          {appointment.patientId?.name || "N/A"}
                        </TableCell>
                        <TableCell className="py-3 font-medium">
                          {appointment.doctorId?.name || "N/A"}
                        </TableCell>
                        <TableCell className="py-3">
                          {appointment.procedureId?.abbr || "N/A"}
                        </TableCell>
                        <TableCell className="py-3">
                          {new Date(appointment.date).toLocaleDateString(
                            "en-US",
                            {
                              //   weekday: "short",
                              year: "2-digit",
                              month: "short",
                              day: "numeric",
                            }
                          )}
                        </TableCell>
                        <TableCell className="py-3 text-sm">
                          {appointment.startTime} - {appointment.endTime}
                        </TableCell>
                        <TableCell className="py-3">
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-sm font-medium  ${
                              statusColors[appointment?.status]
                            }`}
                          >
                            {appointment?.status.toUpperCase() || "scheduled"}
                          </span>
                        </TableCell>
                        <TableCell className="flex justify-center">
                          {appointment.prescription ? (
                            <FileText
                              onClick={() => {
                                console.log(appointment.prescription);
                                setCurrentPrescription(
                                  appointment.prescription
                                );
                                setAppointmentDetails({
                                  doctorName: appointment.doctorId?.name,
                                  patientName: appointment.patientId?.name,
                                  appointmentDate: appointment.date,
                                });
                                setIsDialogOpen(true);
                              }}
                            />
                          ) : (
                            "NA"
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center">
                        No appointments found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>

              <div className="flex flex-col text-sm md:flex-row justify-between items-center mt-4 gap-2">
                <div>
                  Page <b>{pagination.page}</b> of <b>{pagination.pages}</b>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={pagination.page <= 1}
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(prev - 1, 1))
                      }
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={pagination.page >= pagination.pages}
                      onClick={() => setCurrentPage((prev) => prev + 1)}
                    >
                      Next
                    </Button>
                  </div>
                  <div className="flex items-center gap-2">
                    <label htmlFor="limit">Rows per page:</label>
                    <select
                      id="limit"
                      value={limit}
                      onChange={(e) => {
                        setLimit(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                      className="border rounded p-1"
                    >
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <PrescriptionModal
        isDialogOpen={isDialogOpen}
        setIsDialogOpen={setIsDialogOpen}
        currentPrescription={currentPrescription}
        viewOnly={true}
        appointmentDetails={appointmentDetails}
      />
      {isLoading && <Loader />}
    </>
  );
}
