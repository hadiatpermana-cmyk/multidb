// ==========================================
// 1. INISIALISASI SUPABASE
// ==========================================
const SUPABASE_URL = 'https://brxwhppefkycvghjqklh.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJyeHdocHBlZmt5Y3ZnaGpxa2xoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQwMzA4MzUsImV4cCI6MjA5OTYwNjgzNX0.aRymB9Fybz0UsiR8blMvun608m5EPxNk29UlF5PSjhg';

// Inisialisasi client Supabase
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);


// ==========================================
// 2. KONTROL UTAMA (Routing per Halaman)
// ==========================================
document.addEventListener('DOMContentLoaded', async () => {
    // A. Selalu muat profil user & toko di setiap halaman (kecuali login)
    loadUserProfile();

    // B. Deteksi sedang berada di halaman mana
    let path = window.location.pathname;
    let currentPage = path.split("/").pop();
    if (currentPage === "") currentPage = "index.html"; 

    // C. Jalankan fungsi spesifik sesuai halaman yang aktif
    switch (currentPage) {
        case "index.html":
        case "dashboard.html":
            await initDashboard();
            break;
        case "barang.html":
            await initMasterBarang();
            break;
        case "pos.html":
            // await initKasir(); // Akan kita buat nanti
            break;
        // Tambahkan halaman lain di sini nanti jika diperlukan
    }
});


// ==========================================
// 3. FUNGSI GLOBAL (Dipakai di semua halaman)
// ==========================================
function loadUserProfile() {
    // Tarik data dari localStorage (di-set oleh auth.js saat Login berhasil)
    // Jika masih kosong/belum login, gunakan default fallback ini
    const storeName = localStorage.getItem('store_name') || 'SBR Putra Food';
    const userName = localStorage.getItem('user_name') || 'Hadiat';
    const role = localStorage.getItem('user_role') || 'System Administrator';

    // Update elemen UI di Header
    const elStoreName = document.getElementById('txtStoreName');
    const elStoreTagline = document.getElementById('txtStoreTagline');
    const elUserName = document.getElementById('txtUserName');

    if (elStoreName) elStoreName.innerText = storeName;
    if (elStoreTagline) elStoreTagline.innerText = role;
    if (elUserName) elUserName.innerText = userName;
}


// ==========================================
// 4. FUNGSI KHUSUS: DASHBOARD
// ==========================================
async function initDashboard() {
    try {
        // Ambil data barang untuk menghitung total dan stok krisis
        const { data: barang, error: errBarang } = await supabase.from('products').select('*');
        
        if (!errBarang && barang) {
            const elTotalBarang = document.getElementById('dashTotalBarang');
            const elStokKrisis = document.getElementById('dashStokKrisis');

            if (elTotalBarang) elTotalBarang.innerText = barang.length;

            const krisisData = barang.filter(item => item.stock <= item.min_stock);
            if (elStokKrisis) elStokKrisis.innerText = krisisData.length;
        }

        // Ambil data agen/pelanggan untuk menghitung total agen
        const { data: agen, error: errAgen } = await supabase.from('customers').select('*');
        
        if (!errAgen && agen) {
            const elTotalAgen = document.getElementById('dashTotalCustomers');
            if (elTotalAgen) elTotalAgen.innerText = agen.length;
        }

    } catch (error) {
        console.error("Gagal memuat data dashboard:", error);
    }
}


// ==========================================
// 5. FUNGSI KHUSUS: MASTER BARANG
// ==========================================
async function initMasterBarang() {
    const tbody = document.getElementById('dataBarang');
    if (!tbody) return;

    try {
        // Tarik data dari tabel 'products' dan urutkan dari yang terbaru
        const { data: barang, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
        
        if (error) throw error;

        tbody.innerHTML = ''; // Kosongkan placeholder "Memuat data..."
        
        if (barang.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align: center;">Belum ada data barang.</td></tr>';
            return;
        }

        // Looping data barang dan masukkan ke dalam baris tabel (<tr>)
        barang.forEach(item => {
            const tr = document.createElement('tr');
            
            // Jika stok di bawah atau sama dengan minimal, beri warna teks merah tebal
            const stokClass = item.stock <= item.min_stock ? 'style="color: #ef4444; font-weight: bold;"' : '';
            
            tr.innerHTML = `
                <td><strong>${item.item_code || '-'}</strong></td>
                <td>${item.item_name}</td>
                <td>${item.unit || 'Pcs'}</td>
                <td>Rp ${item.cost_price.toLocaleString('id-ID')}</td>
                <td>Rp ${item.retail_price.toLocaleString('id-ID')}</td>
                <td ${stokClass}>${item.stock}</td>
                <td style="text-align: center;">
                    <!-- Sesuai preferensi, kita gunakan tombol Edit, bukan Delete -->
                    <button class="btn-edit" onclick="editBarang('${item.id}')">
                        <i class="fa-solid fa-pen-to-square"></i> Edit
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });

    } catch (error) {
        console.error("Error loading barang:", error);
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: red;">Gagal memuat data dari database.</td></tr>';
    }
}

// Fungsi sementara yang akan dipanggil saat tombol "Edit" di tabel diklik
function editBarang(id) {
    console.log("Membuka form edit untuk ID:", id);
    alert("Fungsi edit akan segera diimplementasikan untuk ID: " + id);
}

// Fungsi sementara yang akan dipanggil saat tombol "Tambah Barang" diklik
function bukaModalTambah() {
    console.log("Membuka form tambah barang");
    alert("Form tambah barang akan segera diimplementasikan.");
}
