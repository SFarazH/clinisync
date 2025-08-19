import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getPaginatedPrescriptions, updatePrescription } from "@/lib";
import { addDays, startOfDay } from "date-fns";
import { Stethoscope } from "lucide-react";
import PrescriptionModal from "./modal/prescription.modal";

export default function PharmacistDashboard() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("pending");
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [filteredPrescriptions, setFilteredPrescriptions] = useState({
    pending: [],
    delivered: [],
  });
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  const queryParams = useMemo(() => {
    const today = new Date();

    const start = startOfDay(today);
    const end = addDays(start, 1);

    return {
      startDate: start.toISOString(),
      endDate: end.toISOString(),
      limit,
      currentPage,
    };
  }, [limit, currentPage]);

  const {
    data: prescriptionsDataObject = {},
    isLoading: loadingPrescriptions,
  } = useQuery({
    queryKey: ["prescriptions", currentPage, limit],
    queryFn: () => getPaginatedPrescriptions(queryParams),
  });

  useEffect(() => {
    if (prescriptionsDataObject?.data) {
      console.log(prescriptionsDataObject.data);
      const pending = [];
      const delivered = [];

      prescriptionsDataObject.data.forEach((item) => {
        if (item.delivered) {
          delivered.push(item);
        } else {
          pending.push(item);
        }
      });

      setFilteredPrescriptions({ pending, delivered });
    }
  }, [prescriptionsDataObject]);

  const updateAppointmentMutation = useMutation({
    mutationFn: updatePrescription,
    onSuccess: () => {
      queryClient.invalidateQueries(["prescriptions"]);
      setSelectedPrescription(null);
      setIsOpen(false);
    },
  });

  const renderPrescriptions = (status) => {
    const list = filteredPrescriptions[status] || [];

    return (
      <TabsContent value={status} className="space-y-6">
        <ul className="space-y-3 mt-3">
          {list.length > 0 ? (
            list.map((pres) => (
              <li
                key={pres._id}
                className="flex items-center justify-between p-2 border rounded-md cursor-pointer hover:bg-accent"
                onClick={() => {
                  setSelectedPrescription(pres);
                  setIsOpen(true);
                }}
              >
                <div className="space-x-2">
                  <p>{pres.patient.name}</p>
                  <p className="flex items-center mt-2 gap-1.5 text-sm text-gray-500">
                    <Stethoscope height={18} width={18} />
                    {pres.appointment.doctorId.name}
                  </p>

                  <p className="text-sm flex items-center gap-2 mt-0.5">
                    {/* <Circle
                      width={15}
                      height={15}
                      color={appt.procedureId.color}
                      fill={appt.procedureId.color}
                    />
                    {appt.procedureId.name} */}
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
    <div className="space-y-6">
      <Card>
        {/* <CardHeader>
          <CardTitle className="font-medium text-xl">
          {doctorData && `Welcome ${doctorData?.data?.name}`}
          </CardTitle>
        </CardHeader> */}
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <CardHeader className="flex items-center">
                <CardTitle className="text-sm flex items-center justify-between font-medium w-full">
                  <p>Total Prescriptions</p>
                  <p className="text-xl">
                    {prescriptionsDataObject?.pagination?.total ?? 0}
                  </p>
                </CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="flex items-center">
                <CardTitle className="text-sm flex items-center justify-between font-medium w-full">
                  <p>Delivered Today</p>
                  <p className="text-xl">
                    {filteredPrescriptions?.delivered?.length ?? 0}
                  </p>
                </CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="flex items-center">
                <CardTitle className="text-sm flex items-center justify-between font-medium w-full">
                  <p>Pending Prescriptions</p>
                  <p className="text-xl">
                    {filteredPrescriptions?.pending?.length ?? 0}
                  </p>
                </CardTitle>
              </CardHeader>
            </Card>
          </div>
        </CardContent>
      </Card>
      <Card>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <CardHeader className="flex items-center justify-between">
            <CardTitle className="font-medium text-xl">Prescriptions</CardTitle>

            <TabsList className="w-1/3">
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="delivered">Delivered</TabsTrigger>
            </TabsList>
          </CardHeader>
          <CardContent>
            {renderPrescriptions("pending")}
            {renderPrescriptions("delivered")}
          </CardContent>
        </Tabs>
      </Card>
      <PrescriptionModal
        isDialogOpen={isOpen}
        setIsDialogOpen={setIsOpen}
        currentPrescription={selectedPrescription}
        updateAppointmentMutation={updateAppointmentMutation}
        viewOnly={false}
      />
    </div>
  );
}
