// === Init Supabase ===
const supabaseUrl = "https://deqtolfjenzmskfiocxl.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRlcXRvbGZqZW56bXNrZmlvY3hsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ1ODYxNzUsImV4cCI6MjA4MDE2MjE3NX0.qJQQlUEKqFrhUAVvqoQWQngm6BCWzv3FuteLOCM4yOg";
const supabase = supabase.createClient(supabaseUrl, supabaseKey);

// === Form insert ===
const formKategori = document.getElementById("formKategori");
const kategoriName = document.getElementById("kategoriName");
const result = document.getElementById("result");

formKategori.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = kategoriName.value.trim();
  if (!name) return alert("Isi nama kategori");

  // Insert ke Supabase
  const { data, error } = await supabase
    .from("Categories")
    .insert([{ name }])
    .select();

  if (error) {
    result.textContent = "Error: " + error.message;
    return;
  }

  result.textContent = "OK: " + JSON.stringify(data);
});
