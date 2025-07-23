"use client";
import React from "react";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import ProcedureForm from "./forms/procedure.form";
import { emptyProcedure } from "./data";
import { Button } from "./ui/button";
import { Clock, Edit, Plus, Trash2 } from "lucide-react";

export default function ProcedureManagement({  
  procedures,
  onAddProcedure,
  onUpdateProcedure,
  onDeleteProcedure,
}) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProcedure, setEditingProcedure] = useState(null);
  const [formData, setFormData] = useState(emptyProcedure);

  const handleEditProcedure = (procedure) => {
    setEditingProcedure(procedure);
    setFormData({
      name: procedure.name,
      duration: procedure.duration,
      color: procedure.color,
    });
    setIsDialogOpen(true);
  };

  const handleDeleteProcedure = (procedureId) => {
    onDeleteProcedure(procedureId);
    toast({
      title: "Procedure Deleted",
      description: "The procedure has been successfully deleted.",
    });
  };

  const handleAddNew = () => {
    setEditingProcedure(null);
    setFormData(emptyProcedure);
    setIsDialogOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingProcedure) {
      onUpdateProcedure(editingProcedure.id, formData);
      toast({
        title: "Procedure Updated",
        description: "The procedure has been successfully updated.",
      });
    } else {
      onAddProcedure(formData);
      toast({
        title: "Procedure Added",
        description: "The new procedure has been successfully added.",
      });
    }
    setFormData(emptyProcedure);
    setEditingProcedure(null);
    setIsDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Procedures</CardTitle>
              <CardDescription>
                Manage different types of procedures and their durations
              </CardDescription>
            </div>
            <Button onClick={handleAddNew}>
              <Plus className="w-4 h-4 mr-2" />
              Add Type
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {procedures.map((type) => (
              <Card key={type.id}>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-4">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: type.color }}
                    />
                    <div className="flex-1">
                      <h3 className="font-medium">{type.name}</h3>
                      <div className="flex items-center text-sm text-muted-foreground mt-1">
                        <Clock className="w-4 h-4 mr-1" />
                        {type.duration} minutes
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditProcedure(type)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteProcedure(type.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
      <ProcedureForm
        dialogState={{
          isDialogOpen,
          setIsDialogOpen,
          editingProcedure,
          setEditingProcedure,
        }}
        formState={{
          formData,
          setFormData,
          handleSubmit,
        }}
      />
    </div>
  );
}
