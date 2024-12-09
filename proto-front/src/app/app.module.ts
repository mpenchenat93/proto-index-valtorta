import { DatePipe, NgFor } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { NgSelectModule } from '@ng-select/ng-select';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { CookieService } from 'ngx-cookie-service';
import { DBConfig, NgxIndexedDBModule } from 'ngx-indexed-db';
import { TreeModule } from 'primeng/tree';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AbecedariumComponent } from './components/abecedarium/abecedarium.component';
import { DefensiveCodeComponent } from './components/defensive-code/defensive-code.component';
import { DefensiveHierarchyComponent } from './components/defensive-hierarchy/defensive-hierarchy.component';
import { FontawesomeComponent } from './components/fontawesome/fontawesome.component';
import { FooterComponent } from './components/footer/footer.component';
import { FormBtnComponent } from './components/form-btn/form-btn.component';
import { FormComponent } from './components/form/form.component';
import { HeaderComponent } from './components/header/header.component';
import { HelpButtonComponent } from './components/help-button/help-button.component';
import { KeywordComponent } from './components/keyword/keyword.component';
import { LogosComponent } from './components/logos/logos.component';
import { MultiSelectMobileComponent } from './components/multi-select-mobile/multi-select-mobile.component';
import { PaginationComponent } from './components/pagination/pagination.component';
import { ProgressBarComponent } from './components/progress-bar/progress-bar.component';
import { ReferenceListComponent } from './components/reference-list/reference-list.component';
import { ThemeComponent } from './components/theme/theme.component';
import { ScrollDirective } from './directives/scroll.directive';

import { AdminComponent } from './pages/admin/admin.component';
import { ChartComponent } from './pages/chart/chart.component';
import { ContactComponent } from './pages/contact/contact.component';
import { HomeComponent } from './pages/home/home.component';
import { InformationComponent } from './pages/information/information.component';

import { AddBrPipe } from './pipes/add-br.pipe';
import { FormatNumberPipe } from './pipes/format-number.pipe';
import { KeywordFilterPipe } from './pipes/keyword-filter.pipe';
import { KeywordSomePipe } from './pipes/keyword-some.pipe';

const dbConfig: DBConfig = {
  name: 'DbFichiers',
  version: 1,
  objectStoresMeta: [
    {
      store: 'fileStorage',
      storeConfig: { keyPath: 'name', autoIncrement: false },
      storeSchema: [],
    },
    {
      store: 'versionStorage',
      storeConfig: { keyPath: 'name', autoIncrement: false },
      storeSchema: [],
    },
  ],
};

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
  declarations: [
    AppComponent,
    DefensiveCodeComponent,
    FontawesomeComponent,
    ReferenceListComponent,
    FooterComponent,
    FormComponent,
    ContactComponent,
    HomeComponent,
    AdminComponent,
    ProgressBarComponent,
    PaginationComponent,
    ChartComponent,
    InformationComponent,
    LogosComponent,
    MultiSelectMobileComponent,
    AbecedariumComponent,
    HelpButtonComponent,
    ScrollDirective,
    HeaderComponent,
    ThemeComponent,
    KeywordComponent,
    FormBtnComponent,
    DefensiveHierarchyComponent,
  ],
  providers: [CookieService, DatePipe],
  bootstrap: [AppComponent],
  imports: [
    AppRoutingModule,
    BrowserModule,
    FormsModule,
    HttpClientModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient],
      },
    }),
    NgFor,
    NgSelectModule,
    NgxIndexedDBModule.forRoot(dbConfig),
    KeywordFilterPipe,
    KeywordSomePipe,
    TreeModule,
    AddBrPipe,
    FormatNumberPipe,
  ],
})
export class AppModule {}
