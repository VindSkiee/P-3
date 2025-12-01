export class Produk {
  constructor(id, nama, kategori, harga, tag, rating) {
    this.id = id;
    this.nama = nama;
    this.kategori = kategori;
    this.harga = harga;
    this.tag = tag;
    this.rating = rating;
  }
}

export class KatalogProduk {
  constructor() {
    this.daftarProduk = [];
  }

  // initial state: daftarProduk kosong atau sudah berisi beberapa produk
  // final state: produk baru ditambahkan ke dalam daftarProduk
  tambahProduk(produk) {
    const temp = [];
    for (let i = 0; i < this.daftarProduk.length; i++) {
      temp.push(this.daftarProduk[i]);
    }
    temp.push(produk);
    this.daftarProduk = temp;
  }

  // initial state: daftarProduk berisi beberapa produk dengan id unik
  // final state: produk dengan id tertentu dihapus dari daftarProduk
  hapusProduk(idProduk) {
    const temp = [];
    for (let i = 0; i < this.daftarProduk.length; i++) {
      if (this.daftarProduk[i].id !== idProduk) {
        temp.push(this.daftarProduk[i]);
      }
    }
    this.daftarProduk = temp;
  }

  // initial state: daftarProduk berisi produk dengan berbagai nama
  // final state: mengembalikan daftar produk yang nama-nya mengandung kata kunci tertentu
  cariBerdasarkanNama(kueri) {
    const lower = kueri.toLowerCase();
    const hasil = [];
    for (let i = 0; i < this.daftarProduk.length; i++) {
      const p = this.daftarProduk[i];
      if (p.nama.toLowerCase().indexOf(lower) !== -1) {
        hasil.push(p);
      }
    }
    return hasil;
  }

  // initial state: daftarProduk berisi produk dengan kategori, harga, rating, dan tag berbeda
  // final state: mengembalikan daftar produk yang sesuai dengan kriteria filter yang diberikan
  filterProduk(kriteria) {
    const hasil = [];
    for (let i = 0; i < this.daftarProduk.length; i++) {
      const p = this.daftarProduk[i];

      let cocokKategori = true;
      if (kriteria.kategori) {
        cocokKategori = p.kategori === kriteria.kategori;
      }

      let cocokHargaMin = true;
      if (kriteria.hargaMinimum) {
        cocokHargaMin = p.harga >= kriteria.hargaMinimum;
      }

      let cocokHargaMax = true;
      if (kriteria.hargaMaksimum) {
        cocokHargaMax = p.harga <= kriteria.hargaMaksimum;
      }

      let cocokRating = true;
      if (kriteria.ratingMinimum) {
        cocokRating = p.rating >= kriteria.ratingMinimum;
      }

      let cocokTag = true;
      if (kriteria.tag) {
        cocokTag = false;
        for (let t of p.tag) {
          for (let kt of kriteria.tag) {
            if (t === kt) {
              cocokTag = true;
            }
          }
        }
      }

      if (cocokKategori && cocokHargaMin && cocokHargaMax && cocokRating && cocokTag) {
        hasil.push(p);
      }
    }
    return hasil;
  }

  // initial state: daftarProduk berisi produk dengan atribut harga, rating, dan nama
  // final state: mengembalikan daftar produk yang sudah diurutkan berdasarkan atribut tertentu
  dapatkanProdukTerurut(urutBerdasarkan, urutan) {
    const arr = [];
    for (let i = 0; i < this.daftarProduk.length; i++) {
      arr.push(this.daftarProduk[i]);
    }

    const faktor = urutan === "turun" ? -1 : 1;

    for (let i = 0; i < arr.length - 1; i++) {
      for (let j = i + 1; j < arr.length; j++) {
        if ((arr[i][urutBerdasarkan] > arr[j][urutBerdasarkan] && faktor === 1) ||
            (arr[i][urutBerdasarkan] < arr[j][urutBerdasarkan] && faktor === -1)) {
          const temp = arr[i];
          arr[i] = arr[j];
          arr[j] = temp;
        }
      }
    }

    return arr;
  }

  // initial state: daftarProduk berisi produk dengan berbagai harga
  // final state: mengembalikan daftar produk yang berada dalam rentang harga tertentu
  dapatkanProdukDalamRentangHarga(minimum, maksimum) {
    const hasil = [];
    for (let i = 0; i < this.daftarProduk.length; i++) {
      const p = this.daftarProduk[i];
      if (p.harga >= minimum && p.harga <= maksimum) {
        hasil.push(p);
      }
    }
    return hasil;
  }

  // initial state: daftarProduk berisi produk dengan berbagai kategori dan tag
  // final state: mengembalikan daftar produk yang mirip dengan produk tertentu berdasarkan tag atau kategori
  dapatkanProdukSerupa(idProduk, batas) {
    let target = null;
    for (let i = 0; i < this.daftarProduk.length; i++) {
      if (this.daftarProduk[i].id === idProduk) {
        target = this.daftarProduk[i];
      }
    }
    if (!target) return [];

    const arr = [];
    for (let i = 0; i < this.daftarProduk.length; i++) {
      const p = this.daftarProduk[i];
      if (p.id === idProduk) continue;

      let skor = 0;
      if (p.kategori === target.kategori) skor += 2;

      let tagSama = 0;
      for (let t of p.tag) {
        for (let tt of target.tag) {
          if (t === tt) tagSama++;
        }
      }
      skor += tagSama;

      if (skor > 0) {
        arr.push({ produk: p, skor });
      }
    }

    for (let i = 0; i < arr.length - 1; i++) {
      for (let j = i + 1; j < arr.length; j++) {
        if (arr[i].skor < arr[j].skor) {
          const temp = arr[i];
          arr[i] = arr[j];
          arr[j] = temp;
        }
      }
    }

    const hasil = [];
    for (let i = 0; i < arr.length && i < batas; i++) {
      hasil.push(arr[i].produk);
    }
    return hasil;
  }

  // initial state: daftarProduk berisi produk dengan berbagai nama
  // final state: mengembalikan daftar nama produk yang dimulai dengan prefix tertentu (auto-complete)
  autoLengkap(prefix, batas) {
    const lower = prefix.toLowerCase();
    const arr = [];
    for (let i = 0; i < this.daftarProduk.length; i++) {
      const nama = this.daftarProduk[i].nama.toLowerCase();
      let cocok = true;
      for (let j = 0; j < lower.length; j++) {
        if (nama[j] !== lower[j]) {
          cocok = false;
        }
      }
      if (cocok) {
        arr.push(this.daftarProduk[i].nama);
      }
    }

    const hasil = [];
    for (let i = 0; i < arr.length && i < batas; i++) {
      hasil.push(arr[i]);
    }
    return hasil;
  }
}
