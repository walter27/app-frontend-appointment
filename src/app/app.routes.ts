import { Routes } from '@angular/router';

export const routes: Routes = [

    {
        pathMatch: 'full',
        path: '',
        redirectTo: 'calendar',
    },
    {
        path: 'calendar',
        loadComponent: () => import('./appointment/appointment').then(m => m.Appointment)
    }
];
