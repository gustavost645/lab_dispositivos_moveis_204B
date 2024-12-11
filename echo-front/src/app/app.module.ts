import { NgModule } from '@angular/core';
import { LOCALE_ID } from '@angular/core';
import { registerLocaleData } from '@angular/common';

import { BrowserModule } from '@angular/platform-browser';
import { TooltipModule } from 'primeng/tooltip';

import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { JwtInterceptor } from './infra/interceptors/jwt.interceptor';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AppLayoutModule } from './components/layout/app.layout.module';
import { LoadingInterceptor } from './infra/interceptors/loading.interceptor';
import { LoadingComponent } from './components/loading/loading.component';
import { LoadingService } from './components/loading/service/loading.service';
import localePtBr from '@angular/common/locales/pt';
import { IntegerOnlyDirective } from './infra/diretive/integer-only.directive';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app'; // Para inicializar o Firebase
import { getAuth, provideAuth } from '@angular/fire/auth'; // Para autenticação
import { environment } from '../environments/environment';
import { ReactiveFormsModule } from '@angular/forms';
import { NgxMaskConfig, NgxMaskDirective, NgxMaskPipe, provideEnvironmentNgxMask } from 'ngx-mask'


registerLocaleData(localePtBr);

const maskConfig: Partial<NgxMaskConfig> = {
  validation: false,
};

@NgModule({
  declarations: [AppComponent, LoadingComponent, IntegerOnlyDirective],
  imports: [
    HttpClientModule,
    BrowserModule,
    AppRoutingModule,
    AppLayoutModule,
    TooltipModule,
    ReactiveFormsModule,
    NgxMaskDirective,
    NgxMaskPipe,
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideAuth(() => getAuth()),
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: JwtInterceptor,
      multi: true,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: LoadingInterceptor,
      multi: true,
    },
    LoadingService,
    { provide: LOCALE_ID, useValue: 'pt-BR' },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
