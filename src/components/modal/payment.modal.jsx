"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import Loader from "../loader";
import { getInvoiceById } from "@/lib";
import { formatDOB } from "@/utils/helper";

export default function PaymentModal({
  isOpen,
  onClose,
  invoice: initialInvoice,
  addPaymentMutation,
}) {
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [open, setOpen] = useState(false);
  const [invoice, setInvoice] = useState(initialInvoice);

  const getInvoiceMutation = useMutation({
    mutationFn: (id) => getInvoiceById(id),
    onSuccess: (res) => {
      if (res.data.success) {
        setInvoice(res.data.data);
      }
    },
  });

  useEffect(() => {
    if (initialInvoice) {
      setInvoice(initialInvoice);
    }
  }, [initialInvoice]);

  const remainingAmount = invoice?.totalAmount - invoice?.amountPaid;

  const handleMakePayment = async () => {
    if (!paymentAmount || Number.parseFloat(paymentAmount) <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    if (Number.parseFloat(paymentAmount) > remainingAmount) {
      alert(`Payment cannot exceed remaining amount ₹${remainingAmount}`);
      return;
    }

    try {
      await addPaymentMutation.mutateAsync({
        invoiceId: invoice?._id,
        data: { amount: paymentAmount, method: paymentMethod },
      });
      await getInvoiceMutation?.mutateAsync(invoice?._id);
      setPaymentAmount("");
      setPaymentMethod("cash");
    } catch (error) {
      console.error("Payment error:", error);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-lg w-full sm:max-w-xl rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">
              Invoice Payment
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-5">
            <div className="grid grid-cols-3 gap-4 text-sm border-b pb-3">
              <div>
                <p className="text-xs text-muted-foreground">Patient</p>
                <p className="font-medium">{invoice?.patientId?.name}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Type</p>
                <p className="capitalize font-medium">{invoice?.invoiceType}</p>
              </div>
              {invoice.invoiceType === "appointment" && (
                <div>
                  <p className="text-xs text-muted-foreground">
                    Appointment Date
                  </p>
                  <p className="capitalize font-medium">
                    {invoice?.appointmentDate
                      ? formatDOB(invoice.appointmentDate)
                      : "NA"}
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <Card className="p-3 bg-green-50 border-green-200">
                  <div className="flex items-center justify-between w-full">
                    <p className="text-xs text-muted-foreground m-0">
                      Amount Paid
                    </p>
                    <p className="text-lg font-semibold text-green-700 m-0">
                      ₹{invoice?.amountPaid.toLocaleString()}
                    </p>
                  </div>
                </Card>
                <Card className="p-3 bg-amber-50 border-amber-200">
                  <div className="flex items-center justify-between w-full">
                    <p className="text-xs text-muted-foreground m-0">
                      Remaining
                    </p>
                    <p className="text-lg font-semibold text-amber-700 m-0">
                      ₹{remainingAmount.toLocaleString()}
                    </p>
                  </div>
                </Card>
              </div>
            </div>

            {invoice?.paymentsHistory?.length > 0 ? (
              <div className="space-y-2">
                <button
                  onClick={() => setOpen((prev) => !prev)}
                  className="flex items-center justify-between w-full text-left"
                >
                  <p className="text-sm font-semibold">Payment History</p>
                  {open ? (
                    <ChevronUp className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  )}
                </button>

                <div
                  className={`transition-all duration-300 ease-in-out overflow-hidden ${
                    open ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
                  }`}
                >
                  <div className="border rounded-md overflow-hidden mt-1">
                    <Table className="text-xs">
                      <TableHeader>
                        <TableRow className="bg-muted/50">
                          <TableHead className="py-2">Date</TableHead>
                          <TableHead className="py-2">Amount</TableHead>
                          <TableHead className="py-2">Method</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {invoice?.paymentsHistory.map((p, idx) => (
                          <TableRow key={idx} className="hover:bg-muted/30">
                            <TableCell className="py-2">
                              {format(new Date(p.date), "MMM dd")}
                            </TableCell>
                            <TableCell className="font-medium">
                              ₹{p.amount.toLocaleString()}
                            </TableCell>
                            <TableCell>
                              <span className="px-2 py-0.5 text-[11px] rounded-full bg-blue-100 text-blue-800 font-medium">
                                {p.method}
                              </span>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-center font-semibold py-1.5">
                No payment history
              </p>
            )}

            {remainingAmount > 0 ? (
              <div className="border-t-1  pt-4 space-y-3">
                <p className="text-sm font-semibold">Add Payment</p>
                <div className="grid grid-cols-3 gap-4 items-end">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground">
                      Amount
                    </label>
                    <Input
                      type="number"
                      placeholder={`Max ₹${remainingAmount}`}
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(e.target.value)}
                      max={remainingAmount}
                      className="text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground">
                      Method
                    </label>
                    <Select
                      value={paymentMethod}
                      onValueChange={setPaymentMethod}
                    >
                      <SelectTrigger className="text-sm">
                        <SelectValue placeholder="Select method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cash">Cash</SelectItem>
                        <SelectItem value="card">Card</SelectItem>
                        <SelectItem value="online">Online</SelectItem>
                        <SelectItem value="upi">UPI</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    onClick={handleMakePayment}
                    disabled={addPaymentMutation.isPending}
                    className="w-full text-sm font-medium"
                  >
                    Add
                  </Button>
                </div>
              </div>
            ) : (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
                <p className="text-sm font-semibold text-green-700">
                  ✓ Payment Complete
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
      {getInvoiceMutation.isPending && <Loader />}
    </>
  );
}
