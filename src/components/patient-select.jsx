import { Label } from "./ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./ui/command";
import { ChevronsUpDown } from "lucide-react";
import { Button } from "./ui/button";
import { useQuery } from "@tanstack/react-query";
import { listPatients } from "@/lib";
import { formatDOB } from "@/utils/helper";
import { useState } from "react";

export default function PatientSelect({
  patientId,
  setPatientId,
  formData,
  setFormData,
  addedStyle,
}) {
  const [open, setOpen] = useState(false);

  const currentPatientId = patientId ?? formData?.patientId ?? null;

  const handleSelect = (id) => {
    if (setPatientId) {
      setPatientId(id);
    } else if (setFormData) {
      setFormData((prev) => ({ ...prev, patientId: id }));
    }
    setOpen(false);
  };

  const { data: patientsData = [], isLoading: loadingPatients } = useQuery({
    queryKey: ["patients"],
    queryFn: listPatients,
  });
  return (
    <div className={`grid gap-2 ${addedStyle}`}>
      <Label htmlFor="patient">Patient</Label>
      <Popover open={open} onOpenChange={setOpen} className="w-full">
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between font-normal bg-transparent"
          >
            {currentPatientId
              ? patientsData.find((p) => p._id === currentPatientId)?.name
              : "Select Patient"}
            <ChevronsUpDown className="opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[var(--radix-popover-trigger-width)]">
          <Command className="w-full">
            {loadingPatients ? (
              <CommandList>
                <CommandItem disabled>
                  <div className="flex items-center space-x-2">
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    <span>Loading patients...</span>
                  </div>
                </CommandItem>
              </CommandList>
            ) : (
              <>
                <CommandInput placeholder="Search Patient" />
                <CommandList>
                  <CommandEmpty>No patient found.</CommandEmpty>
                  <CommandGroup>
                    {patientsData.map((patient) => (
                      <CommandItem
                        key={patient._id}
                        value={patient.name.toLowerCase()}
                        onSelect={() => handleSelect(patient._id)}
                        className={
                          currentPatientId === patient._id ? "bg-gray-200" : ""
                        }
                      >
                        {patient.name} - ({formatDOB(patient.dob)})
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </>
            )}
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
