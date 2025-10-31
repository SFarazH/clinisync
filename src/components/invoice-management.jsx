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
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";
import { useState, useMemo, useCallback, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PaymentModal from "./modal/payment.modal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { formatDOB } from "@/utils/helper";
import Loader from "./loader";
import { addPaymentToInvoiceApi, getInvocies } from "@/lib";

const DUMMY_INVOICES = [
  {
    _id: "1",
    invoiceType: "appointment",
    totalAmount: 500,
    amountPaid: 300,
    isPaymentComplete: false,
    patientId: { name: "John Doe", email: "john@example.com" },
    appointment: { date: "2025-10-30", time: "10:00 AM" },
    paymentsHistory: [
      {
        date: new Date("2025-10-25"),
        amount: 300,
        method: "cash",
      },
    ],
  },
  {
    _id: "2",
    invoiceType: "appointment",
    totalAmount: 1000,
    amountPaid: 1000,
    isPaymentComplete: true,
    patientId: { name: "Jane Smith", email: "jane@example.com" },
    appointment: { date: "2025-10-28", time: "2:00 PM" },
    paymentsHistory: [
      {
        date: new Date("2025-10-28"),
        amount: 1000,
        method: "card",
      },
    ],
  },
  {
    _id: "3",
    invoiceType: "labWork",
    labWork: { nameOfLab: "ABC" },
    totalAmount: 750,
    amountPaid: 0,
    isPaymentComplete: false,
    patientId: { name: "Mike Johnson", email: "mike@example.com" },
    appointment: { date: "2025-11-01", time: "11:30 AM" },
    paymentsHistory: [],
  },
  {
    _id: "4",
    invoiceType: "labWork",
    labWork: { nameOfLab: "XYZ" },
    totalAmount: 1200,
    amountPaid: 600,
    isPaymentComplete: false,
    patientId: { name: "Sarah Williams", email: "sarah@example.com" },
    appointment: { date: "2025-10-29", time: "3:00 PM" },
    paymentsHistory: [
      {
        date: new Date("2025-10-29"),
        amount: 600,
        method: "online",
      },
    ],
  },
];

export default function InvoiceManagement() {
  const queryClient = useQueryClient();

  const [invoiceType, setInvoiceType] = useState("appointment");
  const [search, setSearch] = useState("");

  const [invoicesData, setInvoicesData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [pagination, setPagination] = useState({});

  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const { data: invoicesDataObject = {}, isLoading: loadingInvoices } =
    useQuery({
      queryKey: ["invoices", invoiceType, currentPage, limit],
      queryFn: async () =>
        getInvocies({
          // page:currentPage,
          invoiceType: invoiceType,
          isPaymentComplete: null,
          paginate: false,
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
      setPagination(invoicesData.pagination);
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
    <div className="space-y-8">
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

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-3">
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
      </div>

      {/* Invoices Table */}
      <Card className="shadow-md border rounded-2xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">Invoices</CardTitle>
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by patient or amount"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="max-w-sm"
              />
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
                      <TableHead className="w-2/12">Patient</TableHead>
                      <TableHead className="w-2/12">Total Amount</TableHead>
                      <TableHead className="w-3/12">Payment Progress</TableHead>
                      <TableHead className="w-2/12">Status</TableHead>
                      <TableHead className="w-2/12">Date</TableHead>
                      <TableHead className="w-1/12"></TableHead>
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
