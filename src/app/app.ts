import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from './components/header/header';
import { Footer } from './components/footer/footer';
import { Aside } from './components/aside/aside';
import { Main } from './components/main/main';

@Component({
  selector: 'app-root',
  imports: [Header, Footer, Aside, Main],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
}
