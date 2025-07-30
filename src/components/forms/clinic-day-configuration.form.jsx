"use client";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { daysOfWeek } from "../data";

export default function ClinicDayConfiguration({
  clinicHours,
  selectedDay,
  shift,
  breaks,
  isEditing,
}) {
  const { updateShift, addShift, removeShift } = shift;
  const { updateBreak, addBreak, removeBreak } = breaks;

  const currentDayConfig = clinicHours[selectedDay];

  if (!currentDayConfig) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">
            {daysOfWeek.find((d) => d.key === selectedDay)?.label} Configuration
          </h3>
        </div>
        <p className="text-muted-foreground">
          No configuration available for this day.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">
          {daysOfWeek.find((d) => d.key === selectedDay)?.label} Configuration
        </h3>
        <div className="text-sm text-muted-foreground">
          {currentDayConfig.isOpen ? "Open" : "Closed"}
        </div>
      </div>
      {currentDayConfig.isOpen && (
        <div className="space-y-6">
          {/* Shifts Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Working Shifts</h4>
              <Button
                size="sm"
                onClick={() => addShift(selectedDay)}
                disabled={!isEditing}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Shift
              </Button>
            </div>
            {currentDayConfig.shifts.length === 0 && !isEditing ? (
              <p className="text-sm text-muted-foreground italic">
                No shifts scheduled.
              </p>
            ) : (
              currentDayConfig.shifts.map((shift, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-2 p-3 border rounded-lg"
                >
                  <div className="flex-1 grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-xs mb-1">Start Time</Label>
                      <Input
                        type="time"
                        value={shift.start}
                        onChange={(e) =>
                          updateShift(
                            selectedDay,
                            index,
                            "start",
                            e.target.value
                          )
                        }
                        className={`h-8 ${
                          !isEditing
                            ? "bg-gray-50 text-gray-500 border-dashed"
                            : ""
                        }`}
                        readOnly={!isEditing}
                      />
                    </div>
                    <div>
                      <Label className="text-xs mb-1">End Time</Label>
                      <Input
                        type="time"
                        value={shift.end}
                        onChange={(e) =>
                          updateShift(selectedDay, index, "end", e.target.value)
                        }
                        className={`h-8 ${
                          !isEditing
                            ? "bg-gray-50 text-gray-500 border-dashed"
                            : ""
                        }`}
                        readOnly={!isEditing}
                      />
                    </div>
                  </div>
                  {isEditing && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => removeShift(selectedDay, index)}
                      disabled={currentDayConfig.shifts.length === 1}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))
            )}
          </div>
          {/* Breaks Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Break Times</h4>
              <Button
                size="sm"
                variant="outline"
                onClick={() => addBreak(selectedDay)}
                disabled={!isEditing}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Break
              </Button>
            </div>
            {currentDayConfig.breaks.length === 0 ? (
              <p className="text-sm text-muted-foreground italic">
                No breaks scheduled
              </p>
            ) : (
              currentDayConfig.breaks.map((breakTime, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-2 p-3 border rounded-lg bg-blue-50"
                >
                  <div className="flex-1 grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-xs mb-1">Break Start</Label>
                      <Input
                        type="time"
                        value={breakTime.start}
                        onChange={(e) =>
                          updateBreak(
                            selectedDay,
                            index,
                            "start",
                            e.target.value
                          )
                        }
                        className={`h-8 ${
                          !isEditing
                            ? "bg-blue-100 text-blue-700 border-dashed"
                            : ""
                        }`}
                        readOnly={!isEditing}
                      />
                    </div>
                    <div>
                      <Label className="text-xs mb-1">Break End</Label>
                      <Input
                        type="time"
                        value={breakTime.end}
                        onChange={(e) =>
                          updateBreak(selectedDay, index, "end", e.target.value)
                        }
                        className={`h-8 ${
                          !isEditing
                            ? "bg-blue-100 text-blue-700 border-dashed"
                            : ""
                        }`}
                        readOnly={!isEditing}
                      />
                    </div>
                  </div>
                  {isEditing && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => removeBreak(selectedDay, index)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
