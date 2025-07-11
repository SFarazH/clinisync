"use client"
import React from "react"

import { useState } from "react"
import { Plus, Search, User, Edit, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "@/hooks/use-toast"

// interface PatientManagementProps {
//   patients: Patient[]
//   onAddPatient: (patient: Omit<Patient, "id">) => void
//   onUpdatePatient: (patientId: string, patient: Omit<Patient, "id">) => void
//   onDeletePatient: (patientId: string) => void
// }

export default function PatientManagement({
  patients,
  onAddPatient,
  onUpdatePatient,
  onDeletePatient,
}) {
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingPatient, setEditingPatient] = useState(null)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    address: "",
  })

  const filteredPatients = patients.filter(
    (patient) =>
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.phone.includes(searchTerm),
  )

  const handleEditPatient = (patient) => {
    setEditingPatient(patient)
    setFormData({
      name: patient.name,
      email: patient.email,
      phone: patient.phone,
      dateOfBirth: patient.dateOfBirth,
      address: patient.address,
    })
    setIsDialogOpen(true)
  }

  const handleDeletePatient = (patientId) => {
    onDeletePatient(patientId)
    toast({
      title: "Patient Deleted",
      description: "The patient has been successfully deleted.",
    })
  }

  const handleAddNew = () => {
    setEditingPatient(null)
    setFormData({
      name: "",
      email: "",
      phone: "",
      dateOfBirth: "",
      address: "",
    })
    setIsDialogOpen(true)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (editingPatient) {
      onUpdatePatient(editingPatient.id, formData)
      toast({
        title: "Patient Updated",
        description: "The patient information has been successfully updated.",
      })
    } else {
      onAddPatient(formData)
      toast({
        title: "Patient Added",
        description: "The new patient has been successfully added.",
      })
    }
    setFormData({
      name: "",
      email: "",
      phone: "",
      dateOfBirth: "",
      address: "",
    })
    setEditingPatient(null)
    setIsDialogOpen(false)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Patient Management</CardTitle>
              <CardDescription>Add and manage patient information</CardDescription>
            </div>
            <Button onClick={handleAddNew}>
              <Plus className="w-4 h-4 mr-2" />
              Add Patient
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search patients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="grid gap-4">
              {filteredPatients.map((patient) => (
                <Card key={patient.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <h3 className="font-medium">{patient.name}</h3>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <p>{patient.email}</p>
                          <p>{patient.phone}</p>
                          <p>DOB: {new Date(patient.dateOfBirth).toLocaleDateString()}</p>
                          <p>{patient.address}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleEditPatient(patient)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => handleDeletePatient(patient.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingPatient ? "Edit Patient" : "Add New Patient"}</DialogTitle>
            <DialogDescription>
              {editingPatient ? "Update the patient's information below." : "Enter the patient's information below."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsDialogOpen(false)
                  setEditingPatient(null)
                  setFormData({
                    name: "",
                    email: "",
                    phone: "",
                    dateOfBirth: "",
                    address: "",
                  })
                }}
              >
                Cancel
              </Button>
              <Button type="submit">{editingPatient ? "Update" : "Add"} Patient</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
