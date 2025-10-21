// Categories Sayfas Kontrolü
class CategoriesPage {
    constructor() {
        this.categories = [];
        this.filteredCategories = [];
        this.searchTerm = '';
        this.init();
    }

    init() {
        this.loadCategories();
        this.attachEventListeners();
        this.updateStats();
    }

    loadCategories() {
        this.categories = dataManager.getCategories();
        this.filterCategories();
        this.renderCategories();
    }

    filterCategories() {
        if (!this.searchTerm) {
            this.filteredCategories = [...this.categories];
        } else {
            const searchLower = this.searchTerm.toLowerCase();
            this.filteredCategories = this.categories.filter(category =>
                category.name.toLowerCase().includes(searchLower) ||
                category.subcategories.some(sub => 
                    sub.toLowerCase().includes(searchLower)
                )
            );
        }
    }

    renderCategories() {
        const grid = document.getElementById('categoriesGrid');
        const emptyState = document.getElementById('emptyState');

        if (!grid) return;

        // Bo durum kontrolü
        if (this.filteredCategories.length === 0) {
            grid.style.display = 'none';
            if (emptyState) emptyState.style.display = 'block';
            return;
        }

        grid.style.display = 'grid';
        if (emptyState) emptyState.style.display = 'none';

        // Kategorileri render et
        grid.innerHTML = '';
        this.filteredCategories.forEach(category => {
            const categoryCard = this.createCategoryCard(category);
            grid.innerHTML += categoryCard;
        });
    }

    createCategoryCard(category) {
        const products = dataManager.getProductsByCategory(category.name);
        const productCount = products.length;
        
        const subcategoriesHTML = category.subcategories.map(sub => 
            `<span class="subcategory-tag" onclick="categoriesPage.filterBySubcategory('${sub}')">${sub}</span>`
        ).join('');

        const featuredProducts = products.filter(p => p.featured).slice(0, 3);
        const featuredProductsHTML = featuredProducts.map(product => `
            <div class="featured-product" onclick="categoriesPage.viewProduct(${product.id})">
                <span class="product-emoji">${product.image}</span>
                <span class="product-name">${product.name}</span>
                <span class="product-price">${product.price.toLocaleString()}</span>
            </div>
        `).join('');

        return `
            <div class="category-card" data-category-id="${category.id}">
                <div class="category-header">
                    <div class="category-icon">
                        <i class="${category.icon || 'fas fa-tag'}"></i>
                    </div>
                    <div class="category-info">
                        <h3 class="category-title">${category.name}</h3>
                        <div class="category-meta">
                            <span class="product-count">${productCount} ürün</span>
                            <span class="category-slug">/${category.slug}</span>
                        </div>
                    </div>
                </div>

                <div class="category-content">
                    <div class="subcategories-section">
                        <h4>Alt Kategoriler</h4>
                        <div class="subcategories-list">
                            ${subcategoriesHTML}
                        </div>
                    </div>

                    ${featuredProducts.length > 0 ? `
                    <div class="featured-products">
                        <h4>Öne Çkan Ürünler</h4>
                        <div class="featured-products-list">
                            ${featuredProductsHTML}
                        </div>
                    </div>
                    ` : ''}

                    ${productCount > 0 ? `
                    <div class="category-actions">
                        <button class="btn btn--primary" onclick="categoriesPage.viewCategory('${category.name}')">
                            <i class="fas fa-eye"></i> Tüm Ürünleri Gör
                        </button>
                        <button class="btn btn--secondary" onclick="categoriesPage.viewCategoryDetails(${category.id})">
                            <i class="fas fa-info-circle"></i> Detaylar
                        </button>
                    </div>
                    ` : `
                    <div class="no-products">
                        <i class="fas fa-box-open"></i>
                        <p>Bu kategoride henüz ürün bulunmuyor</p>
                    </div>
                    `}
                </div>
            </div>
        `;
    }

    attachEventListeners() {
        const searchInput = document.getElementById('categorySearch');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchTerm = e.target.value;
                this.filterCategories();
                this.renderCategories();
                this.updateStats();
            });
        }

        // Modal dna tklaynca kapat
        window.addEventListener('click', (event) => {
            const modal = document.getElementById('categoryModal');
            if (event.target === modal) {
                this.closeModal();
            }
        });
    }

    updateStats() {
        const totalCategories = document.getElementById('totalCategories');
        const totalProducts = document.getElementById('totalProducts');
        const featuredCategories = document.getElementById('featuredCategories');

        if (totalCategories) {
            totalCategories.textContent = this.filteredCategories.length;
        }

        if (totalProducts) {
            const productCount = this.filteredCategories.reduce((total, category) => {
                return total + dataManager.getProductsByCategory(category.name).length;
            }, 0);
            totalProducts.textContent = productCount;
        }

        if (featuredCategories) {
            // En fazla ürünü olan 3 kategori
            const popularCategories = this.filteredCategories
                .filter(category => dataManager.getProductsByCategory(category.name).length > 0)
                .sort((a, b) => 
                    dataManager.getProductsByCategory(b.name).length - 
                    dataManager.getProductsByCategory(a.name).length
                )
                .slice(0, 3).length;
            
            featuredCategories.textContent = popularCategories;
        }
    }

    clearSearch() {
        const searchInput = document.getElementById('categorySearch');
        if (searchInput) {
            searchInput.value = '';
            this.searchTerm = '';
            this.filterCategories();
            this.renderCategories();
            this.updateStats();
        }
    }

    filterBySubcategory(subcategory) {
        // Ürünler sayfasna yönlendir ve filtre uygula
        window.location.href = `products.html?search=${encodeURIComponent(subcategory)}`;
    }

    viewCategory(categoryName) {
        // Ürünler sayfasna yönlendir ve kategori filtresi uygula
        window.location.href = `products.html?category=${encodeURIComponent(categoryName)}`;
    }

    viewCategoryDetails(categoryId) {
        const category = this.categories.find(c => c.id === categoryId);
        if (category) {
            this.showCategoryModal(category);
        }
    }

    showCategoryModal(category) {
        const modal = document.getElementById('categoryModal');
        const title = document.getElementById('categoryModalTitle');
        const body = document.getElementById('categoryModalBody');

        if (!modal || !title || !body) return;

        const products = dataManager.getProductsByCategory(category.name);
        const productCount = products.length;
        const featuredProducts = products.filter(p => p.featured);
        const inStockProducts = products.filter(p => p.inStock);

        title.textContent = category.name;
        body.innerHTML = `
            <div class="category-modal-content">
                <div class="category-modal-header">
                    <div class="category-icon-large">
                        <i class="${category.icon || 'fas fa-tag'}"></i>
                    </div>
                    <div class="category-info-large">
                        <h4>${category.name}</h4>
                        <span class="category-slug">/${category.slug}</span>
                    </div>
                </div>

                <div class="category-stats-grid">
                    <div class="category-stat">
                        <span class="stat-value">${productCount}</span>
                        <span class="stat-label">Toplam Ürün</span>
                    </div>
                    <div class="category-stat">
                        <span class="stat-value">${featuredProducts.length}</span>
                        <span class="stat-label">Öne Çkan</span>
                    </div>
                    <div class="category-stat">
                        <span class="stat-value">${inStockProducts.length}</span>
                        <span class="stat-label">Stokta</span>
                    </div>
                </div>

                <div class="category-details">
                    <div class="detail-section">
                        <h5>Alt Kategoriler</h5>
                        <div class="subcategories-modal">
                            ${category.subcategories.map(sub => 
                                `<span class="subcategory-tag-large">${sub}</span>`
                            ).join('')}
                        </div>
                    </div>

                    ${products.length > 0 ? `
                    <div class="detail-section">
                        <h5>Ürün Dalm</h5>
                        <div class="products-preview">
                            ${products.slice(0, 5).map(product => `
                                <div class="product-preview" onclick="categoriesPage.viewProduct(${product.id})">
                                    <span class="product-emoji">${product.image}</span>
                                    <div class="product-preview-info">
                                        <span class="product-name">${product.name}</span>
                                        <span class="product-price">${product.price.toLocaleString()}</span>
                                    </div>
                                    ${product.featured ? '<i class="fas fa-star featured-star"></i>' : ''}
                                </div>
                            `).join('')}
                        </div>
                        ${products.length > 5 ? `
                        <div class="view-all-products">
                            <button class="btn btn--primary" onclick="categoriesPage.viewCategory('${category.name}')">
                                Tüm ${products.length} Ürünü Gör
                            </button>
                        </div>
                        ` : ''}
                    </div>
                    ` : `
                    <div class="no-products-modal">
                        <i class="fas fa-box-open"></i>
                        <p>Bu kategoride henüz ürün bulunmuyor</p>
                    </div>
                    `}
                </div>

                <div class="modal-actions">
                    <button class="btn btn--primary" onclick="categoriesPage.viewCategory('${category.name}')">
                        <i class="fas fa-shopping-bag"></i> Ürünleri Gör
                    </button>
                    <button class="btn btn--secondary" onclick="categoriesPage.closeModal()">
                        <i class="fas fa-times"></i> Kapat
                    </button>
                </div>
            </div>
        `;

        modal.style.display = 'block';
    }

    viewProduct(productId) {
        const product = dataManager.getProduct(productId);
        if (product) {
            // Products sayfasna yönlendir veya modal göster
            window.location.href = `products.html?product=${productId}`;
        }
    }

    closeModal() {
        const modal = document.getElementById('categoryModal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    // URL parametrelerinden kategori yükleme
    loadFromUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        const categoryParam = urlParams.get('category');
        
        if (categoryParam) {
            const searchInput = document.getElementById('categorySearch');
            if (searchInput) {
                searchInput.value = categoryParam;
                this.searchTerm = categoryParam;
                this.filterCategories();
                this.renderCategories();
                this.updateStats();
            }
        }
    }
}

// Sayfa yüklendiinde balat
document.addEventListener('DOMContentLoaded', () => {
    window.categoriesPage = new CategoriesPage();
    categoriesPage.loadFromUrl();
});
