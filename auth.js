// auth.js - File penjaga akses halaman opsional

async function checkPageAccess(storeId, pageId) {
    if (!storeId) {
        alert('Sesi toko tidak ditemukan. Silakan login ulang.');
        window.location.href = 'indek.html';
        return;
    }

    // Mengambil data izin dari tabel store_page_permissions di Supabase
    const { data, error } = await supabaseClient
        .from('store_page_permissions')
        .select('is_active')
        .eq('store_id', storeId)
        .eq('page_id', pageId)
        .single();

    // Jika toko tidak memiliki akses atau statusnya tidak aktif, tendang kembali ke indek.html
    if (!data || data.is_active !== true) {
        alert('Maaf, toko Anda tidak memiliki akses ke halaman ini.');
        window.location.href = 'indek.html';
    }
}
