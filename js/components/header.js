// Header Component'i - Türkçe Karakter Düzeltmeli
class Header {
    constructor() {
        this.init();
    }

    init() {
        const headerHTML = `
            <header class="header">
                <nav class="nav container">
                    <div class="nav__logo">
                        <a href="../pages/index.html" style="color: inherit; text-decoration: none;">
                            <h2>EMR TUNING</h2>
                            <span>GARAGE</span>
                        </a>
                    </div>
                    
                    <ul class="nav__menu">
                        <li><a href="../pages/index.html">Ana Sayfa</a></li>
                        <li><a href="../pages/products.html">Ürünler</a></li>
                        <li><a href="../pages/categories.html">Kategoriler</a></li>
                        <li><a href="../pages/services.html">Hizmetler</a></li>
                        <li><a href="../pages/contact.html">letiim</a></li>
                        <li><a href="../admin/index.html">Yönetim</a></li>
                    </ul>
                    
                    <div class="nav-icons">
                        <a href="../pages/wishlist.html" class="nav-icon wishlist-icon">
                            <i class="fas fa-heart"></i>
                            <span class="wishlist-count">0</span>
                        </a>
                        <a href="../pages/cart.html" class="nav-icon cart-icon">
                            <i class="fas fa-shopping-cart"></i>
                            <span class="cart-count">0</span>
                        </a>
                    </div>
                    
                    <div class="nav__toggle">
                        <i class="fas fa-bars"></i>
                    </div>
                </nav>
            </header>
        `;

        const headerElement = document.getElementById('header');
        if (headerElement) {
            headerElement.innerHTML = headerHTML;
            this.attachEventListeners();
            this.setActiveLink();
        }
    }

    setActiveLink() {
        const currentPage = window.location.pathname;
        const menuItems = document.querySelectorAll('.nav__menu a');
        
        menuItems.forEach(item => {
            if (currentPage.includes(item.getAttribute('href'))) {
                item.classList.add('active');
            }
        });
    }

    attachEventListeners() {
        const toggle = document.querySelector('.nav__toggle');
        const menu = document.querySelector('.nav__menu');
        
        if (toggle && menu) {
            toggle.addEventListener('click', () => {
                const isVisible = menu.style.display === 'flex';
                menu.style.display = isVisible ? 'none' : 'flex';
                
                if (!isVisible) {
                    menu.style.flexDirection = 'column';
                    menu.style.position = 'absolute';
                    menu.style.top = '100%';
                    menu.style.left = '0';
                    menu.style.right = '0';
                    menu.style.background = '#1a1a1a';
                    menu.style.padding = '1rem';
                }
            });
        }

        // Mobile menüyü kapatmak için
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.nav') && menu && menu.style.display === 'flex') {
                menu.style.display = 'none';
            }
        });

        // Sepet ve favori güncellemelerini dinle
        document.addEventListener('cartUpdated', () => {
            this.updateCartIcon();
        });

        document.addEventListener('wishlistUpdated', () => {
            this.updateWishlistIcon();
        });
    }

    updateCartIcon() {
        const cartCount = cartManager ? cartManager.getCartCount() : 0;
        const cartElements = document.querySelectorAll('.cart-count');
        
        cartElements.forEach(element => {
            element.textContent = cartCount;
            element.style.display = cartCount > 0 ? 'flex' : 'none';
        });
    }

    updateWishlistIcon() {
        const wishlistCount = cartManager ? cartManager.getWishlistCount() : 0;
        const wishlistElements = document.querySelectorAll('.wishlist-count');
        
        wishlistElements.forEach(element => {
            element.textContent = wishlistCount;
            element.style.display = wishlistCount > 0 ? 'flex' : 'none';
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new Header();
});
