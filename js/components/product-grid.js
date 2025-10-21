// ÃrÃ¼n Grid Component'i
class ProductGrid {
    constructor() {
        this.products = [];
    }

    init() {
        this.renderProducts();
    }

    renderProducts(products = []) {
        this.products = products;
        const grid = document.getElementById('productsGrid');
        const emptyState = document.getElementById('emptyState');
        const productsCount = document.getElementById('productsCount');

        if (!grid) return;

        // ÃrÃ¼n sayÄ±sÄ±nÄ± gÃ¼ncelle
        if (productsCount) {
            productsCount.textContent = `${products.length} Ã¼rÃ¼n bulundu`;
        }

        // BoÅ durum kontrolÃ¼
        if (products.length === 0) {
            grid.style.display = 'none';
            if (emptyState) emptyState.style.display = 'block';
            return;
        }

        grid.style.display = 'grid';
        if (emptyState) emptyState.style.display = 'none';

        // ÃrÃ¼nleri render et
        grid.innerHTML = '';
        products.forEach(product => {
            const productCard = this.createProductCard(product);
            grid.innerHTML += productCard;
        });
    }

    createProductCard(product) {
        const featuresHTML = product.features.map(feature => 
            `<span class="feature-tag">${feature}</span>`
        ).join('');

        const stockStatus = product.inStock ? 
            '<span class="stock-badge in-stock">Stokta</span>' : 
            '<span class="stock-badge out-of-stock">Stokta Yok</span>';

        return `
            <div class="product-card detailed-card" data-product-id="${product.id}">
                <div class="product-image">
                    ${product.image}
                    ${product.featured ? '<span class="featured-badge">Ãne ÃÄ±kan</span>' : ''}
                </div>
                <div class="product-info">
                    ${stockStatus}
                    <h3 class="product-title">${product.name}</h3>
                    <p class="product-category">${product.category} âº ${product.subcategory}</p>
                    <p class="product-brand-model">${product.brand} â¢ ${product.model} â¢ ${product.year}</p>
                    
                    <div class="product-features">
                        ${featuresHTML}
                    </div>
                    
                    <p class="product-description">${product.description}</p>
                    
                    <div class="product-footer">
                        <span class="product-price">âº${product.price.toLocaleString()}</span>
                        <div class="product-actions">
                            <button class="btn btn--primary" onclick="productGrid.viewProduct(${product.id})">
                                <i class="fas fa-eye"></i> Ä°ncele
                            </button>
                            <button class="btn btn--secondary" onclick="productGrid.contactProduct(${product.id})">
                                <i class="fas fa-whatsapp"></i> Sor
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    viewProduct(productId) {
        const product = dataManager.getProduct(productId);
        if (product) {
            this.showProductModal(product);
        }
    }

    showProductModal(product) {
        const modal = document.getElementById('productModal');
        const title = document.getElementById('productModalTitle');
        const body = document.getElementById('productModalBody');

        if (!modal || !title || !body) return;

        const featuresHTML = product.features.map(feature => 
            `<li>${feature}</li>`
        ).join('');

        const stockStatus = product.inStock ? 
            '<span class="stock-badge in-stock">Stokta</span>' : 
            '<span class="stock-badge out-of-stock">Stokta Yok</span>';

        title.textContent = product.name;
        body.innerHTML = `
            <div class="product-modal-content">
                <div class="product-modal-image">
                    <div class="image-placeholder">${product.image}</div>
                </div>
                <div class="product-modal-details">
                    <div class="product-modal-header">
                        <h4>${product.name}</h4>
                        ${stockStatus}
                    </div>
                    
                    <div class="product-modal-meta">
                        <p><strong>Kategori:</strong> ${product.category} âº ${product.subcategory}</p>
                        <p><strong>Marka:</strong> ${product.brand}</p>
                        <p><strong>Model:</strong> ${product.model}</p>
                        <p><strong>YÄ±l:</strong> ${product.year}</p>
                    </div>

                    <div class="product-modal-price">
                        <span class="price">âº${product.price.toLocaleString()}</span>
                    </div>

                    <div class="product-modal-description">
                        <h5>AÃ§Ä±klama</h5>
                        <p>${product.description}</p>
                    </div>

                    <div class="product-modal-features">
                        <h5>Ãzellikler</h5>
                        <ul>${featuresHTML}</ul>
                    </div>

                    <div class="product-modal-actions">
                        <button class="btn btn--primary" onclick="productGrid.contactProduct(${product.id})">
                            <i class="fas fa-whatsapp"></i> WhatsApp ile Sorgula
                        </button>
                        <button class="btn btn--secondary" onclick="productGrid.closeModal()">
                            <i class="fas fa-times"></i> Kapat
                        </button>
                    </div>
                </div>
            </div>
        `;

        modal.style.display = 'block';
    }

    closeModal() {
        const modal = document.getElementById('productModal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    contactProduct(productId) {
        const product = dataManager.getProduct(productId);
        if (product) {
            const message = `Merhaba, ${product.name} Ã¼rÃ¼nÃ¼ hakkÄ±nda bilgi almak istiyorum.`;
            const whatsappUrl = `https://wa.me/905551234567?text=${encodeURIComponent(message)}`;
            window.open(whatsappUrl, '_blank');
        }
    }

    updateProducts(products) {
        this.renderProducts(products);
    }
}

// Global instance
const productGrid = new ProductGrid();
EOF