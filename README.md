# Modul Backend - asmuam Baseline



## Deskripsi

  Proyek ini adalah modul backend untuk aplikasi portfolio yang mengelola autentikasi pengguna, data user, dan integrasi dengan Prisma sebagai ORM/ODM untuk manajemen database. Backend ini dibangun menggunakan Node.js dengan Express, dan dilengkapi dengan tes unit menggunakan Jest.

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
- menggunakan commit convention
- otomatis test sebelum commit

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
├── .env                       # Konfigurasi lingkungan (.env)
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

Jalankan server:

```bash
npm run start
## using nodemon
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

**Node.js:**
Runtime JavaScript untuk backend yang memungkinkan Anda menjalankan JavaScript di server. Node.js dikenal karena kemampuannya untuk menangani banyak koneksi secara bersamaan berkat model I/O yang non-blok.

**Express.js:**
Framework untuk membuat server HTTP dengan sintaks yang sederhana dan fleksibel, memudahkan pengembangan aplikasi web dan API. Express.js menyediakan banyak middleware untuk menangani permintaan dan respons HTTP.

**Prisma:**
ORM (Object-Relational Mapping) untuk interaksi dengan database. Prisma memudahkan pengelolaan database dengan menggunakan model yang kuat, menyediakan tipe data yang kuat dan query yang intuitif.

**JWT (JSON Web Token):**
Metode untuk mengautentikasi pengguna melalui token yang dapat dipertukarkan. JWT memungkinkan server untuk menghasilkan token saat pengguna berhasil login dan pengguna dapat menggunakan token ini untuk mengakses endpoint yang dilindungi.

**Jest:**
Framework untuk pengujian unit yang digunakan untuk menulis dan menjalankan pengujian JavaScript. Jest menawarkan kemampuan pengujian yang cepat dan efisien serta dukungan untuk pengujian asinkron.

**bcrypt:**
Library untuk hashing password yang menyediakan fungsi hashing yang aman. Bcrypt membantu melindungi password pengguna dengan mengenkripsi password sebelum disimpan ke database.

**cookie-parser:**
Middleware Express.js untuk mem-parsing cookie dari permintaan HTTP. Cookie-parser memudahkan akses data cookie yang dikirim oleh klien.

**cors:**
Middleware untuk mengizinkan Cross-Origin Resource Sharing (CORS), memungkinkan aplikasi web di satu domain untuk melakukan permintaan ke server di domain lain.

**supertest:**
Library untuk menguji endpoint HTTP dalam aplikasi Node.js. Supertest menyediakan API yang intuitif untuk melakukan permintaan dan memverifikasi respons yang diterima.

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


## Panduan Conventional Commits
  Conventional Commits adalah spesifikasi untuk menulis pesan commit yang dapat diinterpretasikan secara otomatis. Dengan mengikuti spesifikasi ini, Anda dapat dengan mudah menghasilkan changelog dan memahami sejarah perubahan dalam proyek.

Format Pesan Commit
Pesan commit harus mengikuti format berikut:

```bash
<type>(<scope>): <subject>
<body>
<footer>
```

Penjelasan Format

**type**: Jenis perubahan yang Anda buat. Berikut adalah beberapa tipe yang umum digunakan:

`feat`: Menambahkan fitur baru.

`fix`: Memperbaiki bug.

`docs`: Perubahan hanya pada dokumentasi.

`style`: Perubahan yang tidak mempengaruhi makna kode (spasi, format, dll).

`refactor`: Perubahan kode yang tidak menambah fitur atau memperbaiki bug.

`perf`: Perubahan yang meningkatkan kinerja.

`test`: Menambahkan tes yang hilang atau memperbaiki tes yang ada.

`chore`: Perubahan pada alat pengembangan atau pustaka yang tidak mempengaruhi kode sumber.

**scope**: (Opsional) Bagian dari kode yang dipengaruhi oleh perubahan. Ini dapat berupa nama modul, komponen, atau bagian dari aplikasi.

**subject**: Deskripsi singkat tentang perubahan. Harus dalam bentuk imperatif (misalnya, "tambah", "perbaiki", "hapus").

**body**: (Opsional) Penjelasan lebih lanjut tentang perubahan, termasuk alasan dan konteks jika perlu.

**footer**: (Opsional) Mengandung informasi tambahan, seperti referensi ke issue yang ditutup, misalnya:

```bash
Closes #123
```

### Contoh Pesan Commit
Berikut adalah beberapa contoh pesan commit yang mengikuti pedoman Conventional Commits:

Menambahkan fitur baru:
```scss
feat(auth): tambahkan autentikasi JWT
```
Memperbaiki bug:
```scss
fix(ui): perbaiki masalah tampilan pada halaman login
```
Mengupdate dokumentasi:
```scss
docs(README): tambahkan contoh penggunaan API
```
Melakukan refactor:
```scss
refactor(user): ubah struktur data pengguna
```
Menambah pengujian:
```scss
test(auth): tambahkan pengujian untuk fungsi login
```
### Kesalahan Umum
**subject-empty**: Subjek pesan commit tidak boleh kosong.
**type-empty**: Tipe pesan commit tidak boleh kosong.
**subject may not be empty**: Pastikan subjek pesan commit Anda tidak kosong dan mendeskripsikan perubahan.
### Menggunakan Commitlint
Untuk memastikan bahwa pesan commit Anda mengikuti pedoman ini, kami menggunakan Commitlint. Jika Anda melakukan commit yang tidak memenuhi kriteria, Anda akan menerima pesan kesalahan yang memberi tahu Anda tentang masalah tersebut.

## Kontribusi

Jika ingin berkontribusi, silakan buat pull request.
