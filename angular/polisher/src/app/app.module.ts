import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MdSidenavModule } from '@angular/material';

import { AppComponent } from './app.component';
import { SideBareService } from './side-bare.service';
import { SideBareComponent } from './side-bare/side-bare.component';

@NgModule({
  declarations: [
    AppComponent,
    SideBareComponent
  ],
  imports: [
    BrowserModule,
    MdSidenavModule,
    BrowserAnimationsModule
  ],
  providers: [SideBareService],
  bootstrap: [AppComponent]
})
export class AppModule { }
