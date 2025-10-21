cat > js/products.js << 'EOF'
// Products SayfasÄ± Ana KontrolÃ¼
class ProductsPage {
    constructor() {
        this.filters = filters;
        this.productGrid = productGrid;
        this.init();
    }

    init() {
        // Component'leri baÅlat
        this.filters.init();
        this.productGrid.init();

        // Ä°lk Ã¼rÃ¼nleri yÃ¼kle
        this.loadProducts();

        // Event listener'larÄ± ekle
        this.attachEventListeners();
    }

    loadProducts() {
        const currentFilters = this.filters.getCurrentFilters();
        const products = dataManager.getProducts(currentFilters);
        this.productGrid.updateProducts(products);
    }

    attachEventListeners() {
        // Filtre deÄiÅikliklerini dinle
        document.addEventListener('filtersChanged', (event) => {
            this.loadProducts();
        });

        // Modal dÄ±ÅÄ±na tÄ±klayÄ±nca kapat
        window.addEventListener('click', (event) => {
            const modal = document.getElementById('productModal');
            if (event.target === modal) {
                this.closeModal();
            }
        });
    }

    clearFilters() {
        this.filters.clearFilters();
    }

    closeModal() {
        this.productGrid.closeModal();
    }

    // URL parametrelerinden filtreleme
    applyUrlFilters() {
        const urlParams = new URLSearchParams(window.location.search);
        const category = urlParams.get('category');
        
        if (category) {
            this.filters.setFilters({ category: category });
        }
    }
}

// Sayfa yÃ¼klendiÄinde baÅlat
document.addEventListener('DOMContentLoaded', () => {
    window.productsPage = new ProductsPage();
    productsPage.applyUrlFilters();
});
EOF