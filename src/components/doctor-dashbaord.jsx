"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import {
  addPrescription,
  fetchAppointments,
  fetchDoctorById,
  updatePrescription,
} from "@/lib";
import { useAuth } from "./context/authcontext";
import { useQueryClient } from "@tanstack/react-query";
import Loader from "./loader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import AppointmentDetailsModal from "./modal/appointment.modal";
import { Circle } from "lucide-react";
import { useMutationWrapper, useQueryWrapper } from "./wrappers";

export default function DoctorDashboard() {
  const { authUser, authClinic } = useAuth();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState("upcoming");
  const [appointments, setAppointments] = useState({
    upcoming: [],
    completed: [],
  });
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = (appt) => {
    setSelectedAppointment(appt);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedAppointment(null);
  };

  const { data: doctorData, isLoading: loadingDoctor } = useQueryWrapper({
    queryKey: ["procedures", authUser?.id],
    queryFn: fetchDoctorById,
    params: { id: authUser.id },
    enabled: !!authUser?.id,
  });

  const queryParams = useMemo(() => {
    const today = new Date();
    const start = new Date(today.setHours(0, 0, 0, 0));
    const end = new Date(start);
    end.setDate(end.getDate() + 1);

    return {
      startDate: start.toISOString(),
      endDate: end.toISOString(),
      doctorId: doctorData?.data?._id,
      isPaginate: false,
    };
  }, [doctorData]);

  const { data: appointmentsData = [], isLoading: loadingAppointments } =
    useQueryWrapper({
      queryKey: ["appointments", queryParams],
      queryFn: fetchAppointments,
      params: queryParams,
      enabled:
        !!queryParams &&
        !!queryParams.startDate &&
        !!queryParams.endDate &&
        !!doctorData,
    });

  const addPrescriptionMutation = useMutationWrapper({
    mutationFn: addPrescription,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["appointments", queryParams, authClinic?.databaseName],
        exact: true,
      });
      handleCloseModal();
    },
  });

  const updatePrescriptionMutation = useMutationWrapper({
    mutationFn: updatePrescription,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["appointments", queryParams, authClinic?.databaseName],
        exact: true,
      });
      handleCloseModal();
    },
  });

  useEffect(() => {
    if (appointmentsData.length > 0) {
      const upcoming = [];
      const completed = [];

      appointmentsData.forEach((appt) => {
        if (appt.status === "completed") {
          completed.push(appt);
        } else if (appt.status === "scheduled") {
          upcoming.push(appt);
        }
      });

      setAppointments({ upcoming, completed });
    }
  }, [appointmentsData]);

  const renderAppointments = (status) => {
    const list = appointments[status] || [];

    return (
      <TabsContent value={status} className="space-y-6">
        <ul className="space-y-3 mt-3">
          {list.length > 0 ? (
            list.map((appt) => (
              <li
                key={appt._id}
                className="flex items-center justify-between p-2 border rounded-md cursor-pointer hover:bg-accent"
                onClick={() => handleOpenModal(appt)}
              >
                <div className="space-x-2">
                  <span className="font-medium">{appt.startTime} -</span>
                  <span>{appt.patientId.name}</span>

                  <p className="text-sm flex items-center gap-2 mt-0.5">
                    <Circle
                      width={15}
                      height={15}
                      color={appt.procedureId.color}
                      fill={appt.procedureId.color}
                    />
                    {appt.procedureId.name}
                  </p>
                </div>
              </li>
            ))
          ) : (
            <p className="text-sm text-gray-500">No {status} appointments.</p>
          )}
        </ul>
      </TabsContent>
    );
  };

  return (
    <>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="font-medium text-xl">
              {doctorData && `Welcome ${doctorData?.data?.name}`}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6 md:grid-cols-4">
              <Card className="bg-sky-100">
                <CardHeader className="flex items-center">
                  <CardTitle className="text-sm flex items-center justify-between font-medium w-full">
                    <p>Appts Today</p>
                    <p className="text-xl">{appointmentsData?.length}</p>
                  </CardTitle>
                </CardHeader>
              </Card>
              <Card className="bg-green-100">
                <CardHeader className="flex items-center">
                  <CardTitle className="text-sm flex items-center justify-between font-medium w-full">
                    <p>Completed</p>
                    <p className="text-xl">{appointments.completed.length}</p>
                  </CardTitle>
                </CardHeader>
              </Card>
              <Card className="bg-orange-100">
                <CardHeader className="flex items-center">
                  <CardTitle className="text-sm flex items-center justify-between font-medium w-full">
                    <p>Upcoming</p>
                    <p className="text-xl">{appointments.upcoming.length}</p>
                  </CardTitle>
                </CardHeader>
              </Card>
              <Card className="bg-red-100">
                <CardHeader className="flex items-center">
                  <CardTitle className="text-sm flex items-center justify-between font-medium w-full">
                    <p>Next Appt</p>
                    <p className="text-xl">
                      {appointments.upcoming[0]?.startTime ?? ":)"}
                    </p>
                  </CardTitle>
                </CardHeader>
              </Card>
            </div>
          </CardContent>
        </Card>
        <Card>
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <CardHeader className="flex items-center justify-between">
              <CardTitle className="font-medium text-xl">
                Appointments
              </CardTitle>

              <TabsList className="w-1/3">
                <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
              </TabsList>
            </CardHeader>

            <CardContent>
              {renderAppointments("upcoming")}
              {renderAppointments("completed")}
            </CardContent>
          </Tabs>
        </Card>
      </div>
      <AppointmentDetailsModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        appointment={selectedAppointment}
        addPrescriptionMutation={addPrescriptionMutation}
        updatePrescriptionMutation={updatePrescriptionMutation}
      />

      {(loadingAppointments || loadingDoctor) && <Loader />}
    </>
  );
}
