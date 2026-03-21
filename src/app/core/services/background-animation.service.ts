import { Injectable, Renderer2, RendererFactory2 } from "@angular/core";
@Injectable({
  providedIn: 'root'
})
export class BackgroundAnimationService {
  private renderer: Renderer2;
  constructor(rendererFactory: RendererFactory2) {
    this.renderer = rendererFactory.createRenderer(null, null);
  }
  createTechBackground(container: HTMLElement): void {
    const techIcons = [
      { icon: "fas fa-laptop", name: "laptop" },
      { icon: "fas fa-laptop-code", name: "laptop-code" },
      { icon: "fas fa-desktop", name: "desktop" },
      { icon: "fas fa-mouse", name: "mouse" },
      { icon: "fas fa-keyboard", name: "keyboard" },
      { icon: "fas fa-database", name: "database" },
      { icon: "fas fa-cloud", name: "cloud" },
      { icon: "fas fa-code", name: "code" },
      { icon: "fas fa-terminal", name: "terminal" },
      { icon: "fas fa-cogs", name: "cogs" },
      { icon: "fas fa-microchip", name: "microchip" },
      { icon: "fas fa-memory", name: "memory" },
      { icon: "fas fa-hdd", name: "hdd" },
      { icon: "fas fa-sd-card", name: "sd-card" },
      { icon: "fas fa-usb", name: "usb" },
      { icon: "fas fa-plug", name: "plug" },
      { icon: "fas fa-wifi", name: "wifi" },
      { icon: "fas fa-bluetooth", name: "bluetooth" },
      { icon: "fab fa-python", name: "python" },
      { icon: "fab fa-js", name: "javascript" },
      { icon: "fab fa-react", name: "react" },
      { icon: "fab fa-node", name: "node" },
      { icon: "fas fa-chart-line", name: "analytics" },
      { icon: "fas fa-robot", name: "robot" },
      { icon: "fas fa-brain", name: "brain" }
    ];
    for (let i = 0; i < 70; i++) {
      const techItem = this.renderer.createElement('div');
      this.renderer.addClass(techItem, 'tech-item');
      const randomIcon = techIcons[Math.floor(Math.random() * techIcons.length)];
      this.renderer.setProperty(techItem, 'innerHTML', `<i class="${randomIcon.icon}"></i>`);
      const size = Math.random() * 50 + 20;
      this.renderer.setStyle(techItem, 'fontSize', `${size}px`);
      this.renderer.setStyle(techItem, 'left', `${Math.random() * 100}%`);
      const drift = (Math.random() - 0.5) * 200;
      this.renderer.setStyle(techItem, '--drift', `${drift}px`);
      const animationType = Math.random();
      if (animationType < 0.33) {
        this.renderer.setStyle(techItem, 'animation', `floatTech ${Math.random() * 15 + 12}s linear infinite`);
      } else if (animationType < 0.66) {
        this.renderer.setStyle(techItem, 'animation', `floatTechSlow ${Math.random() * 20 + 18}s linear infinite`);
      } else {
        this.renderer.setStyle(techItem, 'animation', `floatTechFast ${Math.random() * 10 + 8}s linear infinite`);
      }
      this.renderer.setStyle(techItem, 'animationDelay', `${Math.random() * 20}s`);
      this.renderer.setStyle(techItem, 'opacity', `${Math.random() * 0.2 + 0.08}`);
      this.renderer.setStyle(techItem, 'transform', `rotate(${Math.random() * 360}deg)`);
      
      this.renderer.appendChild(container, techItem);
    }
    for (let i = 0; i < 150; i++) {
      const particle = this.renderer.createElement('div');
      this.renderer.addClass(particle, 'bg-particle');
      const particleSize = Math.random() * 4 + 1;
      this.renderer.setStyle(particle, 'width', `${particleSize}px`);
      this.renderer.setStyle(particle, 'height', `${particleSize}px`);
      this.renderer.setStyle(particle, 'left', `${Math.random() * 100}%`);
      this.renderer.setStyle(particle, 'animation', `floatParticle ${Math.random() * 12 + 8}s linear infinite`);
      this.renderer.setStyle(particle, 'animationDelay', `${Math.random() * 15}s`);
      this.renderer.setStyle(particle, 'opacity', `${Math.random() * 0.3 + 0.1}`);
      this.renderer.setStyle(particle, 'background', `rgba(255, 255, 255, ${Math.random() * 0.3 + 0.1})`);
      this.renderer.appendChild(container, particle);
    }
    const orbColors = [
      'rgba(102, 126, 234, 0.3)',
      'rgba(118, 75, 162, 0.3)',
      'rgba(236, 72, 153, 0.2)',
      'rgba(16, 185, 129, 0.2)'
    ];
    for (let i = 0; i < 8; i++) {
      const orb = this.renderer.createElement('div');
      this.renderer.addClass(orb, 'glow-orb');
      const orbSize = Math.random() * 250 + 150;
      this.renderer.setStyle(orb, 'width', `${orbSize}px`);
      this.renderer.setStyle(orb, 'height', `${orbSize}px`);
      this.renderer.setStyle(orb, 'left', `${Math.random() * 100}%`);
      this.renderer.setStyle(orb, 'top', `${Math.random() * 100}%`);
      this.renderer.setStyle(orb, 'background', `radial-gradient(circle, ${orbColors[i % orbColors.length]}, transparent)`);
      this.renderer.setStyle(orb, 'animationDuration', `${Math.random() * 8 + 6}s`);
      this.renderer.setStyle(orb, 'animationDelay', `${Math.random() * 5}s`);
      
      this.renderer.appendChild(container, orb);
    }
  }
}