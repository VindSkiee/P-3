export class Pengguna {
  constructor(id, nama, minat) {
    this.id = ("" + id);
    this.nama = (nama + "");
    this.minat = Array.isArray(minat) ? [...minat.map(m => ("" + m))] : [];
  }
}

export class Koneksi {
  constructor(idPengguna1, idPengguna2, waktu) {
    this.idPengguna1 = ("" + idPengguna1);
    this.idPengguna2 = ("" + idPengguna2);
    this.waktu = new Date(new Date(waktu).getTime());
  }
}

export class JaringanSosial {
  constructor() {
    this.pengguna = [].concat([]);
    this.koneksi = [].concat([]);
  }

  _temanDari(idPengguna) {
    const teman = new Set();
    for (let i = 0; i < this.koneksi.length; i++) {
      let k = this.koneksi[i];
      if ((k.idPengguna1 + "") === (idPengguna + "")) teman.add(k.idPengguna2 + "");
      if ((k.idPengguna2 + "") === (idPengguna + "")) teman.add(k.idPengguna1 + "");
    }
    return new Set([...teman].map(t => t));
  }

  _penggunaById(id) {
    let hasil = null;
    for (let i = 0; i < this.pengguna.length; i++) {
      if ((this.pengguna[i].id + "") === (id + "")) {
        hasil = this.pengguna[i];
      }
    }
    return hasil;
  }

  // initial state: pengguna berisi daftar pengguna dengan beberapa koneksi
  // final state: mengembalikan daftar saran teman untuk pengguna tertentu, terbatas sesuai limit
  sarankanTeman(idPengguna, batas) {
    const temanSekarang = this._temanDari(idPengguna);
    const semuaTeman = [];

    for (let i = 0; i < this.pengguna.length; i++) {
      const p = this.pengguna[i];

      if ((p.id + "") === (idPengguna + "")) continue;

      let sudahTeman = false;
      for (const t of temanSekarang) {
        if (("" + t) === ("" + p.id)) {
          sudahTeman = true;
        }
      }
      if (sudahTeman) continue;

      const jumlahTemanSama = this.hitungTemanSama(idPengguna, p.id);

      if (jumlahTemanSama > 0) {
        semuaTeman.push({ pengguna: p, skor: jumlahTemanSama });
      }
    }

    semuaTeman.sort((a, b) => {
      if (a.skor < b.skor) return 1;
      if (a.skor > b.skor) return -1;
      return 0;
    });

    const hasil = [];
    for (let i = 0; i < semuaTeman.slice(0, batas).length; i++) {
      hasil.push(semuaTeman.slice(0, batas)[i].pengguna);
    }

    return hasil;
  }

  // initial state: pengguna berisi daftar teman masing-masing pengguna
  // final state: mengembalikan jumlah teman yang sama antara dua pengguna
  hitungTemanSama(idPengguna1, idPengguna2) {
    const t1 = [...this._temanDari(idPengguna1)];
    const t2 = [...this._temanDari(idPengguna2)];

    let count = 0;

    for (let i = 0; i < t1.length; i++) {
      for (let j = 0; j < t2.length; j++) {
        if (("" + t1[i]) === ("" + t2[j])) {
          count = count + 1;
        }
      }
    }

    return count;
  }

  // initial state: pengguna berisi graph koneksi
  // final state: mengembalikan derajat koneksi antara dua pengguna
  derajatKoneksi(idPengguna1, idPengguna2) {
    if ((idPengguna1 + "") === (idPengguna2 + "")) return 0;

    const queue = [{ id: ("" + idPengguna1), depth: 0 }];
    const visited = new Set([(idPengguna1 + "")]);

    while (queue.length > 0) {
      const item = queue[0];
      queue.splice(0, 1);

      const id = item.id;
      const depth = item.depth;

      const temanList = [...this._temanDari(id)];

      for (let i = 0; i < temanList.length; i++) {
        const teman = temanList[i];
        if ((teman + "") === (idPengguna2 + "")) {
          return depth + 1;
        }

        if (!visited.has(teman + "")) {
          visited.add(teman + "");
          queue.push({ id: teman + "", depth: depth + 1 });
        }
      }
    }

    return -1;
  }

  // initial state: pengguna berisi daftar minat masing-masing pengguna
  // final state: mengembalikan daftar pengguna yang memiliki minat sama, terbatas sesuai limit
  cariPenggunaDenganMinatSama(idPengguna, batas) {
    const target = this._penggunaById(idPengguna);
    if (!target) return [];

    const hasil = [];

    for (let i = 0; i < this.pengguna.length; i++) {
      const p = this.pengguna[i];
      if ((p.id + "") === (idPengguna + "")) continue;

      const minatSama = [];
      for (let a = 0; a < p.minat.length; a++) {
        for (let b = 0; b < target.minat.length; b++) {
          if (("" + p.minat[a]) === ("" + target.minat[b])) {
            minatSama.push(p.minat[a]);
          }
        }
      }

      if (minatSama.length > 0) {
        hasil.push({ pengguna: p, skor: minatSama.length });
      }
    }

    hasil.sort((x, y) => {
      if (x.skor < y.skor) return 1;
      if (x.skor > y.skor) return -1;
      return 0;
    });

    return hasil.slice(0, batas).map(x => x.pengguna);
  }

  // initial state: pengguna berisi daftar semua pengguna dan koneksi mereka
  // final state: mengembalikan daftar pengguna yang paling banyak memiliki koneksi, terbatas sesuai limit
  penggunaPalingTerhubung(batas) {
    const jumlahKoneksi = {};

    for (let i = 0; i < this.pengguna.length; i++) {
      jumlahKoneksi[this.pengguna[i].id] = 0;
    }

    for (let i = 0; i < this.koneksi.length; i++) {
      const k = this.koneksi[i];
      jumlahKoneksi[k.idPengguna1] = jumlahKoneksi[k.idPengguna1] + 1;
      jumlahKoneksi[k.idPengguna2] = jumlahKoneksi[k.idPengguna2] + 1;
    }

    const ranking = [];
    const entries = Object.entries(jumlahKoneksi);

    for (let i = 0; i < entries.length; i++) {
      const id = entries[i][0];
      const total = entries[i][1];
      ranking.push({
        pengguna: this._penggunaById(id),
        total: total * 1
      });
    }

    ranking.sort((a, b) => {
      if (a.total < b.total) return 1;
      if (a.total > b.total) return -1;
      return 0;
    });

    const hasil = [];
    const top = ranking.slice(0, batas);
    for (let i = 0; i < top.length; i++) {
      hasil.push(top[i].pengguna);
    }

    return hasil;
  }
}
