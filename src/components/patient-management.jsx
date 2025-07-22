"use client";
import React from "react";

import { useState } from "react";
import { Plus, Search, Edit, Trash2 } from "lucide-react";
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

export default function PatientManagement({
  patients,
  onAddPatient,
  onUpdatePatient,
  onDeletePatient,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);
  const [formData, setFormData] = useState(emptyPatient);

  const filteredPatients = patients.filter(
    (patient) =>
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.phone.includes(searchTerm)
  );

  const handleEditPatient = (patient) => {
    setEditingPatient(patient);
    setFormData({
      name: patient.name,
      email: patient.email,
      phone: patient.phone,
      age: patient.age,
      dateOfBirth: patient.dateOfBirth,
      address: patient.address,
    });
    setIsDialogOpen(true);
  };

  const handleDeletePatient = (patientId) => {
    onDeletePatient(patientId);
    toast({
      title: "Patient Deleted",
      description: "The patient has been successfully deleted.",
    });
  };

  const handleAddNew = () => {
    setEditingPatient(null);
    setFormData(emptyPatient);
    setIsDialogOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingPatient) {
      onUpdatePatient(editingPatient.id, formData);
      toast({
        title: "Patient Updated",
        description: "The patient information has been successfully updated.",
      });
    } else {
      onAddPatient(formData);
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
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search patients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="grid gap-4">
              <Table>
                <TableHeader>
                  <TableRow className="w-full">
                    <TableHead className="w-1/14">ID</TableHead>
                    <TableHead className="w-4/14">Name</TableHead>
                    <TableHead className="w-1/14">Age</TableHead>
                    <TableHead className="w-2/14">DOB</TableHead>
                    <TableHead className="w-4/14">Email</TableHead>
                    <TableHead className="w-1/14"></TableHead>
                    <TableHead className="w-1/14"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPatients.length > 0 &&
                    filteredPatients.map((patient, index) => (
                      <TableRow key={patient.id}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>{patient.name}</TableCell>
                        <TableCell>{patient?.age}</TableCell>
                        <TableCell>{patient?.dateOfBirth}</TableCell>
                        <TableCell>{patient.email}</TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditPatient(patient)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeletePatient(patient.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
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
    </div>
  );
}
