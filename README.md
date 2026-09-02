# Al-Qur'an — Hafalan & Murojaah

Aplikasi web sederhana untuk membaca Al-Qur'an dan mengelola target hafalan serta murojaah.

## Fitur
- 30 Juz (Juz 1–30)
- Pembacaan ayat Arab Utsmani
- Daftar juz yang mudah dipilih
- Ayat acak
- Simpan posisi bacaan terakhir
- Target hafalan per juz
- Tandai juz selesai
- Murojaah harian per juz
- Ringkasan progres hafalan
- Streak counter dasar
- Catatan hafalan
- Dark mode
- Responsive desktop & mobile
- Data target/catatan disimpan di `localStorage` browser

## Sumber teks Al-Qur'an
Teks ayat dimuat saat aplikasi dibuka melalui **AlQuran Cloud API**:
`https://api.alquran.cloud/v1`

Endpoint Juz yang digunakan:
`/juz/{juz}/quran-uthmani`

Dokumentasi: https://alquran.cloud/api

Karena teks dimuat dari API, perangkat membutuhkan koneksi internet ketika membaca ayat.

## Menjalankan
Tidak membutuhkan Node.js.

1. Extract ZIP.
2. Buka `index.html` untuk melihat aplikasi.
3. Untuk GitHub Pages: upload `index.html`, `style.css`, `script.js`, dan `README.md` ke repository lalu aktifkan Pages.

## Catatan
Data hafalan, murojaah, dan catatan tersimpan secara lokal pada browser. Jika browser/storage dibersihkan, data lokal dapat hilang.

Untuk versi produksi, fitur yang bisa ditambahkan:
- akun/login
- sinkronisasi database
- audio murattal & pilihan qari
- terjemahan Bahasa Indonesia
- tajwid berwarna
- jadwal target otomatis
- notifikasi murojaah
- kalender hafalan
- statistik per minggu/bulan


## Murottal Mishary Rashid Alafasy
Fitur **Murottal** menggunakan edisi `ar.alafasy` dari AlQuran Cloud/CDN dan memutar audio per ayat secara streaming. Audio tidak dibundel ke dalam ZIP sehingga ukuran aplikasi tetap ringan. Pengguna dapat menekan **▶ Murottal** pada setiap ayat dan audio otomatis melanjutkan ke ayat berikutnya dalam juz yang sedang dibuka.

Sumber audio: AlQuran Cloud / Islamic Network. Lihat dokumentasi CDN dan ketentuan penggunaannya sebelum melakukan publikasi komersial.
