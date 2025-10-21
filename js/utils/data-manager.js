// Merkezi Veri YÃ¶netim Sistemi
class DataManager {
    constructor() {
        this.data = this.loadInitialData();
        this.loadData();
    }

    loadInitialData() {
        return {
            categories: [
                {
                    id: 1,
                    name: "AraÃ§ Kaplama-Cam Filmi",
                    slug: "arac-kaplama-cam-filmi",
                    subcategories: ["Seramik Kaplama", "Cam Filmi", "Boya Koruma", "Vinyal Kaplama"],
                    icon: "fas fa-film"
                },
                {
                    id: 2,
                    name: "AraÃ§ KayÄ±t KameralarÄ±",
                    slug: "arac-kayit-kameralari", 
                    subcategories: ["Ãn Kamera", "Arka Kamera", "360 Kamera", "Park SensÃ¶rÃ¼"],
                    icon: "fas fa-camera"
                },
                {
                    id: 3,
                    name: "UTTS",
                    slug: "utts",
                    subcategories: ["UTTS CihazlarÄ±", "Kablo Setleri", "Aksesuarlar"],
                    icon: "fas fa-satellite-dish"
                },
                {
                    id: 4,
                    name: "Multimedya",
                    slug: "multimedya",
                    subcategories: ["Android Sistemler", "Apple CarPlay", "Android Auto", "Navigasyon"],
                    icon: "fas fa-tv"
                },
                {
                    id: 5,
                    name: "Aksesuar",
                    slug: "aksesuar",
                    subcategories: ["Ä°Ã§ Aksesuar", "DÄ±Å Aksesuar", "Fonksiyonel Aksesuarlar"],
                    icon: "fas fa-cogs"
                },
                {
                    id: 6,
                    name: "KÄ±lÄ±f",
                    slug: "kilif",
                    subcategories: ["Koltuk KÄ±lÄ±flarÄ±", "Direksiyon KÄ±lÄ±fÄ±", "Vites KÄ±lÄ±fÄ±"],
                    icon: "fas fa-layer-group"
                },
                {
                    id: 7,
                    name: "AydÄ±nlatma",
                    slug: "aydinlatma",
                    subcategories: ["LED Far", "LED Ä°Ã§ AydÄ±nlatma", "Sinyal LambalarÄ±", "FlaÅÃ¶rler"],
                    icon: "fas fa-lightbulb"
                },
                {
                    id: 8,
                    name: "Temizlik",
                    slug: "temizlik",
                    subcategories: ["Ä°Ã§ Temizlik", "DÄ±Å Temizlik", "Koruyucu Spreyler", "Temizlik Setleri"],
                    icon: "fas fa-spray-can"
                },
                {
                    id: 9,
                    name: "Ses Sistemleri",
                    slug: "ses-sistemleri",
                    subcategories: ["Amfi", "HoparlÃ¶r", "Subwoofer", "Tweeter", "Ses Kontrol"],
                    icon: "fas fa-volume-up"
                },
                {
                    id: 10,
                    name: "Elektrik",
                    slug: "elektrik",
                    subcategories: ["AkÃ¼", "MarÅ Sistemi", "Åarj Sistemi", "Kablolama"],
                    icon: "fas fa-bolt"
                }
            ],

            brands: ["BMW", "Mercedes", "Audi", "Volkswagen", "Ford", "Toyota", "Honda", "Renault", "Fiat", "Hyundai"],
            
            models: {
                "BMW": ["3 Serisi", "5 Serisi", "7 Serisi", "X3", "X5"],
                "Mercedes": ["C Serisi", "E Serisi", "S Serisi", "GLC", "GLE"],
                "Audi": ["A3", "A4", "A6", "Q3", "Q5"],
                "Volkswagen": ["Golf", "Passat", "Tiguan", "Polo"],
                "Ford": ["Focus", "Fiesta", "Kuga", "Mondeo"]
            },

            products: [
                {
                    id: 1,
                    name: "4K Ultra HD Dash Kamera",
                    category: "AraÃ§ KayÄ±t KameralarÄ±",
                    subcategory: "Ãn Kamera",
                    brand: "BlackVue",
                    model: "TÃ¼m Modeller",
                    year: "2020-2024",
                    price: 1299,
                    image: "ğ·",
                    description: "4K Ã§Ã¶zÃ¼nÃ¼rlÃ¼kte gece gÃ¶rÃ¼Å Ã¶zellikli Ã¶n kamera. Wi-Fi ve GPS entegrasyonu ile akÄ±llÄ± telefonunuzdan kolay kontrol.",
                    features: ["4K KayÄ±t", "Gece GÃ¶rÃ¼Å", "Wi-Fi", "GPS", "Park Modu"],
                    inStock: true,
                    featured: true
                },
                {
                    id: 2,
                    name: "Android 11 Multimedya Sistem",
                    category: "Multimedya",
                    subcategory: "Android Sistemler",
                    brand: "BMW",
                    model: "3 Serisi",
                    year: "2019-2023",
                    price: 3499,
                    image: "ğ±",
                    description: "10.25 inÃ§ Android 11 iÅletim sistemli multimedya. Apple CarPlay ve Android Auto destekli.",
                    features: ["Android 11", "Apple CarPlay", "Android Auto", "Navigasyon", "Bluetooth"],
                    inStock: true,
                    featured: true
                },
                {
                    id: 3,
                    name: "Seramik AraÃ§ Kaplama",
                    category: "AraÃ§ Kaplama-Cam Filmi",
                    subcategory: "Seramik Kaplama",
                    brand: "TÃ¼m Markalar",
                    model: "TÃ¼m Modeller",
                    year: "TÃ¼m YÄ±llar",
                    price: 2499,
                    image: "â¨",
                    description: "5 yÄ±l garantili profesyonel seramik kaplama. Su itici Ã¶zellikli ve Ã§izilmeye dayanÄ±klÄ±.",
                    features: ["5 YÄ±l Garanti", "Su Ä°tici", "Ãizilmeye DayanÄ±klÄ±", "UV Koruma"],
                    inStock: true,
                    featured: false
                },
                {
                    id: 4,
                    name: "1200W Subwoofer Set",
                    category: "Ses Sistemleri",
                    subcategory: "Subwoofer",
                    brand: "JBL",
                    model: "TÃ¼m Modeller",
                    year: "TÃ¼m YÄ±llar",
                    price: 2199,
                    image: "ğ",
                    description: "1200W gÃ¼cÃ¼nde bas ses sistemi. HÄ±zlÄ± kurulum ve ayarlanabilir bass Ã¶zelliÄi.",
                    features: ["1200W", "Bass AyarlÄ±", "HÄ±zlÄ± Kurulum", "Kompat AmplifikatÃ¶r"],
                    inStock: true,
                    featured: true
                },
                {
                    id: 5,
                    name: "LED Far Seti",
                    category: "AydÄ±nlatma",
                    subcategory: "LED Far",
                    brand: "Audi",
                    model: "A4",
                    year: "2016-2020",
                    price: 1899,
                    image: "ğ¡",
                    description: "Beyaz Ä±ÅÄ±k LED far upgrade seti. Uzun Ã¶mÃ¼r ve kolay montaj.",
                    features: ["Beyaz IÅÄ±k", "Uzun ÃmÃ¼r", "Kolay Montaj", "ECE OnaylÄ±"],
                    inStock: false,
                    featured: false
                }
            ]
        };
    }

    // LocalStorage'dan verileri yÃ¼kle
    loadData() {
        const savedData = localStorage.getItem('emirTuningData');
        if (savedData) {
            this.data = JSON.parse(savedData);
        }
    }

    // Verileri kaydet
    saveData() {
        localStorage.setItem('emirTuningData', JSON.stringify(this.data));
    }

    // GET metodlarÄ±
    getProducts(filters = {}) {
        let products = [...this.data.products];

        // Filtreleme
        if (filters.category) {
            products = products.filter(p => p.category === filters.category);
        }
        if (filters.brand) {
            products = products.filter(p => p.brand === filters.brand);
        }
        if (filters.model) {
            products = products.filter(p => p.model.includes(filters.model));
        }
        if (filters.year) {
            products = products.filter(p => p.year.includes(filters.year));
        }
        if (filters.search) {
            const searchTerm = filters.search.toLowerCase();
            products = products.filter(p => 
                p.name.toLowerCase().includes(searchTerm) ||
                p.brand.toLowerCase().includes(searchTerm) ||
                p.model.toLowerCase().includes(searchTerm) ||
                p.description.toLowerCase().includes(searchTerm)
            );
        }
        if (filters.inStock !== undefined) {
            products = products.filter(p => p.inStock === filters.inStock);
        }

        // SÄ±ralama
        if (filters.sort) {
            switch (filters.sort) {
                case 'name':
                    products.sort((a, b) => a.name.localeCompare(b.name));
                    break;
                case 'name-desc':
                    products.sort((a, b) => b.name.localeCompare(a.name));
                    break;
                case 'price':
                    products.sort((a, b) => a.price - b.price);
                    break;
                case 'price-desc':
                    products.sort((a, b) => b.price - a.price);
                    break;
            }
        }

        return products;
    }

    getCategories() {
        return this.data.categories;
    }

    getBrands() {
        return this.data.brands;
    }

    getModels(brand = '') {
        if (brand && this.data.models[brand]) {
            return this.data.models[brand];
        }
        return [];
    }

    getProduct(id) {
        return this.data.products.find(p => p.id === id);
    }

    // CRUD Ä°Ålemleri
    addProduct(productData) {
        const newProduct = {
            id: this.generateProductId(),
            ...productData,
            createdAt: new Date().toISOString()
        };
        this.data.products.push(newProduct);
        this.saveData();
        return newProduct;
    }

    updateProduct(id, productData) {
        const index = this.data.products.findIndex(p => p.id === id);
        if (index !== -1) {
            this.data.products[index] = { ...this.data.products[index], ...productData };
            this.saveData();
            return this.data.products[index];
        }
        return null;
    }

    deleteProduct(id) {
        this.data.products = this.data.products.filter(p => p.id !== id);
        this.saveData();
    }

    // YardÄ±mcÄ± metodlar
    generateProductId() {
        return Math.max(...this.data.products.map(p => p.id), 0) + 1;
    }

    getFeaturedProducts() {
        return this.data.products.filter(p => p.featured);
    }

    getProductsByCategory(category) {
        return this.data.products.filter(p => p.category === category);
    }

    // Ä°statistikler
    getStats() {
        return {
            totalProducts: this.data.products.length,
            totalCategories: this.data.categories.length,
            totalBrands: this.data.brands.length,
            featuredProducts: this.data.products.filter(p => p.featured).length,
            outOfStock: this.data.products.filter(p => !p.inStock).length
        };
    }
}

// Global instance
const dataManager = new DataManager();
EOF