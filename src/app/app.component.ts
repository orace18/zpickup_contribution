import {Component, OnInit} from '@angular/core';
import { LoginComponent } from "./features/dashboard/pages/login/login.component";
import { RouterModule } from '@angular/router';
import {NgIf} from '@angular/common';
import {AutoLogoutService} from '../core/services/inspector.service';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  standalone: true,
  imports: [RouterModule, NgIf]
})
export class AppComponent{
  title = 'ZpickUp ';
/*
  constructor(private autoLogoutService: AutoLogoutService) {}

  ngOnInit() {
    this.autoLogoutService.initializeAutoLogout();
  }*/


}
