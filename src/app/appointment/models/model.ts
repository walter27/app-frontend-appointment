import { ValidatorFn } from '@angular/forms';


export interface Event {
    id: string;
    title: string;
    start: string;
    end: string;
}


export type FieldType =
    | 'text'
    | 'email'
    | 'password'
    | 'select'
    | 'radio'
    | 'checkbox';

export interface FieldOption {
    label: string;
    value: any;
}

export interface FieldConfig {
    name: string;
    label: string;
    type: FieldType;
    placeholder?: string;
    value?: any;
    options?: FieldOption[]; 
    validators?: ValidatorFn[];
}

