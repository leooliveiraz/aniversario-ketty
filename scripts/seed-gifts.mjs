import pg from "pg";
import fs from "fs";

const env = fs.readFileSync(".env", "utf8");
const match = env.match(/^DATABASE_URL=(.+)$/m);
const databaseUrl = match[1].trim();

const pool = new pg.Pool({ connectionString: databaseUrl });

const gifts = [
  {
    title: "Bolsa Transversal Marsala",
    description: "Bolsa elegante em tom marsala com detalhes dourados, perfeita para o dia a dia.",
    category: "Bolsas",
    price: "220.00",
    image_url: "https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?auto=format&fit=crop&w=800&q=80",
  },
  {
    title: "Mochila Feminina Charmosa",
    description: "Mochila estilosa e prática para usar no colégio ou nos passeios.",
    category: "Bolsas",
    price: "180.00",
    image_url: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80",
  },
  {
    title: "Bolsa Sacola Marsala",
    description: "Bolsa sacola espaçosa e versátil para o dia a dia.",
    category: "Bolsas",
    price: "260.00",
    image_url: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80",
  },
  {
    title: "Colar de Zircônias Dourado",
    description: "Colar delicado com zircônias brilhantes para qualquer ocasião.",
    category: "Acessórios",
    price: "150.00",
    image_url: "https://images.unsplash.com/photo-1602173574767-37ac01994b2a?auto=format&fit=crop&w=800&q=80",
  },
  {
    title: "Kit Brincos & Pulseira",
    description: "Conjunto de brincos e pulseira com design jovem e elegante.",
    category: "Acessórios",
    price: "130.00",
    image_url: "https://images.unsplash.com/photo-1635767798638-3e25273a8236?auto=format&fit=crop&w=800&q=80",
  },
  {
    title: "Relógio Feminino Dourado",
    description: "Relógio analógico elegante com pulseira dourada.",
    category: "Acessórios",
    price: "280.00",
    image_url: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&w=800&q=80",
  },
  {
    title: "Paleta de Sombras Marsala",
    description: "Paleta completa com tons marsala, dourados e nudes para looks incríveis.",
    category: "Maquiagem",
    price: "190.00",
    image_url: "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=800&q=80",
  },
  {
    title: "Kit Pincéis Profissional",
    description: "Conjunto de 12 pincéis profissionais para uma make impecável.",
    category: "Maquiagem",
    price: "160.00",
    image_url: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=800&q=80",
  },
  {
    title: "Batom Líquido Matte",
    description: "Batons líquidos matte nas cores do momento para looks perfeitos.",
    category: "Maquiagem",
    price: "80.00",
    image_url: "https://images.unsplash.com/photo-1583241800693-0a6a6b9c8f9b?auto=format&fit=crop&w=800&q=80",
  },
  {
    title: "Kit Gloss Labial",
    description: "Glosses brilhantes e hidratantes para lábios deslumbrantes.",
    category: "Maquiagem",
    price: "70.00",
    image_url: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=800&q=80",
  },
  {
    title: "Kit Skin Care Completo",
    description: "Rotina completa: cleanser, sérum, hidratante e protetor solar.",
    category: "Skin Care",
    price: "250.00",
    image_url: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&w=800&q=80",
  },
  {
    title: "Máscara Facial LED",
    description: "Máscara de LED para tratamentos faciais em casa.",
    category: "Skin Care",
    price: "320.00",
    image_url: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=800&q=80",
  },
  {
    title: "Kit Hidratação & Cuidados",
    description: "Produtos para cuidados diários com a pele, cabelo e corpo.",
    category: "Skin Care",
    price: "180.00",
    image_url: "https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?auto=format&fit=crop&w=800&q=80",
  },
  {
    title: "Kit Esmaltes Completo",
    description: "Coleção com 10 esmaltes, base fortalecedora e óleo cutículas.",
    category: "Unha",
    price: "140.00",
    image_url: "https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=800&q=80",
  },
  {
    title: "Máquina de Unhas Elétrica",
    description: "Kit completo de manicure elétrica com lixas e acessórios.",
    category: "Unha",
    price: "170.00",
    image_url: "https://images.unsplash.com/photo-1632345031435-8727f6897d53?auto=format&fit=crop&w=800&q=80",
  },
  {
    title: "Adesivos & Acessórios para Unhas",
    description: "Kit criativo com adesivos, strass e acessórios para decorar as unhas.",
    category: "Unha",
    price: "90.00",
    image_url: "https://images.unsplash.com/photo-1607779097040-26e80aa78e66?auto=format&fit=crop&w=800&q=80",
  },
];

async function main() {
  await pool.query("DELETE FROM gifts");

  const values = gifts.flatMap(g => [g.title, g.description, g.category, g.price, g.image_url]);
  const placeholders = gifts.map((_, i) => {
    const base = i * 5;
    return `($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4}, $${base + 5}, false)`;
  }).join(", ");

  await pool.query(
    `INSERT INTO gifts (title, description, category, price, image_url, is_quota) VALUES ${placeholders}`,
    values
  );
  console.log(`${gifts.length} gifts inserted`);
  await pool.end();
}

main().catch(e => { console.error(e.message); process.exit(1); });
