import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService } from '../core/api.service';
import { Enquiry } from '../core/models';
import { Subscription, timer } from 'rxjs';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css'
})
export class AdminComponent implements OnInit, OnDestroy {
  private readonly api = inject(ApiService);
  private poll?: Subscription;
  private firstLoad = true;
  private knownIds = new Set<number>();

  authenticated = false;
  checkingSession = true;
  username = '';
  password = '';
  loginError = '';
  enquiries: Enquiry[] = [];
  loading = false;
  toast = '';

  ngOnInit(): void {
    this.api.session().subscribe({
      next: result => {
        this.authenticated = result.authenticated;
        this.checkingSession = false;
        if (this.authenticated) this.startDashboard();
      },
      error: () => {
        this.authenticated = false;
        this.checkingSession = false;
      }
    });
  }

  login(): void {
    this.loginError = '';
    if (!this.username || !this.password) {
      this.loginError = 'Enter username and password.';
      return;
    }
    this.api.login(this.username, this.password).subscribe({
      next: result => {
        if (result.success) {
          this.authenticated = true;
          this.password = '';
          this.startDashboard();
        } else {
          this.loginError = result.message || 'Invalid username or password.';
        }
      },
      error: error => {
        this.loginError = error?.error?.message || 'Invalid username or password.';
      }
    });
  }

  startDashboard(): void {
    this.loadQueries(true);
    this.poll?.unsubscribe();
    this.poll = timer(10000, 10000).subscribe(() => this.loadQueries(false));
  }

  loadQueries(initial: boolean): void {
    if (this.loading) return;
    this.loading = true;
    this.api.getQueries().subscribe({
      next: data => {
        const ids = new Set(data.map(q => q.id));
        if (!initial && !this.firstLoad) {
          const newItems = data.filter(q => !this.knownIds.has(q.id));
          if (newItems.length) {
            const latest = newItems[0];
            this.showNewEnquiry(latest);
          }
        }
        this.enquiries = data;
        this.knownIds = ids;
        this.firstLoad = false;
        this.loading = false;
      },
      error: error => {
        this.loading = false;
        if (error.status === 401) {
          this.authenticated = false;
          this.poll?.unsubscribe();
        }
      }
    });
  }

  showNewEnquiry(q: Enquiry): void {
    this.toast = `New enquiry #${q.id} — ${q.carModel}`;
    setTimeout(() => this.toast = '', 5000);

    if ('Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification('New CarFixHub Enquiry', {
          body: `Enquiry #${q.id}\n${q.carModel} • ${q.serviceType}`
        });
      } else if (Notification.permission === 'default') {
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            new Notification('New CarFixHub Enquiry', {
              body: `Enquiry #${q.id}\n${q.carModel} • ${q.serviceType}`
            });
          }
        });
      }
    }
  }

  async deleteQuery(q: Enquiry): Promise<void> {
    if (!confirm(`Delete enquiry #${q.id}?`)) return;
    this.api.deleteQuery(q.id).subscribe({
      next: () => {
        this.enquiries = this.enquiries.filter(item => item.id !== q.id);
        this.knownIds.delete(q.id);
      },
      error: error => alert(error?.error?.message || 'Unable to delete enquiry.')
    });
  }

  callCustomer(mobile: string): void {
    window.location.href = `tel:+91${mobile}`;
  }

  logout(): void {
    this.api.logout().subscribe({
      next: () => this.finishLogout(),
      error: () => this.finishLogout()
    });
  }

  finishLogout(): void {
    this.poll?.unsubscribe();
    this.authenticated = false;
    this.enquiries = [];
    this.knownIds.clear();
    window.location.href = '/';
  }

  formatDateTime(value: string): string {
    if (!value) return '—';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return new Intl.DateTimeFormat('en-IN', {
      timeZone: 'Asia/Kolkata', day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true
    }).format(date);
  }

  photoUrls(q: Enquiry): string[] {
    return [q.photoUrl1, q.photoUrl2, q.photoUrl3].filter(Boolean);
  }

  downloadUrl(url: string): string {
    return url.includes('/upload/') ? url.replace('/upload/', '/upload/fl_attachment/') : url;
  }

  ngOnDestroy(): void {
    this.poll?.unsubscribe();
  }
}
