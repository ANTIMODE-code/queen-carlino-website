// Unisce i file creati dal pannello (content/) in un unico data/catalogo.json letto dalla home.
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");

function readFolder(dir) {
  const full = path.join(root, dir);
  if (!fs.existsSync(full)) return [];
  return fs
    .readdirSync(full)
    .filter((f) => f.endsWith(".json"))
    .map((f) => ({ slug: f.replace(/\.json$/, ""), ...JSON.parse(fs.readFileSync(path.join(full, f), "utf8")) }))
    .filter((item) => item.published !== false);
}

const catalogs = readFolder("content/cataloghi")
  .sort((a, b) => (a.order ?? 10) - (b.order ?? 10) || a.title.localeCompare(b.title, "it"))
  .map(({ slug, title, description }) => ({ slug, title, description: description || "" }));

const known = new Set(catalogs.map((c) => c.slug));

const products = readFolder("content/prodotti")
  .sort((a, b) => a.title.localeCompare(b.title, "it"))
  .map((p) => ({
    slug: p.slug,
    title: p.title,
    image: p.image || "",
    gallery: (p.gallery || []).filter(Boolean),
    price: typeof p.price === "number" ? p.price : null,
    catalogs: (p.catalogs || []).filter((c) => known.has(c)),
    sizes: p.sizes || "",
    description: p.description || "",
    available: p.available !== false,
  }));

fs.mkdirSync(path.join(root, "data"), { recursive: true });
fs.writeFileSync(path.join(root, "data/catalogo.json"), JSON.stringify({ catalogs, products }, null, 2));
console.log(`catalogo.json: ${catalogs.length} cataloghi, ${products.length} prodotti`);
