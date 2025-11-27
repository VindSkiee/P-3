export class SlotWaktu {
  constructor(mulai, selesai) {
    this.mulai = mulai;     // Objek Date
    this.selesai = selesai; // Objek Date
  }

  // initial state: dua slot waktu sudah diketahui (this dan other)
  // final state: mengembalikan true jika kedua slot waktu saling tumpang tindih (overlap)
  tumpangTindih(denganSlotLain) {
    if (!denganSlotLain) return false;

    const mulaiA = this.mulai.getTime();
    const selesaiA = this.selesai.getTime();
    const mulaiB = denganSlotLain.mulai.getTime();
    const selesaiB = denganSlotLain.selesai.getTime();
    return mulaiA < selesaiB && mulaiB < selesaiA;
  }

  // initial state: slot waktu memiliki waktu mulai dan selesai yang valid
  // final state: mengembalikan durasi waktu (dalam menit atau jam) antara mulai dan selesai
  durasi() {
    const ms = this.selesai.getTime() - this.mulai.getTime();
    const menit = Math.floor(ms / 1000 / 60);
    if (menit < 0) {
      return 0;
    }
    return menit;
  }
}

export class Rapat {
  constructor(id, judul, slotWaktu, idRuang, peserta) {
    this.id = id;
    this.judul = judul;
    this.slotWaktu = slotWaktu; // Objek SlotWaktu
    this.idRuang = idRuang;
    this.peserta = peserta; // array nama/id peserta
  }
}

export class RuangRapat {
  constructor(id, nama, kapasitas) {
    this.id = id;
    this.nama = nama;
    this.kapasitas = kapasitas;
  }
}

export class Penjadwal {
  constructor() {
    this.daftarRapat = [];
    this.daftarRuang = [];
  }

  // initial state: daftarRapat sudah berisi beberapa rapat dengan slot waktu tertentu
  // final state: mengembalikan true jika rapat baru memiliki konflik waktu dengan rapat lain di ruang yang sama
  adaKonflik(rapat) {
    for (const r of this.daftarRapat) {
      if (r.idRuang === rapat.idRuang) {
        if (r.slotWaktu.tumpangTindih(rapat.slotWaktu)) {
          return true;
        }
      }
    }
    return false;
  }

  // initial state: daftarRapat berisi rapat-rapat di berbagai ruang dan waktu
  // final state: mengembalikan daftar slot waktu kosong (tidak terpakai) pada tanggal dan durasi tertentu di ruang yang diminta
  cariSlotTersedia(idRuang, tanggal, durasiMenit) {
    const rapatHariIni = this.daftarRapat.filter(r =>
      r.idRuang === idRuang &&
      r.slotWaktu.mulai.toDateString() === tanggal.toDateString()
    );

    rapatHariIni.sort((a, b) => a.slotWaktu.mulai - b.slotWaktu.mulai);

    const hasil = [];
    const hari = tanggal;

    let pointer = new Date(hari.getFullYear(), hari.getMonth(), hari.getDate(), 0, 0, 0);

    for (const r of rapatHariIni) {
      const mulaiRapat = r.slotWaktu.mulai;

      const selisih = (mulaiRapat.getTime() - pointer.getTime()) / (1000 * 60);

      if (selisih >= durasiMenit) {
        hasil.push(
          new SlotWaktu(
            new Date(pointer),
            new Date(pointer.getTime() + durasiMenit * 60000)
          )
        );
      }

      pointer = r.slotWaktu.selesai;
    }
    const akhirHari = new Date(hari.getFullYear(), hari.getMonth(), hari.getDate(), 23, 59, 0);
    const selisihAkhir = (akhirHari.getTime() - pointer.getTime()) / (1000 * 60);

    if (selisihAkhir >= durasiMenit) {
      hasil.push(
        new SlotWaktu(
          new Date(pointer),
          new Date(pointer.getTime() + durasiMenit * 60000)
        )
      );
    }

    return hasil;
  }

  // initial state: daftar rapat dan daftar ruang sudah diketahui
  // final state: menjadwalkan rapat-rapat ke ruang yang paling optimal dengan meminimalkan konflik waktu
  jadwalOptimal(daftarRapat) {
    const hasil = [];

    for (const rapat of daftarRapat) {
      let ditempatkan = false;

      for (const ruang of this.daftarRuang) {
        rapat.idRuang = ruang.id;

        if (!this.adaKonflik(rapat)) {
          this.daftarRapat.push(rapat);
          hasil.push({ rapat, ruang: ruang.nama });
          ditempatkan = true;
          break;
        }
      }

      if (!ditempatkan) {
        hasil.push({ rapat, ruang: null });
      }
    }

    return hasil;
  }

  // initial state: daftarRapat berisi beberapa rapat dengan konflik waktu tertentu
  // final state: mengembalikan daftar alternatif waktu yang memungkinkan rapat diatur ulang tanpa konflik
  cariSlotAlternatif(rapat, rapatBerkonflik) {
    const tanggal = rapat.slotWaktu.mulai;
    const durasi = rapat.slotWaktu.durasi();

    const alternatif = this.cariSlotTersedia(rapat.idRuang, tanggal, durasi);

    const hasil = [];

    for (const slot of alternatif) {
      let aman = true;

      for (const r of rapatBerkonflik) {
        if (slot.tumpangTindih(r.slotWaktu)) {
          aman = false;
          break;
        }
      }

      if (aman) hasil.push(slot);
    }

    return hasil;
  }

  // initial state: daftarRapat berisi rapat-rapat dengan waktu mulai dan selesai
  // final state: mengembalikan daftar rapat yang berlangsung dalam rentang waktu tertentu
  dapatkanRapatDalamRentang(tanggalMulai, tanggalSelesai) {
    const hasil = [];

    for (const rapat of this.daftarRapat) {
      const s = rapat.slotWaktu.mulai;
      const e = rapat.slotWaktu.selesai;
      const overlap = s < tanggalSelesai && e > tanggalMulai;
      if (overlap) hasil.push(rapat);
    }

    return hasil;
  }
}
