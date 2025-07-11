"use client"

import { useState } from "react"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Plus, Trash2 } from "lucide-react"
import { toast } from "@/hooks/use-toast"

// interface ClinicSettingsProps {
//   clinicHours: ClinicHours
//   onUpdateClinicHours: (hours: ClinicHours) => void
// }

const daysOfWeek = [
  { key: "monday", label: "Monday" },
  { key: "tuesday", label: "Tuesday" },
  { key: "wednesday", label: "Wednesday" },
  { key: "thursday", label: "Thursday" },
  { key: "friday", label: "Friday" },
  { key: "saturday", label: "Saturday" },
  { key: "sunday", label: "Sunday" },
] 

export default function ClinicSettings({ clinicHours, onUpdateClinicHours }) {
  const [selectedDay, setSelectedDay] = useState("monday")

  const updateDayOpen = (day, isOpen) => {
    onUpdateClinicHours({
      ...clinicHours,
      [day]: {
        ...clinicHours[day],
        isOpen,
      },
    })
  }

  const addShift = (day) => {
    const newShift = { start: "09:00", end: "17:00" }
    onUpdateClinicHours({
      ...clinicHours,
      [day]: {
        ...clinicHours[day],
        shifts: [...clinicHours[day].shifts, newShift],
      },
    })
    toast({
      title: "Shift Added",
      description: "New shift has been added successfully.",
    })
  }

  const updateShift = (day, shiftIndex, field, value) => {
    const updatedShifts = [...clinicHours[day].shifts]
    updatedShifts[shiftIndex] = { ...updatedShifts[shiftIndex], [field]: value }
    onUpdateClinicHours({
      ...clinicHours,
      [day]: {
        ...clinicHours[day],
        shifts: updatedShifts,
      },
    })
  }

  const removeShift = (day, shiftIndex) => {
    const updatedShifts = clinicHours[day].shifts.filter((_, index) => index !== shiftIndex)
    onUpdateClinicHours({
      ...clinicHours,
      [day]: {
        ...clinicHours[day],
        shifts: updatedShifts,
      },
    })
    toast({
      title: "Shift Removed",
      description: "Shift has been removed successfully.",
    })
  }

  const addBreak = (day) => {
    const newBreak = { start: "12:00", end: "13:00" }
    onUpdateClinicHours({
      ...clinicHours,
      [day]: {
        ...clinicHours[day],
        breaks: [...clinicHours[day].breaks, newBreak],
      },
    })
    toast({
      title: "Break Added",
      description: "New break time has been added successfully.",
    })
  }

  const updateBreak = (day, breakIndex, field, value) => {
    const updatedBreaks = [...clinicHours[day].breaks]
    updatedBreaks[breakIndex] = { ...updatedBreaks[breakIndex], [field]: value }
    onUpdateClinicHours({
      ...clinicHours,
      [day]: {
        ...clinicHours[day],
        breaks: updatedBreaks,
      },
    })
  }

  const removeBreak = (day, breakIndex) => {
    const updatedBreaks = clinicHours[day].breaks.filter((_, index) => index !== breakIndex)
    onUpdateClinicHours({
      ...clinicHours,
      [day]: {
        ...clinicHours[day],
        breaks: updatedBreaks,
      },
    })
    toast({
      title: "Break Removed",
      description: "Break time has been removed successfully.",
    })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Clinic Working Hours & Shifts</CardTitle>
          <CardDescription>
            Configure your clinic's operating hours, shifts, and break times for each day
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Select Day</h3>
              <div className="grid gap-2">
                {daysOfWeek.map(({ key, label }) => (
                  <div
                    key={key}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedDay === key ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => setSelectedDay(key)}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{label}</span>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={clinicHours[key].isOpen}
                          onCheckedChange={(checked) => updateDayOpen(key, checked)}
                          onClick={(e) => e.stopPropagation()}
                        />
                        <span className="text-sm text-muted-foreground">
                          {clinicHours[key].isOpen ? "Open" : "Closed"}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Day Configuration */}
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
                      <div key={index} className="flex items-center space-x-2 p-3 border rounded-lg">
                        <div className="flex-1 grid grid-cols-2 gap-2">
                          <div>
                            <Label className="text-xs">Start Time</Label>
                            <Input
                              type="time"
                              value={shift.start}
                              onChange={(e) => updateShift(selectedDay, index, "start", e.target.value)}
                              className="h-8"
                            />
                          </div>
                          <div>
                            <Label className="text-xs">End Time</Label>
                            <Input
                              type="time"
                              value={shift.end}
                              onChange={(e) => updateShift(selectedDay, index, "end", e.target.value)}
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
                      <Button size="sm" variant="outline" onClick={() => addBreak(selectedDay)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Break
                      </Button>
                    </div>

                    {clinicHours[selectedDay].breaks.length === 0 ? (
                      <p className="text-sm text-muted-foreground italic">No breaks scheduled</p>
                    ) : (
                      clinicHours[selectedDay].breaks.map((breakTime, index) => (
                        <div key={index} className="flex items-center space-x-2 p-3 border rounded-lg bg-orange-50">
                          <div className="flex-1 grid grid-cols-2 gap-2">
                            <div>
                              <Label className="text-xs">Break Start</Label>
                              <Input
                                type="time"
                                value={breakTime.start}
                                onChange={(e) => updateBreak(selectedDay, index, "start", e.target.value)}
                                className="h-8"
                              />
                            </div>
                            <div>
                              <Label className="text-xs">Break End</Label>
                              <Input
                                type="time"
                                value={breakTime.end}
                                onChange={(e) => updateBreak(selectedDay, index, "end", e.target.value)}
                                className="h-8"
                              />
                            </div>
                          </div>
                          <Button variant="destructive" size="sm" onClick={() => removeBreak(selectedDay, index)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
