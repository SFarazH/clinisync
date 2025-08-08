"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { fetchAppointments, fetchDoctorById } from "@/lib";
import { useAuth } from "./context/authcontext";
import { useQuery } from "@tanstack/react-query";
import Loader from "./loader";
import { Tabs } from "@radix-ui/react-tabs";
import { TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Button } from "./ui/button";
import AppointmentDetailsModal from "./modal/appointment.modal";

export default function DoctorDashboard() {
  const { authUser } = useAuth();

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

  const { data: doctorData, isLoading: loadingDoctor } = useQuery({
    queryKey: ["procedures", authUser?.id],
    queryFn: () => fetchDoctorById(authUser.id),
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
      doctorId: doctorData?._id,
      isPaginate: false,
    };
  }, [doctorData]);

  const { data: appointmentsData = [], isLoading: loadingAppointments } =
    useQuery({
      queryKey: ["appointments", queryParams],
      queryFn: () => {
        return fetchAppointments(queryParams);
      },
      enabled:
        !!queryParams && !!queryParams.startDate && !!queryParams.endDate,
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

  useEffect(() => {
    console.log(appointments);
  }, [appointments]);

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
            <div className="grid gap-6 md:grid-cols-3">
              <Card>
                <CardHeader className="flex items-center">
                  <CardTitle className="text-sm flex items-center justify-between font-medium w-full">
                    <p>My Appointments Today</p>
                    <p className="text-xl">6</p>
                  </CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="flex items-center">
                  <CardTitle className="text-sm flex items-center justify-between font-medium w-full">
                    <p>My Appointments Today</p>
                    <p className="text-xl">6</p>
                  </CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="flex items-center">
                  <CardTitle className="text-sm flex items-center justify-between font-medium w-full">
                    <p>My Appointments Today</p>
                    <p className="text-xl">6</p>
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
              <TabsContent value="upcoming" className="space-y-6">
                <ul className="space-y-3 mt-3">
                  {appointments.upcoming.length > 0 &&
                    appointments.upcoming.map((appt) => {
                      return (
                        <li
                          key={appt._id}
                          className="flex items-center justify-between p-2 border rounded-md cursor-pointer hover:bg-accent"
                          onClick={() => handleOpenModal(appt)}
                        >
                          <div className="space-x-2">
                            <span className="font-medium">
                              {appt.startTime} -
                            </span>
                            <span>{appt.patientId.name}</span>
                            <p className="text-sm">{appt.procedureId.name}</p>
                          </div>
                          {/* <Button  size="sm">
                            View Prescription
                          </Button> */}
                        </li>
                      );
                    })}
                </ul>
              </TabsContent>
              <TabsContent value="completed" className="space-y-6">
                Completed
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>
      </div>
      {loadingDoctor && <Loader />}
      <AppointmentDetailsModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        appointment={selectedAppointment}
      />
    </>
  );
}
