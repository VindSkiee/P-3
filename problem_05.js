export class Produk {
  constructor(id, nama, kategori, stokSekarang, stokMin, stokMax) {
    this.id = id;
    this.nama = nama;
    this.kategori = kategori;
    this.stokSekarang = stokSekarang;
    this.stokMin = stokMin;
    this.stokMax = stokMax;
  }
}

export class TransaksiStok {
  constructor(idProduk, tipe, jumlah, waktu) {
    this.idProduk = idProduk;
    this.tipe = tipe;
    this.jumlah = jumlah;
    this.waktu = waktu;
  }
}

function rataRata(arr) {
  if (arr.length === 0) return 0;
  let total = 0;
  for (let i = 0; i < arr.length; i++) total += arr[i];
  return total / arr.length;
}

export class PengelolaInventaris {
  constructor() {
    this.produk = [];
    this.transaksi = [];
  }

  // initial state: produk berisi daftar produk dengan stok berbeda
  // final state: mengembalikan daftar produk dengan stok terendah, terbatas sesuai limit
  produkStokRendah(batas) {
    const salinan = [];
    for (let i = 0; i < this.produk.length; i++) salinan.push(this.produk[i]);

    for (let i = 0; i < salinan.length; i++) {
      for (let j = i + 1; j < salinan.length; j++) {
        if (salinan[i].stokSekarang > salinan[j].stokSekarang) {
          const t = salinan[i];
          salinan[i] = salinan[j];
          salinan[j] = t;
        }
      }
    }

    const hasil = [];
    for (let i = 0; i < batas && i < salinan.length; i++) hasil.push(salinan[i]);
    return hasil;
  }

  // initial state: produk berisi produk dengan stok maksimum berbeda
  // final state: mengembalikan produk yang stoknya di bawah threshold % dari stok maksimum
  produkDiBawahThreshold(persentase) {
    const hasil = [];
    for (let i = 0; i < this.produk.length; i++) {
      const p = this.produk[i];
      let ambang = 0;
      for (let j = 0; j < p.stokMax; j++) {
        if (j === Math.floor(p.stokMax * (persentase / 100))) {
          ambang = j;
          break;
        }
      }
      if (p.stokSekarang <= ambang) hasil.push(p);
    }
    return hasil;
  }

  // initial state: transaksi berisi daftar semua transaksi
  // final state: mengembalikan daftar transaksi produk tertentu dalam rentang tanggal
  riwayatTransaksi(idProduk, tanggalMulai, tanggalAkhir) {
    const start = new Date(tanggalMulai).getTime();
    const end = new Date(tanggalAkhir).getTime();

    const hasil = [];
    for (let i = 0; i < this.transaksi.length; i++) {
      const t = this.transaksi[i];
      if (t.idProduk !== idProduk) continue;

      let time = new Date(t.waktu).getTime();

      if (time >= start && time <= end) {
        hasil.push(t);
      }
    }
    return hasil;
  }

  // initial state: transaksi berisi sejarah penggunaan produk
  // final state: memprediksi tanggal kapan produk harus direstock berdasarkan rata-rata penggunaan
  prediksiTanggalRestock(idProduk) {
    let produk = null;
    for (let i = 0; i < this.produk.length; i++) {
      if (this.produk[i].id === idProduk) produk = this.produk[i];
    }
    if (!produk) return null;

    const transaksiKeluar = [];
    for (let i = 0; i < this.transaksi.length; i++) {
      const t = this.transaksi[i];
      if (t.idProduk === idProduk && t.tipe === "KELUAR") {
        transaksiKeluar.push(t);
      }
    }

    if (transaksiKeluar.length < 2) return null;

    const selisihHari = [];
    for (let i = 0; i < transaksiKeluar.length; i++) {
      selisihHari.push(new Date(transaksiKeluar[i].waktu).getTime());
    }

    for (let i = 0; i < selisihHari.length; i++) {
      for (let j = i + 1; j < selisihHari.length; j++) {
        if (selisihHari[i] > selisihHari[j]) {
          const t = selisihHari[i];
          selisihHari[i] = selisihHari[j];
          selisihHari[j] = t;
        }
      }
    }

    const intervalHari = [];
    for (let i = 1; i < selisihHari.length; i++) {
      let beda = selisihHari[i] - selisihHari[i - 1];
      beda = beda / (1000 * 60 * 60 * 24);
      intervalHari.push(beda);
    }

    const jumlahList = [];
    for (let i = 0; i < transaksiKeluar.length; i++) {
      jumlahList.push(transaksiKeluar[i].jumlah);
    }

    const rataInterval = rataRata(intervalHari);
    const rataJumlah = rataRata(jumlahList);

    if (rataJumlah === 0) return null;

    const sisa = produk.stokSekarang;
    const estimasiHariHabis = (sisa / rataJumlah) * rataInterval;

    const tanggal = new Date();
    for (let i = 0; i < Math.ceil(estimasiHariHabis); i++) {
      tanggal.setDate(tanggal.getDate() + 1);
    }

    return tanggal;
  }

  // initial state: produk berisi daftar produk
  // final state: memperbarui stok beberapa produk sekaligus
  perbaruiStokBanyak(pembaruan) {
    for (let i = 0; i < pembaruan.length; i++) {
      const up = pembaruan[i];
      let prod = null;

      for (let j = 0; j < this.produk.length; j++) {
        if (this.produk[j].id === up.idProduk) {
          prod = this.produk[j];
        }
      }

      if (!prod) continue;

      if (up.stokBaru < 0) {
        prod.stokSekarang = 0;
      } else {
        prod.stokSekarang = up.stokBaru;
      }
    }
  }
}
