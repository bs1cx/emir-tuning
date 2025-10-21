// Siparilerim Sayfas Kontrolü
class OrdersPage {
    constructor() {
        this.currentCustomer = null;
        this.orders = [];
        this.filteredOrders = [];
        this.filters = {
            search: '',
            status: '',
            date: ''
        };
        this.currentPage = 1;
        this.ordersPerPage = 10;
        this.init();
    }

    init() {
        this.loadCustomer();
        this.attachEventListeners();
        this.loadOrders();
        this.updateCustomerStats();
    }

    // MÜTER YÖNETM

    loadCustomer() {
        // Varsaylan müteriyi yükle veya seçilmi müteriyi al
        const savedCustomer = localStorage.getItem('currentCustomer');
        this.currentCustomer = savedCustomer || 'ahmet@example.com';
        this.updateCustomerDisplay();
    }

    updateCustomerDisplay() {
        const customerName = document.getElementById('customerName');
        if (customerName) {
            const customerInfo = this.getCustomerInfo(this.currentCustomer);
            customerName.textContent = customerInfo.name;
        }
    }

    getCustomerInfo(email) {
        const customers = {
            'ahmet@example.com': { name: 'Ahmet Ylmaz', email: 'ahmet@example.com' },
            'mehmet@example.com': { name: 'Mehmet Demir', email: 'mehmet@example.com' },
            'ayse@example.com': { name: 'Aye Kaya', email: 'ayse@example.com' }
        };
        return customers[email] || { name: 'Misafir Müteri', email: '' };
    }

    switchCustomer() {
        this.showCustomerModal();
    }

    showCustomerModal() {
        const modal = document.getElementById('customerModal');
        if (modal) {
            modal.style.display = 'block';
        }
    }

    closeCustomerModal() {
        const modal = document.getElementById('customerModal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    selectCustomer(email) {
        this.currentCustomer = email;
        localStorage.setItem('currentCustomer', email);
        this.updateCustomerDisplay();
        this.closeCustomerModal();
        this.loadOrders();
        this.updateCustomerStats();
        
        this.showNotification(`Müteri deitirildi: ${this.getCustomerInfo(email).name}`, 'success');
    }

    // SPAR YÖNETM

    loadOrders() {
        this.showLoading();
        
        setTimeout(() => {
            this.orders = orderAPI.getOrdersByCustomer(this.currentCustomer);
            this.applyFilters();
            this.renderOrders();
            this.hideLoading();
            this.updateCustomerStats();
        }, 500);
    }

    applyFilters() {
        let filtered = [...this.orders];

        // Arama filtresi
        if (this.filters.search) {
            const searchTerm = this.filters.search.toLowerCase();
            filtered = filtered.filter(order =>
                order.orderNumber.toLowerCase().includes(searchTerm) ||
                order.items.some(item => 
                    item.product.name.toLowerCase().includes(searchTerm)
                )
            );
        }

        // Durum filtresi
        if (this.filters.status) {
            filtered = filtered.filter(order => order.status === this.filters.status);
        }

        // Tarih filtresi
        if (this.filters.date) {
            const now = new Date();
            filtered = filtered.filter(order => {
                const orderDate = new Date(order.createdAt);
                switch (this.filters.date) {
                    case 'today':
                        return orderDate.toDateString() === now.toDateString();
                    case 'week':
                        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                        return orderDate >= weekAgo;
                    case 'month':
                        const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
                        return orderDate >= monthAgo;
                    case '3months':
                        const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
                        return orderDate >= threeMonthsAgo;
                    case 'year':
                        const yearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
                        return orderDate >= yearAgo;
                    default:
                        return true;
                }
            });
        }

        // Tarihe göre srala (yeniden eskiye)
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        this.filteredOrders = filtered;
    }

    renderOrders() {
        const container = document.getElementById('ordersList');
        const emptyState = document.getElementById('emptyOrders');
        const pagination = document.getElementById('pagination');

        if (this.filteredOrders.length === 0) {
            container.style.display = 'none';
            emptyState.style.display = 'block';
            pagination.style.display = 'none';
            return;
        }

        container.style.display = 'block';
        emptyState.style.display = 'none';

        // Sayfalama
        const totalPages = Math.ceil(this.filteredOrders.length / this.ordersPerPage);
        const startIndex = (this.currentPage - 1) * this.ordersPerPage;
        const paginatedOrders = this.filteredOrders.slice(startIndex, startIndex + this.ordersPerPage);

        container.innerHTML = paginatedOrders.map(order => this.createOrderCard(order)).join('');

        // Sayfalama kontrollerini göster
        if (totalPages > 1) {
            this.renderPagination(totalPages);
            pagination.style.display = 'flex';
        } else {
            pagination.style.display = 'none';
        }
    }

    createOrderCard(order) {
        const statusColor = orderAPI.getOrderStatusColor(order.status);
        const statusText = orderAPI.getOrderStatusText(order.status);
        const totalItems = order.items.reduce((sum, item) => sum + item.quantity, 0);
        const grandTotal = order.total + (order.shipping?.cost || 0);

        return `
            <div class="order-card" data-order-number="${order.orderNumber}">
                <div class="order-header">
                    <div class="order-info">
                        <div class="order-number">
                            <strong>#${order.orderNumber}</strong>
                            <span class="order-date">${orderAPI.formatOrderDate(order.createdAt)}</span>
                        </div>
                        <div class="order-status" style="color: ${statusColor}">
                            <i class="fas fa-circle"></i>
                            ${statusText}
                        </div>
                    </div>
                    <div class="order-actions">
                        <button class="btn btn--outline btn--small" onclick="ordersPage.viewOrderDetails('${order.orderNumber}')">
                            <i class="fas fa-eye"></i> Detaylar
                        </button>
                        <button class="btn btn--outline btn--small" onclick="ordersPage.trackOrder('${order.orderNumber}')">
                            <i class="fas fa-map-marker-alt"></i> Takip Et
                        </button>
                    </div>
                </div>

                <div class="order-content">
                    <div class="order-items-preview">
                        ${order.items.slice(0, 3).map(item => `
                            <div class="order-item-preview">
                                <span class="item-emoji">${item.product.image}</span>
                                <span class="item-name">${item.product.name}</span>
                                <span class="item-quantity">x${item.quantity}</span>
                            </div>
                        `).join('')}
                        ${order.items.length > 3 ? `
                            <div class="more-items">+${order.items.length - 3} ürün daha</div>
                        ` : ''}
                    </div>

                    <div class="order-summary">
                        <div class="summary-item">
                            <span>Toplam Ürün:</span>
                            <span>${totalItems} adet</span>
                        </div>
                        <div class="summary-item">
                            <span>Kargo:</span>
                            <span>${order.shipping?.cost === 0 ? 'ÜCRETSZ' : `${order.shipping?.cost?.toLocaleString() || '0'}`}</span>
                        </div>
                        <div class="summary-item total">
                            <strong>Toplam:</strong>
                            <strong>${grandTotal.toLocaleString()}</strong>
                        </div>
                    </div>
                </div>

                <div class="order-footer">
                    <div class="customer-info">
                        <i class="fas fa-user"></i>
                        <span>${order.customer.name}</span>
                    </div>
                    <div class="order-progress">
                        ${this.createProgressIndicator(order.tracking)}
                    </div>
                </div>
            </div>
        `;
    }

    createProgressIndicator(trackingEvents) {
        const completedEvents = trackingEvents.filter(event => event.completed).length;
        const totalEvents = trackingEvents.length;
        const progress = (completedEvents / totalEvents) * 100;

        return `
            <div class="progress-container">
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${progress}%"></div>
                </div>
                <span class="progress-text">${completedEvents}/${totalEvents} aama</span>
            </div>
        `;
    }

    renderPagination(totalPages) {
        const pagination = document.getElementById('pagination');
        let html = '';

        // Önceki sayfa butonu
        html += `
            <button class="pagination-btn ${this.currentPage === 1 ? 'disabled' : ''}" 
                    onclick="ordersPage.changePage(${this.currentPage - 1})" 
                    ${this.currentPage === 1 ? 'disabled' : ''}>
                <i class="fas fa-chevron-left"></i>
            </button>
        `;

        // Sayfa numaralar
        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= this.currentPage - 1 && i <= this.currentPage + 1)) {
                html += `
                    <button class="pagination-btn ${i === this.currentPage ? 'active' : ''}" 
                            onclick="ordersPage.changePage(${i})">
                        ${i}
                    </button>
                `;
            } else if (i === this.currentPage - 2 || i === this.currentPage + 2) {
                html += '<span class="pagination-ellipsis">...</span>';
            }
        }

        // Sonraki sayfa butonu
        html += `
            <button class="pagination-btn ${this.currentPage === totalPages ? 'disabled' : ''}" 
                    onclick="ordersPage.changePage(${this.currentPage + 1})" 
                    ${this.currentPage === totalPages ? 'disabled' : ''}>
                <i class="fas fa-chevron-right"></i>
            </button>
        `;

        pagination.innerHTML = html;
    }

    changePage(page) {
        if (page < 1 || page > Math.ceil(this.filteredOrders.length / this.ordersPerPage)) return;
        
        this.currentPage = page;
        this.renderOrders();
        
        // Sayfay yukar kaydr
        document.querySelector('.orders-container').scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
        });
    }

    // EVENT LISTENERS

    attachEventListeners() {
        // Arama kutusu
        const searchInput = document.getElementById('ordersSearch');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.filters.search = e.target.value;
                this.currentPage = 1;
                this.loadOrders();
            });
        }

        // Filtreler
        const statusFilter = document.getElementById('statusFilter');
        const dateFilter = document.getElementById('dateFilter');

        if (statusFilter) {
            statusFilter.addEventListener('change', (e) => {
                this.filters.status = e.target.value;
                this.currentPage = 1;
                this.loadOrders();
            });
        }

        if (dateFilter) {
            dateFilter.addEventListener('change', (e) => {
                this.filters.date = e.target.value;
                this.currentPage = 1;
                this.loadOrders();
            });
        }

        // Sipari güncellemelerini dinle
        document.addEventListener('orderUpdated', (event) => {
            const updatedOrder = event.detail.order;
            const customerOrders = orderAPI.getOrdersByCustomer(this.currentCustomer);
            
            if (customerOrders.some(order => order.orderNumber === updatedOrder.orderNumber)) {
                this.loadOrders();
                this.updateCustomerStats();
            }
        });
    }

    // STATSTKLER

    updateCustomerStats() {
        const customerOrders = orderAPI.getOrdersByCustomer(this.currentCustomer);
        
        const totalOrders = customerOrders.length;
        const pendingOrders = customerOrders.filter(order => 
            ['pending', 'confirmed', 'preparing', 'ready', 'shipped'].includes(order.status)
        ).length;
        const deliveredOrders = customerOrders.filter(order => order.status === 'delivered').length;
        const totalSpent = customerOrders
            .filter(order => order.status !== 'cancelled')
            .reduce((sum, order) => sum + order.total + (order.shipping?.cost || 0), 0);

        document.getElementById('totalOrders').textContent = totalOrders;
        document.getElementById('pendingOrders').textContent = pendingOrders;
        document.getElementById('deliveredOrders').textContent = deliveredOrders;
        document.getElementById('totalSpent').textContent = `${totalSpent.toLocaleString()}`;
    }

    // SPAR DETAYLARI

    viewOrderDetails(orderNumber) {
        const order = orderAPI.getOrder(orderNumber);
        if (order) {
            this.showOrderModal(order);
        }
    }

    showOrderModal(order) {
        const modal = document.getElementById('orderDetailModal');
        const title = document.getElementById('modalOrderTitle');
        const content = document.getElementById('orderDetailContent');

        if (!modal || !title || !content) return;

        title.textContent = `Sipari #${order.orderNumber}`;
        content.innerHTML = this.createOrderDetailHTML(order);

        modal.style.display = 'block';
    }

    createOrderDetailHTML(order) {
        const statusColor = orderAPI.getOrderStatusColor(order.status);
        const statusText = orderAPI.getOrderStatusText(order.status);
        const grandTotal = order.total + (order.shipping?.cost || 0);

        return `
            <div class="order-detail">
                <!-- Durum ve lerleme -->
                <div class="detail-section">
                    <h4><i class="fas fa-truck"></i> Sipari Durumu</h4>
                    <div class="status-display" style="border-left-color: ${statusColor}">
                        <div class="status-info">
                            <span class="status-text">${statusText}</span>
                            <span class="status-date">Son güncelleme: ${orderAPI.formatOrderDate(order.updatedAt)}</span>
                        </div>
                    </div>
                    
                    <div class="tracking-timeline compact">
                        ${order.tracking.map((event, index) => `
                            <div class="timeline-item ${event.completed ? 'completed' : ''}">
                                <div class="timeline-marker">
                                    ${event.completed ? 
                                        '<i class="fas fa-check-circle"></i>' : 
                                        '<i class="far fa-circle"></i>'
                                    }
                                </div>
                                <div class="timeline-content">
                                    <div class="timeline-title">${event.title}</div>
                                    ${event.date ? `
                                        <div class="timeline-date">${orderAPI.formatOrderDate(event.date)}</div>
                                    ` : ''}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <!-- Sipari çerii -->
                <div class="detail-section">
                    <h4><i class="fas fa-boxes"></i> Sipari çerii</h4>
                    <div class="order-items-detailed">
                        ${order.items.map(item => `
                            <div class="order-item-detailed">
                                <div class="item-image">${item.product.image}</div>
                                <div class="item-details">
                                    <div class="item-name">${item.product.name}</div>
                                    <div class="item-category">${item.product.category}</div>
                                    <div class="item-features">
                                        ${item.product.features.slice(0, 2).map(feature => 
                                            `<span class="feature-tag">${feature}</span>`
                                        ).join('')}
                                    </div>
                                </div>
                                <div class="item-pricing">
                                    <div class="item-quantity">${item.quantity} adet</div>
                                    <div class="item-price">${item.product.price.toLocaleString()}</div>
                                    <div class="item-total">${(item.product.price * item.quantity).toLocaleString()}</div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <!-- Ödeme ve Teslimat -->
                <div class="detail-grid">
                    <div class="detail-section">
                        <h4><i class="fas fa-user"></i> Müteri Bilgileri</h4>
                        <div class="info-list">
                            <div class="info-item">
                                <label>Ad Soyad:</label>
                                <span>${order.customer.name}</span>
                            </div>
                            <div class="info-item">
                                <label>E-posta:</label>
                                <span>${order.customer.email}</span>
                            </div>
                            <div class="info-item">
                                <label>Telefon:</label>
                                <span>${order.customer.phone}</span>
                            </div>
                        </div>
                    </div>

                    <div class="detail-section">
                        <h4><i class="fas fa-map-marker-alt"></i> Teslimat Adresi</h4>
                        <div class="info-list">
                            <div class="info-item">
                                <label>Adres:</label>
                                <span>${order.shipping.address}</span>
                            </div>
                            <div class="info-item">
                                <label>ehir:</label>
                                <span>${order.shipping.city}</span>
                            </div>
                            <div class="info-item">
                                <label>Kargo:</label>
                                <span>${order.shipping.cost === 0 ? 'ÜCRETSZ' : `${order.shipping.cost.toLocaleString()}`}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Sipari Özeti -->
                <div class="detail-section">
                    <h4><i class="fas fa-receipt"></i> Sipari Özeti</h4>
                    <div class="order-totals-detailed">
                        <div class="total-row">
                            <span>Ara Toplam:</span>
                            <span>${order.total.toLocaleString()}</span>
                        </div>
                        <div class="total-row">
                            <span>Kargo Ücreti:</span>
                            <span>${order.shipping.cost === 0 ? 'ÜCRETSZ' : `${order.shipping.cost.toLocaleString()}`}</span>
                        </div>
                        <div class="total-row grand-total">
                            <strong>Toplam:</strong>
                            <strong>${grandTotal.toLocaleString()}</strong>
                        </div>
                    </div>
                </div>

                <!-- Hzl lemler -->
                <div class="detail-actions">
                    <button class="btn btn--primary" onclick="ordersPage.trackOrder('${order.orderNumber}')">
                        <i class="fas fa-map-marker-alt"></i> Detayl Takip
                    </button>
                    <button class="btn btn--secondary" onclick="ordersPage.contactAboutOrder('${order.orderNumber}')">
                        <i class="fas fa-headset"></i> Destek
                    </button>
                    <button class="btn btn--outline" onclick="ordersPage.printOrder('${order.orderNumber}')">
                        <i class="fas fa-print"></i> Yazdr
                    </button>
                </div>
            </div>
        `;
    }

    closeOrderModal() {
        const modal = document.getElementById('orderDetailModal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    // DER LEMLER

    trackOrder(orderNumber) {
        window.location.href = `order-tracking.html?order=${orderNumber}`;
    }

    contactAboutOrder(orderNumber) {
        const phone = '905551234567';
        const message = `Merhaba, ${orderNumber} numaral sipariim hakknda bilgi almak istiyorum.`;
        const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
    }

    printOrder(orderNumber) {
        this.showNotification('Yazdrma özellii yaknda eklenecek!', 'info');
    }

    clearFilters() {
        this.filters = { search: '', status: '', date: '' };
        document.getElementById('ordersSearch').value = '';
        document.getElementById('statusFilter').value = '';
        document.getElementById('dateFilter').value = '';
        this.currentPage = 1;
        this.loadOrders();
    }

    exportOrders() {
        const customerOrders = orderAPI.getOrdersByCustomer(this.currentCustomer);
        
        if (customerOrders.length === 0) {
            this.showNotification('Da aktarlacak sipari bulunamad.', 'info');
            return;
        }

        const dataStr = JSON.stringify(customerOrders, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `siparislerim-${this.currentCustomer}-${new Date().toISOString().split('T')[0]}.json`;
        link.click();

        this.showNotification('Siparileriniz da aktarld!', 'success');
    }

    // YARDIMCI FONKSYONLAR

    showLoading() {
        const loading = document.getElementById('loadingOrders');
        const list = document.getElementById('ordersList');
        
        if (loading && list) {
            list.style.display = 'none';
            loading.style.display = 'block';
        }
    }

    hideLoading() {
        const loading = document.getElementById('loadingOrders');
        if (loading) {
            loading.style.display = 'none';
        }
    }

    showNotification(message, type = 'info') {
        Toastify({
            text: message,
            duration: 3000,
            gravity: "top",
            position: "right",
            backgroundColor: type === 'success' ? "#4CAF50" : 
                          type === 'error' ? "#f44336" : "#2196F3"
        }).showToast();
    }
}

// Sayfa yüklendiinde balat
document.addEventListener('DOMContentLoaded', () => {
    window.ordersPage = new OrdersPage();
});

// Modal dna tklaynca kapat
window.addEventListener('click', (event) => {
    const orderModal = document.getElementById('orderDetailModal');
    const customerModal = document.getElementById('customerModal');
    
    if (event.target === orderModal) {
        ordersPage.closeOrderModal();
    }
    
    if (event.target === customerModal) {
        ordersPage.closeCustomerModal();
    }
});
