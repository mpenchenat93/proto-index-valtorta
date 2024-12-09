import { Component, Input } from '@angular/core';

@Component({
  selector: 'fontawesome',
  templateUrl: './fontawesome.component.html',
  styleUrls: ['./fontawesome.component.css'],
})
export class FontawesomeComponent {
  @Input() name?: any;
  @Input() color?: any;
  @Input() isHovering?: any;
}
