import { RouterModule } from '@angular/router';
import {AutoLogoutService} from '../core/services/inspector.service';
import { AuthService } from '../core/services/auth.service';
import { Component, OnInit } from '@angular/core';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  standalone: true,
  imports: [RouterModule],
  providers: [AutoLogoutService]
})
export class AppComponent implements OnInit {
  title = 'ZpickUp ';
  constructor(
    private autoLogoutService: AutoLogoutService
  ) {}

  ngOnInit() {
    this.autoLogoutService.initializeAutoLogout();
  }
}
