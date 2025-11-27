export class Produk {
  constructor(id, nama, kategori, stokSekarang, stokMin, stokMax) {
    this.id = id;                // ID unik produk
    this.nama = nama;            // Nama produk
    this.kategori = kategori;    // Kategori produk
    this.stokSekarang = stokSekarang; // Jumlah stok saat ini
    this.stokMin = stokMin;      // Stok minimum
    this.stokMax = stokMax;      // Stok maksimum
  }
}

export class TransaksiStok {
  constructor(idProduk, tipe, jumlah, waktu) {
    this.idProduk = idProduk; // ID produk
    this.tipe = tipe;         // "MASUK" atau "KELUAR"
    this.jumlah = jumlah;     // Jumlah produk yang ditransaksikan
    this.waktu = waktu;       // Timestamp transaksi
  }
}

function rataRata(arr) {
  if (arr.length === 0) return 0;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

export class PengelolaInventaris {
  constructor() {
    this.produk = [];        // Daftar semua produk
    this.transaksi = [];     // Daftar semua transaksi
  }

  // initial state: produk berisi daftar produk dengan stok berbeda
  // final state: mengembalikan daftar produk dengan stok terendah, terbatas sesuai limit
  produkStokRendah(batas) {
    return this.produk
      .slice()                                 // salin agar tidak mengubah array asli
      .sort((a, b) => a.stokSekarang - b.stokSekarang)
      .slice(0, batas);
  }

  // initial state: produk berisi produk dengan stok maksimum berbeda
  // final state: mengembalikan produk yang stoknya di bawah threshold % dari stok maksimum
  produkDiBawahThreshold(persentase) {
    return this.produk.filter(p => {
      const ambang = p.stokMax * (persentase / 100);
      return p.stokSekarang <= ambang;
    });
  }

  // initial state: transaksi berisi daftar semua transaksi
  // final state: mengembalikan daftar transaksi produk tertentu dalam rentang tanggal
  riwayatTransaksi(idProduk, tanggalMulai, tanggalAkhir) {
    const start = new Date(tanggalMulai).getTime();
    const end = new Date(tanggalAkhir).getTime();

    return this.transaksi.filter(t => {
      if (t.idProduk !== idProduk) return false;
      const time = new Date(t.waktu).getTime();
      return time >= start && time <= end;
    });
  }

  // initial state: transaksi berisi sejarah penggunaan produk
  // final state: memprediksi tanggal kapan produk harus direstock berdasarkan rata-rata penggunaan
  prediksiTanggalRestock(idProduk) {
    const produk = this.produk.find(p => p.id === idProduk);
    if (!produk) return null;

  	// ambil transaksi keluar dari produk tertentu
    const transaksiKeluar = this.transaksi.filter(
      t => t.idProduk === idProduk && t.tipe === "KELUAR"
    );

    if (transaksiKeluar.length < 2) {
      return null; 
    }

    const selisihHari = transaksiKeluar.map(t => new Date(t.waktu).getTime());
    selisihHari.sort((a, b) => a - b);

    let intervalHari = [];
    for (let i = 1; i < selisihHari.length; i++) {
      const beda = (selisihHari[i] - selisihHari[i - 1]) / (1000 * 60 * 60 * 24);
      intervalHari.push(beda);
    }

    const rataInterval = rataRata(intervalHari);
    const rataJumlah = rataRata(transaksiKeluar.map(t => t.jumlah));

    if (rataJumlah === 0) return null;
    const sisa = produk.stokSekarang;
    const estimasiHariHabis = (sisa / rataJumlah) * rataInterval;

    const tanggal = new Date();
    tanggal.setDate(tanggal.getDate() + Math.ceil(estimasiHariHabis));

    return tanggal;
  }

  // initial state: produk berisi daftar produk
  // final state: memperbarui stok beberapa produk sekaligus
  perbaruiStokBanyak(pembaruan) {
    for (let up of pembaruan) {
      const prod = this.produk.find(pr => pr.id === up.idProduk);
      if (up.stokBaru < 0) {
        prod.stokSekarang = 0;
        continue;
      }
      if (prod) {
        prod.stokSekarang = up.stokBaru;
      }
    }
  }
}
