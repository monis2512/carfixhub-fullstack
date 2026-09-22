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
  showPassword = false;

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
    window.location.href = '/admin';
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

// Mobile sidebar
sidebarOpen = false;

 // if (this.sidebarOpen) {
 // document.body.classList.add('sidebar-open');
//} else {
 // document.body.classList.remove('sidebar-open');
//}


toggleSidebar(): void {
  this.sidebarOpen = !this.sidebarOpen;

  if (this.sidebarOpen) {
    document.body.style.overflow = 'hidden';   // lock scroll
  } else {
    document.body.style.overflow = '';         // restore scroll
  }
}
  

// Image viewer
lightboxOpen = false;
lightboxImages: string[] = [];
currentImageIndex = 0;

// Open image viewer
openLightbox(images: string[], index: number): void {
  this.lightboxImages = images;
  this.currentImageIndex = index;
  this.lightboxOpen = true;
}

// Close image viewer
closeLightbox(): void {
  this.lightboxOpen = false;
}

// Next image
nextImage(): void {
  this.currentImageIndex =
    (this.currentImageIndex + 1) % this.lightboxImages.length;
}

// Previous image
prevImage(): void {
  this.currentImageIndex =
    (this.currentImageIndex - 1 + this.lightboxImages.length) %
    this.lightboxImages.length;
}

// Download image
downloadImage(url: string): void {
  fetch(url)
    .then(res => res.blob())
    .then(blob => {
      const blobUrl = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `damage-photo-${Date.now()}.jpg`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(blobUrl);
    })
    .catch(() => {
      window.open(url, '_blank');
    });
}

  scrollToEnquiries(): void {
  this.sidebarOpen = false;

  setTimeout(() => {
    const section = document.getElementById('enquiries');
    section?.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  }, 250); // Wait for sidebar to close
}

  searchTerm = '';

currentPage = 1;
itemsPerPage = 5;

  get filteredEnquiries() {
  const term = this.searchTerm.trim().toLowerCase();

  const filtered = this.enquiries.filter(enquiry =>
    (enquiry.carModel || '').toLowerCase().includes(term) ||
    (enquiry.mobileNumber || '').toLowerCase().includes(term)
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / this.itemsPerPage));

  if (this.currentPage > totalPages) {
    this.currentPage = totalPages;
  }

  return filtered;
}

  get paginatedEnquiries() {
  const start = (this.currentPage - 1) * this.itemsPerPage;
  return this.filteredEnquiries.slice(start, start + this.itemsPerPage);
}

get totalPages() {
  return Math.max(1, Math.ceil(this.filteredEnquiries.length / this.itemsPerPage));
}

get pages() {
  return Array.from({ length: this.totalPages }, (_, i) => i + 1);
}

  goToPage(page: number) {
  this.currentPage = page;
}

nextPage() {
  if (this.currentPage < this.totalPages) {
    this.currentPage++;
  }
}

prevPage() {
  if (this.currentPage > 1) {
    this.currentPage--;
  }
}
  
  ngOnDestroy(): void {
    this.poll?.unsubscribe();
  }
}
