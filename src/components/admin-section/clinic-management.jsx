"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Trash2, Plus } from "lucide-react";
import { useQueryWrapper } from "../wrappers";
import { getClinicsApi } from "@/lib";
import ClinicModal from "./clinic-form-modal";

export function ClinicsTable() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedClinic, setSelectedClinic] = useState(null);

  const { data: clinicsData = [], isLoading: loadingClinics } = useQueryWrapper(
    {
      queryKey: ["clinics"],
      queryFn: getClinicsApi,
    },
  );

  const handleAddClinic = () => {
    setIsModalOpen(true);
    setSelectedClinic(null);
  };

  const handleClinicClick = (clinic) => {
    setIsModalOpen(true);
    setSelectedClinic(clinic);
  };

  console.log(clinicsData);

  return (
    <>
      <div className="mb-8">
        <Button onClick={handleAddClinic} className="gap-2">
          <Plus className="w-4 h-4" />
          Add Clinic
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-5">
        {Array.isArray(clinicsData) &&
          clinicsData?.map((clinic) => (
            <Card
              key={clinic._id}
              className="p-3 cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => handleClinicClick(clinic)}
            >
              <div className="space-y-4">
                <div className="flex justify-between">
                  <h3 className="text-lg font-semibold text-foreground truncate">
                    {clinic.name}
                  </h3>
                  <span
                    className={`px-2 py-1 rounded-full text-md font-medium ${
                      clinic.isClinicActive
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                        : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
                    }`}
                  >
                    {clinic.isClinicActive ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
            </Card>
          ))}
      </div>

      <ClinicModal
        clinic={selectedClinic}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
