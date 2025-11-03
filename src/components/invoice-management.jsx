"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Plus, Search } from "lucide-react";
import { useState, useMemo, useCallback, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PaymentModal from "./modal/payment.modal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { formatDOB } from "@/utils/helper";
import Loader from "./loader";
import { addPaymentToInvoiceApi, getInvocies } from "@/lib";
import PatientSelect from "./patient-select";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Label } from "./ui/label";
import { DateRangePicker } from "./date-picker";

export default function InvoiceManagement() {
  const queryClient = useQueryClient();

  const [invoiceType, setInvoiceType] = useState("appointment");

  const [invoicesData, setInvoicesData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [pagination, setPagination] = useState({});
  const [patientId, setPatientId] = useState(null);
  const [isPaymentComplete, setIsPaymentComplete] = useState("All");

  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const { data: invoicesDataObject = {}, isLoading: loadingInvoices } =
    useQuery({
      queryKey: [
        "invoices",
        invoiceType,
        currentPage,
        limit,
        isPaymentComplete,
        patientId,
      ],
      queryFn: async () =>
        getInvocies({
          page: currentPage,
          invoiceType: invoiceType,
          isPaymentComplete:
            isPaymentComplete === "All"
              ? null
              : isPaymentComplete === "Completed",
          paginate: true,
          patientId: patientId,
        }),
    });

  const addPaymentMutation = useMutation({
    mutationFn: addPaymentToInvoiceApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
    },
  });

  useEffect(() => {
    if (!loadingInvoices && invoicesDataObject.data) {
      setInvoicesData(invoicesDataObject.data);
      setPagination(invoicesDataObject.pagination);
    }
  }, [loadingInvoices, invoicesDataObject]);

  const handleOpenPaymentModal = useCallback((invoice) => {
    setSelectedInvoice(invoice);
    setIsPaymentModalOpen(true);
  }, []);

  const handleClosePaymentModal = useCallback(() => {
    setIsPaymentModalOpen(false);
    setSelectedInvoice(null);
  }, []);

  const stats = useMemo(() => {
    const total = invoicesData?.reduce((sum, inv) => sum + inv.totalAmount, 0);
    const paid = invoicesData?.reduce((sum, inv) => sum + inv.amountPaid, 0);
    const pending = total - paid;

    return { total, paid, pending };
  }, [invoicesData]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Invoice Management</h1>
          <p className="text-muted-foreground">
            Track and manage all invoices and payments
          </p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          New Invoice
        </Button>
      </div>

      {/* <div className="grid gap-6 md:grid-cols-3">
        <Card className="bg-blue-50">
          <CardHeader className="flex items-center">
            <CardTitle className="text-md flex items-center justify-between font-medium w-full">
              <p>Total Amount</p>
              <p className="text-xl font-bold">
                ₹{stats.total.toLocaleString()}
              </p>
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="bg-green-50">
          <CardHeader className="flex items-center">
            <CardTitle className="text-md flex items-center justify-between font-medium w-full">
              <p>Amount Paid</p>
              <p className="text-xl font-bold">
                ₹{stats.paid.toLocaleString()}
              </p>
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="bg-orange-50">
          <CardHeader className="flex items-center">
            <CardTitle className="text-md flex items-center justify-between font-medium w-full">
              <p>Pending</p>
              <p className="text-xl font-bold">
                ₹{stats.pending.toLocaleString()}
              </p>
            </CardTitle>
          </CardHeader>
        </Card>
      </div> */}

      <Card className="shadow-md border rounded-2xl">
        <CardHeader>
          <div className="flex items-center justify-between mb-4">
            <CardTitle className="text-xl">Invoices</CardTitle>
          </div>

          <div className="flex gap-8">
            <PatientSelect
              patientId={patientId}
              setPatientId={setPatientId}
              addedStyle="mb-2 w-1/4"
            />
            <div className="grid gap-2 w-1/4 mb-2">
              <Label htmlFor="isPaymentComplete">Payment Status</Label>
              <Select
                value={isPaymentComplete}
                onValueChange={(value) => setIsPaymentComplete(value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {[
                    { key: null, value: "All" },
                    { key: true, value: "Completed" },
                    { key: false, value: "Pending" },
                  ].map((status) => (
                    <SelectItem key={status.key} value={status.value}>
                      <div className="flex items-center gap-2">
                        {status.value}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end mb-2">
              <Button
                variant="outline"
                className="cursor-pointer"
                disabled={patientId === null && isPaymentComplete === "All"}
                onClick={() => {
                  setPatientId(null);
                  setIsPaymentComplete("All");
                }}
              >
                Clear
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs
            value={invoiceType}
            onValueChange={(e) => {
              setInvoiceType(e);
              setInvoicesData([]);
            }}
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="appointment">Appointments</TabsTrigger>
              <TabsTrigger value="labWork">Lab Work</TabsTrigger>
            </TabsList>

            <TabsContent value={invoiceType} className="mt-6">
              <Table>
                <TableHeader>
                  {invoiceType === "appointment" ? (
                    <TableRow className="bg-gray-50">
                      <TableHead className="w-2/14">Patient</TableHead>
                      <TableHead className="w-2/14">Total Amount</TableHead>
                      <TableHead className="w-3/14">Payment Progress</TableHead>
                      <TableHead className="w-2/14">Status</TableHead>
                      <TableHead className="w-2/14">Date</TableHead>
                      <TableHead className="w-2/14">Appt Date</TableHead>
                      <TableHead className="w-1/14"></TableHead>
                    </TableRow>
                  ) : (
                    <TableRow className="bg-gray-50">
                      <TableHead className="w-2/14">Patient</TableHead>
                      <TableHead className="w-2/14">Lab</TableHead>
                      <TableHead className="w-2/14">Total Amount</TableHead>
                      <TableHead className="w-3/14">Paid Amount</TableHead>
                      <TableHead className="w-2/14">Status</TableHead>
                      <TableHead className="w-2/14">Date</TableHead>
                      <TableHead className="w-1/14"></TableHead>
                    </TableRow>
                  )}
                </TableHeader>
                <TableBody>
                  {invoicesData?.length > 0 ? (
                    invoicesData?.map((invoice) => {
                      const progressPercent = (
                        (invoice.amountPaid / invoice.totalAmount) *
                        100
                      ).toFixed(0);

                      return (
                        <TableRow
                          key={invoice._id}
                          className="hover:bg-muted/50 transition"
                        >
                          <TableCell className="font-medium">
                            <div>
                              <p className="font-semibold">
                                {invoice.patientId?.name}
                              </p>
                            </div>
                          </TableCell>
                          {invoiceType === "labWork" && (
                            <TableCell>{invoice.labWork?.nameOfLab}</TableCell>
                          )}
                          <TableCell className="font-semibold">
                            ₹{invoice.totalAmount.toLocaleString()}
                          </TableCell>
                          <TableCell>
                            ₹{invoice?.amountPaid.toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <span
                              className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-full ${
                                invoice.isPaymentComplete
                                  ? "bg-green-100 text-green-800"
                                  : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {invoice.isPaymentComplete
                                ? "Completed"
                                : "Pending"}
                            </span>
                          </TableCell>
                          <TableCell className="text-sm">
                            {formatDOB(invoice?.createdAt)}
                          </TableCell>
                          {invoiceType === "appointment" && (
                            <TableCell>
                              {invoice?.appointmentDate
                                ? formatDOB(invoice?.appointmentDate)
                                : "NA"}
                            </TableCell>
                          )}
                          <TableCell>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleOpenPaymentModal(invoice)}
                            >
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-6">
                        No invoices found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
              <div className="flex flex-col text-sm md:flex-row justify-between items-center mt-6 gap-2">
                <div>
                  Page <b>{pagination?.page}</b> of <b>{pagination?.pages}</b>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={pagination?.page <= 1}
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(prev - 1, 1))
                      }
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={pagination?.page >= pagination?.pages}
                      onClick={() => setCurrentPage((prev) => prev + 1)}
                    >
                      Next
                    </Button>
                  </div>
                  <div className="flex items-center gap-2">
                    <label htmlFor="limit">Rows per page:</label>
                    <select
                      id="limit"
                      value={limit}
                      onChange={(e) => {
                        setLimit(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                      className="border rounded p-1"
                    >
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                    </select>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={handleClosePaymentModal}
        invoice={selectedInvoice}
        addPaymentMutation={addPaymentMutation}
      />

      {(loadingInvoices || addPaymentMutation.isPending) && <Loader />}
    </div>
  );
}
