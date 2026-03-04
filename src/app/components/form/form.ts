import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { StoreService } from '../../appointment/store/store';
import { CommonModule } from '@angular/common';
import { FieldConfig } from '../../appointment/models';

@Component({
  selector: 'app-form',
  imports: [FormsModule, CommonModule, ReactiveFormsModule],
  templateUrl: './form.html',
  styleUrl: './form.css',
})
export class Form {

  private storeService = inject(StoreService);
  public form!: FormGroup
  private fb = inject(FormBuilder)

  fields = this.storeService.fields
  fieldColumns = () => this.chunkFields(this.fields().filter((field) => !this.isHiddenField(field.name)), 3);

  ngOnInit(): void {
    const controls: any = {};
    this.fields().forEach(field => {
      controls[field.name] = [
        field.value ?? '',
        field.validators ?? []
      ];
    });
    this.form = this.fb.group(controls);
  }

  submit() {
    if (this.form.valid) {      
      this.storeService.setObject(this.form.value, "customer")
    } else {
      this.form.markAllAsTouched();
    }
  }

  hasError(name: string): boolean {
    const control = this.form.get(name);
    return !!(control && control.invalid && control.touched);
  }

  isHiddenField(name: string): boolean {
    return name === 'id';
  }

  private chunkFields(fields: FieldConfig[], size: number): FieldConfig[][] {
    const chunks: FieldConfig[][] = [];
    for (let index = 0; index < fields.length; index += size) {
      chunks.push(fields.slice(index, index + size));
    }
    return chunks;
  }

}
