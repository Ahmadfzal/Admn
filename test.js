// ----------------- CONFIG -----------------
const SUPABASE_URL = "https://deqtolfjenzmskfiocxl.supabase.co";
const SUPABASE_ANON_KEY =
"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRlcXRvbGZqZW56bXNrZmlvY3hsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ1ODYxNzUsImV4cCI6MjA4MDE2MjE3NX0.qJQQlUEKqFrhUAVvqoQWQngm6BCWzv3FuteLOCM4yOg";

const BUCKET_NAME = "product-images";

// Create client (BENAR)
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
// ------------------------------------------


// ============ KATEGORI =============
formKategori.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = kategoriName.value.trim();
  if (!name) return alert("Isi nama kategori");

  const { data, error } = await supabase
    .from("categories")
    .insert([{ name }]);

  if (error) {
    console.error(error);
    return alert("Gagal menambah kategori");
  }

  kategoriName.value = "";
  loadCategories();
  alert("Kategori tersimpan");
});

async function loadCategories() {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("id");

  if (error) {
    console.error(error);
    kategoriList.innerHTML = "<li>Error load kategori</li>";
    return;
  }

  kategoriList.innerHTML = data
    .map((c) => `<li>${c.name}</li>`)
    .join("");

  productCategory.innerHTML =
    `<option value="">Pilih kategori…</option>` +
    data.map((c) =>
      `<option value="${c.name}">${c.name}</option>`
    ).join("");
}


// ============ UPLOAD GAMBAR =============
async function uploadImageToStorage(file) {
  if (!file) return null;

  const ext = file.name.split(".").pop();
  const fileName = `${Date.now()}.${ext}`;
  const path = fileName;

  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(path, file);

  if (error) {
    console.error(error);
    return null;
  }

  const { data } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(path);

  return data.publicUrl;
}


// ============ PRODUK =============
formProduk.addEventListener("submit", async (e) => {
  e.preventDefault();

  const payload = {
    name: productName.value.trim(),
    price: productPrice.value,
    desci: productDesc.value.trim(),
    category: productCategory.value,
    tags: productTags.value.split(",").map(t => t.trim()),
    shopee_link: productShopee.value.trim(),
    created_at: new Date()
  };

  if (productImage.files[0]) {
    payload.imgUrl = await uploadImageToStorage(productImage.files[0]);
  }

  const { data, error } = await supabase
    .from("products")
    .insert([payload]);

  if (error) {
    console.error(error);
    return alert("Gagal menyimpan produk");
  }

  formProduk.reset();
  loadProducts();
  alert("Produk tersimpan");
});


// ============ LOAD PRODUK =============
async function loadProducts() {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("id", { ascending: false });

  if (error) {
    console.error(error);
    productList.innerHTML = "<p>Error load produk</p>";
    return;
  }

  productList.innerHTML = data
    .map(
      (p) => `
<div style="padding:10px;border:1px solid #ddd;border-radius:8px;margin-bottom:10px">
  <b>${p.name}</b><br/>
  Harga: Rp ${p.price}<br/>
  <small>Kategori: ${p.category}</small><br/>
  <p>${p.desci || ""}</p>
  ${p.imgUrl ? `<img src="${p.imgUrl}" width="100">` : ""}
</div>`
    )
    .join("");
}


// ============ INITIAL LOAD ============
loadCategories();
loadProducts();
