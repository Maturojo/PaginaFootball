# Liga Football Americano Mar del Plata

## Requisitos
- Node.js 18+
- MongoDB corriendo localmente (puerto 27017)

## Instalación y arranque

### 1. Backend
```bash
cd backend
npm install
npm run seed      # Carga datos iniciales y crea el admin
npm run dev       # Servidor en http://localhost:5000
```

### 2. Frontend
```bash
cd frontend
npm install
npm run dev       # App en http://localhost:5173
```

## Acceso Admin
- URL: http://localhost:5173/admin
- Email: admin@ligafootballmdp.com
- Contraseña: Admin1234!

## Estructura
```
backend/src/
  index.js          Servidor Express
  models/           User, Team, Product, Page
  routes/           auth, teams, products, pages
  middleware/auth.js JWT validation
  seed.js           Datos iniciales

frontend/src/
  pages/            Inicio, Historia, Equipos, Tienda, Contacto
  pages/admin/      Login, Dashboard, AdminEquipos, AdminProductos, AdminPaginas
  components/       Navbar, Footer, PrivateRoute
  context/          AuthContext
  api.js            Axios config
```
