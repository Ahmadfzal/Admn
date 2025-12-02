// --------- CONFIG: ganti sesuai project mu ----------
const SUPABASE_URL = "https://deqtolfjenzmskfiocxl.supabase.co"; // contoh
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRlcXRvbGZqZW56bXNrZmlvY3hsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ1ODYxNzUsImV4cCI6MjA4MDE2MjE3NX0.qJQQlUEKqFrhUAVvqoQWQngm6BCWzv3FuteLOCM4yOg";
const BUCKET_NAME = "product-images"; // nama bucket yang kamu buat di Supabase Storage
// ---------------------------------------------------

const supabase = supabaseJs.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// DOM
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

async function showLog(msg){
  console.log(msg);
}

// =========== Kategori ===========
formKategori.addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = kategoriName.value.trim();
  if(!name) return alert("Isi nama kategori");

  // insert ke Supabase
  const { data, error } = await supabase
    .from("categories")
    .insert([{ name }]);

  if (error) {
    console.error("Error insert kategori:", error);
    alert("Gagal menambah kategori. Cek console.");
    return;
  }

  kategoriName.value = "";
  await loadCategories();
  alert("Kategori tersimpan");
});

async function loadCategories() {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("id", { ascending: true });

  if (error) {
    console.error("Error load categories:", error);
    kategoriList.innerHTML = "<li>Error load categories (lihat console)</li>";
    return;
  }

  kategoriList.innerHTML = data.map(c => `<li>${escapeHtml(c.name)}</li>`).join("");
  // update dropdown
  productCategory.innerHTML = `<option value="">Pilih kategori...</option>` + data.map(c => `<option value="${escapeHtml(c.name)}">${escapeHtml(c.name)}</option>`).join("");
}

// =========== Upload image to Supabase Storage ===========
async function uploadImageToStorage(file) {
  if (!file) return null;
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}.${fileExt}`;
  const path = `${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(path, file, { cacheControl: '3600', upsert: false });

  if (uploadError) {
    console.error("Upload error:", uploadError);
    return null;
  }

  // get public url
  const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(path);
  return data.publicUrl;
}

// =========== Produk ===========
formProduk.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = productName.value.trim();
  const price = productPrice.value;
  const desci = productDesc.value.trim();
  const category = productCategory.value;
  const tags = productTags.value.split(",").map(t => t.trim().toLowerCase()).filter(Boolean);
  const shopee = productShopee.value.trim();

  if (!name || !price || !category) {
    return alert("Nama, harga, dan kategori wajib diisi");
  }

  // upload image (opsional)
  let imgUrl = null;
  const file = productImage.files[0];
  if (file) {
    imgUrl = await uploadImageToStorage(file);
    if (!imgUrl) {
      return alert("Gagal upload gambar. Cek console.");
    }
  }

  const payload = {
    name, price, desci, category, tags, shopee_link: shopee, imgUrl, created_at: new Date()
  };

  const { data, error } = await supabase
    .from("products")
    .insert([payload]);

  if (error) {
    console.error("Error insert product:", error);
    return alert("Gagal menyimpan produk. Cek console.");
  }

  productName.value = "";
  productPrice.value = "";
  productDesc.value = "";
  productTags.value = "";
  productShopee.value = "";
  productImage.value = "";

  await loadProducts();
  alert("Produk tersimpan");
});

// load products (simple rendering)
async function loadProducts() {
  const { data, error } = await supabase.from("products").select("*").order('id', { ascending: false }).limit(50);
  if (error) {
    console.error("Error load products:", error);
    productList.innerHTML = "<div>Error load products (cek console)</div>";
    return;
  }

  productList.innerHTML = data.map(p => `
    <div style="background:#fff;padding:10px;margin:8px 0;border-radius:8px">
      <div style="display:flex;gap:10px">
        <img src="${p.imgUrl || ''}" style="width:80px;height:80px;object-fit:cover;border-radius:6px" alt="">
        <div>
          <b>${escapeHtml(p.name)}</b><br/>
          Rp ${escapeHtml(String(p.price))}<br/>
          <small>${escapeHtml(p.category || '')}</small><br/>
          <div style="margin-top:6px">${escapeHtml(p.desci || '')}</div>
          <div style="margin-top:6px;color:#1a73e8">${(p.tags || []).join(", ")}</div>
          ${p.shopee_link ? `<div style="margin-top:6px"><a href="${p.shopee_link}" target="_blank">Beli</a></div>` : ""}
        </div>
      </div>
    </div>
  `).join("");
}

// utility
function escapeHtml(s){ return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

// refresh button
btnRefresh.addEventListener("click", ()=> {
  loadCategories();
  loadProducts();
});

// initial load
loadCategories();
loadProducts();
