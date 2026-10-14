import { bootstrapApplication } from '@angular/platform-browser';
import { contratoConfig } from './contrato/contrato.config';
import { Portal } from './portal/portal';

bootstrapApplication(Portal, contratoConfig)
  .catch((err) => console.error(err));
