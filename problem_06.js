export class Produk {
  constructor(id, nama, kategori, harga, tag, rating) {
    this.id = id;
    this.nama = nama;
    this.kategori = kategori;
    this.harga = harga;
    this.tag = tag;      // array berisi label/kata kunci produk
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
    this.daftarProduk.push(produk);
  }

  // initial state: daftarProduk berisi beberapa produk dengan id unik
  // final state: produk dengan id tertentu dihapus dari daftarProduk
  hapusProduk(idProduk) {
    this.daftarProduk = this.daftarProduk.filter(p => p.id !== idProduk);
  }

  // initial state: daftarProduk berisi produk dengan berbagai nama
  // final state: mengembalikan daftar produk yang nama-nya mengandung kata kunci tertentu
  cariBerdasarkanNama(kueri) {
    const lower = kueri.toLowerCase();
    return this.daftarProduk.filter(p =>
      p.nama.toLowerCase().includes(lower)
    );
  }

  // initial state: daftarProduk berisi produk dengan kategori, harga, rating, dan tag berbeda
  // final state: mengembalikan daftar produk yang sesuai dengan kriteria filter yang diberikan
  filterProduk(kriteria) {
    return this.daftarProduk.filter(p => {
      const cocokKategori =
        !kriteria.kategori || p.kategori === kriteria.kategori;

      const cocokHargaMin =
        !kriteria.hargaMinimum || p.harga >= kriteria.hargaMinimum;

      const cocokHargaMax =
        !kriteria.hargaMaksimum || p.harga <= kriteria.hargaMaksimum;

      const cocokRating =
        !kriteria.ratingMinimum || p.rating >= kriteria.ratingMinimum;

      const cocokTag =
        !kriteria.tag ||
        p.tag.some(t => kriteria.tag.includes(t)); // minimal ada 1 tag yang cocok

      return cocokKategori && cocokHargaMin && cocokHargaMax && cocokRating && cocokTag;
    });
  }

  // initial state: daftarProduk berisi produk dengan atribut harga, rating, dan nama
  // final state: mengembalikan daftar produk yang sudah diurutkan berdasarkan atribut tertentu
  dapatkanProdukTerurut(urutBerdasarkan, urutan) {
    const faktor = urutan === "turun" ? -1 : 1;

    return this.daftarProduk
      .slice() // clone untuk keamanan data
      .sort((a, b) => {
        if (a[urutBerdasarkan] < b[urutBerdasarkan]) return -1 * faktor;
        if (a[urutBerdasarkan] > b[urutBerdasarkan]) return 1 * faktor;
        return 0;
      });
  }

  // initial state: daftarProduk berisi produk dengan berbagai harga
  // final state: mengembalikan daftar produk yang berada dalam rentang harga tertentu
  dapatkanProdukDalamRentangHarga(minimum, maksimum) {
    return this.daftarProduk.filter(p => p.harga >= minimum && p.harga <= maksimum);
  }

  // initial state: daftarProduk berisi produk dengan berbagai kategori dan tag
  // final state: mengembalikan daftar produk yang mirip dengan produk tertentu berdasarkan tag atau kategori
  dapatkanProdukSerupa(idProduk, batas) {
    const target = this.daftarProduk.find(p => p.id === idProduk);
    if (!target) return [];

    const hasil = this.daftarProduk
      .filter(p => p.id !== idProduk)
      .map(p => {
        let skor = 0;

        if (p.kategori === target.kategori) skor += 2;

        // cocokkan tag — makin banyak tag yang sama makin tinggi skor
        const tagSama = p.tag.filter(t => target.tag.includes(t)).length;
        skor += tagSama;

        return { produk: p, skor };
      })
      .filter(x => x.skor > 0) // hanya produk yang somewhat mirip
      .sort((a, b) => b.skor - a.skor)
      .slice(0, batas)
      .map(x => x.produk);

    return hasil;
  }

  // initial state: daftarProduk berisi produk dengan berbagai nama
  // final state: mengembalikan daftar nama produk yang dimulai dengan prefix tertentu (auto-complete)
  autoLengkap(prefix, batas) {
    const lower = prefix.toLowerCase();

    return this.daftarProduk
      .filter(p => p.nama.toLowerCase().startsWith(lower))
      .slice(0, batas)
      .map(p => p.nama);
  }
}
