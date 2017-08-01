import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule }   from '@angular/forms';

import { AppComponent } from './app.component';
import { GeneralConfigurationComponent } from './general-configuration/general-configuration.component';
import { ConfigurationService } from './configuration.service';

import {MdTabsModule, MdCardModule, MdInputModule, MdButtonModule, MdIconModule} from '@angular/material';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';

@NgModule({
  declarations: [
    AppComponent,
    GeneralConfigurationComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    MdTabsModule,
    MdCardModule,
    MdInputModule,
    MdButtonModule,
    MdIconModule,
    BrowserAnimationsModule
  ],
  providers: [ConfigurationService],
  bootstrap: [AppComponent]
})
export class AppModule { }
