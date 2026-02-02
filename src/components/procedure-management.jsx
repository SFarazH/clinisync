"use client";
import React from "react";
import { useState } from "react";
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
import { Edit, Plus, Trash2 } from "lucide-react";
import {
  addProcedure,
  deleteProcedure,
  fetchProceudres,
  updateProcedure,
} from "@/lib";
import { useQueryClient } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import Loader from "./loader";
import { useMutationWrapper, useQueryWrapper } from "./wrappers";

export default function ProcedureManagement() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProcedure, setEditingProcedure] = useState(null);
  const [formData, setFormData] = useState(emptyProcedure);

  const { data: proceduresData = [], isLoading: loadingProcedures } =
    useQueryWrapper({
      queryKey: ["procedures"],
      queryFn: fetchProceudres,
    });

  const addProcedureMutation = useMutationWrapper({
    mutationFn: addProcedure,
    onSuccess: () => {
      queryClient.invalidateQueries(["procedures"]);
      // toast({
      //   title: "Procedure Added",
      //   description: "New procedure has been added.",
      // });
    },
  });

  const updateProcedureMutation = useMutationWrapper({
    mutationFn: updateProcedure,
    onSuccess: () => {
      queryClient.invalidateQueries(["procedures"]);
    },
  });

  const deleteProcedureMutation = useMutationWrapper({
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
      cost: procedure.cost,
    });
    setIsDialogOpen(true);
  };

  const handleDeleteProcedure = (procedureId) => {
    deleteProcedureMutation.mutateAsync({ id: procedureId });
    // toast({
    //   title: "Procedure Deleted",
    //   description: "The procedure has been successfully deleted.",
    // });
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
      addProcedureMutation.mutateAsync({ procedureData: formData });
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
            <Table>
              <TableHeader>
                <TableRow className="w-full">
                  <TableHead className="w-1/14">ID</TableHead>
                  <TableHead className="w-4/14">Name</TableHead>
                  <TableHead className="w-2/14">Abbr</TableHead>
                  <TableHead className="w-2/14">Duration</TableHead>
                  <TableHead className="w-2/14">Cost</TableHead>
                  <TableHead className="w-2/14">Color</TableHead>
                  <TableHead className="w-1/14"></TableHead>
                  <TableHead className="w-1/14"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {proceduresData.length > 0 &&
                  proceduresData.map((procedure, index) => (
                    <TableRow key={procedure._id} className="items-center">
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{procedure.name}</TableCell>
                      <TableCell>{procedure?.abbr}</TableCell>
                      <TableCell>{procedure.duration} m</TableCell>
                      <TableCell>{procedure.cost}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-4">
                          <div
                            className="w-6 h-6 rounded-full"
                            style={{ backgroundColor: procedure.color }}
                          />
                        </div>
                      </TableCell>

                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            handleEditProcedure(procedure);
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteProcedure(procedure._id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
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
      {(loadingProcedures ||
        addProcedureMutation.isPending ||
        updateProcedureMutation.isPending ||
        deleteProcedureMutation.isPending) && <Loader />}
    </div>
  );
}
