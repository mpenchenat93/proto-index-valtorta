import { Component } from '@angular/core';

@Component({
  selector: 'app-logos',
  templateUrl: './logos.component.html',
  styleUrl: './logos.component.css',
})
export class LogosComponent {
  goValtortaOrg() {
    window.open('https://www.maria-valtorta.org', '_blank');
  }

  goForum() {
    window.open('https://mariavaltorta.forumactif.com', '_blank');
  }

  goValtortaFr() {
    window.open('https://valtorta.fr', '_blank');
  }
}
