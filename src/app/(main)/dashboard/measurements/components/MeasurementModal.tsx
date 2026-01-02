import type React from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MeasurementForm } from "./MeasurementForm";
import type { FormData } from "../types";

type MeasurementModalProps = {
  isOpen: boolean;
  formData: FormData;
  error: string | null;
  isLoading: boolean;
  isValid: boolean;
  onInputChange: (field: string, value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
};

export function MeasurementModal({
  isOpen,
  formData,
  error,
  isLoading,
  isValid,
  onInputChange,
  onSubmit,
}: MeasurementModalProps) {
  return (
    <Dialog open={isOpen}>
      <DialogContent className="max-h-[90vh] max-w-md overflow-y-auto" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle className="text-2xl">Напишете вашите данни</DialogTitle>
          <DialogDescription>Въведете текущите си телесни измервания, за да продължите</DialogDescription>
        </DialogHeader>

        <MeasurementForm
          formData={formData}
          error={error}
          isLoading={isLoading}
          isValid={isValid}
          onInputChange={onInputChange}
          onSubmit={onSubmit}
        />
      </DialogContent>
    </Dialog>
  );
}
