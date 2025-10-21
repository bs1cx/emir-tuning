// Footer Component'i - Türkçe Karakter Düzeltmeli
class Footer {
    constructor() {
        this.init();
    }

    init() {
        const footerHTML = `
            <footer class="footer">
                <div class="container">
                    <div class="footer-content">
                        <div class="footer-section">
                            <h3>EMR TUNING GARAGE</h3>
                            <p>Profesyonel araç tuning ve aksesuar çözümleri</p>
                            <div class="social-links">
                                <a href="#" class="social-link"><i class="fab fa-instagram"></i></a>
                                <a href="#" class="social-link"><i class="fab fa-facebook"></i></a>
                                <a href="#" class="social-link"><i class="fab fa-whatsapp"></i></a>
                            </div>
                        </div>
                        
                        <div class="footer-section">
                            <h4>Hzl Balantlar</h4>
                            <ul>
                                <li><a href="../pages/index.html">Ana Sayfa</a></li>
                                <li><a href="../pages/products.html">Ürünler</a></li>
                                <li><a href="../pages/categories.html">Kategoriler</a></li>
                                <li><a href="../pages/services.html">Hizmetler</a></li>
                            </ul>
                        </div>
                        
                        <div class="footer-section">
                            <h4>Müteri Hizmetleri</h4>
                            <ul>
                                <li><a href="../pages/contact.html">letiim</a></li>
                                <li><a href="../pages/order-tracking.html">Sipari Takip</a></li>
                                <li><a href="../pages/orders.html">Siparilerim</a></li>
                                <li><a href="#">Skça Sorulan Sorular</a></li>
                            </ul>
                        </div>
                        
                        <div class="footer-section">
                            <h4>letiim Bilgileri</h4>
                            <div class="contact-info">
                                <p><i class="fas fa-phone"></i> 0532 778 83 39</p>
                                <p><i class="fab fa-whatsapp"></i> WhatsApp Sipari</p>
                                <p><i class="fas fa-envelope"></i> info@emirtuning.com</p>
                                <p><i class="fas fa-map-marker-alt"></i> stanbul, Türkiye</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="footer-bottom">
                        <p>&copy; 2024 Emir Tuning Garage. Tüm haklar sakldr.</p>
                        <p>Profesyonel Araç Tuning Çözümleri</p>
                    </div>
                </div>
            </footer>
        `;

        const footerElement = document.getElementById('footer');
        if (footerElement) {
            footerElement.innerHTML = footerHTML;
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new Footer();
});
