import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-help-button',
  templateUrl: './help-button.component.html',
  styleUrl: './help-button.component.css',
})
export class HelpButtonComponent {
  @Input() active: boolean;

  @Output() activeChange = new EventEmitter<boolean>();

  get color(): string {
    return this.active ? '#6c757d' : '#ddd';
  }

  toggle() {
    this.active = !this.active;
    this.activeChange.emit(this.active);
  }
}
