const SUPABASE_URL = "https://deqtolfjenzmskfiocxl.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRlcXRvbGZqZW56bXNrZmlvY3hsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ1ODYxNzUsImV4cCI6MjA4MDE2MjE3NX0.qJQQlUEKqFrhUAVvqoQWQngm6BCWzv3FuteLOCM4yOg";
const BUCKET_NAME = "Product-image";

// Inisialisasi Supabase
const client = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Ambil elemen form & input
const formKategori = document.getElementById("formKategori");
const kategoriName = document.getElementById("kategoriName");
const result = document.getElementById("result");
const kategoriList = document.getElementById("kategoriList");
const productCategory = document.getElementById("productCategory");
const productName = document.getElementById("productName");
const productPrice = document.getElementById("productPrice");
const productDesc = document.getElementById("productDesc");
const productTags = document.getElementById("productTags");
const productShopee = document.getElementById("productShopee");
const productImage = document.getElementById("productImage");
function escapeHtml(text) {
  let map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}
// Event submit
formKategori.addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = kategoriName.value.trim();
  if (!name) return alert("Isi nama kategori!");

  const editId = formKategori.dataset.editId; // cek mode edit
//fungsi edit
if (editId) {
  const { error } = await client
    .from("Categories")
    .update({ name })
    .eq("id", editId);

  if (error) {
    console.error("Update error:", error);
    return alert("Gagal mengupdate kategori");
  }

  alert("Kategori berhasil diupdate!");
  kategoriName.value = "";
  delete formKategori.dataset.editId;
  loadCategories();
  return;
}

  // INSERT
  const { data, error } = await client
    .from("Categories")   // ← Sesuaikan huruf besar & kecil
    .insert([{ name }]);

  if (error) {
    console.error("Error insert kategori:", error);
    return alert("Gagal menambah kategori");
  }

  kategoriName.value = "";
  await loadCategories();
  alert("Kategori tersimpan");
});
    async function loadCategories() {
  const { data, error } = await client
    .from("Categories")
    .select("*")
    .order("id", { ascending: true });

  if (error) {
    console.error("Error load categories:", error);
    kategoriList.innerHTML = "<li>Error load categories</li>";
    return;
  }

  kategoriList.innerHTML = data.map(c => `
    <li style="margin-bottom:6px;">
      ${escapeHtml(c.name)}
      <button onclick="editKategori(${c.id}, '${escapeHtml(c.name)}')"
        style="margin-left:10px;padding:3px 6px;background:#007bff;color:white;border:none;border-radius:4px;">
        Edit
      </button>
      <button onclick="deleteKategori(${c.id})"
        style="padding:3px 6px;background:#dc3545;color:white;border:none;border-radius:4px;">
        Hapus
      </button>
    </li>
  `).join("");


  // Update dropdown produk
  productCategory.innerHTML =
    `<option value="">Pilih kategori...</option>` +
    data.map(c =>
      `<option value="${escapeHtml(c.name)}">${escapeHtml(c.name)}</option>`
    ).join("");
}
//hapus categori
async function deleteKategori(id) {
  if (!confirm("Hapus kategori ini?")) return;

  const { error } = await client
    .from("Categories")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Delete error:", error);
    alert("Gagal menghapus kategori");
    return;
  }

  alert("Kategori dihapus");
  loadCategories();
}
//fungsi edit
function editKategori(id, name) {
  kategoriName.value = name;
  formKategori.dataset.editId = id;
  alert("Mode edit kategori aktif. Silakan ubah lalu klik Simpan.");
}

// =========== Upload image ===========
async function uploadImageToStorage(file) {
  if (!file) return null;

  const ext = file.name.split(".").pop();
  const fileName = `${Date.now()}.${ext}`;

  const { error } = await client.storage
    .from(BUCKET_NAME)
    .upload(fileName, file);

  if (error) {
    console.error("Upload error:", error);
    return null;
  }

  const { data } = client.storage.from(BUCKET_NAME).getPublicUrl(fileName);
  return data.publicUrl;
}
// --- SIMPAN PRODUK KE DATABASE ---
document.getElementById("formProduk").addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("productName").value;
    const price = document.getElementById("productPrice").value;
    const desc = document.getElementById("productDesc").value;
    const tags = document.getElementById("productTags").value.split(" ").map(t => t.trim().toLowerCase());
    const category = document.getElementById("productCategory").value;
    const shopee_link = document.getElementById("productShopee").value;
    const productImage = document.getElementById("productImage");
 let Img_url = null;
  const file = productImage.files[0];
  if (file) {
    Img_url = await uploadImageToStorage(file);
    if (!Img_url) return alert("Gagal upload gambar");
  }
  
  // --- UPDATE MODE ---
  const payloadEdit = {
      name,
      price,
      category,
      desc,
      tags,
      shopee_link,
      Img_url,          // jika tidak upload, imgUrl tetap gambar lama
    };
    if (editingProductId) {
        const { error } = await client
            .from("Products")
            .update(payloadEdit)
            .eq("id", editingProductId);

        if (error) {
           console.log("Supabase error detail:", JSON.stringify(error, null, 2));
        }

        alert("Produk berhasil diupdate!");

        editingProductId = null;
        btnAddProduct.textContent = "Tambah Produk";
        formProduk.reset();
        loadProducts();
        return;
    }
    // Simpan ke table Supabase
    const { error } = await client.from("Products").insert([{
    name,
    price,
    desc,
    category,
    tags,
    shopee_link,
    Img_url
}]);

    if (error) {
    console.error("Insert error details:", JSON.stringify(error, null, 2));
    alert("Gagal menyimpan produk! Cek console untuk detail.");
    return;
}

    alert("Produk berhasil ditambahkan!");
    e.target.reset();
    loadProducts(); // refresh daftar
});

// --- LOAD PRODUK UNTUK DITAMPILKAN DI ADMIN ---
async function loadProducts() {
    const { data: products, error } = await client
        .from("Products")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) {
        console.error(error);
        return alert("Gagal memuat produk");
    }

    const grid = document.getElementById("productList");
    grid.innerHTML = "";

    products.forEach(p => {
        grid.innerHTML += `
        <div class="product-card">
            <img class="imgcard" src="${p.Img_url}">
            <p><b>${p.name}</b></p>
            <p>Rp ${p.price}</p>
            <small>Kategori: ${p.category}</small>
            <p>${p.desc}</p>

            <div>
                ${(Array.isArray(p.tags) ? p.tags : (p.tags ? p.tags.split(" ") : []))
                .map(t => `<span class="tag">${t}</span>`).join(" ")}
            </div>

            <a href="${p.shopee_link}" target="_blank">Shopee</a>

            <div style="margin-top:8px; display:flex; gap:8px;">
                <button onclick="editProduct(${p.id})" 
                    style="padding:6px 10px; background:#007bff; color:white; border:none; border-radius:6px;">
                    Edit
                </button>

                <button onclick="deleteProduct(${p.id})" 
                    style="padding:6px 10px; background:#dc3545; color:white; border:none; border-radius:6px;">
                    Hapus
                </button>
            </div>
        </div>`;
    });
}
async function deleteProduct(id) {
    if (!confirm("Yakin ingin menghapus produk ini?")) return;

    const { error } = await client
        .from("Products")
        .delete()
        .eq("id", id);

    if (error) {
        console.error(error);
        return alert("Gagal menghapus produk");
    }

    alert("Produk berhasil dihapus!");
    loadProducts(); // refresh daftar
}
let editingProductId = null;
async function editProduct(id) {
    const { data, error } = await client
        .from("Products")
        .select("*")
        .eq("id", id)
        .single();

    if (error) {
        console.error(error);
        return alert("Gagal mengambil data produk");
    }

    // Isi form
    productName.value = data.name;
    productPrice.value = data.price;
    productCategory.value = data.category;
    productDesc.value = data.desc;

    productTags.value = Array.isArray(data.tags)
        ? data.tags.join(", ")
        : data.tags;

    productShopee.value = data.shopee_link;

    editingProductId = id;

  document.getElementById("btnAddProduct").textContent = "Update Produk";

    alert("Mode edit aktif. Silakan ubah data produk.");
}
loadProducts();
loadCategories();
