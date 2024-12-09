import {
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { CookieService } from 'ngx-cookie-service';
import { TreeNode } from 'primeng/api';
import { Subscription, firstValueFrom } from 'rxjs';

import {
  FormattedError,
  Oeuvre,
  Reference,
  SelectableKeyword,
} from 'src/app/interfaces/interface';

import { CommunicationService } from 'src/app/services/communication.service';
import { DataManagerService } from 'src/app/services/data-manager.service';
import { ExportService } from 'src/app/services/export.service';
import { UtilsService } from 'src/app/services/utils.service';
import { WorkerService } from 'src/app/services/worker.service';
import FormatService from 'src/app/worker/services/format.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit, OnDestroy {
  @ViewChild('topList') topListRef: ElementRef;
  @ViewChild('bottomList') bottomListRef: ElementRef;

  private subscription: Subscription = new Subscription();

  fileUrl: any;

  idvhlouL5zm9PJ3 = FormatService.BtQa4HAXRcL5gS;
  b2s9ANs7dvsMLQh = FormatService.VQSGVOu89lO89iy;

  references: Reference[] = [];
  keywords: SelectableKeyword[] = [];
  themeTree: TreeNode[] = [];

  // Form
  oeuvreList: Oeuvre[];

  // Pagination
  page: number = 1;
  pageSize: number = 20;

  // Defensive Code
  formattedErr: FormattedError[] = [];
  hierarchyError: any = { status: true };

  // ----------

  nbLoadedFiles = 0;
  private nbFilesToDownload = 1;

  // ----

  private selectLabel: string;

  // ---

  search: string = '';

  width = 0;
  goToPosition = 0;

  private tabLabel = '';

  mobileGoTopShown = false;

  // --

  isDisabled: boolean = false;

  cptRef = 0;

  hideLinks = false;
  isJobDone = false;

  // ---

  isTreePresent: any = null;

  /**
   *
   * Methods
   *
   */

  constructor(
    private utils: UtilsService,
    private exportService: ExportService,
    private cookieService: CookieService,
    private translate: TranslateService,
    private dataManager: DataManagerService,
    private workerService: WorkerService,
    private communicationService: CommunicationService
  ) {
    this.oeuvreList = [];
  }

  async ngOnInit() {
    document.body.style.overflowY = 'hidden';
    const _formattedErr = this.dataManager.formattedErr;
    if (_formattedErr.length) {
      this.hideLinks = true;
      this.formattedErr = _formattedErr;
      return;
    }

    const version = this.cookieService.get('appVersion');
    if (!version) {
      this.workerService.clearIndexedDb();
      this.cookieService.set('appVersion', '2', {
        expires: 400,
      });
    }

    let isPageSizeCookieExists = this.cookieService.get('pageSize') !== '';
    if (isPageSizeCookieExists)
      this.pageSize = parseInt(this.cookieService.get('pageSize'));

    this.selectLabel = await firstValueFrom(this.translate.get('FORM.SELECT'));
    this.oeuvreList = [
      {
        name: 'ALL',
        fullName: this.selectLabel,
        isParent: false,
      },
    ];

    this.addSubscription();

    if (this.dataManager.isDataLoaded) {
      this.nbLoadedFiles = 1000;
      this.isJobDone = true;
      this.workerService.changePage(1);
      document.body.style.overflowY = 'auto';
    }

    const location = window.location.href;
    this.workerService.loadData(location, this.pageSize);

    const settings = this.dataManager.settings;
    this.tabLabel = settings ? settings['LABEL-TAB'] : '';

    this.getScreenSize();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  @HostListener('window:resize', ['$event'])
  private getScreenSize(event?: Event) {
    this.width = window.innerWidth;
    this.goToPosition = this.width / 2 - 400;
  }

  onHierarchyError(_hierarchyError: any) {
    this.hierarchyError = _hierarchyError;
  }

  onScroll(scrollPos: number) {
    if (this.hierarchyError.name) return;

    const positionYTop = this.topListRef.nativeElement.offsetTop;
    const positionYBottom =
      this.bottomListRef.nativeElement.offsetTop - window.innerHeight;

    this.mobileGoTopShown =
      scrollPos > positionYTop && scrollPos < positionYBottom;
  }

  getRightPositionForMobile() {
    return this.width < 600 ? '20px' : '40px';
  }

  // PAGINATION ---

  onPageChange(newPage: number) {
    this.page = newPage;
    this.workerService.changePage(newPage);
  }

  // PROGRESSBAR ---

  getValue() {
    if (this.oeuvreList.length === 1) return 0;
    return Math.round((this.nbLoadedFiles * 100) / this.nbFilesToDownload);
  }

  // ---

  async exportFile() {
    this.workerService.exportReferences();
  }

  // IHM

  scrollToBottom = this.utils.scrollToBottom;
  scrollToTop = this.utils.scrollToTop;

  // FORM LISTEN EVENT

  onChangePageSize(newValue: any): void {
    this.page = 1;
    this.pageSize = parseInt(newValue);
    this.cookieService.set('pageSize', newValue, { expires: 400 });
    this.workerService.changePageSize(this.pageSize);
  }

  // --- Private methods

  private addSubscription() {
    this.subscription.add(
      this.workerService.messages$.subscribe({
        next: (response) => {
          if (response.label === 'nbFiles') {
            this.nbFilesToDownload = response.data;
          }

          if (
            [
              'refError',
              'confError',
              'themesTreeNotFoundError',
              'keywordsTreeNotFoundError',
            ].includes(response.label)
          ) {
            if (response.data) {
              this.hideLinks = true;
              this.formattedErr = response.data;
              return;
            }
          }

          if (
            ['keywordsTreeError', 'themesTreeError', 'mergeTreeError'].includes(
              response.label
            )
          ) {
            if (response.data) {
              this.hideLinks = true;
              this.hierarchyError = response.data;
              return;
            }
          }

          if (response.label === 'oeuvres') {
            this.oeuvreList = [...this.oeuvreList, ...response.data];
            this.dataManager.oeuvresList = this.oeuvreList;
          }

          if (response.label === 'cptRef') {
            this.cptRef = response.data;
          }

          if (response.label === 'nbLoadedFiles') {
            this.nbLoadedFiles = response.data;
          }

          if (response.label === 'references') {
            this.references = response.data;
            this.communicationService.publierMessage('msg');
            if (response.fromFilter) {
              this.page = 1;
            }
          }

          if (response.label === 'referencesForExport') {
            this.exportService.getFile(response.data, this.tabLabel);
          }

          if (response.label === 'tree') {
            if (this.isTreePresent === null) {
              this.isTreePresent = response.data ? response.data.length : false;
            }
            this.themeTree = response.data;
          }

          if (response.label === 'keywords') {
            if (response.isComplete) {
              this.dataManager.keywords = response.data;
              const kws = response.data.map((kw: any) => {
                return kw.value;
              });

              const date = new Date();
              const formattedDate = date.toLocaleString('fr-FR', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
              });

              sessionStorage.setItem(
                'keywords',
                JSON.stringify({
                  keywords: kws,
                  date: formattedDate,
                })
              );
            }
            this.keywords = response.data;
          }

          if (response === 'JOB DONE') {
            this.isJobDone = true;
            this.dataManager.isDataLoaded = true;

            setTimeout(() => {
              this.nbLoadedFiles = 1000;
              document.body.style.overflowY = 'auto';
            }, 1000);
          }
        },
      })
    );
  }
}
