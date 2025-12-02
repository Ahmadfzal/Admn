const sb = supabase.createClient(
  "https://YOUR_PROJECT_URL.supabase.co",
  "YOUR_ANON_KEY"
);

document.getElementById("btn").onclick = async () => {
  const { data, error } = await sb
    .from("Categories")
    .insert([{ name: "TestKategori" }])
    .select();

  document.getElementById("result").innerText =
    error ? "ERROR: " + error.message : "OK: " + JSON.stringify(data);
};
