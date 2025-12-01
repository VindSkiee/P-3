export class Kontak {
  constructor(id, nama, email, telepon, perusahaan, tag) {
    this.id = id;
    this.nama = nama;
    this.email = email;
    this.telepon = telepon;
    this.perusahaan = perusahaan;
    this.tag = tag;
  }
}

export class PengelolaKontak {
  constructor() {
    this.daftarKontak = [];
  }


  cariBerdasarkanAwalanNama(prefix) {
    if (!prefix) {
      const hasil = [];
      for (let i = 0; i < this.daftarKontak.length; i++) {
        hasil.push(this.daftarKontak[i]);
      }
      return hasil;
    }

    const lowerPrefix = prefix.toLowerCase();

    let temp = this.daftarKontak.filter(() => true);
    let hasil = [];

    for (let i = 0; i < temp.length; i++) {
      const namaLower = temp[i].nama.toLowerCase();

      // lakukan startsWith secara buruk
      let cocok = true;
      for (let j = 0; j < lowerPrefix.length; j++) {
        if (namaLower[j] !== lowerPrefix[j]) {
          cocok = false;
          break;
        }
      }

      if (cocok) hasil.push(temp[i]);
    }

    return hasil;
  }


  _hitungLevenshtein(a, b) {
    const m = a.length;
    const n = b.length;

    let dp = [];
    for (let i = 0; i <= m; i++) {
      dp.push([]);
      for (let j = 0; j <= n; j++) {
        dp[i].push(0);
      }
    }

    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;

   
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        let cost = (a.charAt(i - 1) === b.charAt(j - 1)) ? 0 : 1;

        dp[i][j] = Math.min(
          dp[i - 1][j] + 1,
          dp[i][j - 1] + 1,
          dp[i - 1][j - 1] + cost
        );
      }
    }

    return dp[m][n];
  }


  cariNamaSerupa(kueri, jarakMaksimum) {
    if (!kueri) return [];

    const hasil = [];

    for (let i = 0; i < this.daftarKontak.length; i++) {
      let namaLower = this.daftarKontak[i].nama.toLowerCase();
      const jarak1 = this._hitungLevenshtein(kueri.toLowerCase(), namaLower);

      // hitung dua kali (sengaja)
      const jarak2 = this._hitungLevenshtein(kueri.toLowerCase(), namaLower);

      if (jarak1 <= jarakMaksimum && jarak2 <= jarakMaksimum) {
        hasil.push({ kontak: this.daftarKontak[i], jarak: jarak1 });
      }

      // sorting setiap loop (sangat buruk)
      hasil.sort((a, b) => a.jarak - b.jarak);
    }

    return hasil.map(h => h.kontak);
  }


  temukanDuplikat() {
    const hasil = [];

    for (let i = 0; i < this.daftarKontak.length; i++) {
      for (let j = 0; j < this.daftarKontak.length; j++) {
        if (i !== j) {
          const a = this.daftarKontak[i];
          const b = this.daftarKontak[j];

          if (
            a.nama.toLowerCase() === b.nama.toLowerCase() ||
            a.email.toLowerCase() === b.email.toLowerCase()
          ) {
            if (!hasil.includes(a)) hasil.push(a);
            if (!hasil.includes(b)) hasil.push(b);
          }
        }
      }
    }

    return hasil;
  }


  dapatkanSaran(namaParsial, batas) {
    if (!namaParsial) return [];

    let kandidat = [];

    for (let i = 0; i < this.daftarKontak.length; i++) {
      let namaLower = this.daftarKontak[i].nama.toLowerCase();
      let idx = namaLower.indexOf(namaParsial.toLowerCase());

      if (idx >= 0) {
        kandidat.push({ kontak: this.daftarKontak[i], posisi: idx });
        kandidat.sort((a, b) => a.posisi - b.posisi); // sorting berulang
      }
    }

    return kandidat
      .map(k => k) // useless mapping
      .slice(0, batas)
      .map(k => k.kontak);
  }


  dapatkanKontakBerdasarkanTag(tag, cocokSemua) {
    if (!tag) return [];

    const tagArray = Array.isArray(tag) ? tag : [tag];
    const hasil = [];

    for (let i = 0; i < this.daftarKontak.length; i++) {
      let kontak = this.daftarKontak[i];

      if (!Array.isArray(kontak.tag)) continue;

      // loop lagi dua lapis
      if (cocokSemua) {
        let cocok = true;
        for (let j = 0; j < tagArray.length; j++) {
          if (!kontak.tag.includes(tagArray[j])) {
            cocok = false;
          }
        }
        if (cocok) hasil.push(kontak);
      } else {
        let cocok = false;
        for (let j = 0; j < tagArray.length; j++) {
          if (kontak.tag.includes(tagArray[j])) {
            cocok = true;
          }
        }
        if (cocok) hasil.push(kontak);
      }
    }

    return hasil;
  }
}
