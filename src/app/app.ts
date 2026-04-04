import { CommonModule } from "@angular/common";
import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from "@angular/core";
import { RouterOutlet, RouterModule } from "@angular/router";
import { BackgroundAnimationService } from "./core/services/background-animation.service";
import { HeaderComponent } from "./shared/components/header/header.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterModule, HeaderComponent],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App implements OnInit, AfterViewInit {
  @ViewChild('techBgContainer') techBgContainer!: ElementRef;

  constructor(private backgroundAnimationService: BackgroundAnimationService) {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    if (this.techBgContainer) {
      this.backgroundAnimationService.createTechBackground(this.techBgContainer.nativeElement);
    }
  }
}