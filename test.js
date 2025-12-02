const sb = supabase.createClient(
  "https://deqtolfjenzmskfiocxl.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRlcXRvbGZqZW56bXNrZmlvY3hsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ1ODYxNzUsImV4cCI6MjA4MDE2MjE3NX0.qJQQlUEKqFrhUAVvqoQWQngm6BCWzv3FuteLOCM4yOg"
);

document.getElementById("btn").onclick = async () => {
  const { data, error } = await sb
    .from("Categories")
    .insert([{ name: "TestKategori" }])
    .select();

  document.getElementById("result").innerText =
    error ? "ERROR: " + error.message : "OK: " + JSON.stringify(data);
};
