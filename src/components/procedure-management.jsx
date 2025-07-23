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
import {
  addProcedure,
  deleteProcedure,
  fetchProceudres,
  updateProcedure,
} from "@/lib";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export default function ProcedureManagement() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProcedure, setEditingProcedure] = useState(null);
  const [formData, setFormData] = useState(emptyProcedure);

  const { data: proceduresData = [], isLoading: loadingProcedures } = useQuery({
    queryKey: ["procedures"],
    queryFn: fetchProceudres,
  });

  const addProcedureMutation = useMutation({
    mutationFn: addProcedure,
    onSuccess: () => {
      queryClient.invalidateQueries(["procedures"]);
      toast({
        title: "Procedure Added",
        description: "New procedure has been added.",
      });
    },
  });

  const updateProcedureMutation = useMutation({
    mutationFn: updateProcedure,
    onSuccess: () => {
      queryClient.invalidateQueries(["procedures"]);
    },
  });

  const deleteProcedureMutation = useMutation({
    mutationFn: deleteProcedure,
    onSuccess: () => {
      queryClient.invalidateQueries(["procedures"]);
    },
  });

  const handleEditProcedure = (procedure) => {
    setEditingProcedure(procedure);
    setFormData({
      name: procedure.name,
      duration: procedure.duration,
      color: procedure.color,
      abbr: procedure.abbr,
    });
    setIsDialogOpen(true);
  };

  const handleDeleteProcedure = (procedureId) => {
    deleteProcedureMutation.mutateAsync(procedureId);
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
      updateProcedureMutation.mutateAsync({
        id: editingProcedure._id,
        procedureData: formData,
      });
    } else {
      addProcedureMutation.mutateAsync(formData);
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
            {proceduresData.map((procedure) => (
              <Card key={procedure._id}>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-4">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: procedure.color }}
                    />
                    <div className="flex-1">
                      <h3 className="font-medium">{procedure.name}</h3>
                      <div className="flex items-center text-sm text-muted-foreground mt-1">
                        <Clock className="w-4 h-4 mr-1" />
                        {procedure.duration} minutes
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditProcedure(procedure)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteProcedure(procedure._id)}
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
