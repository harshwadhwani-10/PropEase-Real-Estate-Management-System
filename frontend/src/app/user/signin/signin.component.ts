import { AfterViewInit, Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LoadingController, Platform, ToastController } from '@ionic/angular';
import { GoogleAuthResponse } from 'src/app/shared/interface/google';
import { environment } from 'src/environments/environment';
import { UserService } from '../user.service';
// CDN - https://accounts.google.com/gsi/client
declare let google: any;

@Component({
    selector: 'app-signin',
    templateUrl: './signin.component.html',
    styleUrls: ['./signin.component.css'],
    standalone: false
})
export class SigninComponent implements OnInit, AfterViewInit {
  public error = false;
  public authFailed = false;
  public signinForm: UntypedFormGroup;
  public showSocial = false;

  constructor(
    private fb: UntypedFormBuilder,
    private user: UserService,
    private toastCtrl: ToastController,
    public loadingController: LoadingController,
    private router: Router,
    public platform: Platform
  ) {
    this.signinForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  ngOnInit() {
    this.showSocial = !!environment.api.googleAuthClientId;
  }

  ngAfterViewInit(): void {
    if (!this.platform.is('capacitor')) {
      this.initializeGoogleSigninWeb();
    }
  }

  public async submit() {
    if (this.signinForm.invalid) {
      this.error = true;
      return;
    }
    const loading = await this.presentLoading();
    loading.present();

    const { email, password } = this.signinForm.value;
    const result = await this.user.signIn(email, password);
    
    console.log('Sign-in result:', result);
    loading.dismiss();

    // Check if we have user data (successful sign-in)
    if (result.data && result.data.accessToken) {
      console.log('Sign-in successful, showing toast and navigating...');
      this.showToast('Success, You are logged in');
      // Small delay to ensure user state is updated before navigation
      setTimeout(() => {
        console.log('Navigating to /map...');
        this.router.navigate(['/map'], { replaceUrl: true });
      }, 100);
    } else {
      console.log('Sign-in failed:', result);
      this.showToast(result.message || 'Sign-in failed', 'danger');
    }
  }

  private initializeGoogleSigninWeb(): void {
    if (!environment.api.googleAuthClientId) { return; }

    google.accounts.id.initialize({
      client_id: environment.api.googleAuthClientId,
      callback: this.handleCredentialResponse.bind(this),
      auto_select: false,
      cancel_on_tap_outside: true,
    });
    google.accounts.id.renderButton(document.getElementById('web-google-button'), {
      theme: 'outline',
      size: 'large',
      width: '330px',
    });
    google.accounts.id.prompt(async (notification: unknown) => {
      console.log(notification);
    });
  }

  private async handleCredentialResponse(response: GoogleAuthResponse) {
    // Here will be your response from Google.
    const loading = await this.presentLoading();
    loading.present();
    const user = await this.user.googleAuth(response);
    if (user) {
      await this.showToast('Success, You are logged in');
      // Small delay to ensure user state is updated before navigation
      setTimeout(() => {
        this.router.navigateByUrl('/map');
      }, 100);
      loading.dismiss();
    }
  }

  private async presentLoading() {
    return await this.loadingController.create({
      cssClass: 'my-custom-class',
      message: 'Please wait...',
    });
  }

  private async showToast(message, color = 'success') {
    console.log('Showing toast:', message, color);
    const toast = await this.toastCtrl.create({
      message,
      duration: 2000,
      color,
    });
    await toast.present();
    console.log('Toast presented');
  }
}
