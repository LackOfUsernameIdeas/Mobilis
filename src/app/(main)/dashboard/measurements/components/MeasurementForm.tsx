import type React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { FormData } from "../types";
import { ACTIVITY_LEVELS, LIMITS } from "../constants";

type MeasurementFormProps = {
  formData: FormData;
  error: string | null;
  isLoading: boolean;
  isValid: boolean;
  onInputChange: (field: string, value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
};

export function MeasurementForm({
  formData,
  error,
  isLoading,
  isValid,
  onInputChange,
  onSubmit,
}: MeasurementFormProps) {
  return (
    <form onSubmit={onSubmit} className="mt-2 space-y-4">
      {error && <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</div>}

      <div className="space-y-2">
        <Label htmlFor="gender" className="text-foreground text-xs">
          Пол
        </Label>
        <Select value={formData.gender} onValueChange={(v) => onInputChange("gender", v)}>
          <SelectTrigger id="gender">
            <SelectValue placeholder="Изберете пол" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="male">Мъж</SelectItem>
            <SelectItem value="female">Жена</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="age" className="text-foreground text-xs">
          Възраст
        </Label>
        <div className="relative">
          <Input
            id="age"
            type="number"
            step="1"
            min={LIMITS.age.min}
            max={LIMITS.age.max}
            value={formData.age}
            onChange={(e) => onInputChange("age", e.target.value)}
            placeholder="напр. 25"
            required
            className="bg-input border-border text-foreground placeholder:text-muted-foreground pr-16 text-sm [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          />
          <span className="text-foreground absolute top-1/2 right-3 -translate-y-1/2 text-sm">години</span>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="activityLevel" className="text-foreground text-xs">
          Ниво на активност
        </Label>
        <Select value={formData.activityLevel} onValueChange={(v) => onInputChange("activityLevel", v)}>
          <SelectTrigger id="activityLevel" className="px-3 py-1">
            <SelectValue placeholder="Изберете ниво на активност">
              {ACTIVITY_LEVELS.find((l) => l.value === formData.activityLevel)?.label}
            </SelectValue>
          </SelectTrigger>

          <SelectContent>
            {ACTIVITY_LEVELS.map((level) => (
              <SelectItem key={level.value} value={level.value}>
                <div className="flex flex-col">
                  <span className="font-medium">{level.label}</span>
                  <span className="text-muted-foreground text-xs">{level.description}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="height" className="text-foreground text-xs">
          Височина
        </Label>
        <div className="relative">
          <Input
            id="height"
            type="number"
            step="0.1"
            min={LIMITS.height.min}
            max={LIMITS.height.max}
            value={formData.height}
            onChange={(e) => onInputChange("height", e.target.value)}
            placeholder="напр. 185"
            required
            className="bg-input border-border text-foreground placeholder:text-muted-foreground pr-12 text-sm [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          />
          <span className="text-foreground absolute top-1/2 right-3 -translate-y-1/2 text-sm">см</span>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="weight" className="text-foreground text-xs">
          Тегло
        </Label>
        <div className="relative">
          <Input
            id="weight"
            type="number"
            step="0.1"
            min={LIMITS.weight.min}
            max={LIMITS.weight.max}
            value={formData.weight}
            onChange={(e) => onInputChange("weight", e.target.value)}
            placeholder="напр. 95"
            required
            className="bg-input border-border text-foreground placeholder:text-muted-foreground pr-12 text-sm [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          />
          <span className="text-foreground absolute top-1/2 right-3 -translate-y-1/2 text-sm">кг</span>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="neck" className="text-foreground text-xs">
          Обиколка на врат
        </Label>
        <div className="relative">
          <Input
            id="neck"
            type="number"
            step="0.1"
            min={LIMITS.neck.min}
            max={LIMITS.neck.max}
            value={formData.neck}
            onChange={(e) => onInputChange("neck", e.target.value)}
            placeholder="напр. 38"
            required
            className="bg-input border-border text-foreground placeholder:text-muted-foreground pr-12 text-sm [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          />
          <span className="text-foreground absolute top-1/2 right-3 -translate-y-1/2 text-sm">см</span>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="waist" className="text-foreground text-xs">
          Обиколка на талия
        </Label>
        <div className="relative">
          <Input
            id="waist"
            type="number"
            step="0.1"
            min={LIMITS.waist.min}
            max={LIMITS.waist.max}
            value={formData.waist}
            onChange={(e) => onInputChange("waist", e.target.value)}
            placeholder="напр. 92"
            required
            className="bg-input border-border text-foreground placeholder:text-muted-foreground pr-12 text-sm [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          />
          <span className="text-foreground absolute top-1/2 right-3 -translate-y-1/2 text-sm">см</span>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="hip" className="text-foreground text-xs">
          Обиколка на таз
        </Label>
        <div className="relative">
          <Input
            id="hip"
            type="number"
            step="0.1"
            min={LIMITS.hip.min}
            max={LIMITS.hip.max}
            value={formData.hip}
            onChange={(e) => onInputChange("hip", e.target.value)}
            placeholder="напр. 102"
            required
            className="bg-input border-border text-foreground placeholder:text-muted-foreground pr-12 text-sm [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          />
          <span className="text-foreground absolute top-1/2 right-3 -translate-y-1/2 text-sm">см</span>
        </div>
      </div>

      <Button type="submit" className="w-full cursor-pointer" disabled={!isValid || isLoading}>
        {isLoading ? "Зареждане..." : "Напред"}
      </Button>
    </form>
  );
}
