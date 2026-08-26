// auth.js (Versi Pembaruan dengan Fitur Sembunyikan Sidebar)

async function checkPageAccess(storeId, pageId) {
    if (!storeId) {
        alert('Sesi toko tidak ditemukan. Silakan login ulang.');
        window.location.href = 'indek.html';
        return;
    }

    const { data, error } = await supabaseClient
        .from('store_page_permissions')
        .select('is_active')
        .eq('store_id', storeId)
        .eq('page_id', pageId)
        .single();

    // Jika tidak aktif atau tidak diizinkan, tendang keluar
    if (!data || data.is_active !== true) {
        alert('Maaf, toko Anda tidak memiliki akses ke halaman ini.');
        window.location.href = 'index.html';
    }
}

// FUNGSI BARU: Untuk merapikan/menyembunyikan menu di sidebar secara otomatis
async function applySidebarPermissions(storeId) {
    if (!storeId) return;

    // Ambil semua izin halaman untuk toko ini dari Supabase
    const { data: permissions } = await supabaseClient
        .from('store_page_permissions')
        .select('page_id, is_active')
        .eq('store_id', storeId);

    let activeMap = {};
    if (permissions) {
        permissions.forEach(p => {
            activeMap[p.page_id] = p.is_active;
        });
    }

    // Daftar mapping antara ID halaman opsional dengan ID/Class elemen menu di sidebar HTML Anda
    // (Pastikan Anda nanti memberikan id atau class unik pada tag <a> di sidebar)
    const menuMapping = {
        'payroll': 'menu-payroll',       // Contoh ID elemen menu payroll di sidebar
        'buku_kas': 'menu-buku-kas',     // Contoh ID elemen menu buku kas di sidebar
        'stok_keluar': 'menu-stok-keluar' // Contoh ID elemen menu stok keluar di sidebar
    };

    // Sembunyikan atau tampilkan menu berdasarkan database
    for (const [pageId, elementId] of Object.entries(menuMapping)) {
        const menuElement = document.getElementById(elementId);
        if (menuElement) {
            // Jika status di database bernilai true, tampilkan. Jika false/null, sembunyikan.
            if (activeMap[pageId] === true) {
                menuElement.style.display = 'block'; 
            } else {
                menuElement.style.display = 'none'; 
            }
        }
    }
}
