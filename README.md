# KYC Portal

Website KYC (Know Your Customer) dengan integrasi SAP Business One API.

## Tech Stack

### Backend
- **ASP.NET Core 8.0** Web API
- **Entity Framework Core** untuk ORM
- **SQL Server / PostgreSQL** untuk database
- **SAP Business One Service Layer** untuk integrasi

### Frontend
- **React 18** dengan **TypeScript**
- **Vite** sebagai build tool
- **Axios** untuk HTTP client
- **React Router** untuk routing

## Struktur Project

```
KYC/
├── backend/
│   ├── KYC.API/              # ASP.NET Core Web API
│   ├── KYC.Core/             # Business Logic & Entities
│   ├── KYC.Infrastructure/   # Database & External Services
│   └── KYC.Shared/           # DTOs & Shared Models
└── frontend/                 # React Frontend
```

## Prerequisites

### Backend
- [.NET 8.0 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- SQL Server atau PostgreSQL

### Frontend
- [Node.js](https://nodejs.org/) (v18 atau lebih baru)
- npm atau yarn

## Installation & Setup

### 1. Backend Setup

```powershell
# Navigate to backend folder
cd backend

# Restore dependencies (setelah .NET SDK terinstall)
dotnet restore

# Update connection string di appsettings.json
# Edit: backend/KYC.API/appsettings.json

# Run migrations (setelah setup database)
dotnet ef database update --project KYC.Infrastructure --startup-project KYC.API

# Run the API
cd KYC.API
dotnet run
```

Backend akan berjalan di `http://localhost:5000` (HTTP) dan `https://localhost:5001` (HTTPS)

### 2. Frontend Setup

```powershell
# Navigate to frontend folder
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev
```

Frontend akan berjalan di `http://localhost:5173`

## Configuration

### Backend Configuration
Edit `backend/KYC.API/appsettings.json`:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=KYC_DB;User Id=sa;Password=YourPassword;",
    "PostgreSQL": "Host=localhost;Port=5432;Database=KYC_DB;Username=postgres;Password=YourPassword"
  },
  "SAPSettings": {
    "ServiceLayerUrl": "https://your-sap-server:50000/b1s/v1",
    "CompanyDB": "SBODemoUS",
    "Username": "manager",
    "Password": "YourSAPPassword"
  }
}
```

### Frontend Configuration
Edit `frontend/.env`:

```
VITE_API_URL=http://localhost:5000/api
```

## Features

- ✅ Customer Management (CRUD)
- ✅ KYC Status Tracking
- ✅ SAP B1 Integration
- ✅ RESTful API
- ✅ Responsive UI
- 🔄 Authentication & Authorization (Coming Soon)
- 🔄 Document Upload (Coming Soon)

## API Endpoints

### Health Check
- `GET /api/health` - Check API status

### Customers (Coming Soon)
- `GET /api/customers` - Get all customers
- `GET /api/customers/{id}` - Get customer by ID
- `POST /api/customers` - Create new customer
- `PUT /api/customers/{id}` - Update customer
- `DELETE /api/customers/{id}` - Delete customer
- `POST /api/customers/{id}/sync-sap` - Sync customer to SAP B1

## Development

### Backend
```powershell
cd backend/KYC.API
dotnet watch run
```

### Frontend
```powershell
cd frontend
npm run dev
```

## Build for Production

### Backend
```powershell
cd backend/KYC.API
dotnet publish -c Release -o ./publish
```

### Frontend
```powershell
cd frontend
npm run build
```

## License

Private Project

## Contact

Untuk pertanyaan atau support, hubungi tim development.
