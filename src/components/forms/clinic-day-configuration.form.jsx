"use client";

const { Plus, Trash2 } = require("lucide-react");
const { Button } = require("../ui/button");
const { Label } = require("../ui/label");
const { Input } = require("../ui/input");
import { daysOfWeek } from "../data";

export default function ClinicDayConfiguration({
  clinicHours,
  selectedDay,
  shift,
  breaks,
}) {
  const { updateShift, addShift, removeShift } = shift;
  const { updateBreak, addBreak, removeBreak } = breaks;
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">
          {daysOfWeek.find((d) => d.key === selectedDay)?.label} Configuration
        </h3>
        <div className="text-sm text-muted-foreground">
          {clinicHours[selectedDay].isOpen ? "Open" : "Closed"}
        </div>
      </div>

      {clinicHours[selectedDay].isOpen && (
        <div className="space-y-6">
          {/* Shifts Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Working Shifts</h4>
              <Button size="sm" onClick={() => addShift(selectedDay)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Shift
              </Button>
            </div>

            {clinicHours[selectedDay].shifts.map((shift, index) => (
              <div
                key={index}
                className="flex items-center space-x-2 p-3 border rounded-lg"
              >
                <div className="flex-1 grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">Start Time</Label>
                    <Input
                      type="time"
                      value={shift.start}
                      onChange={(e) =>
                        updateShift(selectedDay, index, "start", e.target.value)
                      }
                      className="h-8"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">End Time</Label>
                    <Input
                      type="time"
                      value={shift.end}
                      onChange={(e) =>
                        updateShift(selectedDay, index, "end", e.target.value)
                      }
                      className="h-8"
                    />
                  </div>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => removeShift(selectedDay, index)}
                  disabled={clinicHours[selectedDay].shifts.length === 1}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>

          {/* Breaks Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Break Times</h4>
              <Button
                size="sm"
                variant="outline"
                onClick={() => addBreak(selectedDay)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Break
              </Button>
            </div>

            {clinicHours[selectedDay].breaks.length === 0 ? (
              <p className="text-sm text-muted-foreground italic">
                No breaks scheduled
              </p>
            ) : (
              clinicHours[selectedDay].breaks.map((breakTime, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-2 p-3 border rounded-lg bg-orange-50"
                >
                  <div className="flex-1 grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-xs">Break Start</Label>
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
                        className="h-8"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Break End</Label>
                      <Input
                        type="time"
                        value={breakTime.end}
                        onChange={(e) =>
                          updateBreak(selectedDay, index, "end", e.target.value)
                        }
                        className="h-8"
                      />
                    </div>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => removeBreak(selectedDay, index)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
