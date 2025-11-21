export class Pengguna {
  constructor(id, nama, minat) {
    this.id = id;            // ID unik pengguna
    this.nama = nama;        // Nama pengguna
    this.minat = minat;      // Array berisi minat pengguna
  }
}

export class Koneksi {
  constructor(idPengguna1, idPengguna2, waktu) {
    this.idPengguna1 = idPengguna1; // ID pengguna pertama
    this.idPengguna2 = idPengguna2; // ID pengguna kedua
    this.waktu = waktu;             // Timestamp koneksi dibuat
  }
}

export class JaringanSosial {
  constructor() {
    this.pengguna = [];     // Daftar semua pengguna
    this.koneksi = [];      // Daftar semua koneksi antar pengguna
  }

  _temanDari(idPengguna) {
    const teman = new Set();
    for (const k of this.koneksi) {
      if (k.idPengguna1 === idPengguna) teman.add(k.idPengguna2);
      if (k.idPengguna2 === idPengguna) teman.add(k.idPengguna1);
    }
    return teman;
  }

  _penggunaById(id) {
    return this.pengguna.find(p => p.id === id);
  }

  // initial state: pengguna berisi daftar pengguna dengan beberapa koneksi
  // final state: mengembalikan daftar saran teman untuk pengguna tertentu, terbatas sesuai limit
  sarankanTeman(idPengguna, batas) {
    const temanSekarang = this._temanDari(idPengguna);
    const semuaTeman = [];

    for (const p of this.pengguna) {
      if (p.id === idPengguna) continue;            // bukan diri sendiri
      if (temanSekarang.has(p.id)) continue;        // bukan yang sudah berteman

      const jumlahTemanSama = this.hitungTemanSama(idPengguna, p.id);
      if (jumlahTemanSama > 0) {
        semuaTeman.push({ pengguna: p, skor: jumlahTemanSama });
      }
    }
    semuaTeman.sort((a, b) => b.skor - a.skor);

    return semuaTeman.slice(0, batas).map(obj => obj.pengguna);
  }

  // initial state: pengguna berisi daftar teman masing-masing pengguna
  // final state: mengembalikan jumlah teman yang sama antara dua pengguna
  hitungTemanSama(idPengguna1, idPengguna2) {
    const t1 = this._temanDari(idPengguna1);
    const t2 = this._temanDari(idPengguna2);

    let count = 0;
    for (const t of t1) {
      if (t2.has(t)) count++;
    }
    return count;
  }

  // initial state: pengguna berisi graph koneksi
  // final state: mengembalikan derajat koneksi antara dua pengguna
  derajatKoneksi(idPengguna1, idPengguna2) {
    if (idPengguna1 === idPengguna2) return 0;

    const queue = [{ id: idPengguna1, depth: 0 }];
    const visited = new Set([idPengguna1]);

    while (queue.length > 0) {
      const { id, depth } = queue.shift();

      for (const teman of this._temanDari(id)) {
        if (teman === idPengguna2) return depth + 1;

        if (!visited.has(teman)) {
          visited.add(teman);
          queue.push({ id: teman, depth: depth + 1 });
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

    for (const p of this.pengguna) {
      if (p.id === idPengguna) continue;

      const minatSama = p.minat.filter(m => target.minat.includes(m));
      if (minatSama.length > 0) {
        hasil.push({ pengguna: p, skor: minatSama.length });
      }
    }
    hasil.sort((a, b) => b.skor - a.skor);

    return hasil.slice(0, batas).map(h => h.pengguna);
  }

  // initial state: pengguna berisi daftar semua pengguna dan koneksi mereka
  // final state: mengembalikan daftar pengguna yang paling banyak memiliki koneksi, terbatas sesuai limit
  penggunaPalingTerhubung(batas) {
    const jumlahKoneksi = new Map();
    for (const p of this.pengguna) {
      jumlahKoneksi.set(p.id, 0);
    }

    for (const k of this.koneksi) {
      jumlahKoneksi.set(k.idPengguna1, jumlahKoneksi.get(k.idPengguna1) + 1);
      jumlahKoneksi.set(k.idPengguna2, jumlahKoneksi.get(k.idPengguna2) + 1);
    }

    const ranking = [...jumlahKoneksi.entries()].map(([id, total]) => {
      return { pengguna: this._penggunaById(id), total };
    });

    ranking.sort((a, b) => b.total - a.total);

    return ranking.slice(0, batas).map(r => r.pengguna);
  }
}
