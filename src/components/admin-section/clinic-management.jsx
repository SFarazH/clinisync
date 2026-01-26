"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Trash2, Plus } from "lucide-react";
import { AddClinicModal } from "./add-clinic-modal";
import { EditClinicModal } from "./edit-clinic-modal";

const DUMMY_CLINICS = [
  {
    _id: "1",
    name: "Green Valley Medical Center",
    owner: "Dr. John Smith",
    databaseName: "gv_medical_db",
    plan: "pro",
    features: {
      labWork: true,
      billing: true,
      prescriptions: true,
    },
    isTrialActive: false,
    isClinicActive: true,
    createdAt: "2024-01-15",
  },
  {
    _id: "2",
    name: "Riverside Clinic",
    owner: "Dr. Sarah Johnson",
    databaseName: "riverside_clinic_db",
    plan: "basic",
    features: {
      labWork: false,
      billing: false,
      prescriptions: true,
    },
    isTrialActive: true,
    isClinicActive: true,
    createdAt: "2024-02-20",
  },
  {
    _id: "3",
    name: "Central Health Services",
    databaseName: "central_health_db",
    plan: "pro",
    features: {
      labWork: true,
      billing: true,
      prescriptions: true,
    },
    isTrialActive: false,
    isClinicActive: false,
    createdAt: "2023-12-01",
  },
];

export function ClinicsTable() {
  const [clinics, setClinics] = useState(DUMMY_CLINICS);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingClinic, setEditingClinic] = useState(null);

  const handleAddClinic = (newClinic) => {
    const clinic = {
      ...newClinic,
      _id: String(clinics.length + 1),
      createdAt: new Date().toISOString().split("T")[0],
    };
    setClinics([...clinics, clinic]);
    setIsAddModalOpen(false);
  };

  const handleUpdateClinic = (updatedClinic) => {
    setClinics(
      clinics.map((c) => (c._id === updatedClinic._id ? updatedClinic : c))
    );
    setEditingClinic(null);
  };

  const handleDeleteClinic = (id) => {
    if (confirm("Are you sure you want to delete this clinic?")) {
      setClinics(clinics.filter((c) => c._id !== id));
    }
  };

  return (
    <>
      <div className="mb-8">
        <Button onClick={() => setIsAddModalOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Add Clinic
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {clinics.map((clinic) => (
          <Card
            key={clinic._id}
            className="p-6 cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => setEditingClinic(clinic)}
          >
            <div className="space-y-4">
              {/* Clinic Header */}
              <div>
                <h3 className="text-lg font-semibold text-foreground truncate">
                  {clinic.name}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {clinic.owner || "No owner assigned"}
                </p>
              </div>

              {/* Status Badges */}
              <div className="flex flex-wrap gap-2">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    clinic.plan === "pro"
                      ? "bg-primary/10 text-primary"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {clinic.plan.charAt(0).toUpperCase() + clinic.plan.slice(1)}
                </span>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    clinic.isClinicActive
                      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                      : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
                  }`}
                >
                  {clinic.isClinicActive ? "Active" : "Inactive"}
                </span>
                {clinic.isTrialActive && (
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100">
                    Trial Active
                  </span>
                )}
              </div>

              {/* Database Info */}
              <div className="text-sm border-t pt-3">
                <p className="text-muted-foreground">
                  <span className="font-medium">Database:</span>{" "}
                  {clinic.databaseName}
                </p>
              </div>

              {/* Features */}
              <div className="text-sm border-t pt-3">
                <p className="font-medium text-foreground mb-2">Features:</p>
                <ul className="space-y-1 text-muted-foreground">
                  <li>{clinic.features.labWork ? "✓" : "✗"} Lab Work</li>
                  <li>{clinic.features.billing ? "✓" : "✗"} Billing</li>
                  <li>
                    {clinic.features.prescriptions ? "✓" : "✗"} Prescriptions
                  </li>
                </ul>
              </div>

              {/* Delete Button */}
              <div className="flex gap-2 pt-2 border-t">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteClinic(clinic._id);
                  }}
                  className="gap-2 w-full"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <AddClinicModal
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        onAdd={handleAddClinic}
      /> 
      {editingClinic && (
        <EditClinicModal
          clinic={editingClinic}
          open={!!editingClinic}
          onOpenChange={(open) => !open && setEditingClinic(null)}
          onUpdate={handleUpdateClinic}
        />
      )}
    </>
  ); 
}
