"use client";

import React from "react";
import { useState } from "react";
import { Plus, Edit, Trash2, Stethoscope } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { emptyDoctor } from "./data";
import DoctorForm from "./forms/doctor.form";
import { useQueryClient } from "@tanstack/react-query";
import { addNewDoctor, deleteDoctor, fetchDoctors, updateDoctor } from "@/lib";
import Loader from "./loader";
import { useMutationWrapper, useQueryWrapper } from "./wrappers";

export default function DoctorManagement() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState(null);
  const [formData, setFormData] = useState(emptyDoctor);

  const { data: doctorsData = [], isLoading: loadingDoctors } = useQueryWrapper(
    {
      queryKey: ["doctors"],
      queryFn: fetchDoctors,
    }
  );

  const addDoctorMutation = useMutationWrapper({
    mutationFn: addNewDoctor,
    onSuccess: () => {
      queryClient.invalidateQueries(["doctors"]);
    },
  });

  const updateDoctorMutation = useMutationWrapper({
    mutationFn: updateDoctor,
    onSuccess: () => {
      queryClient.invalidateQueries(["doctors"]);
    },
  });

  const deleteDoctorMutation = useMutationWrapper({
    mutationFn: deleteDoctor,
    onSuccess: () => {
      queryClient.invalidateQueries(["doctors"]);
    },
  });

  const handleEditDoctor = (doctor) => {
    setEditingDoctor(doctor);
    setFormData({
      name: doctor.name,
      specialization: doctor.specialization,
      email: doctor.email,
      phoneNumber: doctor.phoneNumber,
      color: doctor.color,
    });
    setIsDialogOpen(true);
  };

  const handleDeleteDoctor = (doctorId) => {
    deleteDoctorMutation.mutateAsync({ id: doctorId });
  };

  const handleAddNew = () => {
    setEditingDoctor(null);
    setFormData(emptyDoctor);
    setIsDialogOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingDoctor) {
      updateDoctorMutation.mutateAsync({
        id: editingDoctor._id,
        doctorData: formData,
      });
    } else {
      addDoctorMutation.mutateAsync({ doctorData: formData });
      toast({
        title: "Doctor Added",
        description: "The new doctor has been successfully added.",
      });
    }
    setFormData(emptyDoctor);
    setEditingDoctor(null);
    setIsDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Doctor Management</CardTitle>
              <CardDescription>
                Add and manage doctor information
              </CardDescription>
            </div>
            <Button onClick={handleAddNew}>
              <Plus className="w-4 h-4 mr-2" />
              Add Doctor
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {doctorsData.map((doctor) => (
              <Card key={doctor._id} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: doctor.color }}
                      >
                        <Stethoscope className="w-5 h-5 text-white" />
                      </div>
                      <div className="sm:hidden flex-1 min-w-0">
                        <h3 className="font-medium truncate">{doctor.name}</h3>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0 space-y-1">
                      <h3 className="font-medium truncate hidden sm:block">{doctor.name}</h3>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p className="font-medium text-blue-600 truncate">
                          {doctor?.specialization}
                        </p>
                        <p className="truncate">{doctor?.email}</p>
                        <p className="truncate">{doctor?.phoneNumber}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 flex-shrink-0 self-end sm:self-center">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditDoctor(doctor)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteDoctor(doctor._id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
      <DoctorForm
        dialogOptions={{ isDialogOpen, setIsDialogOpen }}
        form={{ formData, setFormData, handleSubmit }}
        doctorOptions={{ editingDoctor, setEditingDoctor }}
      />
      {(loadingDoctors ||
        addDoctorMutation.isPending ||
        deleteDoctorMutation.isPending ||
        updateDoctorMutation.isPending) && <Loader />}
    </div>
  );
}
