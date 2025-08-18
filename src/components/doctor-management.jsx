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
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addNewDoctor, deleteDoctor, fetchDoctors, updateDoctor } from "@/lib";
import Loader from "./loader";

export default function DoctorManagement() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState(null);
  const [formData, setFormData] = useState(emptyDoctor);

  const { data: doctorsData = [], isLoading: loadingDoctors } = useQuery({
    queryKey: ["doctors"],
    queryFn: fetchDoctors,
  });

  const addDoctorMutation = useMutation({
    mutationFn: addNewDoctor,
    onSuccess: () => {
      queryClient.invalidateQueries(["doctors"]);
    },
  });

  const updateDoctorMutation = useMutation({
    mutationFn: updateDoctor,
    onSuccess: () => {
      queryClient.invalidateQueries(["doctors"]);
    },
  });

  const deleteDoctorMutation = useMutation({
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
      phone: doctor.phone,
      color: doctor.color,
    });
    setIsDialogOpen(true);
  };

  const handleDeleteDoctor = (doctorId) => {
    deleteDoctorMutation.mutateAsync(doctorId);
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
      addDoctorMutation.mutateAsync(formData);
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
              <Card key={doctor._id}>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-4">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: doctor.color }}
                    >
                      <Stethoscope className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <h3 className="font-medium">{doctor.name}</h3>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p className="font-medium text-blue-600">
                          {doctor?.specialization}
                        </p>
                        <p>{doctor?.email}</p>
                        <p>{doctor?.phone}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
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
