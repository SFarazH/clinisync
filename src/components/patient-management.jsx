"use client";
import React, { useEffect } from "react";

import { useState } from "react";
import { Plus, Search, Edit, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import PatientForm from "./forms/patient.form";
import { emptyPatient } from "./data";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createNewPatient,
  deletePatient,
  fetchPaginatedPatients,
  updatePatient,
} from "@/lib/patientApi";
import { formatDate } from "@/utils/functions";
import Loader from "./loader";
import { Pagination } from "./pagination";

export default function PatientManagement() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);
  const [formData, setFormData] = useState(emptyPatient);

  const [patientsData, setPatientsData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [pagination, setPagination] = useState({});

  const { data: patientsDataObject = {}, isLoading: loadingPatients } =
    useQuery({
      queryKey: ["patients", currentPage, limit, search],
      queryFn: () =>
        fetchPaginatedPatients({ page: currentPage, limit, search }),
    });

  useEffect(() => {
    if (!loadingPatients && patientsDataObject && patientsDataObject.data) {
      setPatientsData(patientsDataObject.data);
      setPagination(patientsDataObject.pagination);
    }
  }, [loadingPatients, patientsDataObject]);

  const addPatientMutation = useMutation({
    mutationFn: createNewPatient,
    onSuccess: () => {
      queryClient.invalidateQueries(["patients"]);
      toast({
        title: "Patient Added",
        description: "New patient has been added.",
      });
    },
  });

  const updatePatientMutation = useMutation({
    mutationFn: updatePatient,
    onSuccess: () => {
      queryClient.invalidateQueries(["patients"]);
      toast({
        title: "Patient Updated",
        description: "Patient details updated.",
      });
    },
  });

  const deletePatientMutation = useMutation({
    mutationFn: deletePatient,
    onSuccess: () => {
      queryClient.invalidateQueries(["patients"]);
      toast({
        title: "Patient Deleted",
        description: "Patient has been deleted.",
      });
    },
  });

  const filteredPatients = patientsData.filter(
    (patient) =>
      patient?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient?.email?.toLowerCase()?.includes(searchTerm.toLowerCase())
  );

  const handleEditPatient = (patient) => {
    setEditingPatient(patient);
    setFormData({
      name: patient.name,
      email: patient.email,
      phone: patient.phone,
      age: patient.age,
      dob: patient.dob,
      gender: patient.gender,
      address: patient.address,
    });
    setIsDialogOpen(true);
  };

  const handleDeletePatient = (patientId) => {
    deletePatientMutation.mutateAsync(patientId);
  };

  const handleAddNew = () => {
    setEditingPatient(null);
    setFormData(emptyPatient);
    setIsDialogOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingPatient) {
      updatePatientMutation.mutateAsync({
        id: editingPatient._id,
        patientData: formData,
      });
      toast({
        title: "Patient Updated",
        description: "The patient information has been successfully updated.",
      });
    } else {
      addPatientMutation.mutateAsync(formData);
      toast({
        title: "Patient Added",
        description: "The new patient has been successfully added.",
      });
    }
    setFormData(emptyPatient);
    setEditingPatient(null);
    setIsDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Patient Management</CardTitle>
              <CardDescription>
                Add and manage patient information
              </CardDescription>
            </div>
            <Button onClick={handleAddNew}>
              <Plus className="w-4 h-4 mr-2" />
              Add Patient
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="relative w-1/4">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search patients..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="grid gap-4">
              <Table>
                <TableHeader>
                  <TableRow className="w-full">
                    <TableHead className="w-1/16">ID</TableHead>
                    <TableHead className="w-4/16">Name</TableHead>
                    <TableHead className="w-1/16">Age</TableHead>
                    <TableHead className="w-2/16">DOB</TableHead>
                    <TableHead className="w-4/16">Email</TableHead>
                    <TableHead className="w-2/16">Phone</TableHead>
                    <TableHead className="w-1/16"></TableHead>
                    <TableHead className="w-1/16"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPatients.length > 0 &&
                    filteredPatients.map((patient, index) => (
                      <TableRow key={patient._id}>
                        <TableCell>
                          {(currentPage - 1) * limit + index + 1}
                        </TableCell>
                        <TableCell>{patient.name}</TableCell>
                        <TableCell>{patient?.age}</TableCell>
                        <TableCell>{formatDate(patient?.dob)}</TableCell>
                        <TableCell>{patient.email}</TableCell>
                        <TableCell>{patient?.phone}</TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              handleEditPatient(patient);
                            }}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeletePatient(patient._id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
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

      <PatientForm
        isDialogOpen={isDialogOpen}
        setIsDialogOpen={setIsDialogOpen}
        editingPatient={editingPatient}
        handleSubmit={handleSubmit}
        formData={formData}
        setFormData={setFormData}
        setEditingPatient={setEditingPatient}
        resetForm={() => setFormData(emptyPatient)}
      />
      {(loadingPatients ||
        addPatientMutation.isPending ||
        updatePatientMutation.isPending ||
        deletePatientMutation.isPending) && <Loader />}
    </div>
  );
}
