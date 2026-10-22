// ui.js - Pusat Manajemen Komponen UI

const sidebarComponent = `
    <aside class="sidebar" id="mainSidebar">
        <div class="sidebar-header"><i class="fa-solid fa-store"></i> Point of Sale</div>
        <ul class="sidebar-menu">
            <li class="sidebar-item" data-page="index.html" onclick="window.location.href='index.html'"><i class="fa-solid fa-chart-pie" style="color: #0d9488;"></i> <span>Dashboard</span></li>
            <li class="sidebar-item" data-page="barang.html" onclick="window.location.href='barang.html'"><i class="fa-solid fa-box-open" style="color: #64748b;"></i> <span>Master Barang</span></li>
            <li class="sidebar-item" data-page="supplier.html" onclick="window.location.href='supplier.html'"><i class="fa-solid fa-truck-fast" style="color: #64748b;"></i> <span>Data Supplier</span></li>
            <li class="sidebar-item" data-page="agen.html" onclick="window.location.href='agen.html'"><i class="fa-solid fa-users" style="color: #64748b;"></i> <span>Agen / Konsumen</span></li>
            <li class="sidebar-item" data-page="harga.html" onclick="window.location.href='harga.html'"><i class="fa-solid fa-tags" style="color: #64748b;"></i> <span>Harga Khusus</span></li>
            
            <li class="sidebar-item" data-page="penerimaan.html" onclick="window.location.href='penerimaan.html'"><i class="fa-solid fa-boxes-packing" style="color: #3b82f6;"></i> <span>Penerimaan (In)</span></li>
            <li class="sidebar-item" data-page="pos.html" onclick="window.location.href='pos.html'"><i class="fa-solid fa-cash-register" style="color: #f97316;"></i> <span>POS Kasir</span></li>
            <li class="sidebar-item" data-page="laporan.html" onclick="window.location.href='laporan.html'"><i class="fa-solid fa-chart-line" style="color: #8b5cf6;"></i> <span>Laporan</span></li>
            
            <li class="sidebar-item" data-page="pengaturan.html" style="margin-top: 15px; border-top: 1px solid var(--border-color); padding-top: 15px;"><i class="fa-solid fa-gear" style="color: #64748b;"></i> <span>Pengaturan Toko</span></li>
            <li class="sidebar-item" onclick="handleLogout()"><i class="fa-solid fa-right-from-bracket" style="color: #ef4444;"></i> <span style="color: #ef4444;">Logout</span></li>
        </ul>
    </aside>
`;

const headerComponent = `
    <header class="header_clean">
        <div class="header-left">
            <button class="btn-icon" onclick="toggleSidebar()"><i class="fa-solid fa-bars"></i></button>
            <div class="store-logo-placeholder" id="headerLogoArea"><i class="fa-solid fa-store"></i></div>
            <div class="store-info">
                <span class="store-name" id="txtStoreName">Memuat...</span>
                <span class="store-tagline" id="txtStoreTagline">System Administrator</span>
            </div>
        </div>
        <div class="header-right">
            <span class="user-profile"><span id="txtUserName">Admin</span> 👋</span>
        </div>
    </header>
`;

// Fungsi untuk me-render UI saat DOM siap
document.addEventListener('DOMContentLoaded', () => {
    // 1. Suntikkan Sidebar dan Header ke kontainer yang disediakan
    const sidebarContainer = document.getElementById('app-sidebar');
    const headerContainer = document.getElementById('app-header');

    if (sidebarContainer) sidebarContainer.innerHTML = sidebarComponent;
    if (headerContainer) headerContainer.innerHTML = headerComponent;

    // 2. Deteksi halaman aktif & tambahkan class 'active'
    setActiveMenu();
});

// Fungsi untuk menandai menu aktif di sidebar
function setActiveMenu() {
    // Ambil nama file dari URL saat ini (misal: "barang.html")
    let path = window.location.pathname;
    let page = path.split("/").pop(); 
    
    // Default ke index.html jika path kosong (root)
    if (page === "") page = "index.html"; 

    // Cari elemen menu dengan data-page yang sesuai
    const activeItem = document.querySelector(`.sidebar-item[data-page="${page}"]`);
    if (activeItem) {
        activeItem.classList.add('active');
        
        // Opsional: Ganti warna icon jadi warna primary (tema)
        const icon = activeItem.querySelector('i');
        if(icon) icon.style.color = '#0d9488'; 
    }
}

// Fungsi toggle sidebar (Pastikan CSS transisinya sudah ada di style.css)
function toggleSidebar() {
    const sidebar = document.getElementById('mainSidebar');
    if (sidebar) sidebar.classList.toggle('collapsed');
}

async function handleLogout() {
    if(confirm('Yakin ingin keluar dari sistem?')) {
        // Hapus sesi di Supabase (Opsional tapi disarankan)
        if (window.supabase) {
            await window.supabase.auth.signOut();
        }

        // Hapus data dari localStorage
        localStorage.removeItem('is_logged_in');
        localStorage.removeItem('user_name');
        localStorage.removeItem('user_role');
        localStorage.removeItem('store_name');

        // Arahkan kembali ke halaman login
        window.location.href = 'login.html';
    }
}
