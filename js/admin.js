// admin.js - Admin panel iÅlevleri
let editingProductId = null;
let editingCategoryId = null;

document.addEventListener('DOMContentLoaded', function() {
    initializeAdmin();
    loadProductsTable();
    loadCategoriesList();
    updateStats();
    initializeProductForm();
});

function initializeAdmin() {
    // Admin baÅlangÄ±Ã§ ayarlarÄ±
    console.log('Admin panel yÃ¼klendi');
}

function updateStats() {
    const data = loadData();
    document.getElementById('totalProducts').textContent = data.products.length;
    document.getElementById('totalCategories').textContent = data.categories.length;
    document.getElementById('totalBrands').textContent = data.brands.length;
}

function loadProductsTable() {
    const data = loadData();
    const table = document.getElementById('productsTable');
    table.innerHTML = '';

    data.products.forEach(product => {
        const row = `
            <tr>
                <td>${product.id}</td>
                <td>${product.name}</td>
                <td>${product.category}</td>
                <td>${product.brand}</td>
                <td>âº${product.price}</td>
                <td class="actions">
                    <button class="btn btn--small btn--primary" onclick="editProduct(${product.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn--small btn--secondary" onclick="deleteProduct(${product.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
        table.innerHTML += row;
    });
}

function loadCategoriesList() {
    const data = loadData();
    const container = document.getElementById('categoriesList');
    container.innerHTML = '';

    data.categories.forEach(category => {
        const categoryCard = `
            <div class="category-admin-card">
                <div class="category-info">
                    <h4>${category.name}</h4>
                    <div class="subcategories-list">
                        ${category.subcategories.map(sub => 
                            `<span class="subcategory-badge">${sub}</span>`
                        ).join('')}
                    </div>
                </div>
                <div class="category-actions">
                    <button class="btn btn--small btn--primary" onclick="editCategory(${category.id})">
                        <i class="fas fa-edit"></i> DÃ¼zenle
                    </button>
                    <button class="btn btn--small btn--secondary" onclick="deleteCategory(${category.id})">
                        <i class="fas fa-trash"></i> Sil
                    </button>
                </div>
            </div>
        `;
        container.innerHTML += categoryCard;
    });
}

function initializeProductForm() {
    const data = loadData();
    const categorySelect = document.getElementById('productCategory');
    const brandSelect = document.getElementById('productBrand');

    // Kategorileri doldur
    categorySelect.innerHTML = '<option value="">SeÃ§iniz</option>';
    data.categories.forEach(category => {
        categorySelect.innerHTML += `<option value="${category.name}">${category.name}</option>`;
    });

    // MarkalarÄ± doldur
    brandSelect.innerHTML = '<option value="">SeÃ§iniz</option>';
    data.brands.forEach(brand => {
        brandSelect.innerHTML += `<option value="${brand}">${brand}</option>`;
    });

    // Kategori deÄiÅince alt kategorileri gÃ¼ncelle
    categorySelect.addEventListener('change', function() {
        updateSubcategories(this.value);
    });

    // Form submit event
    document.getElementById('productForm').addEventListener('submit', function(e) {
        e.preventDefault();
        saveProduct();
    });

    // Kategori form submit event
    document.getElementById('categoryForm').addEventListener('submit', function(e) {
        e.preventDefault();
        saveCategory();
    });
}

function updateSubcategories(categoryName) {
    const data = loadData();
    const subcategorySelect = document.getElementById('productSubcategory');
    const category = data.categories.find(cat => cat.name === categoryName);
    
    subcategorySelect.innerHTML = '<option value="">SeÃ§iniz</option>';
    if (category) {
        category.subcategories.forEach(sub => {
            subcategorySelect.innerHTML += `<option value="${sub}">${sub}</option>`;
        });
    }
}

// Modal Ä°Ålemleri
function openProductModal(productId = null) {
    editingProductId = productId;
    const modal = document.getElementById('productModal');
    const title = document.getElementById('productModalTitle');
    
    if (productId) {
        title.textContent = 'ÃrÃ¼nÃ¼ DÃ¼zenle';
        loadProductData(productId);
    } else {
        title.textContent = 'Yeni ÃrÃ¼n Ekle';
        document.getElementById('productForm').reset();
        document.getElementById('productId').value = '';
    }
    
    modal.style.display = 'block';
}

function closeProductModal() {
    document.getElementById('productModal').style.display = 'none';
    editingProductId = null;
}

function openCategoryModal(categoryId = null) {
    editingCategoryId = categoryId;
    const modal = document.getElementById('categoryModal');
    
    if (categoryId) {
        loadCategoryData(categoryId);
    } else {
        document.getElementById('categoryForm').reset();
    }
    
    modal.style.display = 'block';
}

function closeCategoryModal() {
    document.getElementById('categoryModal').style.display = 'none';
    editingCategoryId = null;
}

// ÃrÃ¼n Ä°Ålemleri
function loadProductData(productId) {
    const data = loadData();
    const product = data.products.find(p => p.id === productId);
    
    if (product) {
        document.getElementById('productId').value = product.id;
        document.getElementById('productName').value = product.name;
        document.getElementById('productCategory').value = product.category;
        updateSubcategories(product.category);
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
    }
}

function saveProduct() {
    const data = loadData();
    const formData = new FormData(document.getElementById('productForm'));
    
    const productData = {
        id: editingProductId || Math.max(...data.products.map(p => p.id), 0) + 1,
        name: document.getElementById('productName').value,
        category: document.getElementById('productCategory').value,
        subcategory: document.getElementById('productSubcategory').value,
        brand: document.getElementById('productBrand').value,
        model: document.getElementById('productModel').value,
        year: document.getElementById('productYear').value,
        price: parseInt(document.getElementById('productPrice').value),
        description: document.getElementById('productDescription').value,
        features: document.getElementById('productFeatures').value.split(',').map(f => f.trim()),
        image: document.getElementById('productImage').value
    };

    if (editingProductId) {
        // DÃ¼zenleme
        const index = data.products.findIndex(p => p.id === editingProductId);
        if (index !== -1) {
            data.products[index] = productData;
        }
    } else {
        // Yeni ekleme
        data.products.push(productData);
    }

    saveData(data);
    loadProductsTable();
    updateStats();
    closeProductModal();
    
    alert(editingProductId ? 'ÃrÃ¼n gÃ¼ncellendi!' : 'ÃrÃ¼n eklendi!');
}

function editProduct(productId) {
    openProductModal(productId);
}

function deleteProduct(productId) {
    if (confirm('Bu Ã¼rÃ¼nÃ¼ silmek istediÄinizden emin misiniz?')) {
        const data = loadData();
        data.products = data.products.filter(p => p.id !== productId);
        saveData(data);
        loadProductsTable();
        updateStats();
        alert('ÃrÃ¼n silindi!');
    }
}

// Kategori Ä°Ålemleri
function loadCategoryData(categoryId) {
    const data = loadData();
    const category = data.categories.find(c => c.id === categoryId);
    
    if (category) {
        document.getElementById('categoryName').value = category.name;
        document.getElementById('categorySubcategories').value = category.subcategories.join('\n');
    }
}

function saveCategory() {
    const data = loadData();
    const name = document.getElementById('categoryName').value;
    const subcategories = document.getElementById('categorySubcategories').value
        .split('\n')
        .map(s => s.trim())
        .filter(s => s !== '');

    if (editingCategoryId) {
        // DÃ¼zenleme
        const category = data.categories.find(c => c.id === editingCategoryId);
        if (category) {
            category.name = name;
            category.subcategories = subcategories;
            category.slug = name.toLowerCase().replace(/ /g, '-');
        }
    } else {
        // Yeni ekleme
        const newCategory = {
            id: Math.max(...data.categories.map(c => c.id), 0) + 1,
            name: name,
            slug: name.toLowerCase().replace(/ /g, '-'),
            subcategories: subcategories
        };
        data.categories.push(newCategory);
    }

    saveData(data);
    loadCategoriesList();
    updateStats();
    closeCategoryModal();
    
    alert(editingCategoryId ? 'Kategori gÃ¼ncellendi!' : 'Kategori eklendi!');
}

function editCategory(categoryId) {
    openCategoryModal(categoryId);
}

function deleteCategory(categoryId) {
    if (confirm('Bu kategoriyi ve tÃ¼m alt kategorilerini silmek istediÄinizden emin misiniz?')) {
        const data = loadData();
        data.categories = data.categories.filter(c => c.id !== categoryId);
        saveData(data);
        loadCategoriesList();
        updateStats();
        alert('Kategori silindi!');
    }
}

// Veri Ä°Ålemleri
function exportData() {
    const data = loadData();
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = 'emir-tuning-data.json';
    link.click();
}

function importData() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = function(e) {
        const file = e.target.files[0];
        const reader = new FileReader();
        
        reader.onload = function(event) {
            try {
                const importedData = JSON.parse(event.target.result);
                saveData(importedData);
                loadProductsTable();
                loadCategoriesList();
                updateStats();
                alert('Veriler baÅarÄ±yla iÃ§e aktarÄ±ldÄ±!');
            } catch (error) {
                alert('Dosya okunamadÄ±! GeÃ§erli bir JSON dosyasÄ± seÃ§in.');
            }
        };
        
        reader.readAsText(file);
    };
    
    input.click();
}

// Modal dÄ±ÅÄ±na tÄ±klayÄ±nca kapat
window.onclick = function(event) {
    const modals = document.getElementsByClassName('modal');
    for (let modal of modals) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    }
}