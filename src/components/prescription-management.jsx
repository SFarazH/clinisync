"use client";
import React, { useEffect } from "react";

import { useState } from "react";
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
import { useQueryClient } from "@tanstack/react-query";
import { formatDate } from "@/utils/functions";
import Loader from "./loader";
import { getPaginatedPrescriptions } from "@/lib";
import { FileText } from "lucide-react";
import PrescriptionModal from "./modal/prescription.modal";
import { Pagination } from "./pagination";
import { useQueryWrapper } from "./wrappers";

export default function PrescriptionManagement() {
  // const queryClient = useQueryClient();
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
  } = useQueryWrapper({
    queryKey: ["prescriptions", currentPage, limit, search, startDate, endDate],
    queryFn: getPaginatedPrescriptions,
    params: {
      page: currentPage,
      limit,
      search,
      startDate,
      endDate,
    },
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
                          {formatDate(prescription?.appointment?.date)}
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
              <Pagination
                limit={limit}
                pagination={pagination}
                setCurrentPage={setCurrentPage}
                setLimit={setLimit}
              />
            </div>
          </div>
        </CardContent>
      </Card>
      <PrescriptionModal
        isDialogOpen={isDialogOpen}
        setIsDialogOpen={setIsDialogOpen}
        currentPrescription={currentPrescription}
        // updateAppointmentMutation={updateAppointmentMutation}
        viewOnly={true}
      />
      {loadingPrescriptions && <Loader />}
    </div>
  );
}
