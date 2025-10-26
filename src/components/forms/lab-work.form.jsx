"use client";
import React, { useEffect } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import PatientSelect from "../patient-select";
import { emptyLabWork } from "../data";

export default function LabWorkForm({
  isDialogOpen,
  setIsDialogOpen,
  editingLabWork,
  handleSubmit,
  formData,
  setFormData,
  setEditingLabWork,
}) {
  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogContent
        className="md:max-w-1/2"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>
            {editingLabWork ? "Edit Lab Work" : "Add New Lab Work"}
          </DialogTitle>
          <DialogDescription>
            {editingLabWork
              ? "Update the lab work details below."
              : "Enter the lab work details below."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="flex gap-4">
              <div className="grid gap-2 w-full">
                <Label htmlFor="nameOfLab">Name of Lab</Label>
                <Input
                  id="nameOfLab"
                  type="text"
                  value={formData.nameOfLab || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, nameOfLab: e.target.value })
                  }
                  required
                />
              </div>

              <PatientSelect
                formData={formData}
                setFormData={setFormData}
                addedStyle="w-full"
              />
            </div>

            <div className="flex gap-4">
              <div className="grid gap-2 w-full">
                <Label htmlFor="work">Work</Label>
                <Input
                  id="work"
                  type="text"
                  value={formData.work || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, work: e.target.value })
                  }
                  required
                />
              </div>

              <div className="grid gap-2 w-full">
                <Label htmlFor="isReceived">Status</Label>
                <Select
                  value={
                    formData.isReceived === true
                      ? "received"
                      : formData.isReceived === false
                      ? "pending"
                      : ""
                  }
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      isReceived: value === "received",
                    })
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="received">Received</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex gap-4">
              {[
                { id: "dateSubmitted", label: "Date Submitted" },
                { id: "dateExpected", label: "Date Expected" },
              ].map(({ id, label }) => (
                <div className="grid gap-2 w-full" key={id}>
                  <Label htmlFor={id}>{label}</Label>
                  <Input
                    id={id}
                    type="date"
                    value={
                      formData[id]
                        ? new Date(formData[id]).toISOString().split("T")[0]
                        : ""
                    }
                    onChange={(e) =>
                      setFormData({ ...formData, [id]: e.target.value })
                    }
                    required
                  />
                </div>
              ))}
            </div>

            {/* Amount */}
            <div className="grid gap-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                value={formData.amount || ""}
                onChange={(e) =>
                  setFormData({ ...formData, amount: e.target.value })
                }
                required
              />
            </div>
          </div>

          {/* Footer */}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsDialogOpen(false);
                setEditingLabWork(null);
                setFormData(emptyLabWork);
              }}
            >
              Cancel
            </Button>
            <Button type="submit">
              {editingLabWork ? "Update" : "Add"} Lab Work
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
