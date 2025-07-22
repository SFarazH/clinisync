"use client";
import React from "react";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import AppointmentTypeForm from "./forms/appointment-types.form";
import { emptyAppointmentType } from "./data";
import { Button } from "./ui/button";
import { Clock, Edit, Plus, Trash2 } from "lucide-react";

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
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Appointment Types</CardTitle>
              <CardDescription>
                Manage different types of appointments and their durations
              </CardDescription>
            </div>
            <Button onClick={handleAddNew}>
              <Plus className="w-4 h-4 mr-2" />
              Add Type
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {appointmentTypes.map((type) => (
              <Card key={type.id}>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-4">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: type.color }}
                    />
                    <div className="flex-1">
                      <h3 className="font-medium">{type.name}</h3>
                      <div className="flex items-center text-sm text-muted-foreground mt-1">
                        <Clock className="w-4 h-4 mr-1" />
                        {type.duration} minutes
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditAppointmentType(type)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteAppointmentType(type.id)}
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
      <AppointmentTypeForm
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
      />
    </div>
  );
}
