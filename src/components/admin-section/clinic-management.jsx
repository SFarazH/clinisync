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

  const { data: clinicsDataObject = {}, isLoading: loadingClinics } =
    useQueryWrapper({
      queryKey: ["clinics"],
      queryFn: getClinicsApi,
    });

  const clinicsData = clinicsDataObject?.data ?? [];

  const handleAddClinic = () => {
    setIsModalOpen(true);
    setSelectedClinic(null);
  };

  const handleClinicClick = (clinic) => {
    setIsModalOpen(true);
    setSelectedClinic(clinic);
  };

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
              className="
          relative overflow-hidden
          cursor-pointer p-3
          transition-shadow hover:shadow-lg
        "
              onClick={() => handleClinicClick(clinic)}
            >
              {!clinic.isLiveClinic && (
                <div
                  className="
              absolute right-[-35px] top-[10px]
              rotate-45

              bg-red-500
              px-10 py-1
              text-center text-xs font-bold
              tracking-wider text-white

              shadow-md
            "
                >
                  DEMO
                </div>
              )}

              <div className="space-y-4">
                <div className="flex justify-between">
                  <div className="flex items-center gap-2">
                    <p
                      className={`w-3 h-3  rounded-full ${clinic.isClinicActive ? "bg-green-500" : "bg-red-500"}`}
                    ></p>
                    <h3 className="truncate text-lg font-semibold text-foreground">
                      {clinic.clinicName}
                    </h3>
                  </div>

                  {/* <span
                    className={`rounded-full px-2 py-1 text-md font-medium ${
                      clinic.isClinicActive
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                        : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
                    }`}
                  >
                    {clinic.isClinicActive ? "Active" : "Inactive"}
                  </span> */}
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
