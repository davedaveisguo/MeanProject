import { Component, OnInit, OnDestroy } from "@angular/core";
import { AuthService } from "src/app/auth/auth.service";
import { Subscription } from "rxjs";

@Component({
  selector: "app-header",
  templateUrl: "./header.component.html",
  styleUrls: ["./header.component.css"],
})
export class HeaderComponent implements OnInit, OnDestroy {
  userIsAuthed = false;
  private authListenerSubs: Subscription;

  constructor(private authService: AuthService) {}

  ngOnDestroy(): void {
    this.authListenerSubs.unsubscribe();
  }


  ngOnInit(): void {
     //  if dont add this code, so header component will not reflect change of status
    this.userIsAuthed = this.authService.getIsAuth();
    this.authListenerSubs = this.authService
      .getAuthStatusListener()
      .subscribe((isAuthed) => {
        this.userIsAuthed = isAuthed;
      });
  }

  onLogout(){
      this.authService.logout();
  }
}
