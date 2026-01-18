import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideStore } from '@ngrx/store';
import { SocketIoModule, SocketIoConfig } from 'ngx-socket-io';

import { routes } from './app.routes';
import { infrastructureReducer } from './store/infrastructure.reducer';

const config: SocketIoConfig = { 
  url: 'http://127.0.0.1:5050', // Direct connection
  options: {
    transports: ['websocket'],
    autoConnect: true
  } 
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(),
    provideStore({ infrastructure: infrastructureReducer }),
    importProvidersFrom(SocketIoModule.forRoot(config))
  ]
};