import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import Loader from "./loader";
import { useQueryWrapper } from "./wrappers";
import { fetchWhatsappMessagesByClinic } from "@/lib";
import { formatDate, formatDateWithTime } from "@/utils/functions";

export default function WhatsappMessageManagement() {
  const { data: whatsappMessagesObj = {}, isLoading: loadingMessages } =
    useQueryWrapper({
      queryKey: ["messages"],
      queryFn: fetchWhatsappMessagesByClinic,
    });

  const messages = whatsappMessagesObj?.data ?? [];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>WhatsApp Messages</CardTitle>
              <CardDescription>View sent WhatsApp messages</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loadingMessages ? (
            <Loader />
          ) : (
            <div className="grid gap-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[60px] text-center">#</TableHead>
                    <TableHead>Patient</TableHead>
                    <TableHead>Appointment</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Sent At</TableHead>
                    <TableHead>Error</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {messages.length > 0 ? (
                    messages.map((message, index) => (
                      <TableRow key={message._id} className="align-middle">
                        <TableCell className="text-center font-medium">
                          {index + 1}
                        </TableCell>

                        <TableCell className="font-medium">
                          {message.patientId?.name || "N/A"}
                        </TableCell>

                        <TableCell>
                          <div className="flex flex-col">
                            <span className="text-sm font-medium">
                              {formatDate(message.appointmentId?.date)}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {message.appointmentId?.startTime || "N/A"}
                            </span>
                          </div>
                        </TableCell>

                        <TableCell>
                          <span
                            className={`px-2 py-1 rounded-md text-xs font-medium ${
                              message.status === "read" ||
                              message.status === "delivered"
                                ? "bg-green-100 text-green-700"
                                : message.status === "failed"
                                  ? "bg-red-100 text-red-700"
                                  : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {message.status}
                          </span>
                        </TableCell>

                        <TableCell className="text-sm text-muted-foreground">
                          {formatDateWithTime(message.createdAt)}
                        </TableCell>

                        <TableCell>
                          {message?.error?.message ? (
                            <span className="text-xs text-red-600">
                              {message.error.message}
                            </span>
                          ) : (
                            <span className="text-xs text-muted-foreground">
                              —
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center py-6 text-muted-foreground"
                      >
                        No messages found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
