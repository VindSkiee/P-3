export class Mahasiswa {
  constructor(id, nama, jurusan) {
    this.id = id;
    this.nama = nama;
    this.jurusan = jurusan;
    this.nilai = new Map(); // key: kodeMataKuliah, value: skor (0-100)
  }
}

export class MataKuliah {
  constructor(kode, nama, sks) {
    this.kode = kode;
    this.nama = nama;
    this.sks = sks;
  }
}

function hitungGPA(mahasiswa, daftarMataKuliah) {
  let totalBobot = 0;
  let totalSks = 0;

  for (let [kode, skor] of mahasiswa.nilai.entries()) {
    const mk = daftarMataKuliah.find(m => m.kode === kode);
    if (!mk) continue;

    let bobot;
    if (skor >= 85) bobot = 4.0;
    else if (skor >= 75) bobot = 3.0;
    else if (skor >= 65) bobot = 2.0;
    else if (skor >= 50) bobot = 1.0;
    else bobot = 0.0;

    totalBobot += bobot * mk.sks;
    totalSks += mk.sks;
  }

  return totalSks === 0 ? 0 : totalBobot / totalSks;
}

function mean(arr) {
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function median(arr) {
  const s = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 === 0 ? (s[mid - 1] + s[mid]) / 2 : s[mid];
}

function modus(arr) {
  const freq = new Map();
  let max = 0;
  let hasil = [];

  for (let v of arr) {
    const n = (freq.get(v) || 0) + 1;
    freq.set(v, n);
    if (n > max) max = n;
  }

  for (let [val, count] of freq.entries()) {
    if (count === max) hasil.push(val);
  }

  return hasil;
}

function stdDev(arr) {
  const rata = mean(arr);
  const varians = arr.reduce((sum, v) => sum + (v - rata) ** 2, 0) / arr.length;
  return Math.sqrt(varians);
}

export class AnalisisKinerjaMahasiswa {
  constructor() {
    this.daftarMahasiswa = [];
    this.daftarMataKuliah = [];
  }

  // initial state: daftarMahasiswa kosong atau berisi beberapa objek Mahasiswa
  // final state: objek Mahasiswa baru ditambahkan ke daftarMahasiswa
  tambahMahasiswa(mahasiswa) {
    this.daftarMahasiswa.push(mahasiswa);
  }

  // initial state: daftarMataKuliah kosong atau berisi beberapa objek MataKuliah
  // final state: objek MataKuliah baru ditambahkan ke daftarMataKuliah
  tambahMataKuliah(mataKuliah) {
    this.daftarMataKuliah.push(mataKuliah);
  }

  // initial state: Mahasiswa dan MataKuliah sudah terdaftar, belum ada nilai untuk kombinasi tertentu
  // final state: nilai mahasiswa untuk mata kuliah tertentu tersimpan di Map nilai
  catatNilai(idMahasiswa, kodeMataKuliah, skor) {
    const mhs = this.daftarMahasiswa.find(m => m.id === idMahasiswa);
    const mk = this.daftarMataKuliah.find(m => m.kode === kodeMataKuliah);

    if (!mhs || !mk) return false;

    mhs.nilai.set(kodeMataKuliah, skor);
    return true;
  }

  // initial state: daftarMahasiswa sudah memiliki nilai di berbagai mata kuliah
  // final state: mengembalikan daftar n mahasiswa dengan nilai tertinggi (berdasarkan GPA)
  dapatkanMahasiswaTerbaik(jumlah) {
    const ranking = this.daftarMahasiswa
      .map(m => ({ mahasiswa: m, gpa: hitungGPA(m, this.daftarMataKuliah) }))
      .sort((a, b) => b.gpa - a.gpa);

    return ranking.slice(0, jumlah);
  }

  // initial state: daftarMahasiswa sudah memiliki GPA atau nilai per mata kuliah
  // final state: mengembalikan daftar mahasiswa dengan GPA di antara minGPA dan maxGPA
  cariMahasiswaBerdasarkanRentangGPA(minGPA, maxGPA) {
    return this.daftarMahasiswa.filter(m => {
      const gpa = hitungGPA(m, this.daftarMataKuliah);
      return gpa >= minGPA && gpa <= maxGPA;
    });
  }

  // initial state: setiap mahasiswa memiliki nilai untuk mata kuliah tertentu
  // final state: mengembalikan statistik (mean, median, modus, dan standar deviasi) untuk satu mata kuliah
  dapatkanStatistikMataKuliah(kodeMataKuliah) {
    const nilai = this.daftarMahasiswa
      .map(m => m.nilai.get(kodeMataKuliah))
      .filter(v => v !== undefined);

    if (nilai.length === 0) return null;

    return {
      mean: mean(nilai),
      median: median(nilai),
      modus: modus(nilai),
      standarDeviasi: stdDev(nilai)
    };
  }

  // initial state: daftarMahasiswa sudah memiliki nilai dan GPA
  // final state: mengembalikan peringkat (ranking) dari mahasiswa dengan id tertentu
  dapatkanPeringkatMahasiswa(idMahasiswa) {
    const ranking = this.daftarMahasiswa
      .map(m => ({ id: m.id, gpa: hitungGPA(m, this.daftarMataKuliah) }))
      .sort((a, b) => b.gpa - a.gpa);

    const posisi = ranking.findIndex(r => r.id === idMahasiswa);
    return posisi === -1 ? null : posisi + 1;
  }

  // initial state: daftarMahasiswa berisi berbagai jurusan dan nilai
  // final state: mengembalikan laporan rekap nilai dan statistik berdasarkan satu jurusan
  dapatkanLaporanJurusan(jurusan) {
    const grup = this.daftarMahasiswa.filter(m => m.jurusan === jurusan);
    if (grup.length === 0) return null;

    const laporan = {};

    for (let mk of this.daftarMataKuliah) {
      const nilaiMK = grup
        .map(m => m.nilai.get(mk.kode))
        .filter(v => v !== undefined);

      if (nilaiMK.length > 0) {
        laporan[mk.kode] = {
          mataKuliah: mk.nama,
          rataRata: mean(nilaiMK),
          median: median(nilaiMK),
          modus: modus(nilaiMK),
          standarDeviasi: stdDev(nilaiMK)
        };
      }
    }

    return laporan;
  }
}
