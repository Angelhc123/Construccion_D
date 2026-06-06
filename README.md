# 📚 LecturaIA - Sistema Educativo de Lectura con IA

Sistema educativo inteligente que utiliza IA para mejorar la comprensión lectora de estudiantes de primaria (4º, 5º y 6º grado).

## 🎯 Características

- ✅ **Autenticación y Autorización** (CU-0001) - Implementado
  - Registro de estudiantes y docentes
  - Login con JWT
  - Sistema de códigos de registro

- 🔜 Gestión de Perfiles de Estudiantes (CU-0002)
- 🔜 Gestión de Contenido de Lectura (CU-0003)
- 🔜 Asignaciones Educativas (CU-0004)
- 🔜 Interfaz de Lectura (CU-0005)
- 🔜 Evaluaciones Inteligentes con IA (CU-0006)
- 🔜 Retroalimentación Automatizada (CU-0007)
- 🔜 Analytics Educativos (CU-0008)
- 🔜 Administración del Sistema (CU-0009)

## 🛠️ Tecnologías

### Backend
- ASP.NET Core 8.0 Web API
- Entity Framework Core 9.0
- SQL Server
- JWT Authentication
- BCrypt para encriptación de contraseñas

### Frontend (En desarrollo)
- React 18
- TypeScript
- Vite

### DevOps & Deployment
- **Docker** - Containerización de aplicaciones
- **Docker Compose** - Orquestación de servicios
- **GitHub Actions** - CI/CD automático
- **Nginx** - Proxy reverso
- **Portainer** - Monitoreo de containers (opcional)

## 📦 Estructura del Proyecto

```
LECTURA SISTEMA/
├── LecturaIA.API/              # Web API Backend
│   ├── Controllers/            # Controladores de la API
│   ├── Models/                 # Modelos y DTOs
│   ├── Services/               # Lógica de negocio
│   ├── Data/                   # DbContext y configuración EF
│   └── Migrations/             # Migraciones de base de datos
├── LecturaIA.Frontend/         # Frontend React + TypeScript
├── deployment/                 # Archivos de despliegue
│   ├── lecturaIA.service       # Systemd service
│   └── CONFIGURACION_VPS.md    # Guía de configuración
├── .github/workflows/          # GitHub Actions CI/CD
└── PRUEBAS_API.md             # Guía de pruebas de la API
```

## 🚀 Inicio Rápido

### ⚡ Despliegue Automático (Docker + CI/CD)

El proyecto está configurado para desplegarse automáticamente a tu VPS.

**📖 Lee la guía paso a paso:** [INICIO_RAPIDO.md](INICIO_RAPIDO.md)

**Resumen en 3 pasos:**
1. Configurar Docker en el VPS
2. Configurar GitHub Secrets
3. Hacer `git push` → ¡Listo!

### 💻 Desarrollo Local (Sin Docker)

### Requisitos Previos
- .NET 8.0 SDK
- SQL Server
- Node.js 18+

### Configuración Backend

1. **Clonar el repositorio**
   ```bash
   git clone <tu-repositorio>
   cd "LECTURA SISTEMA"
   ```

2. **Configurar la base de datos**

   Edita `LecturaIA.API/appsettings.json` con tu connection string:
   ```json
   "ConnectionStrings": {
     "DefaultConnection": "Server=tu-servidor;Database=LecturaIA;..."
   }
   ```

3. **Aplicar migraciones**
   ```bash
   cd LecturaIA.API
   dotnet ef database update
   ```

4. **Ejecutar la API**
   ```bash
   dotnet run
   ```

   La API estará disponible en: `http://localhost:5267`
   Swagger UI: `http://localhost:5267/swagger`

### Configuración Frontend

1. **Instalar dependencias**
   ```bash
   cd LecturaIA.Frontend
   npm install
   ```

2. **Ejecutar en desarrollo**
   ```bash
   npm run dev
   ```

   El frontend estará en: `http://localhost:5173`

## 📖 Documentación de la API

### Endpoints Disponibles

#### Autenticación

- `POST /api/auth/registro/estudiante` - Registrar estudiante
- `POST /api/auth/registro/docente` - Registrar docente
- `POST /api/auth/login` - Iniciar sesión

#### Códigos de Registro

- `POST /api/codigos/generar-codigo-estudiante` - Generar código
- `GET /api/codigos/listar-codigos/{codigoDocente}` - Listar códigos

Ver [PRUEBAS_API.md](PRUEBAS_API.md) para ejemplos detallados.

## 🔒 Seguridad

- Contraseñas hasheadas con BCrypt
- Autenticación JWT
- Validación de datos con Data Annotations
- CORS configurado para frontend
- SQL injection prevention con EF Core

## 🌐 Despliegue en Producción

### 🐳 Docker + CI/CD (Configurado)

El proyecto está completamente dockerizado con CI/CD automático.

**Arquitectura:**
```
Internet → Nginx (Puerto 80)
              ├── / → Frontend (React Container)
              └── /api → Backend (ASP.NET Container)
                           ↓
                     SQL Server (161.132.45.15:1433)
```

**Flujo Automático:**
```
git push origin main
    ↓
GitHub Actions
    ↓
Docker Build (Backend + Frontend)
    ↓
Deploy al VPS vía SSH
    ↓
docker-compose up -d
    ↓
✅ Producción actualizada en 5-8 minutos
```

### Configurar por primera vez:

1. **En el VPS:**
   ```bash
   ssh root@161.132.45.15
   bash deployment/setup-vps.sh
   ```

2. **En GitHub:**
   - Configurar secrets (Settings → Secrets and variables → Actions):
     - `VPS_HOST`: 161.132.45.15
     - `VPS_USERNAME`: root
     - `VPS_SSH_KEY`: (clave privada SSH)
     - `VPS_SSH_PORT`: 22
     - `JWT_SECRET_KEY`: (generar con `openssl rand -base64 32`)

3. **Push y listo:**
   ```bash
   git push origin main
   ```

📖 **Documentación:**
- [INICIO_RAPIDO.md](INICIO_RAPIDO.md) - Guía paso a paso completa
- [DOCKER_GUIDE.md](deployment/DOCKER_GUIDE.md) - Detalles técnicos avanzados

## 🧪 Pruebas

### Pruebas Manuales

Ver [PRUEBAS_API.md](PRUEBAS_API.md) para comandos curl y ejemplos.

### Usando Swagger

Navega a `http://localhost:5267/swagger` para probar todos los endpoints interactivamente.

## 📊 Base de Datos

### Tablas

- **Usuarios** - Información base de usuarios (docentes y estudiantes)
- **Estudiantes** - Perfil específico de estudiantes
- **Docentes** - Perfil específico de docentes
- **CodigosRegistroEstudiante** - Sistema de códigos de invitación

### Connection String de Producción

```
Server=161.132.45.15;Database=LecturaIA;User Id=sa;Password=***;TrustServerCertificate=true;
```

## 👥 Roles de Usuario

1. **Estudiante**
   - Leer contenidos asignados
   - Responder cuestionarios
   - Ver su progreso

2. **Docente**
   - Gestionar estudiantes
   - Crear contenido de lectura
   - Asignar lecturas
   - Ver analytics

3. **Administrador**
   - Gestionar docentes
   - Generar códigos de acceso
   - Ver estadísticas globales

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto es académico, desarrollado por Mario Antonio Flores Ramos y Dylan Yariet Tapia Vargas.

## 📧 Contacto

- Proyecto: LecturaIA
- VPS: 161.132.45.15

---

## 📊 Estado del Proyecto

| Componente | Estado | Descripción |
|------------|--------|-------------|
| CU-0001 Autenticación | ✅ Completo | Registro, login, JWT, códigos |
| Docker Backend | ✅ Completo | Dockerfile multi-stage |
| Docker Frontend | ✅ Completo | Nginx + React optimizado |
| Docker Compose | ✅ Completo | Orquestación completa |
| CI/CD GitHub Actions | ✅ Completo | Deploy automático |
| Nginx Proxy | ✅ Completo | Proxy reverso configurado |
| Monitoreo Portainer | ✅ Opcional | Panel visual Docker |
| Base de Datos | ✅ Producción | SQL Server en VPS |

**Próximo:** CU-0002 Gestión de Perfiles de Estudiantes

---

**URL Producción:** http://161.132.45.15
**Swagger API:** http://161.132.45.15/swagger
**Portainer:** http://161.132.45.15:9000 (si está instalado)
