"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/utils/helper";

export default function AccountsManagement({ invoices, payments }) {
  const totalRevenue = payments
    ?.filter((p) => p.status === "succeeded")
    ?.reduce((sum, p) => sum + p.amount, 0);

  const outstanding = invoices
    ?.filter((inv) => inv.status === "issued" || inv.status === "partial")
    ?.reduce((sum, inv) => {
      const paid = payments
        .filter((p) => p.invoiceId === inv.id && p.status === "succeeded")
        .reduce((s, p) => s + p.amount, 0);
      return sum + Math.max(0, inv.total - paid);
    }, 0);

  const today = new Date().toISOString().slice(0, 10);
  const todaysRevenue = payments
    ?.filter(
      (p) => p.status === "succeeded" && p.receivedAt.slice(0, 10) === today
    )
    ?.reduce((sum, p) => sum + p.amount, 0);

  const paidInvoices = invoices?.filter((inv) => inv.status === "paid").length;
  const openInvoices = invoices?.filter(
    (inv) => inv.status === "issued" || inv.status === "partial"
  ).length;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader>
          <CardTitle>Revenue (MTD)</CardTitle>
        </CardHeader>
        <CardContent className="text-2xl font-bold">
          {formatCurrency(totalRevenue)}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Outstanding A/R</CardTitle>
        </CardHeader>
        <CardContent className="text-2xl font-bold">
          {formatCurrency(outstanding)}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Today’s Revenue</CardTitle>
        </CardHeader>
        <CardContent className="text-2xl font-bold">
          {formatCurrency(todaysRevenue)}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Invoices</CardTitle>
        </CardHeader>
        <CardContent className="text-2xl font-bold">
          12 paid / 3 open
        </CardContent>
      </Card>
    </div>
  );
}
