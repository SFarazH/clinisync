"use client";
import React from "react";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { appointmentTypeColorOptions } from "../data";

export default function AppointmentTypeForm({ dialogState, formState }) {
  const {
    isDialogOpen,
    setIsDialogOpen,
    editingAppointmentType,
    setEditingAppointmentType,
  } = dialogState;

  const { formData, setFormData, handleSubmit } = formState;

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogContent
        className="sm:max-w-[425px]"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
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
                min="15"
                max="240"
                step="15"
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
                {appointmentTypeColorOptions.map((color) => (
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
  );
}
