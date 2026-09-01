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

## Email de confirmación de inscripciones
Para que cada persona reciba el mensaje automático al inscribirse, configurar estas variables de entorno en el backend/Vercel:

```bash
SMTP_HOST=smtp.tu-proveedor.com
SMTP_PORT=587
SMTP_USER=tu-email@dominio.com
SMTP_PASS=tu-password-o-app-password
SMTP_FROM="Liga Football MDP <tu-email@dominio.com>"
```

Si estas variables no están configuradas, la inscripción igual se guarda, pero no se envía email automático.

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
