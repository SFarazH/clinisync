"use client";
import React from "react";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import AppointmentTypeForm from "./forms/appointment-types.form";
import { emptyAppointmentType } from "./data";

export default function AppointmentTypes({
  appointmentTypes,
  onAddAppointmentType,
  onUpdateAppointmentType,
  onDeleteAppointmentType,
}) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAppointmentType, setEditingAppointmentType] = useState(null);
  const [formData, setFormData] = useState(emptyAppointmentType);

  const handleEditAppointmentType = (appointmentType) => {
    setEditingAppointmentType(appointmentType);
    setFormData({
      name: appointmentType.name,
      duration: appointmentType.duration,
      color: appointmentType.color,
    });
    setIsDialogOpen(true);
  };

  const handleDeleteAppointmentType = (appointmentTypeId) => {
    onDeleteAppointmentType(appointmentTypeId);
    toast({
      title: "Appointment Type Deleted",
      description: "The appointment type has been successfully deleted.",
    });
  };

  const handleAddNew = () => {
    setEditingAppointmentType(null);
    setFormData(emptyAppointmentType);
    setIsDialogOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingAppointmentType) {
      onUpdateAppointmentType(editingAppointmentType.id, formData);
      toast({
        title: "Appointment Type Updated",
        description: "The appointment type has been successfully updated.",
      });
    } else {
      onAddAppointmentType(formData);
      toast({
        title: "Appointment Type Added",
        description: "The new appointment type has been successfully added.",
      });
    }
    setFormData(emptyAppointmentType);
    setEditingAppointmentType(null);
    setIsDialogOpen(false);
  };

  return (
    <AppointmentTypeForm
      appointmentTypes={appointmentTypes}
      dialogState={{
        isDialogOpen,
        setIsDialogOpen,
        editingAppointmentType,
        setEditingAppointmentType,
      }}
      formState={{
        formData,
        setFormData,
        handleSubmit,
      }}
      handlers={{
        handleAddNew,
        handleEditAppointmentType,
        handleDeleteAppointmentType,
      }}
    />
  );
}
