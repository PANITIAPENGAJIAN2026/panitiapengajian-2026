// 1. Data Dummy / Basis Data Sementara
const dataDonasi = [
    { id: 1, namaDonatur: "Hamba Allah", jumlah: 500000, tanggal: "2026-03-01", keterangan: "Zakat / Infak" },
    { id: 2, namaDonatur: "Bapak Ahmad", jumlah: 1000000, tanggal: "2026-03-05", keterangan: "Sponsorship Konsumsi" }
];

const dataPengeluaran = [
    { id: 1, keperluan: "Sewa Sound System", jumlah: 350000, tanggal: "2026-03-10", keterangan: "DP Awal Sewa" },
    { id: 2, keperluan: "Pembelian Air Mineral", jumlah: 120000, tanggal: "2026-03-12", keterangan: "4 Dus untuk jamaah" }
];

// 2. Fungsi untuk mengubah angka biasa menjadi format Rupiah (Rp)
function formatRupiah(angka) {
    return "Rp " + angka.toLocaleString('id-ID');
}

// 3. Fungsi utama untuk menampilkan data ke halaman web
function tampilkanLaporan() {
    let htmlDonasi = "";
    let totalDonasi = 0;

    let htmlPengeluaran = "";
    let totalPengeluaran = 0;

    // Loop data Donasi ke Tabel HTML
    dataDonasi.forEach((item, index) => {
        totalDonasi += item.jumlah;
        htmlDonasi += `
            <tr>
                <td>${index + 1}</td>
                <td>${item.tanggal}</td>
                <td>${item.namaDonatur}</td>
                <td>${formatRupiah(item.jumlah)}</td>
                <td>${item.keterangan}</td>
            </tr>
        `;
    });

    // Loop data Pengeluaran ke Tabel HTML
    dataPengeluaran.forEach((item, index) => {
        totalPengeluaran += item.jumlah;
        htmlPengeluaran += `
            <tr>
                <td>${index + 1}</td>
                <td>${item.tanggal}</td>
                <td>${item.keperluan}</td>
                <td>${formatRupiah(item.jumlah)}</td>
                <td>${item.keterangan}</td>
            </tr>
        `;
    });

    // Hitung Sisa Saldo Keseluruhan
    const sisaSaldo = totalDonasi - totalPengeluaran;

    // Masukkan hasil pembuatan HTML ke elemen ID masing-masing
    document.getElementById("tabel-donasi").innerHTML = htmlDonasi;
    document.getElementById("tabel-pengeluaran").innerHTML = htmlPengeluaran;

    // Update Text Nilai Saldo Box
    document.getElementById("total-donasi").innerText = formatRupiah(totalDonasi);
    document.getElementById("total-pengeluaran").innerText = formatRupiah(totalPengeluaran);
    document.getElementById("sisa-saldo").innerText = formatRupiah(sisaSaldo);
}

// Jalankan fungsi otomatis saat halaman selesai dimuat
window.onload = tampilkanLaporan;
