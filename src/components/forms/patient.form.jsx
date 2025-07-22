"use client";
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function PatientForm({
  isDialogOpen,
  setIsDialogOpen,
  editingPatient,
  handleSubmit,
  formData,
  setFormData,
  setEditingPatient,
  resetForm,
}) {
  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogContent
        className="sm:max-w-[425px]"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>
            {editingPatient ? "Edit Patient" : "Add New Patient"}
          </DialogTitle>
          <DialogDescription>
            {editingPatient
              ? "Update the patient's information below."
              : "Enter the patient's information below."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {[
              { id: "name", label: "Full Name", type: "text" },
              { id: "email", label: "Email", type: "email" },
              { id: "phone", label: "Phone", type: "text" },
              { id: "age", label: "Age", type: "number" },
              { id: "dateOfBirth", label: "Date of Birth", type: "date" },
              { id: "address", label: "Address", type: "text" },
            ].map(({ id, label, type }) => (
              <div className="grid gap-2" key={id}>
                <Label htmlFor={id}>{label}</Label>
                <Input
                  id={id}
                  type={type}
                  value={formData[id]}
                  onChange={(e) =>
                    setFormData({ ...formData, [id]: e.target.value })
                  }
                  required={id === "name" || id === "dateOfBirth"}
                />
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsDialogOpen(false);
                setEditingPatient(null);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button type="submit">
              {editingPatient ? "Update" : "Add"} Patient
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
