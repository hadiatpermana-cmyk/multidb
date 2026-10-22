(() => {
    const menuItems = [
        { href: "dashboard.html", label: "📊 Dashboard", pageId: "dashboard" },
        { href: "agen.html", label: "👥 Master Agen & Supplier", pageId: "agen" },
        { href: "barang.html", label: "📦 Master Barang", pageId: "barang" },
        { href: "harga_agen.html", label: "🏷️ Setting Harga Khusus", pageId: "harga_agen", aliases: ["harga agen"] },
        { href: "stok_masuk.html", label: "📥 Stok Masuk", pageId: "stok_masuk", aliases: ["stok masuk"] },
        { href: "stok_keluar.html", label: "📤 Stok Keluar Bahan", pageId: "stok_keluar", aliases: ["stok keluar"] },
        { href: "stok_opname.html", label: "🧮 Stok Opname", pageId: "stok_opname", aliases: ["stok opname"] },
        { href: "pos_kasir.html", label: "🛒 POS Kasir", pageId: "pos_kasir", aliases: ["pos kasir"] },
        { href: "laporan.html", label: "📈 Pusat Laporan", pageId: "laporan" },
        { href: "buku_kas.html", label: "📖 Buku Kas", pageId: "buku_kas", aliases: ["buku kas"] },
        { href: "payroll.html", label: "💵 Payroll & Produksi", pageId: "payroll" },
        { href: "kontrol_bon_supplier.html", label: "📉 Kontrol Bon Supplier", pageId: "kontrol_bon_supplier", aliases: ["kontrol bon supplier"] },
        { href: "pengaturan.html", label: "⚙️ Pengaturan Toko", pageId: "pengaturan" }
    ];

    function renderNavigation(sidebar, profile, permissions, permissionError) {
        const nav = sidebar.querySelector(".nav-menu");
        if (!nav) return;

        const currentPage = window.location.pathname.split("/").pop() || "dashboard.html";
        const links = menuItems
            .filter(item => permissions[item.pageId] !== false)
            .map(item => {
                const link = document.createElement("a");
                link.className = "nav-item";
                link.href = item.href;
                link.textContent = item.label;
                if (item.href === currentPage) {
                    link.classList.add("active");
                    link.setAttribute("aria-current", "page");
                }
                return link;
            });

        const isSuperadmin = profile && (profile.role || "").toLowerCase() === "superadmin";
        if (isSuperadmin) {
            const link = document.createElement("a");
            link.className = "nav-item";
            link.href = "superadmin.html";
            link.textContent = "👑 Panel Superadmin";
            if (currentPage === "superadmin.html") {
                link.classList.add("active");
                link.setAttribute("aria-current", "page");
            }
            links.push(link);
        }
        if (permissionError) {
            const warning = document.createElement("div");
            warning.className = "nav-item";
            warning.textContent = permissionError;
            warning.setAttribute("role", "alert");
            links.unshift(warning);
        }
        nav.replaceChildren(...links);
    }

    async function loadStorePermissions() {
        const client = typeof _supabase !== "undefined" ? _supabase : null;
        if (!client) return { profile: null, permissions: {} };

        const { data: sessionData, error: sessionError } = await client.auth.getSession();
        if (sessionError) throw sessionError;
        if (!sessionData.session) return { profile: null, permissions: {} };

        const { data: profile, error: profileError } = await client
            .from("profiles")
            .select("toko_id, role")
            .eq("id", sessionData.session.user.id)
            .single();
        if (profileError) throw profileError;

        if (!profile?.toko_id) return { profile, permissions: {} };

        const { data: toko, error: tokoError } = await client
            .from("toko")
            .select("is_active")
            .eq("id", profile.toko_id)
            .single();
        let statusWarning = "";
        if (["42703", "PGRST204"].includes(tokoError?.code) && /is_active/i.test(tokoError.message || "")) {
            console.warn("Kolom toko.is_active belum tersedia. Terapkan migrasi superadmin.");
            statusWarning = "⚠️ Status toko belum aktif; migrasi superadmin diperlukan";
        } else if (tokoError) {
            throw tokoError;
        } else if (toko?.is_active === false &&
            profile.role?.toLowerCase() !== "superadmin") {
            window.location.replace("index.html?store=inactive");
            return { profile, permissions: {} };
        }

        const { data: rows, error: permissionsError } = await client
            .from("store_page_permissions")
            .select("page_id, is_active")
            .eq("store_id", profile.toko_id);
        if (permissionsError) throw permissionsError;

        const rowMap = new Map((rows || []).map(row => [String(row.page_id).toLowerCase(), row.is_active]));
        const permissions = {};
        menuItems.forEach(item => {
            const ids = [item.pageId, ...(item.aliases || [])].map(id => id.toLowerCase());
            const saved = ids.filter(id => rowMap.has(id)).map(id => rowMap.get(id));
            permissions[item.pageId] = saved.length === 0 || !saved.includes(false);
        });
        return { profile, permissions, warning: statusWarning };
    }

    function initializeSidebar() {
        const sidebar = document.querySelector(".main-container > .sidebar");
        if (!sidebar || !sidebar.querySelector(".nav-menu")) return;

        loadStorePermissions()
            .then(({ profile, permissions, warning }) => renderNavigation(sidebar, profile, permissions, warning))
            .catch(error => {
                console.error("Gagal memuat izin sidebar:", error);
                renderNavigation(sidebar, null, {}, "⚠️ Gagal memuat izin menu");
            });

        let scrim = document.getElementById("sidebarScrim");
        if (!scrim) {
            scrim = document.createElement("button");
            scrim.id = "sidebarScrim";
            scrim.type = "button";
            scrim.setAttribute("aria-label", "Tutup menu");
            document.body.appendChild(scrim);
        }

        const toggle = document.querySelector(".menu-toggle");
        const syncSidebarState = () => {
            const isOpen = !sidebar.classList.contains("collapsed");
            scrim.hidden = !isOpen;
            toggle?.setAttribute("aria-expanded", String(isOpen));
        };

        scrim.addEventListener("click", () => {
            sidebar.classList.add("collapsed");
            syncSidebarState();
        });
        toggle?.addEventListener("click", () => requestAnimationFrame(syncSidebarState));
        document.addEventListener("keydown", event => {
            if (event.key === "Escape" && !sidebar.classList.contains("collapsed")) {
                sidebar.classList.add("collapsed");
                syncSidebarState();
            }
        });
        window.addEventListener("resize", syncSidebarState);
        syncSidebarState();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initializeSidebar, { once: true });
    } else {
        initializeSidebar();
    }
})();
