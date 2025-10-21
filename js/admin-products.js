// Admin Ürün Yönetimi
class AdminProducts {
    constructor() {
        this.editingProductId = null;
        this.init();
    }

    init() {
        this.initProductForm();
        this.initFilters();
    }

    initProductForm() {
        const form = document.getElementById('productForm');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveProduct();
            });
        }

        this.loadFormOptions();
    }

    loadFormOptions() {
        // Kategorileri yükle
        const categories = dataManager.getCategories();
        const categorySelect = document.getElementById('productCategory');
        if (categorySelect) {
            categorySelect.innerHTML = '<option value="">Seçiniz</option>';
            categories.forEach(category => {
                categorySelect.innerHTML += `<option value="${category.name}">${category.name}</option>`;
            });

            // Kategori deiince alt kategorileri güncelle
            categorySelect.addEventListener('change', (e) => {
                this.updateSubcategories(e.target.value);
            });
        }

        // Markalar yükle
        const brands = dataManager.getBrands();
        const brandSelect = document.getElementById('productBrand');
        if (brandSelect) {
            brandSelect.innerHTML = '<option value="">Seçiniz</option>';
            brands.forEach(brand => {
                brandSelect.innerHTML += `<option value="${brand}">${brand}</option>`;
            });
        }
    }

    updateSubcategories(categoryName) {
        const subcategorySelect = document.getElementById('productSubcategory');
        if (!subcategorySelect) return;

        const categories = dataManager.getCategories();
        const category = categories.find(cat => cat.name === categoryName);
        
        subcategorySelect.innerHTML = '<option value="">Seçiniz</option>';
        if (category) {
            category.subcategories.forEach(sub => {
                subcategorySelect.innerHTML += `<option value="${sub}">${sub}</option>`;
            });
        }
    }

    initFilters() {
        const searchInput = document.getElementById('productSearch');
        const categoryFilter = document.getElementById('productCategoryFilter');
        const stockFilter = document.getElementById('productStockFilter');

        // Kategori filtrelerini yükle
        if (categoryFilter) {
            const categories = dataManager.getCategories();
            categories.forEach(category => {
                categoryFilter.innerHTML += `<option value="${category.name}">${category.name}</option>`;
            });

            categoryFilter.addEventListener('change', () => {
                this.loadProductsTable();
            });
        }

        if (stockFilter) {
            stockFilter.addEventListener('change', () => {
                this.loadProductsTable();
            });
        }

        if (searchInput) {
            searchInput.addEventListener('input', () => {
                this.loadProductsTable();
            });
        }
    }

    loadProductsTable() {
        const table = document.getElementById('productsTable');
        if (!table) return;

        // Filtreleri al
        const searchTerm = document.getElementById('productSearch')?.value || '';
        const categoryFilter = document.getElementById('productCategoryFilter')?.value || '';
        const stockFilter = document.getElementById('productStockFilter')?.value || '';

        // Filtreleme yap
        let filters = {};
        if (searchTerm) filters.search = searchTerm;
        if (categoryFilter) filters.category = categoryFilter;
        if (stockFilter === 'inStock') filters.inStock = true;
        if (stockFilter === 'outOfStock') filters.inStock = false;

        const products = dataManager.getProducts(filters);

        // Tabloyu doldur
        table.innerHTML = '';
        products.forEach(product => {
            const row = this.createProductRow(product);
            table.innerHTML += row;
        });

        // Bo durum
        if (products.length === 0) {
            table.innerHTML = `
                <tr>
                    <td colspan="7" class="no-data">
                        <i class="fas fa-search"></i>
                        <p>Ürün bulunamad</p>
                    </td>
                </tr>
            `;
        }
    }

    createProductRow(product) {
        const stockStatus = product.inStock ? 
            '<span class="status-badge success">Stokta</span>' : 
            '<span class="status-badge error">Stokta Yok</span>';

        const featuredStatus = product.featured ? 
            '<i class="fas fa-star featured-star"></i>' : '';

        return `
            <tr>
                <td>${product.id}</td>
                <td>
                    <div class="product-cell">
                        <span class="product-emoji">${product.image}</span>
                        <div>
                            <div class="product-name">${featuredStatus} ${product.name}</div>
                            <div class="product-desc">${product.description.substring(0, 50)}...</div>
                        </div>
                    </div>
                </td>
                <td>${product.category}</td>
                <td>${product.brand}</td>
                <td>${product.price.toLocaleString()}</td>
                <td>${stockStatus}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn--small btn--primary" onclick="adminProducts.editProduct(${product.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn--small btn--secondary" onclick="adminProducts.deleteProduct(${product.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }

    openProductModal(productId = null) {
        this.editingProductId = productId;
        const modal = document.getElementById('productModal');
        const title = document.getElementById('productModalTitle');

        if (productId) {
            title.textContent = 'Ürünü Düzenle';
            this.loadProductData(productId);
        } else {
            title.textContent = 'Yeni Ürün Ekle';
            document.getElementById('productForm').reset();
            document.getElementById('productId').value = '';
            document.getElementById('productInStock').checked = true;
            document.getElementById('productFeatured').checked = false;
        }

        modal.style.display = 'block';
    }

    closeModal() {
        const modal = document.getElementById('productModal');
        if (modal) {
            modal.style.display = 'none';
            this.editingProductId = null;
        }
    }

    loadProductData(productId) {
        const product = dataManager.getProduct(productId);
        if (!product) return;

        document.getElementById('productId').value = product.id;
        document.getElementById('productName').value = product.name;
        document.getElementById('productCategory').value = product.category;
        
        // Alt kategorileri güncelle ve deeri set et
        this.updateSubcategories(product.category);
        setTimeout(() => {
            document.getElementById('productSubcategory').value = product.subcategory;
        }, 100);

        document.getElementById('productBrand').value = product.brand;
        document.getElementById('productModel').value = product.model;
        document.getElementById('productYear').value = product.year;
        document.getElementById('productPrice').value = product.price;
        document.getElementById('productDescription').value = product.description;
        document.getElementById('productFeatures').value = product.features.join(', ');
        document.getElementById('productImage').value = product.image;
        document.getElementById('productInStock').checked = product.inStock;
        document.getElementById('productFeatured').checked = product.featured;
    }

    saveProduct() {
        const formData = {
            name: document.getElementById('productName').value,
            category: document.getElementById('productCategory').value,
            subcategory: document.getElementById('productSubcategory').value,
            brand: document.getElementById('productBrand').value,
            model: document.getElementById('productModel').value,
            year: document.getElementById('productYear').value,
            price: parseInt(document.getElementById('productPrice').value),
            description: document.getElementById('productDescription').value,
            features: document.getElementById('productFeatures').value.split(',').map(f => f.trim()),
            image: document.getElementById('productImage').value || '',
            inStock: document.getElementById('productInStock').checked,
            featured: document.getElementById('productFeatured').checked
        };

        let result;
        if (this.editingProductId) {
            result = dataManager.updateProduct(this.editingProductId, formData);
            adminUI.showMessage('Ürün baaryla güncellendi!', 'success');
        } else {
            result = dataManager.addProduct(formData);
            adminUI.showMessage('Ürün baaryla eklendi!', 'success');
        }

        if (result) {
            this.closeModal();
            this.loadProductsTable();
            adminUI.loadDashboardStats(); // Dashboard istatistiklerini güncelle
        }
    }

    editProduct(productId) {
        this.openProductModal(productId);
    }

    deleteProduct(productId) {
        if (confirm('Bu ürünü silmek istediinizden emin misiniz? Bu ilem geri alnamaz.')) {
            dataManager.deleteProduct(productId);
            this.loadProductsTable();
            adminUI.loadDashboardStats();
            adminUI.showMessage('Ürün baaryla silindi!', 'success');
        }
    }
}

// Global instance
const adminProducts = new AdminProducts();
