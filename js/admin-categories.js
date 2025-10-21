// Admin Kategori Yönetimi
class AdminCategories {
    constructor() {
        this.editingCategoryId = null;
    }

    loadCategoriesList() {
        const container = document.getElementById('categoriesList');
        if (!container) return;

        const categories = dataManager.getCategories();
        
        if (categories.length === 0) {
            container.innerHTML = `
                <div class="no-data">
                    <i class="fas fa-tags"></i>
                    <p>Henüz kategori bulunmuyor</p>
                </div>
            `;
            return;
        }

        container.innerHTML = categories.map(category => `
            <div class="category-admin-card">
                <div class="category-header">
                    <div class="category-icon">
                        <i class="${category.icon || 'fas fa-tag'}"></i>
                    </div>
                    <div class="category-info">
                        <h4>${category.name}</h4>
                        <span class="category-slug">/${category.slug}</span>
                    </div>
                </div>
                
                <div class="category-subcategories">
                    <h5>Alt Kategoriler:</h5>
                    <div class="subcategories-list">
                        ${category.subcategories.map(sub => 
                            `<span class="subcategory-badge">${sub}</span>`
                        ).join('')}
                    </div>
                </div>

                <div class="category-stats">
                    <span class="stat">
                        <i class="fas fa-box"></i>
                        ${dataManager.getProductsByCategory(category.name).length} ürün
                    </span>
                </div>

                <div class="category-actions">
                    <button class="btn btn--small btn--primary" onclick="adminCategories.editCategory(${category.id})">
                        <i class="fas fa-edit"></i> Düzenle
                    </button>
                    <button class="btn btn--small btn--secondary" onclick="adminCategories.deleteCategory(${category.id})">
                        <i class="fas fa-trash"></i> Sil
                    </button>
                </div>
            </div>
        `).join('');
    }

    openCategoryModal(categoryId = null) {
        this.editingCategoryId = categoryId;
        const modal = document.getElementById('categoryModal');

        if (categoryId) {
            this.loadCategoryData(categoryId);
        } else {
            document.getElementById('categoryForm').reset();
            document.getElementById('categoryId').value = '';
        }

        modal.style.display = 'block';
    }

    closeModal() {
        const modal = document.getElementById('categoryModal');
        if (modal) {
            modal.style.display = 'none';
            this.editingCategoryId = null;
        }
    }

    loadCategoryData(categoryId) {
        const categories = dataManager.getCategories();
        const category = categories.find(c => c.id === categoryId);
        
        if (category) {
            document.getElementById('categoryId').value = category.id;
            document.getElementById('categoryName').value = category.name;
            document.getElementById('categorySubcategories').value = category.subcategories.join('\n');
            document.getElementById('categoryIcon').value = category.icon || '';
        }
    }

    saveCategory() {
        const form = document.getElementById('categoryForm');
        const name = document.getElementById('categoryName').value;
        const subcategoriesText = document.getElementById('categorySubcategories').value;
        const icon = document.getElementById('categoryIcon').value;

        const subcategories = subcategoriesText
            .split('\n')
            .map(s => s.trim())
            .filter(s => s !== '');

        if (!name || subcategories.length === 0) {
            adminUI.showMessage('Lütfen kategori ad ve en az bir alt kategori girin!', 'error');
            return;
        }

        const categories = dataManager.getCategories();
        
        if (this.editingCategoryId) {
            // Düzenleme
            const categoryIndex = categories.findIndex(c => c.id === this.editingCategoryId);
            if (categoryIndex !== -1) {
                categories[categoryIndex] = {
                    ...categories[categoryIndex],
                    name: name,
                    slug: name.toLowerCase().replace(/ /g, '-'),
                    subcategories: subcategories,
                    icon: icon || 'fas fa-tag'
                };
                dataManager.saveData();
                adminUI.showMessage('Kategori baaryla güncellendi!', 'success');
            }
        } else {
            // Yeni ekleme
            const newCategory = {
                id: Math.max(...categories.map(c => c.id), 0) + 1,
                name: name,
                slug: name.toLowerCase().replace(/ /g, '-'),
                subcategories: subcategories,
                icon: icon || 'fas fa-tag'
            };
            categories.push(newCategory);
            dataManager.saveData();
            adminUI.showMessage('Kategori baaryla eklendi!', 'success');
        }

        this.closeModal();
        this.loadCategoriesList();
        adminUI.loadDashboardStats();
    }

    editCategory(categoryId) {
        this.openCategoryModal(categoryId);
    }

    deleteCategory(categoryId) {
        if (confirm('Bu kategoriyi ve tüm alt kategorilerini silmek istediinizden emin misiniz? Bu ilem geri alnamaz.')) {
            const categories = dataManager.getCategories();
            const updatedCategories = categories.filter(c => c.id !== categoryId);
            
            // DataManager' güncelle
            const data = JSON.parse(localStorage.getItem('emirTuningData') || '{}');
            data.categories = updatedCategories;
            localStorage.setItem('emirTuningData', JSON.stringify(data));
            
            // Sayfay yenile
            this.loadCategoriesList();
            adminUI.loadDashboardStats();
            adminUI.showMessage('Kategori baaryla silindi!', 'success');
        }
    }
}

// Global instance
const adminCategories = new AdminCategories();

// Form submit eventini ekle
document.addEventListener('DOMContentLoaded', function() {
    const categoryForm = document.getElementById('categoryForm');
    if (categoryForm) {
        categoryForm.addEventListener('submit', function(e) {
            e.preventDefault();
            adminCategories.saveCategory();
        });
    }
});
