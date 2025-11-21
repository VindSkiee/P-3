export class Kontak {
  constructor(id, nama, email, telepon, perusahaan, tag) {
    this.id = id;
    this.nama = nama;
    this.email = email;
    this.telepon = telepon;
    this.perusahaan = perusahaan;
    this.tag = tag; // Array berisi label/kategori kontak
  }
}

export class PengelolaKontak {
  constructor() {
    this.daftarKontak = [];
  }

  // initial state: daftarKontak berisi beberapa kontak dengan berbagai nama
  // final state: mengembalikan daftar kontak yang namanya diawali dengan prefix tertentu
  cariBerdasarkanAwalanNama(prefix) {
    if (!prefix) return this.daftarKontak;

    const lowerPrefix = prefix.toLowerCase();

    const hasil = [];
    for (const kontak of this.daftarKontak) {
      const namaLower = kontak.nama.toLowerCase();
      if (namaLower.startsWith(lowerPrefix)) {
        hasil.push(kontak);
      }
    }
    return hasil;
  }

  _hitungLevenshtein(a, b) {
    const m = a.length;
    const n = b.length;

    const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));

    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;

    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        const cost = a[i - 1] === b[j - 1] ? 0 : 1;

        dp[i][j] = Math.min(
          dp[i - 1][j] + 1,
          dp[i][j - 1] + 1,
          dp[i - 1][j - 1] + cost
        );
      }
    }
    return dp[m][n];
  }

  // initial state: daftarKontak berisi beberapa kontak dengan nama berbeda
  // final state: mengembalikan daftar kontak yang memiliki kemiripan nama dengan query tertentu (berdasarkan jarak Levenshtein)
  cariNamaSerupa(kueri, jarakMaksimum) {
    if (!kueri) return [];

    const queryLower = kueri.toLowerCase();
    const hasil = [];

    for (const kontak of this.daftarKontak) {
      const namaLower = kontak.nama.toLowerCase();
      const jarak = this._hitungLevenshtein(queryLower, namaLower);

      if (jarak <= jarakMaksimum) {
        hasil.push({ kontak, jarak });
      }
    }
    hasil.sort((a, b) => a.jarak - b.jarak);
    return hasil.map((h) => h.kontak);
  }

  // initial state: daftarKontak berisi beberapa kontak dengan nama dan email yang mungkin berulang
  // final state: mengembalikan daftar kontak yang terdeteksi sebagai duplikat berdasarkan nama atau email
  temukanDuplikat() {
    const mapNama = {};
    const mapEmail = {};

    for (const kontak of this.daftarKontak) {
      const namaKey = kontak.nama.toLowerCase();
      const emailKey = kontak.email.toLowerCase();

      if (!mapNama[namaKey]) mapNama[namaKey] = [];
      if (!mapEmail[emailKey]) mapEmail[emailKey] = [];

      mapNama[namaKey].push(kontak);
      mapEmail[emailKey].push(kontak);
    }

    const hasil = new Set();

    // nama duplikat
    for (const key in mapNama) {
      if (mapNama[key].length > 1) {
        mapNama[key].forEach((k) => hasil.add(k));
      }
    }
    for (const key in mapEmail) {
      if (mapEmail[key].length > 1) {
        mapEmail[key].forEach((k) => hasil.add(k));
      }
    }

    return Array.from(hasil);
  }

  // initial state: daftarKontak berisi beberapa kontak dengan berbagai nama
  // final state: mengembalikan daftar saran nama kontak berdasarkan potongan nama (partialName) dengan batas jumlah tertentu
  dapatkanSaran(namaParsial, batas) {
    if (!namaParsial) return [];

    const lowerPart = namaParsial.toLowerCase();

    let kandidat = [];

    for (const kontak of this.daftarKontak) {
      const namaLower = kontak.nama.toLowerCase();

      if (namaLower.includes(lowerPart)) {
        kandidat.push({
          kontak,
          posisi: namaLower.indexOf(lowerPart),
        });
      }
    }

    kandidat.sort((a, b) => {
      if (a.posisi !== b.posisi) return a.posisi - b.posisi;
      return a.kontak.nama.localeCompare(b.kontak.nama);
    });

    return kandidat.slice(0, batas).map((k) => k.kontak);
  }

  // initial state: daftarKontak berisi beberapa kontak dengan tag yang berbeda
  // final state: mengembalikan daftar kontak yang memiliki tag sesuai dengan kriteria (semua atau salah satu)
  dapatkanKontakBerdasarkanTag(tag, cocokSemua) {
    if (!tag) return [];
    const tagArray = Array.isArray(tag) ? tag : [tag];

    const hasil = [];

    for (const kontak of this.daftarKontak) {
      if (!Array.isArray(kontak.tag)) continue;

      if (cocokSemua) {
        // mode AND → semua tag harus ada
        const semuaAda = tagArray.every((t) => kontak.tag.includes(t));
        if (semuaAda) hasil.push(kontak);
      } else {
        // mode OR → minimal satu tag cocok
        const adaYangCocok = tagArray.some((t) => kontak.tag.includes(t));
        if (adaYangCocok) hasil.push(kontak);
      }
    }

    return hasil;
  }
}
