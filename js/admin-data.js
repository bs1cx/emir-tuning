// Admin Veri Yönetimi
class AdminData {
    constructor() {
        this.init();
    }

    init() {
        // lk yükleme
    }

    exportData() {
        const data = dataManager.data;
        const dataStr = JSON.stringify(data, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `emir-tuning-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        adminUI.showMessage('Veriler başarıyla da aktarldı!', 'success');
    }

    importData() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const importedData = JSON.parse(event.target.result);
                    
                    // Basit validasyon
                    if (!importedData.categories || !importedData.products) {
                        throw new Error('Geçersiz veri format');
                    }

                    if (confirm('Mevcut verilerin üzerine yazlacak. Emin misiniz?')) {
                        localStorage.setItem('emirTuningData', JSON.stringify(importedData));
                        location.reload(); // Sayfay yenile
                    }
                } catch (error) {
                    adminUI.showMessage('Dosya okunamad! Geçerli bir yedek dosyas seçin.', 'error');
                }
            };
            
            reader.readAsText(file);
        };
        
        input.click();
    }

    resetData() {
        if (confirm('TÜM VERLER SLNECEK! Bu ilem geri alnamaz. Emin misiniz?')) {
            if (confirm('SON UYARI: Tüm ürünler, kategoriler ve ayarlar silinecek. Devam etmek istiyor musunuz?')) {
                localStorage.removeItem('emirTuningData');
                location.reload();
            }
        }
    }

    // Veri istatistikleri
    getDataStats() {
        return dataManager.getStats();
    }

    // Sistem bilgileri
    getSystemInfo() {
        return {
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            screenSize: `${screen.width}x${screen.height}`,
            localStorageSize: JSON.stringify(localStorage).length,
            lastBackup: this.getLastBackupDate()
        };
    }

    getLastBackupDate() {
        // Son yedekleme tarihini döndür (basit implementasyon)
        return 'Henüz yedek alnmad';
    }
}

// Global instance
const adminData = new AdminData();
