// ================== KONFIGURASI ==================
const SUPABASE_URL = "https://deqtolfjenzmskfiocxl.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRlcXRvbGZqZW56bXNrZmlvY3hsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ1ODYxNzUsImV4cCI6MjA4MDE2MjE3NX0.qJQQlUEKqFrhUAVvqoQWQngm6BCWzv3FuteLOCM4yOg";

const BUCKET_NAME = "product-images";

// client Supabase (CDN v2)
const client = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ================== DOM ELEMENTS ==================
const formKategori = document.getElementById("formKategori");
const kategoriName = document.getElementById("kategoriName");
const kategoriList = document.getElementById("kategoriList");

const formProduk = document.getElementById("formProduk");
const productName = document.getElementById("productName");
const productPrice = document.getElementById("productPrice");
const productCategory = document.getElementById("productCategory");
const productDesc = document.getElementById("productDesc");
const productTags = document.getElementById("productTags");
const productShopee = document.getElementById("productShopee");
const productImage = document.getElementById("productImage");

const productList = document.getElementById("productList");
const btnRefresh = document.getElementById("btnRefresh");

// ================== TAMBAH KATEGORI ==================
formKategori.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = kategoriName.value.trim();
  if (!name) return alert("Isi nama kategori!");

  // Masukkan ke tabel Categories
  const { error } = await client.from("Categories").insert([{ name }]);

  if (error) {
    console.error("Gagal insert kategori:", error);
    return alert("Gagal menambah kategori!");
  }

  kategoriName.value = "";
  loadCategories();
  alert("Kategori berhasil disimpan!");
});

// ================== LOAD KATEGORI ==================
async function loadCategories() {
  const { data, error } = await client
    .from("Categories")
    .select("*")
    .order("id", { ascending: true });

  if (error) {
    console.error("Gagal load kategori:", error);
    kategoriList.innerHTML = "<li>Error load kategori</li>";
    return;
  }

  // List kategori
  kategoriList.innerHTML = data
    .map((c) => `<li>${escapeHtml(c.name)}</li>`)
    .join("");

  // Dropdown produk
  productCategory.innerHTML =
    `<option value="">Pilih kategori...</option>` +
    data
      .map((c) => `<option value="${escapeHtml(c.name)}">${escapeHtml(c.name)}</option>`)
      .join("");
}

// ================== UPLOAD GAMBAR ==================
async function uploadImageToStorage(file) {
  if (!file) return null;

  const ext = file.name.split(".").pop();
  const fileName = `${Date.now()}.${ext}`;

  const { error } = await client.storage
    .from(BUCKET_NAME)
    .upload(fileName, file);

  if (error) {
    console.error("Upload gagal:", error);
    return null;
  }

  const { data } = client.storage.from(BUCKET_NAME).getPublicUrl(fileName);
  return data.publicUrl;
}

// ================== TAMBAH PRODUK ==================
formProduk.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = productName.value.trim();
  const price = productPrice.value;
  const category = productCategory.value;
  const desci = productDesc.value.trim();
  const tags = productTags.value
    .split(",")
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean);
  const shopee = productShopee.value.trim();

  if (!name || !price || !category)
    return alert("Nama, harga & kategori wajib diisi!");

  let imgUrl = null;
  const file = productImage.files[0];
  if (file) {
    imgUrl = await uploadImageToStorage(file);
    if (!imgUrl) return alert("Gagal upload gambar!");
  }

  const payload = {
    name,
    price,
    category,
    desci,
    tags,
    shopee_link: shopee,
    imgUrl,
    created_at: new Date(),
  };

  const { error } = await client.from("products").insert([payload]);

  if (error) {
    console.error("Gagal insert produk:", error);
    return alert("Gagal menyimpan produk!");
  }

  formProduk.reset();
  loadProducts();
  alert("Produk berhasil disimpan!");
});

// ================== LOAD PRODUK ==================
async function loadProducts() {
  const { data, error } = await client
    .from("products")
    .select("*")
    .order("id", { ascending: false });

  if (error) {
    console.error("Gagal load produk:", error);
    productList.innerHTML = "Gagal memuat produk.";
    return;
  }

  productList.innerHTML = data
    .map(
      (p) => `
    <div style="background:#fff;padding:10px;margin:8px 0;border-radius:8px">
      <div style="display:flex;gap:10px">
        <img src="${p.imgUrl || ""}" style="width:80px;height:80px;object-fit:cover;border-radius:6px">
        <div>
          <b>${escapeHtml(p.name)}</b><br/>
          Rp ${escapeHtml(p.price)}<br/>
          <small>${escapeHtml(p.category || "")}</small><br/>
          <p>${escapeHtml(p.desci || "")}</p>
          <p>${(p.tags || []).join(", ")}</p>
          ${
            p.shopee_link
              ? `<a href="${p.shopee_link}" target="_blank" style="color:#1a73e8">Beli di Shopee</a>`
              : ""
          }
        </div>
      </div>
    </div>
  `
    )
    .join("");
}

// ================== ESCAPE HTML ==================
function escapeHtml(text) {
  return String(text).replace(/[&<>"']/g, (c) => {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[
      c
    ];
  });
}

// ================== BUTTON REFRESH ==================
btnRefresh.addEventListener("click", () => {
  loadCategories();
  loadProducts();
});

// ================== LOAD AWAL ==================
loadCategories();
loadProducts();
