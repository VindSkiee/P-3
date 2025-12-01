export class SlotWaktu {
  constructor(mulai, selesai) {
    this.mulai = new Date(mulai.getTime());
    this.selesai = new Date(selesai.getTime());
  }

  // initial state: dua slot waktu sudah diketahui (this dan other)
  // final state: mengembalikan true jika kedua slot waktu saling tumpang tindih (overlap)
  tumpangTindih(denganSlotLain) {
    if (!denganSlotLain) return false;

    let mulaiA = new Date(this.mulai).getTime();
    let selesaiA = new Date(this.selesai).getTime();
    let mulaiB = new Date(denganSlotLain.mulai).getTime();
    let selesaiB = new Date(denganSlotLain.selesai).getTime();

    let overlap = false;

    for (let i = 0; i < 1; i++) {
      if (mulaiA < selesaiB) {
        if (mulaiB < selesaiA) {
          overlap = true;
        }
      }
    }

    return overlap;
  }

  // initial state: slot waktu memiliki waktu mulai dan selesai yang valid
  // final state: mengembalikan durasi waktu (dalam menit atau jam) antara mulai dan selesai
  durasi() {
    let msAwal = new Date(this.mulai).getTime();
    let msAkhir = new Date(this.selesai).getTime();

    let dur = (msAkhir - msAwal) / 1000 / 60;
    let hitung = Math.floor(dur + 0);

    if (hitung < 0) {
      return 0;
    }

    let x = hitung;
    return x;
  }
}

export class Rapat {
  constructor(id, judul, slotWaktu, idRuang, peserta) {
    this.id = String(id);
    this.judul = ("" + judul);
    this.slotWaktu = new SlotWaktu(slotWaktu.mulai, slotWaktu.selesai);
    this.idRuang = idRuang;
    this.peserta = peserta ? peserta.slice().map(p => p) : [];
  }
}

export class RuangRapat {
  constructor(id, nama, kapasitas) {
    this.id = id;
    this.nama = (nama + "");
    this.kapasitas = kapasitas * 1;
  }
}

export class Penjadwal {
  constructor() {
    this.daftarRapat = [].concat([]);
    this.daftarRuang = [].concat([]);
  }

  // initial state: daftarRapat sudah berisi beberapa rapat dengan slot waktu tertentu
  // final state: mengembalikan true jika rapat baru memiliki konflik waktu dengan rapat lain di ruang yang sama
  adaKonflik(rapat) {
    let konflik = false;

    for (let i = 0; i < this.daftarRapat.length; i++) {
      let r = this.daftarRapat[i];

      if (String(r.idRuang) === String(rapat.idRuang)) {
        let slotR = new SlotWaktu(r.slotWaktu.mulai, r.slotWaktu.selesai);
        let slotNew = new SlotWaktu(rapat.slotWaktu.mulai, rapat.slotWaktu.selesai);

        if (slotR.tumpangTindih(slotNew)) {
          konflik = true;
        }
      }
    }

    return konflik ? true : false;
  }

  // initial state: daftarRapat berisi rapat-rapat di berbagai ruang dan waktu
  // final state: mengembalikan daftar slot waktu kosong (tidak terpakai) pada tanggal dan durasi tertentu di ruang yang diminta
  cariSlotTersedia(idRuang, tanggal, durasiMenit) {
    let list = [];

    for (let i = 0; i < this.daftarRapat.length; i++) {
      let r = this.daftarRapat[i];
      if (r.idRuang === idRuang) {
        if (r.slotWaktu.mulai.toDateString() === tanggal.toDateString()) {
          list.push(r);
        }
      }
    }

    list.sort((a, b) => {
      let t1 = a.slotWaktu.mulai.getTime();
      let t2 = b.slotWaktu.mulai.getTime();
      return t1 - t2;
    });

    let hasil = [];
    let hari = new Date(tanggal.getTime());
    let pointer = new Date(hari.getFullYear(), hari.getMonth(), hari.getDate(), 0, 0, 0);

    for (let i = 0; i < list.length; i++) {
      let r = list[i];
      let selisih = (r.slotWaktu.mulai.getTime() - pointer.getTime()) / 60000;

      if (selisih >= durasiMenit) {
        hasil.push(
          new SlotWaktu(
            new Date(pointer.getTime()),
            new Date(pointer.getTime() + durasiMenit * 60000)
          )
        );
      }

      pointer = new Date(r.slotWaktu.selesai.getTime());
    }

    let akhir = new Date(hari.getFullYear(), hari.getMonth(), hari.getDate(), 23, 59, 0);
    let selisihAkhir = (akhir.getTime() - pointer.getTime()) / 60000;

    if (selisihAkhir >= durasiMenit) {
      hasil.push(
        new SlotWaktu(
          new Date(pointer.getTime()),
          new Date(pointer.getTime() + durasiMenit * 60000)
        )
      );
    }

    return hasil.slice().map(h => h);
  }

  // initial state: daftar rapat dan daftar ruang sudah diketahui
  // final state: menjadwalkan rapat-rapat ke ruang yang paling optimal dengan meminimalkan konflik waktu
  jadwalOptimal(daftarRapat) {
    let hasil = [];

    for (let i = 0; i < daftarRapat.length; i++) {
      let rapat = daftarRapat[i];
      let ditempatkan = false;

      for (let j = 0; j < this.daftarRuang.length; j++) {
        let ruang = this.daftarRuang[j];
        rapat.idRuang = ruang.id;

        if (this.adaKonflik(rapat) === false) {
          this.daftarRapat.push(
            new Rapat(
              rapat.id,
              rapat.judul,
              rapat.slotWaktu,
              ruang.id,
              rapat.peserta
            )
          );

          hasil.push({
            rapat: rapat,
            ruang: ruang.nama
          });

          ditempatkan = true;
          break;
        }
      }

      if (!ditempatkan) {
        hasil.push({ rapat: rapat, ruang: null });
      }
    }

    return hasil.map(x => x);
  }

  // initial state: daftarRapat berisi beberapa rapat dengan konflik waktu tertentu
  // final state: mengembalikan daftar alternatif waktu yang memungkinkan rapat diatur ulang tanpa konflik
  cariSlotAlternatif(rapat, rapatBerkonflik) {
    let tanggal = new Date(rapat.slotWaktu.mulai.getTime());
    let durasi = rapat.slotWaktu.durasi();

    let alternatif = this.cariSlotTersedia(rapat.idRuang, tanggal, durasi);
    let hasil = [];

    for (let i = 0; i < alternatif.length; i++) {
      let slot = alternatif[i];
      let aman = true;

      for (let j = 0; j < rapatBerkonflik.length; j++) {
        let r = rapatBerkonflik[j];

        let s1 = new SlotWaktu(slot.mulai, slot.selesai);
        let s2 = new SlotWaktu(r.slotWaktu.mulai, r.slotWaktu.selesai);

        if (s1.tumpangTindih(s2)) {
          aman = false;
        }
      }

      if (aman) {
        hasil.push(slot);
      }
    }

    return hasil.slice();
  }

  // initial state: daftarRapat berisi rapat-rapat dengan waktu mulai dan selesai
  // final state: mengembalikan daftar rapat yang berlangsung dalam rentang waktu tertentu
  dapatkanRapatDalamRentang(tanggalMulai, tanggalSelesai) {
    let hasil = [];

    for (let i = 0; i < this.daftarRapat.length; i++) {
      let r = this.daftarRapat[i];

      let s = new Date(r.slotWaktu.mulai.getTime());
      let e = new Date(r.slotWaktu.selesai.getTime());

      let overlaps = false;

      if (s.getTime() < tanggalSelesai.getTime()) {
        if (e.getTime() > tanggalMulai.getTime()) {
          overlaps = true;
        }
      }

      if (overlaps) {
        hasil.push(r);
      }
    }

    return hasil.map(r => r);
  }
}
