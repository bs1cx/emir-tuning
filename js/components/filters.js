// Filtreleme Sistemi Component'i
class Filters {
    constructor() {
        this.currentFilters = {
            category: '',
            brand: '',
            model: '',
            year: '',
            search: '',
            sort: 'name',
            inStock: undefined
        };
    }

    init() {
        this.renderFilterOptions();
        this.attachEventListeners();
    }

    renderFilterOptions() {
        this.renderCategories();
        this.renderBrands();
        this.renderSortOptions();
    }

    renderCategories() {
        const categories = dataManager.getCategories();
        const categoryFilter = document.getElementById('categoryFilter');
        
        if (categoryFilter) {
            categoryFilter.innerHTML = '<option value="">TÃ¼m Kategoriler</option>';
            categories.forEach(category => {
                categoryFilter.innerHTML += `<option value="${category.name}">${category.name}</option>`;
            });
        }
    }

    renderBrands() {
        const brands = dataManager.getBrands();
        const brandFilter = document.getElementById('brandFilter');
        
        if (brandFilter) {
            brandFilter.innerHTML = '<option value="">TÃ¼m Markalar</option>';
            brands.forEach(brand => {
                brandFilter.innerHTML += `<option value="${brand}">${brand}</option>`;
            });
        }
    }

    renderSortOptions() {
        const sortSelect = document.getElementById('sortSelect');
        if (sortSelect) {
            sortSelect.value = this.currentFilters.sort;
        }
    }

    attachEventListeners() {
        // Filtre deÄiÅiklikleri
        const categoryFilter = document.getElementById('categoryFilter');
        const brandFilter = document.getElementById('brandFilter');
        const modelFilter = document.getElementById('modelFilter');
        const yearFilter = document.getElementById('yearFilter');
        const sortSelect = document.getElementById('sortSelect');
        const searchInput = document.getElementById('searchInput');

        if (categoryFilter) {
            categoryFilter.addEventListener('change', (e) => {
                this.currentFilters.category = e.target.value;
                this.onFiltersChange();
            });
        }

        if (brandFilter) {
            brandFilter.addEventListener('change', (e) => {
                this.currentFilters.brand = e.target.value;
                this.updateModels();
                this.onFiltersChange();
            });
        }

        if (modelFilter) {
            modelFilter.addEventListener('change', (e) => {
                this.currentFilters.model = e.target.value;
                this.onFiltersChange();
            });
        }

        if (yearFilter) {
            yearFilter.addEventListener('change', (e) => {
                this.currentFilters.year = e.target.value;
                this.onFiltersChange();
            });
        }

        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                this.currentFilters.sort = e.target.value;
                this.onFiltersChange();
            });
        }

        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.currentFilters.search = e.target.value;
                this.onFiltersChange();
            });
        }
    }

    updateModels() {
        const modelFilter = document.getElementById('modelFilter');
        if (modelFilter && this.currentFilters.brand) {
            const models = dataManager.getModels(this.currentFilters.brand);
            modelFilter.innerHTML = '<option value="">TÃ¼m Modeller</option>';
            models.forEach(model => {
                modelFilter.innerHTML += `<option value="${model}">${model}</option>`;
            });
        }
    }

    onFiltersChange() {
        // Custom event tetikle
        const event = new CustomEvent('filtersChanged', { 
            detail: { filters: this.currentFilters } 
        });
        document.dispatchEvent(event);
    }

    getCurrentFilters() {
        return { ...this.currentFilters };
    }

    setFilters(newFilters) {
        this.currentFilters = { ...this.currentFilters, ...newFilters };
        this.updateUI();
        this.onFiltersChange();
    }

    updateUI() {
        const categoryFilter = document.getElementById('categoryFilter');
        const brandFilter = document.getElementById('brandFilter');
        const modelFilter = document.getElementById('modelFilter');
        const yearFilter = document.getElementById('yearFilter');
        const sortSelect = document.getElementById('sortSelect');
        const searchInput = document.getElementById('searchInput');

        if (categoryFilter) categoryFilter.value = this.currentFilters.category;
        if (brandFilter) brandFilter.value = this.currentFilters.brand;
        if (modelFilter) modelFilter.value = this.currentFilters.model;
        if (yearFilter) yearFilter.value = this.currentFilters.year;
        if (sortSelect) sortSelect.value = this.currentFilters.sort;
        if (searchInput) searchInput.value = this.currentFilters.search;

        if (this.currentFilters.brand) {
            this.updateModels();
        }
    }

    clearFilters() {
        this.currentFilters = {
            category: '',
            brand: '',
            model: '',
            year: '',
            search: '',
            sort: 'name',
            inStock: undefined
        };
        this.updateUI();
        this.onFiltersChange();
    }
}

// Global instance
const filters = new Filters();
EOF