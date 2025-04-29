import { Component } from '@angular/core';
import {SidebarComponent} from '../../components/sidebar/sidebar.component';
import {HeaderComponent} from '../../components/header/header.component';
import {RouterOutlet} from '@angular/router';

@Component({
  selector: 'app-main-layout',
  imports: [
    RouterOutlet,
    SidebarComponent,
    HeaderComponent
  ],
  templateUrl: './main-layout.component.html',
  standalone: true,
  styleUrl: './main-layout.component.css'
})
export class MainLayoutComponent {

}
