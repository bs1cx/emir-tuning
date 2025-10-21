// Favoriler Sayfas Kontrolü
class WishlistPage {
    constructor() {
        this.wishlist = [];
        this.filteredWishlist = [];
        this.selectedItems = new Set();
        this.filters = {
            stock: '',
            sort: 'date'
        };
        this.init();
    }

    init() {
        this.loadWishlist();
        this.attachEventListeners();
        this.updateStats();
    }

    loadWishlist() {
        this.wishlist = cartManager.getWishlistItems();
        this.applyFilters();
        this.renderWishlist();
        this.updateBulkActions();
    }

    applyFilters() {
        let filtered = [...this.wishlist];

        // Stok filtresi
        if (this.filters.stock === 'inStock') {
            filtered = filtered.filter(item => item.product.inStock);
        } else if (this.filters.stock === 'outOfStock') {
            filtered = filtered.filter(item => !item.product.inStock);
        }

        // Sralama
        switch (this.filters.sort) {
            case 'price-low':
                filtered.sort((a, b) => a.product.price - b.product.price);
                break;
            case 'price-high':
                filtered.sort((a, b) => b.product.price - a.product.price);
                break;
            case 'name':
                filtered.sort((a, b) => a.product.name.localeCompare(b.product.name));
                break;
            case 'date':
            default:
                filtered.sort((a, b) => new Date(b.addedAt) - new Date(a.addedAt));
                break;
        }

        this.filteredWishlist = filtered;
    }

    renderWishlist() {
        const grid = document.getElementById('wishlistGrid');
        const emptyWishlist = document.getElementById('emptyWishlist');

        if (this.filteredWishlist.length === 0) {
            grid.style.display = 'none';
            emptyWishlist.style.display = 'block';
            return;
        }

        grid.style.display = 'grid';
        emptyWishlist.style.display = 'none';

        grid.innerHTML = this.filteredWishlist.map(item => this.createWishlistItem(item)).join('');
    }

    createWishlistItem(item) {
        const isSelected = this.selectedItems.has(item.product.id);
        const isInStock = item.product.inStock;
        
        return `
            <div class="wishlist-item ${isSelected ? 'selected' : ''}" data-product-id="${item.product.id}">
                <div class="item-select">
                    <input type="checkbox" 
                           ${isSelected ? 'checked' : ''}
                           onchange="wishlistPage.toggleSelection(${item.product.id})">
                </div>
                
                <div class="item-image">
                    ${item.product.image}
                    ${!isInStock ? '<span class="out-of-stock-badge">Stokta Yok</span>' : ''}
                </div>

                <div class="item-details">
                    <h4 class="item-title">${item.product.name}</h4>
                    <p class="item-category">${item.product.category}  ${item.product.subcategory}</p>
                    <p class="item-brand">Marka: ${item.product.brand} | Model: ${item.product.model}</p>
                    
                    <div class="item-features">
                        ${item.product.features.slice(0, 3).map(feature => 
                            `<span class="feature-tag">${feature}</span>`
                        ).join('')}
                    </div>

                    <div class="item-meta">
                        <span class="added-date">
                            <i class="far fa-calendar"></i>
                            ${this.formatDate(item.addedAt)}
                        </span>
                    </div>
                </div>

                <div class="item-price">
                    <div class="price-amount">${item.product.price.toLocaleString()}</div>
                    ${isInStock ? 
                        '<span class="stock-badge in-stock"><i class="fas fa-check"></i> Stokta</span>' :
                        '<span class="stock-badge out-of-stock"><i class="fas fa-times"></i> Stokta Yok</span>'
                    }
                </div>

                <div class="item-actions">
                    ${isInStock ? `
                    <button class="btn btn--primary btn--small" onclick="wishlistPage.addToCart(${item.product.id})">
                        <i class="fas fa-cart-plus"></i> Sepete Ekle
                    </button>
                    ` : `
                    <button class="btn btn--secondary btn--small" disabled>
                        <i class="fas fa-bell"></i> Stok Gelince Haber Ver
                    </button>
                    `}
                    
                    <button class="btn btn--secondary btn--small" onclick="wishlistPage.removeFromWishlist(${item.product.id})">
                        <i class="fas fa-trash"></i> Kaldr
                    </button>
                    
                    <button class="btn btn--outline btn--small" onclick="wishlistPage.viewProduct(${item.product.id})">
                        <i class="fas fa-eye"></i> ncele
                    </button>
                </div>
            </div>
        `;
    }

    attachEventListeners() {
        // Filtre deiiklikleri
        const stockFilter = document.getElementById('stockFilter');
        const sortFilter = document.getElementById('sortFilter');

        if (stockFilter) {
            stockFilter.addEventListener('change', (e) => {
                this.filters.stock = e.target.value;
                this.loadWishlist();
            });
        }

        if (sortFilter) {
            sortFilter.addEventListener('change', (e) => {
                this.filters.sort = e.target.value;
                this.loadWishlist();
            });
        }

        // Favori güncellemelerini dinle
        document.addEventListener('wishlistUpdated', () => {
            this.loadWishlist();
            this.updateStats();
        });

        // Toplu seçim için
        document.addEventListener('click', (e) => {
            if (e.target.closest('.select-all')) {
                this.toggleSelectAll();
            }
        });
    }

    updateStats() {
        const totalWishlist = document.getElementById('totalWishlist');
        const inStockCount = document.getElementById('inStockCount');
        const outOfStockCount = document.getElementById('outOfStockCount');
        const totalValue = document.getElementById('totalValue');

        if (totalWishlist) {
            totalWishlist.textContent = this.wishlist.length;
        }

        const inStock = this.wishlist.filter(item => item.product.inStock).length;
        const outOfStock = this.wishlist.length - inStock;
        const value = this.wishlist.reduce((total, item) => total + item.product.price, 0);

        if (inStockCount) inStockCount.textContent = inStock;
        if (outOfStockCount) outOfStockCount.textContent = outOfStock;
        if (totalValue) totalValue.textContent = `${value.toLocaleString()}`;
    }

    // SEÇM LEMLER

    toggleSelection(productId) {
        if (this.selectedItems.has(productId)) {
            this.selectedItems.delete(productId);
        } else {
            this.selectedItems.add(productId);
        }
        
        this.updateItemSelection(productId);
        this.updateBulkActions();
    }

    updateItemSelection(productId) {
        const item = document.querySelector(`.wishlist-item[data-product-id="${productId}"]`);
        if (item) {
            const isSelected = this.selectedItems.has(productId);
            item.classList.toggle('selected', isSelected);
        }
    }

    updateBulkActions() {
        const bulkActions = document.getElementById('bulkActions');
        const selectedCount = document.getElementById('selectedCount');

        if (this.selectedItems.size > 0) {
            bulkActions.style.display = 'block';
            selectedCount.textContent = `${this.selectedItems.size} ürün seçildi`;
        } else {
            bulkActions.style.display = 'none';
        }
    }

    toggleSelectAll() {
        const allSelected = this.selectedItems.size === this.filteredWishlist.length;
        
        if (allSelected) {
            this.selectedItems.clear();
        } else {
            this.filteredWishlist.forEach(item => {
                this.selectedItems.add(item.product.id);
            });
        }
        
        this.renderWishlist();
        this.updateBulkActions();
    }

    // TOPLU LEMLER

    addSelectedToCart() {
        let addedCount = 0;
        
        this.selectedItems.forEach(productId => {
            const item = this.wishlist.find(w => w.product.id === productId);
            if (item && item.product.inStock) {
                cartManager.addToCart(item.product);
                addedCount++;
            }
        });

        if (addedCount > 0) {
            cartManager.showNotification(`${addedCount} ürün sepete eklendi!`, 'success');
        } else {
            cartManager.showNotification('Seçilen ürünlerden stokta olan bulunamad.', 'info');
        }

        this.selectedItems.clear();
        this.updateBulkActions();
    }

    removeSelected() {
        if (this.selectedItems.size === 0) return;

        if (confirm(`Seçilen ${this.selectedItems.size} ürünü favorilerden kaldrmak istediinizden emin misiniz?`)) {
            this.selectedItems.forEach(productId => {
                cartManager.removeFromWishlist(productId);
            });
            
            this.selectedItems.clear();
            this.updateBulkActions();
        }
    }

    // BREYSEL LEMLER

    addToCart(productId) {
        const product = dataManager.getProduct(productId);
        if (product) {
            cartManager.addToCart(product);
        }
    }

    removeFromWishlist(productId) {
        if (confirm('Bu ürünü favorilerden kaldrmak istediinizden emin misiniz?')) {
            cartManager.removeFromWishlist(productId);
        }
    }

    viewProduct(productId) {
        window.location.href = `products.html?product=${productId}`;
    }

    clearFilters() {
        this.filters = { stock: '', sort: 'date' };
        document.getElementById('stockFilter').value = '';
        document.getElementById('sortFilter').value = 'date';
        this.loadWishlist();
    }

    clearWishlist() {
        if (this.wishlist.length === 0) return;

        if (confirm('Tüm favori ürünlerinizi kaldrmak istediinizden emin misiniz? Bu ilem geri alnamaz.')) {
            this.wishlist.forEach(item => {
                cartManager.removeFromWishlist(item.product.id);
            });
            this.selectedItems.clear();
        }
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) return 'Dün';
        if (diffDays < 7) return `${diffDays} gün önce`;
        if (diffDays < 30) return `${Math.floor(diffDays / 7)} hafta önce`;
        
        return date.toLocaleDateString('tr-TR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    }
}

// Sayfa yüklendiinde balat
document.addEventListener('DOMContentLoaded', () => {
    window.wishlistPage = new WishlistPage();
});
