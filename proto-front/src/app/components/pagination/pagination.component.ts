import {
  Component,
  EventEmitter,
  HostListener,
  Input,
  Output,
} from '@angular/core';

@Component({
  selector: 'app-pagination',
  templateUrl: './pagination.component.html',
  styleUrls: ['./pagination.component.css'],
})
export class PaginationComponent {
  @Input() collectionSize: number = 0; // Total des éléments dans la collection
  @Input() page: number = 1; // Page actuelle
  @Input() pageSize: number = 10; // Nombre d'éléments par page
  @Input() rotate: boolean = true; // Si vrai, fait défiler les numéros de page
  @Input() ellipses: boolean = false; // Affiche ou non les ellipses
  @Input() position: string;

  @Output() pageChange = new EventEmitter<number>();

  private maxSize: number = 4;

  constructor() {}

  ngOnInit() {
    this.getScreenSize();
  }

  get totalPages(): number {
    return Math.ceil(this.collectionSize / this.pageSize);
  }

  get displayedPages(): number[] {
    let pages: number[] = [];
    if (this.totalPages <= this.maxSize) {
      for (let i = 1; i <= this.totalPages; i++) {
        pages.push(i);
      }
    } else {
      let startPage: number;
      let endPage: number;

      if (this.rotate) {
        const maxPagesBeforeCurrentPage = Math.floor(this.maxSize / 2);
        const maxPagesAfterCurrentPage = Math.ceil(this.maxSize / 2) - 1;
        if (this.page <= maxPagesBeforeCurrentPage) {
          // Début de la liste de pages
          startPage = 1;
          endPage = this.maxSize;
        } else if (this.page + maxPagesAfterCurrentPage >= this.totalPages) {
          // Fin de la liste de pages
          startPage = this.totalPages - this.maxSize + 1;
          endPage = this.totalPages;
        } else {
          // Milieu de la liste de pages
          startPage = this.page - maxPagesBeforeCurrentPage;
          endPage = this.page + maxPagesAfterCurrentPage;
        }
      } else {
        startPage = 1;
        endPage = this.maxSize;
      }

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
    }

    return pages;
  }

  navigateToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.page = page;
      this.pageChange.emit(this.page);

      if (this.position === 'bottom') {
        const element = document.getElementById('scrollpagtop');
        element?.scrollIntoView({ behavior: 'instant' });
      }
    }
  }

  // ---

  @HostListener('window:resize', ['$event'])
  private getScreenSize(event?: Event) {
    let screenWidth = window.innerWidth;
    this.maxSize = 1;
    if (screenWidth > 320) this.maxSize = 2;
    if (screenWidth > 390) this.maxSize = 3;
    if (screenWidth > 450) this.maxSize = 4;
  }
}
