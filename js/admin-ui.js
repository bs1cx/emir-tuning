// Admin UI Yönetimi
class AdminUI {
    constructor() {
        this.currentTab = 'dashboard';
        this.init();
    }

    init() {
        this.initTabs();
        this.initUserInfo();
        this.loadDashboardStats();
    }

    initTabs() {
        // Tab linklerine event listener ekle
        const tabLinks = document.querySelectorAll('[data-tab]');
        tabLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const tabName = link.getAttribute('data-tab');
                this.showTab(tabName);
            });
        });

        // Aktif tab' göster
        const urlHash = window.location.hash.substring(1);
        if (urlHash) {
            this.showTab(urlHash);
        }
    }

    showTab(tabName) {
        // Tüm tab'lar gizle
        const tabs = document.querySelectorAll('.admin-tab');
        tabs.forEach(tab => {
            tab.classList.remove('active');
        });

        // Tüm menu item'lar pasif yap
        const menuItems = document.querySelectorAll('.menu-item');
        menuItems.forEach(item => {
            item.classList.remove('active');
        });

        // Hedef tab' göster
        const targetTab = document.getElementById(tabName);
        if (targetTab) {
            targetTab.classList.add('active');
            this.currentTab = tabName;

            // Menu item' aktif yap
            const targetMenuItem = document.querySelector(`[data-tab="${tabName}"]`).parentElement;
            if (targetMenuItem) {
                targetMenuItem.classList.add('active');
            }

            // URL hash'ini güncelle
            window.location.hash = tabName;

            // Tab deiince ilgili verileri yükle
            this.onTabChange(tabName);
        }
    }

    onTabChange(tabName) {
        switch (tabName) {
            case 'products':
                if (typeof adminProducts !== 'undefined') {
                    adminProducts.loadProductsTable();
                }
                break;
            case 'categories':
                if (typeof adminCategories !== 'undefined') {
                    adminCategories.loadCategoriesList();
                }
                break;
            case 'dashboard':
                this.loadDashboardStats();
                break;
        }
    }

    initUserInfo() {
        const usernameElement = document.getElementById('adminUsername');
        if (usernameElement) {
            usernameElement.textContent = adminAuth.getUsername();
        }
    }

    loadDashboardStats() {
        const stats = dataManager.getStats();
        
        document.getElementById('totalProducts').textContent = stats.totalProducts;
        document.getElementById('totalCategories').textContent = stats.totalCategories;
        document.getElementById('featuredProducts').textContent = stats.featuredProducts;
        document.getElementById('outOfStock').textContent = stats.outOfStock;

        // Son eklenen ürünleri yükle
        this.loadRecentProducts();
    }

    loadRecentProducts() {
        const recentList = document.getElementById('recentProductsList');
        if (!recentList) return;

        const products = dataManager.getProducts({ sort: 'name' }).slice(0, 5);
        
        if (products.length === 0) {
            recentList.innerHTML = '<p class="no-data">Henüz ürün bulunmuyor</p>';
            return;
        }

        recentList.innerHTML = products.map(product => `
            <div class="recent-item">
                <div class="product-info">
                    <span class="product-name">${product.name}</span>
                    <span class="product-category">${product.category}</span>
                </div>
                <div class="product-meta">
                    <span class="product-price">${product.price.toLocaleString()}</span>
                    <span class="product-stock ${product.inStock ? 'in-stock' : 'out-of-stock'}">
                        ${product.inStock ? 'Stokta' : 'Stokta Yok'}
                    </span>
                </div>
            </div>
        `).join('');
    }

    showLoading() {
        // Loading göster
        console.log('Loading...');
    }

    hideLoading() {
        // Loading gizle
        console.log('Loading hidden');
    }

    showMessage(message, type = 'info') {
        // Mesaj göster
        alert(`${type.toUpperCase()}: ${message}`);
    }
}

// Global instance
const adminUI = new AdminUI();
