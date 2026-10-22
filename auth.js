// 1. Tes apakah file JS berhasil terbaca
alert("Tahap 1: auth.js berhasil dimuat oleh browser!");

try {
    const SUPABASE_URL = 'https://brxwhppefkycvghjqklh.supabase.co';
    const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJyeHdocHBlZmt5Y3ZnaGpxa2xoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQwMzA4MzUsImV4cCI6MjA5OTYwNjgzNX0.aRymB9Fybz0UsiR8blMvun608m5EPxNk29UlF5PSjhg';
    
    const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    // 2. Tes apakah Supabase berhasil konek
    alert("Tahap 2: Inisialisasi Supabase berhasil!");

    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            alert("Tahap 3: Tombol login ditekan! Mulai otentikasi...");
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const btnLogin = document.getElementById('btnLogin');
            const errorMsg = document.getElementById('loginError');

            btnLogin.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Memproses...';
            
            try {
                const { data, error } = await supabase.auth.signInWithPassword({
                    email: email,
                    password: password
                });

                if (error) throw error;

                alert("Tahap 4: Login Sukses! Menyimpan data dan pindah ke index.html");
                
                localStorage.setItem('user_name', 'Hadiat'); 
                localStorage.setItem('user_role', 'System Administrator');
                localStorage.setItem('store_name', 'SBR Putra Food');
                localStorage.setItem('is_logged_in', 'true');

                window.location.href = 'index.html';

            } catch (error) {
                alert("ERROR SUPABASE: " + error.message);
                errorMsg.innerText = "Gagal login: " + error.message;
                errorMsg.style.display = 'block';
                btnLogin.innerHTML = 'Masuk <i class="fa-solid fa-arrow-right"></i>';
            }
        });
    }
} catch (globalError) {
    // Menangkap error jika library Supabase gagal dimuat dari internet
    alert("FATAL ERROR (Supabase tidak termuat): " + globalError.message);
}
