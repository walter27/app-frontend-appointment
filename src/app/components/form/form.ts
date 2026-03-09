import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, ViewChild, inject } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FieldConfig } from '../../appointment/models';
import { StoreService } from '../../appointment/store/store';

@Component({
  selector: 'app-form',
  imports: [FormsModule, CommonModule, ReactiveFormsModule],
  templateUrl: './form.html',
  styleUrl: './form.css',
})
export class Form implements AfterViewInit {
  private storeService = inject(StoreService);
  private fb = inject(FormBuilder);
  @ViewChild('formRoot') formRoot?: ElementRef<HTMLFormElement>;

  public form: FormGroup = new FormGroup({});
  public currentStepIndex = 0;

  fields = this.storeService.fields;

  ngOnInit(): void {
    const controls: Record<string, unknown[]> = {};
    this.normalizedFields().forEach((field) => {
      controls[field.name] = [
        field.type === 'file' ? null : (field.value ?? ''),
        field.validators ?? []
      ];
    });

    this.form = this.fb.group(controls);
    this.currentStepIndex = 0;
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.focusFirstWritableControl(), 0);
  }

  stepNumbers(): number[] {
    const steps = new Set<number>();
    this.normalizedFields().forEach((field) => steps.add(field.step ?? 1));
    return Array.from(steps).sort((a, b) => a - b);
  }

  hasMultipleSteps(): boolean {
    return this.stepNumbers().length >= 2;
  }

  currentStep(): number {
    return this.stepNumbers()[this.currentStepIndex] ?? 1;
  }

  isFirstStep(): boolean {
    return this.currentStepIndex === 0;
  }

  isLastStep(): boolean {
    return this.currentStepIndex >= this.stepNumbers().length - 1;
  }

  fieldsForCurrentStep(): FieldConfig[] {
    const step = this.currentStep();
    return this.normalizedFields().filter((field) => (field.step ?? 1) === step);
  }

  currentStepColumnCount(): number {
    const columns = this.fieldsForCurrentStep().map((field) => field.column ?? 1);
    return Math.max(1, ...columns);
  }

  currentStepGridTemplateColumns(): string {
    return `repeat(${this.currentStepColumnCount()}, minmax(0, 1fr))`;
  }

  previousStep(): void {
    if (this.isFirstStep()) return;
    this.currentStepIndex -= 1;
    setTimeout(() => this.focusFirstWritableControl(), 0);
  }

  nextStep(): boolean {
    if (!this.validateCurrentStep()) {
      return false;
    }

    if (!this.isLastStep()) {
      this.currentStepIndex += 1;
      setTimeout(() => this.focusFirstWritableControl(), 0);
      return true;
    }

    return false;
  }

  submit(): boolean {
    if (!this.form.valid) {
      this.form.markAllAsTouched();
      return false;
    }

    this.storeService.setObject(this.normalizeNumberValues(this.form.value), 'customer');
    return true;
  }

  submitFromModalAction(): boolean {
    if (!this.isLastStep()) {
      this.nextStep();
      return false;
    }
    return this.submit();
  }

  hasError(name: string): boolean {
    const control = this.form.get(name);
    return !!(control && control.invalid && control.touched);
  }

  isValidControl(name: string): boolean {
    const control = this.form.get(name);
    return !!(control && control.valid && control.touched);
  }

  hasValue(name: string): boolean {
    const value = this.form.get(name)?.value;
    if (Array.isArray(value)) return value.length > 0;
    if (value === null || value === undefined) return false;
    return String(value).trim() !== '';
  }

  fieldRow(field: FieldConfig): number | null {
    return field.row ?? null;
  }

  fieldColumn(field: FieldConfig): number | null {
    return field.column ?? null;
  }

  fieldInputStep(field: FieldConfig): number | null {
    return field.inputStep ?? null;
  }

  isHiddenField(name: string): boolean {
    return name === 'id';
  }

  onFileChange(fieldName: string, event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = input.files;

    if (!files) {
      this.form.get(fieldName)?.setValue(null);
      return;
    }

    const value = files.length > 1 ? Array.from(files) : files[0] ?? null;
    this.form.get(fieldName)?.setValue(value);
    this.form.get(fieldName)?.markAsTouched();
    this.form.get(fieldName)?.updateValueAndValidity();
  }

  fileLabel(fieldName: string): string {
    const value = this.form.get(fieldName)?.value;
    if (!value) return '';
    if (Array.isArray(value)) return `${value.length} files selected`;
    return value?.name ?? '1 file selected';
  }

  openFileDialog(fieldName: string): void {
    const root = this.formRoot?.nativeElement;
    if (!root) return;

    const fileInput = root.querySelector<HTMLInputElement>(`#file-input-${fieldName}`);
    fileInput?.click();
  }

  errorMessage(field: FieldConfig): string {
    const errors = this.form.get(field.name)?.errors;
    if (!errors) return `${field.label} is invalid`;
    if (errors['required']) return `${field.label} is required`;
    if (errors['email']) return `${field.label} is not valid`;
    if (errors['minlength']) return `${field.label} must be at least ${errors['minlength'].requiredLength} characters`;
    if (errors['maxlength']) return `${field.label} must be at most ${errors['maxlength'].requiredLength} characters`;
    if (errors['min']) return `${field.label} must be greater than or equal to ${errors['min'].min}`;
    if (errors['max']) return `${field.label} must be less than or equal to ${errors['max'].max}`;
    if (errors['pattern']) return `${field.label} has an invalid format`;
    return `${field.label} is invalid`;
  }

  private validateCurrentStep(): boolean {
    const currentFields = this.fieldsForCurrentStep();
    currentFields.forEach((field) => {
      this.form.get(field.name)?.markAsTouched();
      this.form.get(field.name)?.updateValueAndValidity();
    });

    return currentFields.every((field) => this.form.get(field.name)?.valid);
  }

  private normalizedFields(): FieldConfig[] {
    const visible = this.fields().filter((field) => !this.isHiddenField(field.name));
    return [...visible].sort((a, b) => {
      const stepDiff = (a.step ?? 1) - (b.step ?? 1);
      if (stepDiff !== 0) return stepDiff;

      const rowDiff = (a.row ?? 1) - (b.row ?? 1);
      if (rowDiff !== 0) return rowDiff;

      return (a.column ?? 1) - (b.column ?? 1);
    });
  }

  private normalizeNumberValues(formValue: Record<string, unknown>): Record<string, unknown> {
    const normalized = { ...formValue };
    this.normalizedFields().forEach((field) => {
      if (field.type === 'number') {
        const value = normalized[field.name];
        if (value !== null && value !== undefined && value !== '') {
          normalized[field.name] = Number(value);
        }
      }
    });
    return normalized;
  }

  private focusFirstWritableControl(): void {
    const root = this.formRoot?.nativeElement;
    if (!root) return;

    const firstControl = root.querySelector<HTMLElement>(
      'input:not([type="hidden"]):not([type="file"]):not([disabled]), select:not([disabled]), textarea:not([disabled])'
    );

    firstControl?.focus();
  }
}
