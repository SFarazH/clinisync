import React, { useEffect, useRef, useState } from "react";
import {
  getAppointmentsForCombinedSlot,
  getSingleAppointmentForSlot,
  isAppointmentStart,
  isTimeWithinMergedAppt,
  getAppointmentColor,
  getAppointmentHeight,
  isDayOpen,
} from "@/utils/helper";
import { Plus } from "lucide-react";
import { appointmentStatusConfig } from "../data";
import Loader from "../loader";
import { format } from "date-fns";

export default function CalendarView({
  data,
  timeSlotOptions,
  calendarData,
  dragOptions,
  loaders,
  setOverlappingAppointmentsDialog,
}) {
  const {
    patientsData,
    doctorsData,
    appointmentsData,
    proceduresData,
    loadingPatients,
  } = data;

  const { isTimeSlotAvailable, handleTimeSlotClick, handleAppointmentClick } =
    timeSlotOptions;

  const {
    timeSlots,
    weekDays,
    clinicHours,
    selectedDoctorId,
    mergedAppointments,
  } = calendarData;

  const {
    handleDragOver,
    handleDragLeave,
    handleDrop,
    dragOverSlot,
    handleDragStart,
    handleDragEnd,
    draggedAppointment,
  } = dragOptions;

  const {
    addAppointmentLoading,
    updateAppointmentLoading,
    deleteAppointmentLoading,
  } = loaders;

  const isDragging = !!draggedAppointment;

  return (
    <div className="relative">
      {timeSlots.map((slot, timeIndex) => {
        const { time, isMainSlot, isClickable = true } = slot;
        return (
          <div
            key={time}
            className={`grid grid-cols-8 ${
              isMainSlot
                ? "border-b border-gray-100"
                : timeIndex !== timeSlots.length - 2 &&
                  "border-b-2 border-gray-200"
            } last:border-b-0 h-[30px]`}
          >
            <div
              className={`p-2 border-r text-sm flex items-start ${
                isMainSlot ? "font-medium" : "font-medium text-sm"
              } ${
                !isClickable
                  ? slot.isBoundary
                    ? "bg-red-100 text-red-800"
                    : "bg-gray-100 text-gray-500"
                  : ""
              }`}
            >
              {slot.isBoundary ? `END - ${time}` : time}
            </div>

            {isClickable
              ? weekDays.map((day, dayIndex) => {
                  const formattedDay = format(day, "yyyy-MM-dd");
                  const isAvailable = isTimeSlotAvailable(
                    day,
                    time,
                    clinicHours,
                  );
                  const isOpen = isDayOpen(day, clinicHours);

                  return (
                    <div
                      key={`${dayIndex}-${timeIndex}`}
                      className={`group ${
                        isAvailable ? "border-r" : ""
                      } last:border-r-0 relative h-[30px] ${
                        isOpen && isAvailable
                          ? "hover:bg-blue-100 cursor-pointer"
                          : "bg-gray-100"
                      } ${
                        dragOverSlot?.date === formattedDay &&
                        dragOverSlot?.time === time &&
                        isOpen &&
                        isAvailable
                          ? "bg-green-100 border-2 border-green-400 border-dashed"
                          : ""
                      }`}
                      onClick={() => handleTimeSlotClick(day, time)}
                      onDragOver={(e) => handleDragOver(e, day, time)}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, day, time)}
                    >
                      {selectedDoctorId === "all"
                        ? (() => {
                            const appointmentsInThisSlot =
                              getAppointmentsForCombinedSlot(
                                appointmentsData,
                                day,
                                time,
                              );
                            if (appointmentsInThisSlot.length === 0)
                              return null;

                            const mergedAppt = mergedAppointments.find(
                              (appt) =>
                                appt.apptId === appointmentsInThisSlot[0].id &&
                                appt.timeStart === time &&
                                appt.date === formattedDay,
                            );

                            const isCoveredByMergedAppt =
                              appointmentsInThisSlot.length === 1 &&
                              mergedAppointments.some((appt) => {
                                return (
                                  appt.apptId ===
                                    appointmentsInThisSlot[0].id &&
                                  appt.date === formattedDay &&
                                  isTimeWithinMergedAppt(
                                    time,
                                    appt.timeStart,
                                    appt.count,
                                  ) &&
                                  appt.timeStart !== time
                                );
                              });

                            if (isCoveredByMergedAppt) return null;

                            return (
                              appointmentsInThisSlot.length > 0 && (
                                <div
                                  className={`absolute inset-x-1 rounded-md p-1 overflow-hidden shadow-sm cursor-pointer hover:shadow-md transition-shadow flex items-center justify-center ${
                                    appointmentsInThisSlot.length === 1
                                      ? "text-white"
                                      : "text-black"
                                  }`}
                                  style={{
                                    backgroundColor:
                                      appointmentsInThisSlot.length === 1
                                        ? getAppointmentColor(
                                            appointmentsInThisSlot[0],
                                            proceduresData,
                                          )
                                        : "#FFEBC6",
                                    height:
                                      mergedAppt &&
                                      mergedAppt.timeStart === time &&
                                      mergedAppt.date === formattedDay
                                        ? `${30 * mergedAppt.count - 3}px`
                                        : `${30 - 3}px`,
                                    zIndex: 10,
                                    flexWrap: "wrap",
                                    gap: "2px",
                                  }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (appointmentsInThisSlot.length === 1) {
                                      handleAppointmentClick(
                                        appointmentsInThisSlot[0],
                                      );
                                    } else {
                                      setOverlappingAppointmentsDialog({
                                        isOpen: true,
                                        appointments: appointmentsInThisSlot,
                                        timeSlot: time,
                                        date: formattedDay,
                                      });
                                    }
                                  }}
                                >
                                  {appointmentsInThisSlot.length === 1 ? (
                                    <div className="font-medium truncate">
                                      {
                                        patientsData.find(
                                          (p) =>
                                            p._id ===
                                            appointmentsInThisSlot[0].patientId,
                                        )?.name
                                      }
                                    </div>
                                  ) : (
                                    <div className="font-medium">
                                      {appointmentsInThisSlot.length}{" "}
                                    </div>
                                  )}
                                  {appointmentsInThisSlot.length > 1 &&
                                    appointmentsInThisSlot.map((apt, idx) => (
                                      <div
                                        key={idx}
                                        className="w-3 h-3 rounded-full"
                                        style={{
                                          backgroundColor: proceduresData.find(
                                            (proc) =>
                                              proc._id === apt.procedureId,
                                          )?.color,
                                        }}
                                        title={`${
                                          patientsData.find(
                                            (p) => p._id === apt.patientId,
                                          )?.name
                                        } (${
                                          doctorsData.find(
                                            (d) => d._id === apt.doctorId,
                                          )?.name
                                        })`}
                                      />
                                    ))}
                                </div>
                              )
                            );
                          })()
                        : (() => {
                            const appointment = getSingleAppointmentForSlot(
                              appointmentsData,
                              selectedDoctorId,
                              day,
                              time,
                            );

                            if (!appointment) return null;

                            const isStart = isAppointmentStart(
                              appointment,
                              time,
                            );
                            const isThisBeingDragged =
                              draggedAppointment?.id === appointment.id;

                            return (
                              <div
                                draggable
                                onDragStart={(e) =>
                                  handleDragStart(e, appointment)
                                }
                                onDragEnd={handleDragEnd}
                                className="absolute inset-x-1 cursor-move flex items-center justify-center overflow-hidden"
                                title={
                                  appointmentStatusConfig[appointment.status]
                                    ?.label
                                }
                                style={{
                                  backgroundColor: isStart
                                    ? proceduresData.find(
                                        (t) =>
                                          t._id === appointment.procedureId,
                                      )?.color
                                    : "transparent",

                                  height: `${
                                    getAppointmentHeight(appointment) * 30 - 3
                                  }px`,
                                  zIndex: isStart ? 10 : 11,
                                  borderRadius: isStart ? "6px" : "0",
                                  color: "white",

                                  pointerEvents:
                                    isDragging && !isThisBeingDragged
                                      ? "none"
                                      : "auto",

                                  opacity: isThisBeingDragged ? 0.6 : 1,
                                  transition:
                                    "opacity 0.18s cubic-bezier(0.4,0,0.2,1)",
                                }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAppointmentClick(appointment);
                                }}
                              >
                                {isStart && (
                                  <div className="font-medium truncate px-1">
                                    {
                                      patientsData.find(
                                        (p) => p._id === appointment.patientId,
                                      )?.name
                                    }
                                  </div>
                                )}
                              </div>
                            );
                          })()}

                      {isOpen &&
                        isAvailable &&
                        !(selectedDoctorId !== "all"
                          ? getSingleAppointmentForSlot(
                              appointmentsData,
                              selectedDoctorId,
                              day,
                              time,
                            )
                          : false) && (
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20">
                            <Plus className="w-3 h-3 text-blue-600" />
                          </div>
                        )}
                    </div>
                  );
                })
              : weekDays.map((_, dayIndex) => (
                  <div
                    key={`${dayIndex}-${timeIndex}`}
                    className={`border-r last:border-r-0 ${
                      slot.isBoundary ? "bg-red-100" : "bg-gray-100"
                    }`}
                  />
                ))}
          </div>
        );
      })}

      {(loadingPatients ||
        addAppointmentLoading ||
        updateAppointmentLoading ||
        deleteAppointmentLoading) && <Loader />}
    </div>
  );
}
