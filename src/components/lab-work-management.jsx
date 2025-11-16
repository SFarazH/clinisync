"use client";
import React, { useEffect } from "react";

import { useState } from "react";
import { Plus, Edit, Trash2 } from "lucide-react";
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
import { emptyLabWork } from "./data";
import { useQueryClient } from "@tanstack/react-query";
import { formatDate } from "@/utils/functions";
import {
  fetchPaginatedLabWorks,
  updateLabWork,
  deleteLabWork,
  addNewLabWork,
  markLabWorkComplete,
} from "@/lib";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import LabWorkForm from "./forms/lab-work.form";
import PatientSelect from "./patient-select";
import Loader from "./loader";
import { useDateRange } from "./context/dateRangeContext";
import { Pagination } from "./pagination";
import { useMutationWrapper, useQueryWrapper } from "./wrappers";

export default function LabWorkManagement() {
  const queryClient = useQueryClient();
  const { dateRange } = useDateRange();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState(emptyLabWork);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [receivedBool, setReceivedBool] = useState("All");
  const [labWorkData, setLabWorkData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [editingLabWork, setEditingLabWork] = useState(null);
  const [limit, setLimit] = useState(10);
  const [pagination, setPagination] = useState({});

  const { data: labWorkDataObject = {}, isLoading: loadingLabWork } =
    useQueryWrapper({
      queryKey: [
        "labWork",
        currentPage,
        limit,
        selectedPatient,
        receivedBool,
        dateRange,
      ],
      queryFn: fetchPaginatedLabWorks,
      params: {
        page: currentPage,
        limit,
        paginate: true,
        patientId: selectedPatient,
        isReceived: receivedBool === "All" ? null : receivedBool === "Received",
        startDate: dateRange?.from,
        endDate: dateRange?.to,
      },
    });

  useEffect(() => {
    if (!loadingLabWork && labWorkDataObject && labWorkDataObject.data) {
      setLabWorkData(labWorkDataObject.data);
      setPagination(labWorkDataObject.pagination);
    }
  }, [loadingLabWork, labWorkDataObject]);

  const addLabWorkMutation = useMutationWrapper({
    mutationFn: addNewLabWork,
    onSuccess: () => {
      queryClient.invalidateQueries(["labWork"]);
    },
  });

  const updateLabWorkMutation = useMutationWrapper({
    mutationFn: updateLabWork,
    onSuccess: () => {
      queryClient.invalidateQueries(["labWork"]);
      //   toast({
      //     title: "Patient Updated",
      //     description: "Patient details updated.",
      //   });
    },
  });

  const deleteLabWorkMutation = useMutationWrapper({
    mutationFn: deleteLabWork,
    onSuccess: () => {
      queryClient.invalidateQueries(["labWork"]);
    },
  });

  const markLabWorkAsReceivedMutation = useMutationWrapper({
    mutationFn: markLabWorkComplete,
    onSuccess: () => {
      queryClient.invalidateQueries(["labWork"]);
    },
  });

  const handleEditLabWork = (labWork) => {
    setEditingLabWork(labWork);
    setFormData({
      nameOfLab: labWork.nameOfLab,
      patientId: labWork.patientId,
      work: labWork.work,
      isReceived: labWork.isReceived,
      dateSubmitted: labWork.dateSubmitted,
      dateExpected: labWork.dateExpected,
      amount: labWork.amount,
    });
    setIsDialogOpen(true);
  };

  const handleMarkLabWork = (labWorkId) => {
    markLabWorkAsReceivedMutation.mutateAsync({ id: labWorkId });
  };

  const handleDeletePatient = (patientId) => {
    deleteLabWorkMutation.mutateAsync({ id: patientId });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (editingLabWork) {
      updateLabWorkMutation.mutateAsync({
        id: editingLabWork._id,
        labWorkData: formData,
      });
    } else {
      addLabWorkMutation.mutateAsync({ labWorkData: formData });
    }

    setFormData(emptyLabWork);
    setEditingLabWork(null);
    setIsDialogOpen(false);
  };

  const handleAddLabWork = () => {
    setIsDialogOpen(true);
    setFormData(emptyLabWork);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Lab Work Management</CardTitle>
              <CardDescription>Add and manage Lab Work</CardDescription>
            </div>
            <Button onClick={handleAddLabWork}>
              <Plus className="w-4 h-4 mr-2" />
              Add Lab Work
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-8">
              <PatientSelect
                setPatientId={setSelectedPatient}
                patientId={selectedPatient}
                addedStyle="mb-2 w-1/4"
              />
              <div className="grid gap-2 w-1/4 mb-2">
                <Label htmlFor="doctor">Received Status</Label>
                <Select
                  value={receivedBool}
                  onValueChange={(value) => setReceivedBool(value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {[
                      { key: null, value: "All" },
                      { key: true, value: "Received" },
                      { key: false, value: "Pending" },
                    ].map((status) => (
                      <SelectItem key={status.key} value={status.value}>
                        <div className="flex items-center gap-2">
                          {status.value}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end mb-2">
                <Button
                  variant="outline"
                  className="cursor-pointer"
                  disabled={selectedPatient === null && receivedBool === "All"}
                  onClick={() => {
                    setSelectedPatient(null);
                    setReceivedBool("All");
                  }}
                >
                  Clear
                </Button>
              </div>
            </div>
            <div className="grid gap-4">
              <Table>
                <TableHeader>
                  <TableRow className="w-full">
                    <TableHead className="w-1/18">ID</TableHead>
                    <TableHead className="w-3/18">Name</TableHead>
                    <TableHead className="w-2/18">Patient</TableHead>
                    <TableHead className="w-2/18">Lab Name</TableHead>
                    <TableHead className="w-2/18">Submitted</TableHead>
                    <TableHead className="w-2/18">Expected</TableHead>
                    <TableHead className="w-3/18">Received</TableHead>
                    <TableHead className="w-1/18"></TableHead>
                    <TableHead className="w-1/18"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {labWorkData.length > 0 ? (
                    labWorkData.map((labWork, index) => (
                      <TableRow key={labWork._id}>
                        <TableCell>
                          {(currentPage - 1) * limit + index + 1}
                        </TableCell>
                        <TableCell
                          style={{
                            whiteSpace: "normal",
                            wordWrap: "break-word",
                          }}
                        >
                          {labWork.work}
                        </TableCell>
                        <TableCell>{labWork.patientId.name}</TableCell>
                        <TableCell>{labWork.nameOfLab}</TableCell>
                        <TableCell>
                          {formatDate(labWork?.dateSubmitted)}
                        </TableCell>
                        <TableCell>
                          {formatDate(labWork?.dateExpected)}
                        </TableCell>
                        <TableCell>
                          {labWork.isReceived ? (
                            <Button
                              variant="outline"
                              className="bg-green-500 text-white hover:bg-green-500 cursor-default hover:text-white"
                            >
                              Received
                            </Button>
                          ) : (
                            <Button
                              className="cursor-pointer bg-blue-500 hover:bg-blue-600"
                              onClick={() => handleMarkLabWork(labWork._id)}
                            >
                              Mark Received
                            </Button>
                          )}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditLabWork(labWork)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeletePatient(labWork._id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={10}
                        className="text-center font-normal py-4 text-md"
                      >
                        No records found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
              <Pagination
                pagination={pagination}
                limit={limit}
                setCurrentPage={setCurrentPage}
                setLimit={setLimit}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <LabWorkForm
        isDialogOpen={isDialogOpen}
        setIsDialogOpen={setIsDialogOpen}
        formData={formData}
        handleSubmit={handleSubmit}
        setFormData={setFormData}
        editingLabWork={editingLabWork}
        setEditingLabWork={setEditingLabWork}
      />

      {(loadingLabWork ||
        updateLabWorkMutation.isPending ||
        addLabWorkMutation.isPending ||
        deleteLabWorkMutation.isPending) && <Loader />}
    </div>
  );
}
