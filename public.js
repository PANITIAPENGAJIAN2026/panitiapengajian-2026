// Data penyimpanan
let dataDonasi = [];
let dataPengeluaran = [];

// Load data dari localStorage (sama seperti admin)
function loadData() {
    const donasi = localStorage.getItem('dataDonasi');
    const pengeluaran = localStorage.getItem('dataPengeluaran');
    
    if (donasi) dataDonasi = JSON.parse(donasi);
    if (pengeluaran) dataPengeluaran = JSON.parse(pengeluaran);
    
    updateDisplay();
}

function formatRupiah(nominal) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(nominal);
}

function hitungTotalDonasi() {
    return dataDonasi.reduce((sum, item) => sum + item.jumlah, 0);
}

function hitungTotalPengeluaran() {
    return dataPengeluaran.reduce((sum, item) => sum + (item.jumlah * item.hargaSatuan), 0);
}

function updateDisplay() {
    const totalDonasi = hitungTotalDonasi();
    const totalPengeluaran = hitungTotalPengeluaran();
    const sisaDana = totalDonasi - totalPengeluaran;
    const persentase = totalDonasi > 0 ? ((totalPengeluaran / totalDonasi) * 100).toFixed(1) : 0;

    document.getElementById('totalDonasi').textContent = formatRupiah(totalDonasi);
    document.getElementById('totalPengeluaran').textContent = formatRupiah(totalPengeluaran);
    document.getElementById('sisaDana').textContent = formatRupiah(sisaDana);
    document.getElementById('persentasePengeluaran').textContent = persentase + '%';
    document.getElementById('jumlahDonatur').textContent = dataDonasi.length;

    document.getElementById('summaryPemasukan').textContent = formatRupiah(totalDonasi);
    document.getElementById('summaryPengeluaran').textContent = formatRupiah(totalPengeluaran);
    document.getElementById('summarySaldo').textContent = formatRupiah(sisaDana);

    displayDaftarDonasi();
    displayDaftarPengeluaran();
    updateCharts();
}

function displayDaftarDonasi(filter = '') {
    const tbody = document.getElementById('daftarDonasi');
    tbody.innerHTML = '';

    let filtered = dataDonasi;
    if (filter) {
        filtered = dataDonasi.filter(item =>
            item.nama.toLowerCase().includes(filter.toLowerCase())
        );
    }

    filtered.forEach((item, index) => {
        const row = tbody.insertRow();
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${item.nama}</td>
            <td>${formatRupiah(item.jumlah)}</td>
            <td>${item.tanggal || '-'}</td>
            <td>${item.keterangan || '-'}</td>
        `;
    });

    if (filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">Tidak ada data</td></tr>';
    }
}

function displayDaftarPengeluaran(filter = '') {
    const tbody = document.getElementById('daftarPengeluaran');
    tbody.innerHTML = '';

    let filtered = dataPengeluaran;
    if (filter) {
        filtered = dataPengeluaran.filter(item =>
            item.item.toLowerCase().includes(filter.toLowerCase())
        );
    }

    filtered.forEach((item, index) => {
        const total = item.jumlah * item.hargaSatuan;
        const row = tbody.insertRow();
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${item.item}</td>
            <td>${item.jumlah}</td>
            <td>${formatRupiah(item.hargaSatuan)}</td>
            <td>${formatRupiah(total)}</td>
            <td>${item.tanggal || '-'}</td>
        `;
    });

    if (filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">Tidak ada data</td></tr>';
    }
}

// Tab Navigation
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        const tabName = this.getAttribute('data-tab');
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
        this.classList.add('active');
        document.getElementById(tabName).classList.add('active');
    });
});

// Search
document.getElementById('searchDonatur').addEventListener('keyup', function() {
    displayDaftarDonasi(this.value);
});

document.getElementById('searchPengeluaran').addEventListener('keyup', function() {
    displayDaftarPengeluaran(this.value);
});

// Charts
let chartPerbandingan, chartPengeluaran;

function updateCharts() {
    const totalDonasi = hitungTotalDonasi();
    const totalPengeluaran = hitungTotalPengeluaran();
    const sisaDana = totalDonasi - totalPengeluaran;

    const ctxPerbandingan = document.getElementById('chartPerbandingan').getContext('2d');
    if (chartPerbandingan) chartPerbandingan.destroy();
    
    chartPerbandingan = new Chart(ctxPerbandingan, {
        type: 'doughnut',
        data: {
            labels: ['Pengeluaran', 'Sisa Dana'],
            datasets: [{
                data: [totalPengeluaran, sisaDana],
                backgroundColor: ['#e74c3c', '#27ae60'],
                borderColor: ['#c0392b', '#229954'],
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom',
                }
            }
        }
    });

    const ctx = document.getElementById('chartPengeluaran').getContext('2d');
    if (chartPengeluaran) chartPengeluaran.destroy();

    const items = dataPengeluaran.reduce((acc, item) => {
        const index = acc.findIndex(a => a.item === item.item);
        if (index === -1) {
            acc.push({ item: item.item, total: item.jumlah * item.hargaSatuan });
        } else {
            acc[index].total += item.jumlah * item.hargaSatuan;
        }
        return acc;
    }, []);

    chartPengeluaran = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: items.map(i => i.item),
            datasets: [{
                label: 'Total Pengeluaran (Rp)',
                data: items.map(i => i.total),
                backgroundColor: '#667eea',
                borderColor: '#5568d3',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                }
            }
        }
    });
}

// Print Laporan
function cetakLaporanPublik() {
    const totalDonasi = hitungTotalDonasi();
    const totalPengeluaran = hitungTotalPengeluaran();
    const sisaDana = totalDonasi - totalPengeluaran;

    const isi = `
    LAPORAN KEUANGAN PANITIA PENGAJIAN TAHUN 2026
    ==============================================
    
    Tanggal Laporan: ${new Date().toLocaleDateString('id-ID')}
    Status: LAPORAN PUBLIK
    
    RINGKASAN KEUANGAN:
    - Total Pemasukan: ${formatRupiah(totalDonasi)}
    - Total Pengeluaran: ${formatRupiah(totalPengeluaran)}
    - Saldo Akhir: ${formatRupiah(sisaDana)}
    
    DAFTAR DONATUR:
    ${dataDonasi.map((d, i) => `${i + 1}. ${d.nama} - ${formatRupiah(d.jumlah)}`).join('\n')}
    
    DAFTAR PENGELUARAN:
    ${dataPengeluaran.map((p, i) => `${i + 1}. ${p.item} (${p.jumlah}x) = ${formatRupiah(p.jumlah * p.hargaSatuan)}`).join('\n')}
    
    ==========================================
    Terima kasih atas dukungan dan kepercayaan Anda
    Semoga berkah untuk seluruh kegiatan pengajian
    ==========================================
    `;

    const printWindow = window.open('', '', 'height=400,width=600');
    printWindow.document.write('<pre>' + isi + '</pre>');
    printWindow.document.close();
    printWindow.print();
}

// Load data on page load
loadData();