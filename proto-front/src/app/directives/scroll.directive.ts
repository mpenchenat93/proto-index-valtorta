import { Directive, EventEmitter, HostListener, Output } from '@angular/core';

@Directive({
  selector: '[appScroll]',
})
export class ScrollDirective {
  @Output() scrollPosition = new EventEmitter<number>();

  @HostListener('window:scroll', ['$event'])
  onWindowScroll() {
    const verticalOffset = window.scrollY || document.documentElement.scrollTop;
    this.scrollPosition.emit(verticalOffset);
  }
}
