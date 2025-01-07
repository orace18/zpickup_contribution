import { Component } from '@angular/core';
import { LoginComponent } from "./features/dashboard/pages/login/login.component";
import { RouterModule } from '@angular/router';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  standalone: true,
  imports: [RouterModule]
})
export class AppComponent {
  title = 'ZpickUp ';


}
