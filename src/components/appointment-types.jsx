"use client";
import React from "react";
import { useState } from "react";
import { Plus, Clock, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";

const colorOptions = [
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#06b6d4",
  "#84cc16",
  "#f97316",
];

export default function AppointmentTypes({
  appointmentTypes,
  onAddAppointmentType,
  onUpdateAppointmentType,
  onDeleteAppointmentType,
}) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAppointmentType, setEditingAppointmentType] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    duration: 30,
    color: "#3b82f6",
  });

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
    setFormData({
      name: "",
      duration: 30,
      color: "#3b82f6",
    });
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
    setFormData({
      name: "",
      duration: 30,
      color: "#3b82f6",
    });
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

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {editingAppointmentType
                ? "Edit Appointment Type"
                : "Add Appointment Type"}
            </DialogTitle>
            <DialogDescription>
              {editingAppointmentType
                ? "Update the appointment type details below."
                : "Create a new appointment type with duration and color."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Type Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="e.g., General Consultation"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="duration">Duration (minutes)</Label>
                <Input
                  id="duration"
                  type="number"
                  min="5"
                  max="240"
                  step="5"
                  value={formData.duration}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      duration: Number.parseInt(e.target.value),
                    })
                  }
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label>Color</Label>
                <div className="flex gap-2 flex-wrap">
                  {colorOptions.map((color) => (
                    <button
                      key={color}
                      type="button"
                      className={`w-8 h-8 rounded-full border-2 ${
                        formData.color === color
                          ? "border-gray-900"
                          : "border-gray-300"
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => setFormData({ ...formData, color })}
                    />
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsDialogOpen(false);
                  setEditingAppointmentType(null);
                  setFormData({
                    name: "",
                    duration: 30,
                    color: "#3b82f6",
                  });
                }}
              >
                Cancel
              </Button>
              <Button type="submit">
                {editingAppointmentType ? "Update" : "Add"} Type
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
