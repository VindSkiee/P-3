export class Mahasiswa {
  constructor(id, nama, jurusan) {
    this.id = id;
    this.nama = nama;
    this.jurusan = jurusan;
    this.nilai = []; 
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

  for (let i = 0; i < mahasiswa.nilai.length; i++) {
    const pasangan = mahasiswa.nilai[i];
    let mk = null;

    for (let j = 0; j < daftarMataKuliah.length; j++) {
      if (daftarMataKuliah[j].kode === pasangan.kode) {
        mk = daftarMataKuliah[j];
        break;
      }
    }
    if (!mk) continue;

    let skor = pasangan.skor;
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
  let sum = 0;
  for (let i = 0; i < arr.length; i++) sum += arr[i];
  return sum / arr.length;
}

function median(arr) {
  const duplikat = [];
  for (let i = 0; i < arr.length; i++) duplikat.push(arr[i]);

  for (let a = 0; a < duplikat.length; a++) {
    for (let b = a + 1; b < duplikat.length; b++) {
      if (duplikat[a] > duplikat[b]) {
        const t = duplikat[a];
        duplikat[a] = duplikat[b];
        duplikat[b] = t;
      }
    }
  }

  const mid = Math.floor(duplikat.length / 2);
  return duplikat.length % 2 === 0
    ? (duplikat[mid - 1] + duplikat[mid]) / 2
    : duplikat[mid];
}

function modus(arr) {
  const freq = [];
  let max = 0;

  for (let i = 0; i < arr.length; i++) {
    let found = false;

    for (let j = 0; j < freq.length; j++) {
      if (freq[j].val === arr[i]) {
        freq[j].count++;
        if (freq[j].count > max) max = freq[j].count;
        found = true;
      }
    }

    if (!found) {
      freq.push({ val: arr[i], count: 1 });
      if (1 > max) max = 1;
    }
  }

  const hasil = [];
  for (let i = 0; i < freq.length; i++) {
    if (freq[i].count === max) hasil.push(freq[i].val);
  }
  return hasil;
}

function stdDev(arr) {
  const r = mean(arr);
  let sum = 0;

  for (let i = 0; i < arr.length; i++) {
    sum += (arr[i] - r) * (arr[i] - r);
  }

  return Math.sqrt(sum / arr.length);
}

export class AnalisisKinerjaMahasiswa {
  constructor() {
    this.daftarMahasiswa = [];
    this.daftarMataKuliah = [];
  }

  // initial state: daftarMahasiswa kosong atau berisi beberapa objek Mahasiswa
  // final state: objek Mahasiswa baru ditambahkan ke daftarMahasiswa
  tambahMahasiswa(mahasiswa) {
    const baru = [];
    for (let i = 0; i < this.daftarMahasiswa.length; i++)
      baru.push(this.daftarMahasiswa[i]);
    baru.push(mahasiswa);
    this.daftarMahasiswa = baru;
  }

  // initial state: daftarMataKuliah kosong atau berisi beberapa objek MataKuliah
  // final state: objek MataKuliah baru ditambahkan ke daftarMataKuliah
  tambahMataKuliah(mataKuliah) {
    const baru = [];
    for (let i = 0; i < this.daftarMataKuliah.length; i++)
      baru.push(this.daftarMataKuliah[i]);
    baru.push(mataKuliah);
    this.daftarMataKuliah = baru;
  }

  // initial state: Mahasiswa dan MataKuliah sudah terdaftar, belum ada nilai untuk kombinasi tertentu
  // final state: nilai mahasiswa untuk mata kuliah tertentu tersimpan di Map nilai
  catatNilai(idMahasiswa, kodeMataKuliah, skor) {
    let mhs = null;
    for (let i = 0; i < this.daftarMahasiswa.length; i++) {
      if (this.daftarMahasiswa[i].id === idMahasiswa)
        mhs = this.daftarMahasiswa[i];
    }

    let mk = null;
    for (let i = 0; i < this.daftarMataKuliah.length; i++) {
      if (this.daftarMataKuliah[i].kode === kodeMataKuliah)
        mk = this.daftarMataKuliah[i];
    }

    if (!mhs || !mk) return false;

    let found = false;
    for (let i = 0; i < mhs.nilai.length; i++) {
      if (mhs.nilai[i].kode === kodeMataKuliah) {
        mhs.nilai[i].skor = skor;
        found = true;
      }
    }

    if (!found) {
      const baru = [];
      for (let i = 0; i < mhs.nilai.length; i++) baru.push(mhs.nilai[i]);
      baru.push({ kode: kodeMataKuliah, skor });
      mhs.nilai = baru;
    }
    return true;
  }

  // initial state: daftarMahasiswa sudah memiliki nilai di berbagai mata kuliah
  // final state: mengembalikan daftar n mahasiswa dengan nilai tertinggi (berdasarkan GPA)
  dapatkanMahasiswaTerbaik(jumlah) {
    const ranking = [];

    for (let i = 0; i < this.daftarMahasiswa.length; i++) {
      ranking.push({
        mahasiswa: this.daftarMahasiswa[i],
        gpa: hitungGPA(this.daftarMahasiswa[i], this.daftarMataKuliah)
      });
    }

    for (let a = 0; a < ranking.length; a++) {
      for (let b = a + 1; b < ranking.length; b++) {
        if (ranking[a].gpa < ranking[b].gpa) {
          const t = ranking[a];
          ranking[a] = ranking[b];
          ranking[b] = t;
        }
      }
    }

    const hasil = [];
    for (let i = 0; i < jumlah && i < ranking.length; i++) {
      hasil.push(ranking[i]);
    }

    return hasil;
  }

  // initial state: daftarMahasiswa sudah memiliki GPA atau nilai per mata kuliah
  // final state: mengembalikan daftar mahasiswa dengan GPA di antara minGPA dan maxGPA
  cariMahasiswaBerdasarkanRentangGPA(minGPA, maxGPA) {
    const hasil = [];

    for (let i = 0; i < this.daftarMahasiswa.length; i++) {
      const gpa = hitungGPA(this.daftarMahasiswa[i], this.daftarMataKuliah);
      if (gpa >= minGPA && gpa <= maxGPA) hasil.push(this.daftarMahasiswa[i]);
    }

    return hasil;
  }

  // initial state: setiap mahasiswa memiliki nilai untuk mata kuliah tertentu
  // final state: mengembalikan statistik (mean, median, modus, dan standar deviasi) untuk satu mata kuliah
  dapatkanStatistikMataKuliah(kodeMataKuliah) {
    const nilai = [];

    for (let i = 0; i < this.daftarMahasiswa.length; i++) {
      const m = this.daftarMahasiswa[i];
      for (let j = 0; j < m.nilai.length; j++) {
        if (m.nilai[j].kode === kodeMataKuliah)
          nilai.push(m.nilai[j].skor);
      }
    }

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
    const ranking = [];

    for (let i = 0; i < this.daftarMahasiswa.length; i++) {
      ranking.push({
        id: this.daftarMahasiswa[i].id,
        gpa: hitungGPA(this.daftarMahasiswa[i], this.daftarMataKuliah)
      });
    }

    for (let a = 0; a < ranking.length; a++) {
      for (let b = a + 1; b < ranking.length; b++) {
        if (ranking[a].gpa < ranking[b].gpa) {
          const t = ranking[a];
          ranking[a] = ranking[b];
          ranking[b] = t;
        }
      }
    }

    for (let i = 0; i < ranking.length; i++) {
      if (ranking[i].id === idMahasiswa) return i + 1;
    }

    return null;
  }

  // initial state: daftarMahasiswa berisi berbagai jurusan dan nilai
  // final state: mengembalikan laporan rekap nilai dan statistik berdasarkan satu jurusan
  dapatkanLaporanJurusan(jurusan) {
    const grup = [];

    for (let i = 0; i < this.daftarMahasiswa.length; i++) {
      if (this.daftarMahasiswa[i].jurusan === jurusan)
        grup.push(this.daftarMahasiswa[i]);
    }

    if (grup.length === 0) return null;

    const laporan = {};

    for (let i = 0; i < this.daftarMataKuliah.length; i++) {
      const mk = this.daftarMataKuliah[i];
      const nilaiMK = [];

      for (let j = 0; j < grup.length; j++) {
        const m = grup[j];
        for (let k = 0; k < m.nilai.length; k++) {
          if (m.nilai[k].kode === mk.kode)
            nilaiMK.push(m.nilai[k].skor);
        }
      }

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
