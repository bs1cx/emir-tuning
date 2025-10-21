// Admin Panel Ana Balatc
class AdminMain {
    constructor() {
        this.init();
    }

    init() {
        console.log('Admin panel balatlyor...');
        
        // Auth kontrolü
        if (!adminAuth.isAuthenticated) {
            window.location.href = 'index.html';
            return;
        }

        // UI bileenlerini balat
        this.initComponents();
        
        // Event listener'lar ekle
        this.attachEventListeners();

        // lk verileri yükle
        this.loadInitialData();

        console.log('Admin panel balatld!');
    }

    initComponents() {
        // Component'ler zaten global instance olarak oluturuldu
        // Burada ek balatma ilemleri yaplabilir
    }

    attachEventListeners() {
        // Global event listener'lar
        document.addEventListener('click', (e) => {
            // Modal dna tklaynca kapat
            if (e.target.classList.contains('admin-modal')) {
                this.closeAllModals();
            }
        });

        // Klavye ksayollar
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                    case 'n':
                        e.preventDefault();
                        if (adminUI.currentTab === 'products') {
                            adminProducts.openProductModal();
                        }
                        break;
                    case 's':
                        e.preventDefault();
                        // Kaydet ilemi
                        break;
                    case 'e':
                        e.preventDefault();
                        adminData.exportData();
                        break;
                }
            }

            // ESC ile modallar kapat
            if (e.key === 'Escape') {
                this.closeAllModals();
            }
        });
    }

    closeAllModals() {
        const modals = document.querySelectorAll('.admin-modal');
        modals.forEach(modal => {
            modal.style.display = 'none';
        });

        // Editing state'leri sfrla
        if (adminProducts) adminProducts.editingProductId = null;
        if (adminCategories) adminCategories.editingCategoryId = null;
    }

    loadInitialData() {
        // lk açlta gerekli verileri yükle
        if (adminUI.currentTab === 'products') {
            adminProducts.loadProductsTable();
        } else if (adminUI.currentTab === 'categories') {
            adminCategories.loadCategoriesList();
        }
    }

    // Global helper functions
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('tr-TR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    formatPrice(price) {
        return '' + price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    }
}

// Admin paneli balat
document.addEventListener('DOMContentLoaded', () => {
    new AdminMain();
});

// Global helper functions
window.adminHelpers = {
    formatDate: (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('tr-TR');
    },
    formatPrice: (price) => {
        return '' + price.toLocaleString('tr-TR');
    }
};
