# Modul Backend - Portfolio App

## Deskripsi

    Proyek ini adalah modul backend untuk aplikasi portfolio yang mengelola autentikasi pengguna, data user, dan integrasi dengan Prisma sebagai ORM untuk manajemen database. Backend ini dibangun menggunakan Node.js dengan Express, dan dilengkapi dengan tes unit menggunakan Jest.

## Style Guide

- variabel/fungsi/metode : camelCase
- url : kebab-case
- const : SCREAMING_SNAKE_CASE
- else : snake_case
- file naming : mengikuti isi, misal
  jika file berisi method maka menggunakan camelCase selainnya
  gunakan snake_case
- folder naming : snake_case
- spasi antara operator
- panjang baris < 80 karakter
- nama pada database : snake_case
- kurung kurawal objek selalu satu baris dengan nama objek kecuali jika ditulis terkompresi
- named export dibandingkan export default kecuali untuk file dengan 1 fungsi/method/etc diletakkan diakhir baris

## Struktur Folder

```bash
MODUL_BACKEND/
├── prisma/
│   ├── migrations/            # Folder untuk file migrasi Prisma
│   └── schema.prisma          # Skema Prisma untuk manajemen database
├── src/
│   ├── controllers/           # Kontroler
│   │   ├── authController.js  # Kontroler autentikasi
│   │   └── userController.js  # Kontroler untuk mengelola data pengguna
│   ├── middleware/            # Middleware
│   │   └── authMiddleware.js  # Middleware autentikasi JWT
│   ├── routes/                # Definisi rute API
│   │   ├── authRoutes.js      # Rute untuk autentikasi
│   │   └── userRoutes.js      # Rute untuk pengelolaan pengguna
│   ├── services/              # Layanan bisnis logika aplikasi
│   │   ├── authService.js     # Layanan terkait autentikasi
│   │   └── userService.js     # Layanan untuk logika terkait pengguna
│   ├── app.js                 # Inisialisasi Express dan middleware
│   ├── config.js              # Konfigurasi aplikasi
│   ├── database.js            # Koneksi ke database menggunakan Prisma
│   └── server.js              # Entry point server
├── tests/                     # Folder untuk pengujian (unit testing)
│   ├── login.test.js          # Unit test untuk login
│   ├── logout.test.js         # Unit test untuk logout
│   ├── refresh.test.js        # Unit test untuk token refresh
│   ├── register.test.js       # Unit test untuk registrasi
│   ├── user.test.js           # Unit test untuk pengelolaan pengguna
│   └── users.test.js.example  # Contoh test pengguna
├── .babelrc                   # Konfigurasi Babel untuk transpiling
├── .gitignore                 # Mengabaikan file yang tidak perlu ke Git
├── package-lock.json          # File kunci dependensi npm
├── package.json               # File konfigurasi npm
└── README.md                  # Dokumentasi proyek ini
```

## Langkah-Langkah Instalasi

### Kloning Repository:

```bash
git clone https://github.com/username/modul_backend.git
cd modul_backend
```

### Instal Dependensi:

```bash
npm install
```

### Konfigurasi Variabel Lingkungan

Buat file .env di root proyek dan tambahkan variabel lingkungan yang dibutuhkan seperti koneksi database dan secret key JWT:

`.env`

```bash
PORT = 3000
ACCESS_TOKEN_SECRET = "ACCESS_TOKEN_SECRET"
REFRESH_TOKEN_SECRET = "REFRESH_TOKEN_SECRET"
DATABASE_URL = mysql://username:password@localhost:port/dbname
```

### Jalankan Migrasi Prisma

Pastikan database terhubung, lalu jalankan migrasi Prisma untuk membuat tabel-tabel yang dibutuhkan:

```bash
npx prisma migrate dev
```

### Menjalankan Server

Jalankan server di mode development:

```bash
npm run dev
```

### Menjalankan Tes

Untuk menjalankan unit test menggunakan Jest, gunakan perintah berikut:

```bash
npm test
```

## Fitur Utama

**Autentikasi**: Login, registrasi, logout, refresh token, menggunakan JWT.

**Pengelolaan Pengguna**: CRUD data pengguna.

**Database**: Menggunakan Prisma sebagai ORM dengan dukungan PostgreSQL/MongoDB.

**Testing**: Unit testing dengan Jest.

**Keamanan**: Middleware autentikasi JWT untuk melindungi endpoint sensitif.

## Teknologi yang Digunakan

**Node.js:** Runtime JavaScript untuk backend.

**Express.js:** Framework untuk membuat server HTTP.

**Prisma:** ORM/ODM untuk interaksi database.

**JWT**: JSON Web Token untuk autentikasi.

**Jest**: Framework untuk pengujian unit.

## API Endpoints

### Authentication

`POST` `/api/auth/register`: Registrasi pengguna baru.

`POST` `/api/auth/login`: Login untuk mendapatkan token.

`POST` `/api/auth/logout`: Logout pengguna.

`POST` `/api/auth/refresh`: refresh token.

### User Management

`POST` `/api/users`: Menambah pengguna baru.

`GET` `/api/users`: Mendapatkan daftar semua pengguna.

`GET` `/api/users/:userId`: Mendapatkan detail pengguna berdasarkan ID.

`PUT` `/api/users/:userId`: Memperbarui data pengguna.

`PATCH` `/api/users/:userId`: Memperbarui sebagian data pengguna.

`DELETE` `/api/users/:userId`: Menghapus pengguna.

## Kontribusi

Jika ingin berkontribusi, silakan buat pull request.
