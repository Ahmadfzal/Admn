<!DOCTYPE html>
<html>
<head>
  <title>Supabase Test</title>
</head>
<body>

<h3>Insert Kategori</h3>

<form id="formKategori">
  <input type="text" id="kategoriName" placeholder="Nama kategori">
  <button type="submit">Insert</button>
</form>

<pre id="result"></pre>

<!-- Load Supabase dulu -->
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>

<!-- Script kamu -->
<script src="test.js"></script>
</body>
</html>
