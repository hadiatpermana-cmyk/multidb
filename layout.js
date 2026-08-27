// layout.js

// 1. DAFTAR HALAMAN WAJIB (Selalu Muncul)
const HALAMAN_WAJIB = [
    { id: 'dashboard', nama: '📊 Dashboard', url: 'dashboard.html' },
    { id: 'agen', nama: '👥 Master Agen & Supplier', url: 'agen.html' },
    { id: 'barang', nama: '📦 Master Barang', url: 'barang.html' },
	{ id: 'harga_agen', nama: '🏷️ Setting Harga Khusus', url: 'harga_agen.html' },
    { id: 'stok_masuk', nama: '📥 Stok Masuk', url: 'stok_masuk.html' },
    { id: 'pos_kasir', nama: '🛒 POS Kasir', url: 'pos_kasir.html' },
    { id: 'laporan', nama: '📈 Pusat Laporan', url: 'laporan.html' },
    { id: 'pengaturan', nama: '⚙️ Pengaturan Toko', url: 'pengaturan.html' }
];

// 2. DAFTAR HALAMAN OPSIONAL (Bisa di-toggle aktif/nonaktif per toko)
const HALAMAN_OPSIONAL = [
    { id: 'stok_keluar', nama: '📤 Stok Keluar Bahan', url: 'stok_keluar.html' },
    { id: 'buku_kas', nama: '📖 Buku Kas', url: 'buku_kas.html' },
    { id: 'payroll', nama: '💵 Payroll & Produksi', url: 'payroll.html' }
];

// --- FUNGSI GLOBAL UTAMA ---
async function initLayoutAndGuard(currentPageId) {
    try {
        // A. Cek Theme Lokal
        initTheme();

        // B. Verifikasi Sesi Supabase
        const { data: sessionData } = await _supabase.auth.getSession();
        if (!sessionData.session) {
            window.location.replace("index.html");
            return null;
        }

        // C. Ambil Profile & Toko User
        const { data: profile } = await _supabase.from('profiles')
            .select('toko_id, nama_lengkap, role')
            .eq('id', sessionData.session.user.id).single();

        const { data: toko } = await _supabase.from('toko')
            .select('*')
            .eq('id', profile.toko_id).single();

        const fiturAktif = toko.fitur_opsional || {};

        // D. ROUTE GUARD: Cek Izin Halaman Opsional
        const isOpsional = HALAMAN_OPSIONAL.find(h => h.id === currentPageId);
        if (isOpsional && !fiturAktif[currentPageId]) {
            alert("Toko Anda tidak memiliki akses ke fitur ini.");
            window.location.replace("dashboard.html");
            return null;
        }

        // E. Atur Warna Tema Toko (Jika Ada)
        if (toko.warna_tema) {
            document.documentElement.style.setProperty('--p-color', toko.warna_tema);
        }

        // F. Inject Topbar
        const topbarEl = document.getElementById('layout-topbar');
        if (topbarEl) {
            topbarEl.innerHTML = `
                <div class="topbar">
                    <div class="topbar-left">
                        <button class="menu-toggle" onclick="toggleSidebar()">☰</button>
                        <a href="dashboard.html" class="store-brand">
                            <div class="store-logo" id="logoTopbar">${toko.logo_url ? `<img src="${toko.logo_url}" style="width:100%;height:100%;object-fit:contain;">` : '🏪'}</div>
                            <div class="store-info">
                                <h3>${toko.nama_toko || 'PosApp'}</h3>
                                <p>${profile.role || 'Admin'}</p>
                            </div>
                        </a>
                    </div>
                    <div class="topbar-right">
                        <div class="network-status online" id="networkStatus">
                            <span class="dot"></span>
                            <span class="status-text" id="networkText">Connected</span>
                        </div>
                        <button class="btn-theme" id="btnThemeToggle" onclick="toggleTheme()">🌙</button>
                        <span>${profile.nama_lengkap.split(' ')[0]}</span> 👋
                        <button class="btn-logout" onclick="prosesLogout()">Keluar</button>
                    </div>
                </div>`;
        }

        // G. Inject Sidebar
        let menuHtml = '';
        
        HALAMAN_WAJIB.forEach(item => {
            const activeClass = item.id === currentPageId ? 'active' : '';
            menuHtml += `<a href="${item.url}" class="nav-item ${activeClass}">${item.nama}</a>`;
        });

        HALAMAN_OPSIONAL.forEach(item => {
            if (fiturAktif[item.id] === true) {
                const activeClass = item.id === currentPageId ? 'active' : '';
                menuHtml += `<a href="${item.url}" class="nav-item ${activeClass}">${item.nama}</a>`;
            }
        });

        const sidebarEl = document.getElementById('layout-sidebar');
        if (sidebarEl) {
            sidebarEl.innerHTML = `
                <div class="sidebar collapsed" id="sidebar">
                    <div class="nav-menu">${menuHtml}</div>
                </div>`;
        }

        // H. Aktifkan Event Listener Jaringan
        setupNetworkListeners();

        return { profile, toko, tokoId: profile.toko_id };

    } catch (err) {
        console.error("Gagal menginisialisasi layout:", err);
        return null;
    }
}

/* --- FUNGSI HELPER LAYOUT --- */
function toggleSidebar() { 
    const sb = document.getElementById('sidebar');
    if (sb) sb.classList.toggle('collapsed'); 
}

function initTheme() { 
    if (localStorage.getItem('themeMode') === 'dark') { 
        document.documentElement.setAttribute('data-theme', 'dark'); 
    } 
}

function toggleTheme() { 
    let isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    let t = isDark ? 'light' : 'dark'; 
    document.documentElement.setAttribute('data-theme', t); 
    localStorage.setItem('themeMode', t); 
    
    const btn = document.getElementById('btnThemeToggle');
    if (btn) btn.innerText = t === 'dark' ? '☀️' : '🌙'; 
}

async function prosesLogout() { 
    await _supabase.auth.signOut(); 
    window.location.replace("index.html"); 
}

function updateNetworkStatus() {
    const statusContainer = document.getElementById('networkStatus');
    const statusText = document.getElementById('networkText');
    if (!statusContainer || !statusText) return;
    
    if (navigator.onLine) {
        statusContainer.classList.remove('offline');
        statusContainer.classList.add('online');
        statusText.innerText = 'Connected';
    } else {
        statusContainer.classList.remove('online');
        statusContainer.classList.add('offline');
        statusText.innerText = 'Error';
    }
}

function setupNetworkListeners() {
    updateNetworkStatus();
    window.addEventListener('online', updateNetworkStatus);
    window.addEventListener('offline', updateNetworkStatus);
}