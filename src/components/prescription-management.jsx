"use client";
import React, { useEffect } from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { formatDate } from "@/utils/functions";
import Loader from "./loader";
import { getPaginatedPrescriptions, updatePrescription } from "@/lib";
import { FileText } from "lucide-react";
import PrescriptionModal from "./modal/prescription.modal";

export default function PrescriptionManagement() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const [prescriptionsData, setPrescriptionsData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [pagination, setPagination] = useState({});
  const [currentPrescription, setCurrentPrescripton] = useState(null);

  const {
    data: prescriptionsDataObject = {},
    isLoading: loadingPrescriptions,
  } = useQuery({
    queryKey: ["prescriptions", currentPage, limit, search, startDate, endDate],
    queryFn: () =>
      getPaginatedPrescriptions({
        page: currentPage,
        limit,
        search,
        startDate,
        endDate,
      }),
  });

  const updateAppointmentMutation = useMutation({
    mutationFn: updatePrescription,
  });

  useEffect(() => {
    if (
      !loadingPrescriptions &&
      prescriptionsDataObject &&
      prescriptionsDataObject.data
    ) {
      setPrescriptionsData(prescriptionsDataObject.data);
      setPagination(prescriptionsDataObject.pagination);
    }
  }, [loadingPrescriptions, prescriptionsDataObject]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsDialogOpen(false);
  };

  const handleClickPrescripton = async (prescription) => {
    setIsDialogOpen(true);
    console.log(prescription);
    setCurrentPrescripton(prescription);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Prescriptions</CardTitle>
          <CardDescription></CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid gap-4">
              <Table>
                <TableHeader>
                  <TableRow className="w-full">
                    <TableHead className="w-1/10">ID</TableHead>
                    <TableHead className="w-3/10">Appointment Date</TableHead>
                    <TableHead className="w-3/10">Doctor</TableHead>
                    <TableHead className="w-2/10">Patient</TableHead>

                    <TableHead className="w-2/10"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {prescriptionsData.length > 0 &&
                    prescriptionsData.map((prescription, index) => (
                      <TableRow key={prescription._id}>
                        <TableCell>
                          {(currentPage - 1) * limit + index + 1}
                        </TableCell>
                        <TableCell>
                          {formatDate(prescription?.appointment.date)}
                        </TableCell>
                        <TableCell>
                          {prescription.appointment?.doctorId?.name}
                        </TableCell>
                        <TableCell>{prescription?.patient.name}</TableCell>

                        <TableCell
                          onClick={() => handleClickPrescripton(prescription)}
                          className="cursor-pointer"
                        >
                          <FileText />
                        </TableCell>
                      </TableRow>
                    ))}
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
          </div>
        </CardContent>
      </Card>
      <PrescriptionModal
        isDialogOpen={isDialogOpen}
        setIsDialogOpen={setIsDialogOpen}
        currentPrescription={currentPrescription}
        updateAppointmentMutation={updateAppointmentMutation}
        viewOnly={false}
      />
      {loadingPrescriptions && <Loader />}
    </div>
  );
}
