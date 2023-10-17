import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { FormsModule } from "@angular/forms";
import { RouterModule, Routes } from "@angular/router";

import { AppComponent } from "./app.component";
import { HomeComponent } from "./home/home.component";
import { GameComponent } from './game/game.component';
import { AppRoutingModule } from './app-routing.module';

const routes: Routes = [{ path: "", component: HomeComponent }];

@NgModule({
  declarations: [AppComponent, HomeComponent, GameComponent],
  imports: [BrowserModule, FormsModule, RouterModule.forRoot(routes), AppRoutingModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
