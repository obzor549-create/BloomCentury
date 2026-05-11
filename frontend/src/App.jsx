import React from 'react';
import{useEffect,useState}from'react';import{Link,Routes,Route,useNavigate,useParams}from'react-router-dom';import{api,API_URL}from'./api';
function user(){try{return JSON.parse(localStorage.getItem('user'))}catch{return null}}
function Layout({children}){const u=user();const logout=()=>{localStorage.clear();location.href='/'};return <><header className="nav"><Link to="/" className="logo">BloomCentury</Link><nav><Link to="/catalog">Каталог</Link><Link to="/favorites">Избранное</Link><Link to="/cart">Корзина</Link>{u&&<Link to="/profile">Профиль</Link>}{u?.role==='admin'&&<Link to="/admin">Админ панель</Link>}{!u?<Link to="/login" className="btn small">Войти</Link>:<button onClick={logout} className="btn small">Выйти</button>}</nav></header><main>{children}</main><footer className="footer">BloomCentury © 2026 — дипломный проект</footer></>}
function Home(){return <Layout><section className="hero"><div><p className="tag">Новая коллекция</p><h1>Брендированная одежда BloomCentury</h1><p>Худи, футболки, спортивные штаны и кепки в современном серо-черном стиле.</p><Link to="/catalog" className="btn">Перейти в каталог</Link></div><div className="heroCard">Bloom<br/>Century</div></section><section className="features"><div>Быстрое оформление заказа</div><div>Личный кабинет и история покупок</div><div>Имитация онлайн-оплаты</div></section></Layout>}
function ProductCard({p}){const add=async()=>{try{await api.post('/cart',{product_id:p.id,quantity:1,size:p.sizes.split(',')[0]});alert('Добавлено в корзину')}catch{alert('Сначала войдите в аккаунт')}};const fav=async()=>{try{await api.post('/favorites/'+p.id);alert('Добавлено в избранное')}catch{alert('Сначала войдите в аккаунт')}};return <div className="card"><Link to={`/product/${p.id}`}><img src={API_URL+p.image}/></Link><h3>{p.name}</h3><p>{p.category}</p><b>{p.price} ₽</b><div className="row"><button onClick={add}>В корзину</button><button onClick={fav}>♡</button></div></div>}
function Catalog(){const[ps,setPs]=useState([]),[q,setQ]=useState({search:'',category:'',min:'',max:'',size:''});const load=async()=>setPs((await api.get('/products',{params:q})).data);useEffect(()=>{load()},[]);return <Layout><h1>Каталог</h1><div className="filters"><input placeholder="Поиск" onChange={e=>setQ({...q,search:e.target.value})}/><select onChange={e=>setQ({...q,category:e.target.value})}><option value="">Все категории</option><option>Худи</option><option>Футболки</option><option>Спортивные штаны</option><option>Кепки</option></select><input placeholder="Цена от" onChange={e=>setQ({...q,min:e.target.value})}/><input placeholder="Цена до" onChange={e=>setQ({...q,max:e.target.value})}/><select onChange={e=>setQ({...q,size:e.target.value})}><option value="">Размер</option><option>S</option><option>M</option><option>L</option><option>XL</option><option>ONE SIZE</option></select><button className="btn" onClick={load}>Применить</button></div><div className="grid">{ps.map(p=><ProductCard key={p.id} p={p}/>)}</div></Layout>}
function Product(){const{id}=useParams();const[p,setP]=useState(null),[rs,setRs]=useState([]),[text,setText]=useState(''),[rating,setRating]=useState(5);const load=async()=>{setP((await api.get('/products/'+id)).data);setRs((await api.get('/reviews/'+id)).data)};useEffect(()=>{load()},[id]);const rev=async()=>{try{await api.post('/reviews/'+id,{rating,text});setText('');load()}catch{alert('Войдите, чтобы оставить отзыв')}};if(!p)return <Layout>Загрузка...</Layout>;return <Layout><div className="productPage"><img src={API_URL+p.image}/><div><h1>{p.name}</h1><p>{p.description}</p><p>Размеры: {p.sizes}</p><h2>{p.price} ₽</h2></div></div><h2>Отзывы</h2><div className="reviewForm"><select onChange={e=>setRating(e.target.value)}><option>5</option><option>4</option><option>3</option><option>2</option><option>1</option></select><input placeholder="Текст отзыва" value={text} onChange={e=>setText(e.target.value)}/><button className="btn" onClick={rev}>Добавить</button></div>{rs.map(r=><div className="review" key={r.id}><b>{r.name}</b> — {r.rating}/5<p>{r.text}</p></div>)}</Layout>}
function Login(){const nav=useNavigate(),[f,setF]=useState({email:'',password:''});const sub=async e=>{e.preventDefault();try{const r=await api.post('/auth/login',f);localStorage.setItem('token',r.data.token);localStorage.setItem('user',JSON.stringify(r.data.user));nav('/catalog');location.reload()}catch(e){alert(e.response?.data?.message||'Ошибка')}};return <Layout><form className="form" onSubmit={sub}><h1>Вход</h1><input placeholder="Email" onChange={e=>setF({...f,email:e.target.value})}/><input type="password" placeholder="Пароль" onChange={e=>setF({...f,password:e.target.value})}/><button className="btn">Войти</button><Link to="/register">Создать аккаунт</Link></form></Layout>}
function Register(){const nav=useNavigate(),[f,setF]=useState({name:'',email:'',password:''});const sub=async e=>{e.preventDefault();await api.post('/auth/register',f);alert('Регистрация выполнена');nav('/login')};return <Layout><form className="form" onSubmit={sub}><h1>Регистрация</h1><input placeholder="ФИО" onChange={e=>setF({...f,name:e.target.value})}/><input placeholder="Email" onChange={e=>setF({...f,email:e.target.value})}/><input type="password" placeholder="Пароль" onChange={e=>setF({...f,password:e.target.value})}/><button className="btn">Зарегистрироваться</button></form></Layout>}
function Cart(){const[items,setItems]=useState([]),[f,setF]=useState({customer_name:'',phone:'',address:'',payment_method:'Онлайн-оплата (имитация)'});const load=async()=>setItems((await api.get('/cart')).data);useEffect(()=>{load().catch(()=>{})},[]);const total=items.reduce((s,i)=>s+i.price*i.quantity,0);const order=async()=>{await api.post('/orders',f);alert('Заказ оформлен. Онлайн-оплата успешно имитирована.');load()};return <Layout><h1>Корзина</h1>{items.map(i=><div className="line" key={i.cart_id}>{i.name} — {i.quantity} шт. — {i.size} — {i.price*i.quantity} ₽ <button onClick={async()=>{await api.delete('/cart/'+i.cart_id);load()}}>Удалить</button></div>)}<h2>Итого: {total} ₽</h2><div className="form"><input placeholder="ФИО" onChange={e=>setF({...f,customer_name:e.target.value})}/><input placeholder="Телефон" onChange={e=>setF({...f,phone:e.target.value})}/><input placeholder="Адрес доставки" onChange={e=>setF({...f,address:e.target.value})}/><select onChange={e=>setF({...f,payment_method:e.target.value})}><option>Онлайн-оплата (имитация)</option><option>Оплата при получении</option></select><button className="btn" onClick={order}>Оформить заказ</button></div></Layout>}
function Favorites(){const[ps,setPs]=useState([]);useEffect(()=>{api.get('/favorites').then(r=>setPs(r.data)).catch(()=>{})},[]);return <Layout><h1>Избранное</h1><div className="grid">{ps.map(p=><ProductCard key={p.id} p={p}/>)}</div></Layout>}
function Profile(){const u=user(),[os,setOs]=useState([]);useEffect(()=>{api.get('/orders').then(r=>setOs(r.data)).catch(()=>{})},[]);return <Layout><h1>Личный кабинет</h1><div className="box">Пользователь: {u?.name}<br/>Email: {u?.email}</div><h2>История заказов</h2>{os.map(o=><div className="order" key={o.id}><b>Заказ №{o.id}</b> — {o.total} ₽ — {o.status}<br/>{o.items.map(i=><span key={i.id}>{i.name} ({i.quantity} шт.) </span>)}</div>)}</Layout>}
function Admin() {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [form, setForm] = useState({ name:'', category:'Худи', description:'', price:'', sizes:'S,M,L', color:'#111111', stock:'10', image:null });
  const [editForms, setEditForms] = useState({});

  const load = async () => {
    const productsRes = await api.get('/products');
    setProducts(productsRes.data);
    const prepared = {};
    productsRes.data.forEach((p) => {
      prepared[p.id] = {
        name: p.name,
        category: p.category,
        description: p.description,
        price: p.price,
        sizes: p.sizes,
        color: p.color || '#111111',
        stock: p.stock,
        image: null
      };
    });
    setEditForms(prepared);
    setOrders((await api.get('/orders')).data);
  };

  useEffect(()=>{ load().catch(()=>{}); }, []);

  const add = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    Object.entries(form).forEach(([k,v]) => {
      if (v !== null && v !== '') fd.append(k,v);
    });
    await api.post('/products', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
    alert('Товар добавлен');
    setForm({ name:'', category:'Худи', description:'', price:'', sizes:'S,M,L', color:'#111111', stock:'10', image:null });
    load();
  };

  const changeEdit = (id, field, value) => {
    setEditForms({
      ...editForms,
      [id]: {
        ...editForms[id],
        [field]: value
      }
    });
  };

  const saveProduct = async (id) => {
    const fd = new FormData();
    Object.entries(editForms[id]).forEach(([k,v]) => {
      if (v !== null && v !== '') fd.append(k,v);
    });
    await api.put('/products/' + id, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
    alert('Карточка товара обновлена');
    load();
  };

  const del = async (id) => {
    if (!confirm('Удалить товар?')) return;
    await api.delete('/products/' + id);
    load();
  };

  return <Layout>
    <h1>Админ панель</h1>

    <form className="form" onSubmit={add}>
      <h2>Добавить товар</h2>
      <input placeholder="Название" value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/>
      <select value={form.category} onChange={e=>setForm({...form,category:e.target.value})}>
        <option>Худи</option><option>Футболки</option><option>Спортивные штаны</option><option>Кепки</option>
      </select>
      <input placeholder="Описание" value={form.description} onChange={e=>setForm({...form,description:e.target.value})}/>
      <input placeholder="Цена" value={form.price} onChange={e=>setForm({...form,price:e.target.value})}/>
      <input placeholder="Размеры" value={form.sizes} onChange={e=>setForm({...form,sizes:e.target.value})}/>
      <input placeholder="Остаток" value={form.stock} onChange={e=>setForm({...form,stock:e.target.value})}/>
      <input type="file" accept="image/*" onChange={e=>setForm({...form,image:e.target.files[0]})}/>
      <button className="btn">Добавить</button>
    </form>

    <h2>Редактирование карточек товаров</h2>
    <div className="adminProducts">
      {products.map((p) => (
        <div className="adminProductCard" key={p.id}>
          <img src={API_URL + p.image} alt={p.name} />
          <div className="adminProductFields">
            <input value={editForms[p.id]?.name || ''} onChange={e=>changeEdit(p.id,'name',e.target.value)} placeholder="Название"/>
            <select value={editForms[p.id]?.category || 'Худи'} onChange={e=>changeEdit(p.id,'category',e.target.value)}>
              <option>Худи</option><option>Футболки</option><option>Спортивные штаны</option><option>Кепки</option>
            </select>
            <input value={editForms[p.id]?.description || ''} onChange={e=>changeEdit(p.id,'description',e.target.value)} placeholder="Описание"/>
            <input value={editForms[p.id]?.price || ''} onChange={e=>changeEdit(p.id,'price',e.target.value)} placeholder="Цена"/>
            <input value={editForms[p.id]?.sizes || ''} onChange={e=>changeEdit(p.id,'sizes',e.target.value)} placeholder="Размеры"/>
            <input value={editForms[p.id]?.stock || ''} onChange={e=>changeEdit(p.id,'stock',e.target.value)} placeholder="Остаток"/>
            <input type="file" accept="image/*" onChange={e=>changeEdit(p.id,'image',e.target.files[0])}/>
            <div className="adminActions">
              <button type="button" className="btn" onClick={()=>saveProduct(p.id)}>Сохранить</button>
              <button type="button" onClick={()=>del(p.id)}>Удалить</button>
            </div>
          </div>
        </div>
      ))}
    </div>

    <h2>Заказы</h2>
    {orders.map(o => <div className="order" key={o.id}>Заказ №{o.id} — {o.customer_name} — {o.total} ₽</div>)}
  </Layout>;
}

export default function App(){return <Routes><Route path="/" element={<Home/>}/><Route path="/catalog" element={<Catalog/>}/><Route path="/product/:id" element={<Product/>}/><Route path="/login" element={<Login/>}/><Route path="/register" element={<Register/>}/><Route path="/cart" element={<Cart/>}/><Route path="/favorites" element={<Favorites/>}/><Route path="/profile" element={<Profile/>}/><Route path="/admin" element={<Admin/>}/></Routes>}
