import { formatDate } from "@/utils/functions";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import React, { useMemo, useState } from "react";
import { useAuth } from "../context/authcontext";
import Image from "next/image";
import { Button } from "../ui/button";
import { Check } from "lucide-react";

export default function PrescriptionModal({
  isDialogOpen,
  setIsDialogOpen,
  currentPrescription,
  updateAppointmentMutation,
  viewOnly,
  appointmentDetails = {},
}) {
  const { authUser } = useAuth();

  const { patientName, doctorName, appointmentDate } = appointmentDetails || {};

  const role = useMemo(() => authUser?.role, [authUser]);
  const [givenStatus, setGivenStatus] = useState({});

  const toggleGiven = (index) => {
    setGivenStatus((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  return (
    currentPrescription && (
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="w-full md:max-w-4xl p-6 bg-white border border-gray-300 shadow-lg rounded-lg">
          <div className="space-y-6">
            <DialogTitle>
              <div className="border-b pb-4 mt-1">
                {currentPrescription.delivered && (
                  <p className="flex items-center bg-green-200 w-fit py-1.5 px-2 rounded-2xl gap-1">
                    Delivered <Check height={22} width={22} />
                  </p>
                )}
                <div className="flex justify-between items-center">
                  <div>
                    <h1 className="text-2xl font-bold text-blue-800">
                      {currentPrescription?.appointment?.doctorId?.clinicName ||
                        "Sunrise Medical Clinic"}
                    </h1>
                    <p className="text-sm text-gray-600">
                      {currentPrescription?.appointment?.doctorId
                        ?.clinicAddress || "123 Main Street, City, State"}
                    </p>
                    <p className="text-sm text-gray-600">
                      Contact:{" "}
                      {currentPrescription?.appointment?.doctorId
                        ?.clinicContact || "+91-9876543210"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      Dr.{" "}
                      {currentPrescription?.appointment?.doctorId?.name ??
                        doctorName}
                    </p>
                    {/* <p className="text-sm text-gray-600">
                      {currentPrescription?.appointment?.doctorId
                        ?.qualification || "MBBS, MD"}
                    </p> */}
                    {/* <p className="text-sm text-gray-600">
                      Reg. No:{" "}
                      {currentPrescription?.appointment?.doctorId?.regNumber ||
                        "MC-123456"}
                    </p> */}
                  </div>
                </div>
              </div>
            </DialogTitle>

            <div className="border-b pb-3 flex justify-between text-sm">
              <div>
                <p>
                  <span className="font-semibold">Patient:</span>{" "}
                  {currentPrescription?.patient?.name ?? patientName}
                </p>
              </div>
              <div className="text-right">
                <p>
                  <span className="font-semibold">Date:</span>{" "}
                  {appointmentDate
                    ? formatDate(appointmentDate)
                    : formatDate(currentPrescription.appointment.date)}
                </p>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-3">Rx</h2>
              <div
                className={`grid ${
                  role === "pharmacist" && !currentPrescription.delivered
                    ? "grid-cols-[1fr_4fr_2fr_2fr_4fr]"
                    : "grid-cols-[4fr_2fr_2fr_4fr]"
                } gap-4 text-sm font-medium text-gray-700 min-w-[700px] border-b py-1 items-center`}
              >
                {role === "pharmacist" && !currentPrescription.delivered && (
                  <div className="text-gray-500"></div>
                )}
                <div className="text-gray-500">Medicine</div>
                <div className="text-gray-500">Frequency</div>
                <div className="text-gray-500">Duration</div>
                <div className="text-gray-500">Instructions</div>

                {currentPrescription.medications.map((medication, index) => (
                  <React.Fragment key={index}>
                    {role === "pharmacist" &&
                      !currentPrescription.delivered && (
                        <div className="flex justify-center">
                          <input
                            type="checkbox"
                            checked={!!givenStatus[index]}
                            onChange={() => toggleGiven(index)}
                            className="w-4 h-4"
                          />
                        </div>
                      )}
                    <div className="text-gray-900">
                      {medication.medicine?.medicineName}
                      <p className="text-xs text-gray-500 mt-0.5">
                        {`${medication.medicine?.shortComposition1} ${medication.medicine?.shortComposition2}`}
                      </p>
                    </div>
                    <div>{medication.frequency}</div>
                    <div>{medication.duration} days</div>
                    <div>
                      {medication.instructions || (
                        <span className="text-gray-400">—</span>
                      )}
                    </div>
                  </React.Fragment>
                ))}
              </div>
            </div>

            <div className="mt-6 flex justify-between items-end">
              {/* Notes (only show if exists) */}
              {currentPrescription.generalNotes ? (
                <div className="max-w-[70%]">
                  <h4 className="font-medium text-gray-900 mb-1">
                    Additional Notes
                  </h4>
                  <p className="text-gray-700">
                    {currentPrescription.generalNotes}
                  </p>
                </div>
              ) : (
                <div></div> // keeps flex spacing if no notes
              )}

              {/* Signature */}
              <div className="text-center">
                <Image
                  src="/demosign.jpg"
                  alt="Doctor's Signature"
                  width={150}
                  height={50}
                  className="object-contain mx-auto"
                />
                <p className="text-sm text-gray-600">Doctor's Signature</p>
              </div>
            </div>
          </div>
          {!viewOnly &&
            !currentPrescription.delivered &&
            role === "pharmacist" && (
              <div className="flex justify-end mt-2 p-0">
                <Button
                  disabled={currentPrescription.delivered}
                  onClick={() =>
                    updateAppointmentMutation.mutateAsync({
                      id: currentPrescription._id,
                      prescriptionData: {
                        delivered: true,
                      },
                    })
                  }
                  className="cursor-pointer"
                >
                  Mark as delivered
                </Button>
              </div>
            )}
        </DialogContent>
      </Dialog>
    )
  );
}
