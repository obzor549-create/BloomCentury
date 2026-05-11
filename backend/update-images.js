const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const dbPath = path.join(__dirname, "database", "bloomcentury.db");
const db = new sqlite3.Database(dbPath);

const updates = [
  ["/uploads/hoodie.svg", "Худи"],
  ["/uploads/tshirt.svg", "Футболки"],
  ["/uploads/pants.svg", "Спортивные штаны"],
  ["/uploads/cap.svg", "Кепки"]
];

db.serialize(() => {
  for (const [image, category] of updates) {
    db.run(
      "UPDATE products SET image = ? WHERE category = ?",
      [image, category],
      function(err) {
        if (err) console.error(err.message);
        else console.log(`Обновлено ${this.changes} товаров категории ${category}`);
      }
    );
  }
});

db.close(() => {
  console.log("Новые реалистичные картинки успешно установлены.");
});