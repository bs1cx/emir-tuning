// Admin Authentication Sistemi
class AdminAuth {
    constructor() {
        this.isAuthenticated = this.checkAuth();
        this.init();
    }

    init() {
        // Sayfa yüklendiinde auth kontrolü yap
        this.checkPageAccess();
        
        // Login formunu balat
        this.initLoginForm();
    }

    checkAuth() {
        return localStorage.getItem('adminAuthenticated') === 'true';
    }

    checkPageAccess() {
        const isLoginPage = window.location.pathname.includes('admin/index.html') || 
                           window.location.pathname.endsWith('admin/');
        const isDashboardPage = window.location.pathname.includes('dashboard.html');

        if (isDashboardPage && !this.isAuthenticated) {
            // Dashboard'a eriim yok, login'e yönlendir
            window.location.href = 'index.html';
            return;
        }

        if (isLoginPage && this.isAuthenticated) {
            // Zaten giri yaplm, dashboard'a yönlendir
            window.location.href = 'dashboard.html';
            return;
        }
    }

    initLoginForm() {
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.login();
            });
        }
    }

    login() {
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        // Basit auth kontrolü (gerçek uygulamada backend kullann)
        if (username === 'admin' && password === 'admin123') {
            localStorage.setItem('adminAuthenticated', 'true');
            localStorage.setItem('adminUsername', username);
            this.isAuthenticated = true;
            
            // Baarl mesaj
            this.showMessage('Giri baarl! Yönlendiriliyorsunuz...', 'success');
            
            // Dashboard'a yönlendir
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1000);
        } else {
            this.showMessage('Kullanc ad veya ifre hatal!', 'error');
        }
    }

    logout() {
        if (confirm('Çk yapmak istediinizden emin misiniz?')) {
            localStorage.removeItem('adminAuthenticated');
            localStorage.removeItem('adminUsername');
            this.isAuthenticated = false;
            
            // Login sayfasna yönlendir
            window.location.href = 'index.html';
        }
    }

    showMessage(message, type = 'info') {
        // Basit mesaj gösterme
        alert(message);
        
        // Daha gelimi bir mesaj sistemi için:
        // const messageDiv = document.createElement('div');
        // messageDiv.className = `message message-${type}`;
        // messageDiv.textContent = message;
        // document.body.appendChild(messageDiv);
        
        // setTimeout(() => {
        //     messageDiv.remove();
        // }, 3000);
    }

    getUsername() {
        return localStorage.getItem('adminUsername') || 'Admin';
    }
}

// Global instance
const adminAuth = new AdminAuth();
