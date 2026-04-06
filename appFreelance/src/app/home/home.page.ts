import { Component } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';

interface HomeFeature {
  title: string;
  icon: string;
}

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage {

  readonly features: HomeFeature[] = [
    {
      title: 'Graphic Design',
      icon: 'color-palette-outline',
    },
    {
      title: 'Digital Marketing',
      icon: 'megaphone-outline',
    },
    {
      title: 'Web Development',
      icon: 'code-slash-outline',
    },
    {
      title: 'Video Editing',
      icon: 'film-outline',
    },
    {
      title: 'Content Writing',
      icon: 'create-outline',
    },
    {
      title: 'UI / UX Design',
      icon: 'phone-portrait-outline',
    },
  ];
  readonly freelancers: any[] = [
    {
      name: 'Yassmine Abdelhak',
      icon: 'color-palette-outline',
    },
    {
      name: 'Asma Abdedaiem ',
      icon: 'megaphone-outline',
    },
    {
      name : 'Sirine Saidi',
      icon: 'code-slash-outline',
    },
    {
      name: 'Yasmine Srioui',
      icon: 'film-outline',
    },
    {
      name: 'Content Writing',
      icon: 'create-outline',
    },
    {
      name: 'UI / UX Design',
      icon: 'phone-portrait-outline',
    },
  ];
readonly services: any[] = [
  {
    title: 'Graphic Design',
    image: 'color-palette-outline',
  },
  {
    title: 'Digital Marketing',
    image: 'megaphone-outline',
  },
  {
    title: 'Web Development',
    image: 'code-slash-outline',
  },
  {
    title: 'Video Editing',
    image: 'film-outline',
  },
  {
    title: 'Content Writing',
    image: 'create-outline',
  },
  {
    title: 'UI / UX Design',
    image: 'phone-portrait-outline',
  },
];
  constructor(private readonly router: Router) {}

  goToLogin(): void {
    this.router.navigateByUrl('/login');
  }

  goToRegister(): void {
    this.router.navigateByUrl('/register');
  }

}
