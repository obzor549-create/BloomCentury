const express=require("express"), cors=require("cors"), path=require("path"), fs=require("fs");
const sqlite3=require("sqlite3").verbose(), bcrypt=require("bcryptjs"), jwt=require("jsonwebtoken"), multer=require("multer");
const app=express(), PORT=5000, SECRET="bloomcentury_secret";
const dbDir=path.join(__dirname,"database"), upDir=path.join(__dirname,"uploads");
fs.mkdirSync(dbDir,{recursive:true}); fs.mkdirSync(upDir,{recursive:true});
const db=new sqlite3.Database(path.join(dbDir,"bloomcentury.db"));
app.use(cors()); app.use(express.json()); app.use("/uploads",express.static(upDir));
const upload=multer({storage:multer.diskStorage({destination:(r,f,cb)=>cb(null,upDir),filename:(r,f,cb)=>cb(null,Date.now()+"_"+f.originalname.replace(/[^a-zA-Z0-9._-]/g,"_"))})});
const run=(s,p=[])=>new Promise((ok,no)=>db.run(s,p,function(e){e?no(e):ok(this)}));
const get=(s,p=[])=>new Promise((ok,no)=>db.get(s,p,(e,r)=>e?no(e):ok(r)));
const all=(s,p=[])=>new Promise((ok,no)=>db.all(s,p,(e,r)=>e?no(e):ok(r)));
function auth(req,res,next){try{const t=(req.headers.authorization||"").replace("Bearer ",""); if(!t) return res.status(401).json({message:"Требуется авторизация"}); req.user=jwt.verify(t,SECRET); next()}catch{return res.status(401).json({message:"Ошибка авторизации"})}}
function admin(req,res,next){ if(req.user.role!=="admin") return res.status(403).json({message:"Нет прав администратора"}); next(); }
const products=[
["Худи BloomCentury Core Black","Худи","Черное худи из плотного хлопка с фирменной вышивкой.",4990,"S,M,L,XL","#151515",22],
["Худи BloomCentury Stone Grey","Худи","Серое худи свободного кроя для повседневного образа.",4790,"S,M,L","#444",18],
["Худи BloomCentury Night Zip","Худи","Худи на молнии в минималистичном стиле.",5290,"M,L,XL","#111",14],
["Худи BloomCentury Oversize","Худи","Оверсайз худи с объемным капюшоном.",5490,"M,L,XL","#222",16],
["Худи BloomCentury Street","Худи","Стритвир-худи с принтом на спине.",5590,"S,M,L,XL","#181818",12],
["Худи BloomCentury Premium","Худи","Премиальная модель из плотного футера.",5990,"M,L,XL","#121212",10],
["Худи BloomCentury Graphite","Худи","Графитовое худи с плотными манжетами.",4890,"S,M,L","#333",20],
["Футболка BloomCentury Basic Black","Футболки","Базовая черная футболка прямого кроя.",1990,"S,M,L,XL","#111",40],
["Футболка BloomCentury White Logo","Футболки","Белая футболка с контрастным логотипом.",2190,"S,M,L,XL","#eee",35],
["Футболка BloomCentury Grey Essential","Футболки","Серая футболка из хлопкового трикотажа.",1890,"S,M,L","#777",31],
["Футболка BloomCentury Oversize","Футболки","Свободная футболка в стиле streetwear.",2490,"M,L,XL","#202020",28],
["Футболка BloomCentury Drop One","Футболки","Лимитированная футболка первой коллекции.",2790,"S,M,L","#161616",15],
["Футболка BloomCentury Classic","Футболки","Классическая модель с аккуратной посадкой.",2090,"S,M,L,XL","#262626",33],
["Футболка BloomCentury Mono","Футболки","Монохромная футболка с принтом на рукаве.",2290,"S,M,L,XL","#292929",27],
["Штаны BloomCentury Jogger Black","Спортивные штаны","Черные джоггеры с эластичным поясом.",3990,"S,M,L,XL","#111",23],
["Штаны BloomCentury Jogger Grey","Спортивные штаны","Серые спортивные штаны для повседневной носки.",3790,"S,M,L","#555",19],
["Штаны BloomCentury Cargo","Спортивные штаны","Спортивные брюки с накладными карманами.",4590,"M,L,XL","#222",17],
["Штаны BloomCentury Training","Спортивные штаны","Удобные штаны для тренировок и прогулок.",3490,"S,M,L","#333",24],
["Штаны BloomCentury Wide","Спортивные штаны","Модель свободного кроя.",4290,"M,L,XL","#202020",16],
["Штаны BloomCentury Soft Touch","Спортивные штаны","Мягкие спортивные штаны с начесом.",3890,"S,M,L,XL","#474747",21],
["Штаны BloomCentury Street Line","Спортивные штаны","Джоггеры с декоративной строчкой.",4190,"S,M,L","#101010",17],
["Кепка BloomCentury Black Cap","Кепки","Черная кепка с вышивкой логотипа.",1490,"ONE SIZE","#111",50],
["Кепка BloomCentury Grey Cap","Кепки","Серая кепка для базового образа.",1390,"ONE SIZE","#666",42],
["Кепка BloomCentury Logo Cap","Кепки","Кепка с крупным фирменным знаком.",1590,"ONE SIZE","#242424",36],
["Кепка BloomCentury Street Cap","Кепки","Модель с жестким козырьком и регулировкой.",1690,"ONE SIZE","#191919",30],
["Кепка BloomCentury Minimal Cap","Кепки","Минималистичная кепка без лишних деталей.",1290,"ONE SIZE","#333",41],
["Кепка BloomCentury Drop Cap","Кепки","Лимитированная кепка из сезонной коллекции.",1890,"ONE SIZE","#0f0f0f",15],
["Кепка BloomCentury Sport Cap","Кепки","Легкая кепка для активного образа жизни.",1490,"ONE SIZE","#454545",28],
["Худи BloomCentury Soft","Худи","Мягкое худи из смесового хлопка.",4490,"S,M,L","#505050",25],
["Футболка BloomCentury Active","Футболки","Легкая футболка для активного движения.",2390,"S,M,L","#3d3d3d",24]
];
async function init(){
await run(`CREATE TABLE IF NOT EXISTS users(id INTEGER PRIMARY KEY AUTOINCREMENT,name TEXT,email TEXT UNIQUE,password TEXT,role TEXT DEFAULT 'user',created_at TEXT DEFAULT CURRENT_TIMESTAMP)`);
await run(`CREATE TABLE IF NOT EXISTS products(id INTEGER PRIMARY KEY AUTOINCREMENT,name TEXT,category TEXT,description TEXT,price INTEGER,sizes TEXT,color TEXT,stock INTEGER,image TEXT,created_at TEXT DEFAULT CURRENT_TIMESTAMP)`);
await run(`CREATE TABLE IF NOT EXISTS favorites(id INTEGER PRIMARY KEY AUTOINCREMENT,user_id INTEGER,product_id INTEGER,UNIQUE(user_id,product_id))`);
await run(`CREATE TABLE IF NOT EXISTS cart_items(id INTEGER PRIMARY KEY AUTOINCREMENT,user_id INTEGER,product_id INTEGER,quantity INTEGER DEFAULT 1,size TEXT,UNIQUE(user_id,product_id,size))`);
await run(`CREATE TABLE IF NOT EXISTS orders(id INTEGER PRIMARY KEY AUTOINCREMENT,user_id INTEGER,customer_name TEXT,phone TEXT,address TEXT,payment_method TEXT,total INTEGER,status TEXT DEFAULT 'Оформлен',created_at TEXT DEFAULT CURRENT_TIMESTAMP)`);
await run(`CREATE TABLE IF NOT EXISTS order_items(id INTEGER PRIMARY KEY AUTOINCREMENT,order_id INTEGER,product_id INTEGER,name TEXT,price INTEGER,quantity INTEGER,size TEXT)`);
await run(`CREATE TABLE IF NOT EXISTS reviews(id INTEGER PRIMARY KEY AUTOINCREMENT,user_id INTEGER,product_id INTEGER,rating INTEGER,text TEXT,created_at TEXT DEFAULT CURRENT_TIMESTAMP)`);
if(!await get("SELECT id FROM users WHERE email=?",["admin@bloomcentury.ru"])) await run("INSERT INTO users(name,email,password,role) VALUES(?,?,?,?)",["Администратор","admin@bloomcentury.ru",bcrypt.hashSync("admin123",10),"admin"]);
if(!await get("SELECT id FROM users WHERE email=?",["user@bloomcentury.ru"])) await run("INSERT INTO users(name,email,password,role) VALUES(?,?,?,?)",["Тестовый пользователь","user@bloomcentury.ru",bcrypt.hashSync("user123",10),"user"]);
const c=await get("SELECT COUNT(*) c FROM products"); if(c.c===0) for(const p of products) await run("INSERT INTO products(name,category,description,price,sizes,color,stock,image) VALUES(?,?,?,?,?,?,?,?)",[...p,"/uploads/product.svg"]);
}
app.get("/",(req,res)=>res.json({message:"BloomCentury API работает"}));
app.post("/api/auth/register",async(req,res)=>{try{const{name,email,password}=req.body; if(!name||!email||!password)return res.status(400).json({message:"Заполните все поля"}); if(await get("SELECT id FROM users WHERE email=?",[email]))return res.status(400).json({message:"Email уже используется"}); await run("INSERT INTO users(name,email,password) VALUES(?,?,?)",[name,email,bcrypt.hashSync(password,10)]); res.json({message:"Регистрация выполнена"})}catch(e){res.status(500).json({message:"Ошибка сервера"})}});
app.post("/api/auth/login",async(req,res)=>{const{email,password}=req.body,u=await get("SELECT * FROM users WHERE email=?",[email]); if(!u||!bcrypt.compareSync(password,u.password))return res.status(400).json({message:"Неверный email или пароль"}); const data={id:u.id,name:u.name,email:u.email,role:u.role}; res.json({token:jwt.sign(data,SECRET,{expiresIn:"7d"}),user:data})});
app.get("/api/products",async(req,res)=>{const{search="",category="",min="",max="",size=""}=req.query; let sql="SELECT * FROM products WHERE 1=1"; const p=[]; if(search){sql+=" AND (name LIKE ? OR description LIKE ?)";p.push(`%${search}%`,`%${search}%`)} if(category){sql+=" AND category=?";p.push(category)} if(min){sql+=" AND price>=?";p.push(+min)} if(max){sql+=" AND price<=?";p.push(+max)} if(size){sql+=" AND sizes LIKE ?";p.push(`%${size}%`)} sql+=" ORDER BY id DESC"; res.json(await all(sql,p))});
app.get("/api/products/:id",async(req,res)=>{const p=await get("SELECT * FROM products WHERE id=?",[req.params.id]); if(!p)return res.status(404).json({message:"Товар не найден"}); res.json(p)});
app.post("/api/products",auth,admin,upload.single("image"),async(req,res)=>{const{name,category,description,price,sizes,color,stock}=req.body,img=req.file?`/uploads/${req.file.filename}`:"/uploads/product.svg"; await run("INSERT INTO products(name,category,description,price,sizes,color,stock,image) VALUES(?,?,?,?,?,?,?,?)",[name,category,description,+price,sizes,color,+stock,img]); res.json({message:"Товар добавлен"})});

app.put("/api/products/:id", auth, admin, upload.single("image"), async (req, res) => {
  try {
    const oldProduct = await get("SELECT * FROM products WHERE id=?", [req.params.id]);
    if (!oldProduct) return res.status(404).json({ message: "Товар не найден" });

    const name = req.body.name || oldProduct.name;
    const category = req.body.category || oldProduct.category;
    const description = req.body.description || oldProduct.description;
    const price = req.body.price ? Number(req.body.price) : oldProduct.price;
    const sizes = req.body.sizes || oldProduct.sizes;
    const color = req.body.color || oldProduct.color;
    const stock = req.body.stock ? Number(req.body.stock) : oldProduct.stock;
    const image = req.file ? `/uploads/${req.file.filename}` : oldProduct.image;

    await run(
      "UPDATE products SET name=?, category=?, description=?, price=?, sizes=?, color=?, stock=?, image=? WHERE id=?",
      [name, category, description, price, sizes, color, stock, image, req.params.id]
    );

    res.json({ message: "Товар обновлен" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Ошибка обновления товара" });
  }
});

app.delete("/api/products/:id",auth,admin,async(req,res)=>{await run("DELETE FROM products WHERE id=?",[req.params.id]); res.json({message:"Товар удален"})});
app.get("/api/favorites",auth,async(req,res)=>res.json(await all("SELECT p.* FROM favorites f JOIN products p ON p.id=f.product_id WHERE f.user_id=?",[req.user.id])));
app.post("/api/favorites/:id",auth,async(req,res)=>{await run("INSERT OR IGNORE INTO favorites(user_id,product_id) VALUES(?,?)",[req.user.id,req.params.id]); res.json({message:"Добавлено в избранное"})});
app.delete("/api/favorites/:id",auth,async(req,res)=>{await run("DELETE FROM favorites WHERE user_id=? AND product_id=?",[req.user.id,req.params.id]); res.json({message:"Удалено"})});
app.get("/api/cart",auth,async(req,res)=>res.json(await all("SELECT c.id cart_id,c.quantity,c.size,p.* FROM cart_items c JOIN products p ON p.id=c.product_id WHERE c.user_id=?",[req.user.id])));
app.post("/api/cart",auth,async(req,res)=>{const{product_id,quantity=1,size="M"}=req.body; await run("INSERT INTO cart_items(user_id,product_id,quantity,size) VALUES(?,?,?,?) ON CONFLICT(user_id,product_id,size) DO UPDATE SET quantity=quantity+excluded.quantity",[req.user.id,product_id,+quantity,size]); res.json({message:"Добавлено в корзину"})});
app.delete("/api/cart/:id",auth,async(req,res)=>{await run("DELETE FROM cart_items WHERE id=? AND user_id=?",[req.params.id,req.user.id]); res.json({message:"Удалено"})});
app.post("/api/orders",auth,async(req,res)=>{const{customer_name,phone,address,payment_method}=req.body,items=await all("SELECT c.*,p.name,p.price FROM cart_items c JOIN products p ON p.id=c.product_id WHERE c.user_id=?",[req.user.id]); if(!items.length)return res.status(400).json({message:"Корзина пуста"}); const total=items.reduce((s,i)=>s+i.price*i.quantity,0),o=await run("INSERT INTO orders(user_id,customer_name,phone,address,payment_method,total) VALUES(?,?,?,?,?,?)",[req.user.id,customer_name,phone,address,payment_method,total]); for(const i of items) await run("INSERT INTO order_items(order_id,product_id,name,price,quantity,size) VALUES(?,?,?,?,?,?)",[o.lastID,i.product_id,i.name,i.price,i.quantity,i.size]); await run("DELETE FROM cart_items WHERE user_id=?",[req.user.id]); res.json({message:"Заказ оформлен",order_id:o.lastID})});
app.get("/api/orders",auth,async(req,res)=>{const os=await all(req.user.role==="admin"?"SELECT * FROM orders ORDER BY id DESC":"SELECT * FROM orders WHERE user_id=? ORDER BY id DESC",req.user.role==="admin"?[]:[req.user.id]); for(const o of os)o.items=await all("SELECT * FROM order_items WHERE order_id=?",[o.id]); res.json(os)});
app.get("/api/reviews/:id",async(req,res)=>res.json(await all("SELECT r.*,u.name FROM reviews r JOIN users u ON u.id=r.user_id WHERE product_id=? ORDER BY r.id DESC",[req.params.id])));
app.post("/api/reviews/:id",auth,async(req,res)=>{const{rating,text}=req.body; await run("INSERT INTO reviews(user_id,product_id,rating,text) VALUES(?,?,?,?)",[req.user.id,req.params.id,+rating,text]); res.json({message:"Отзыв добавлен"})});
init().then(()=>app.listen(PORT,()=>console.log(`BloomCentury backend: http://localhost:${PORT}`)));
