// ===== KONFIGURASI LOGIN =====
// Ganti dengan username dan password yang Anda inginkan
const ADMIN_CREDENTIALS = {
    username: 'admin',
    password: 'pengajian2026'
};

// Data penyimpanan
let dataDonasi = [];
let dataPengeluaran = [];
let isLoggedIn = false;

// ===== FUNGSI LOGIN =====
document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
        isLoggedIn = true;
        localStorage.setItem('adminLoggedIn', 'true');
        
        // Tampilkan main content, sembunyikan login
        document.getElementById('loginModal').style.display = 'none';
        document.getElementById('mainContent').style.display = 'block';
        
        // Load data
        loadData();
    } else {
        document.getElementById('loginError').style.display = 'block';
        document.getElementById('password').value = '';
    }
});

// ===== FUNGSI LOGOUT =====
function logout() {
    if (confirm('Yakin ingin logout?')) {
        isLoggedIn = false;
        localStorage.removeItem('adminLoggedIn');
        document.getElementById('loginModal').style.display = 'flex';
        document.getElementById('mainContent').style.display = 'none';
        document.getElementById('loginForm').reset();
        document.getElementById('loginError').style.display = 'none';
    }
}

// Cek jika sudah login sebelumnya
window.addEventListener('load', function() {
    if (localStorage.getItem('adminLoggedIn') === 'true') {
        isLoggedIn = true;
        document.getElementById('loginModal').style.display = 'none';
        document.getElementById('mainContent').style.display = 'block';
        loadData();
    }
});

// ===== FUNGSI UTILITY =====
function loadData() {
    const donasi = localStorage.getItem('dataDonasi');
    const pengeluaran = localStorage.getItem('dataPengeluaran');
    
    if (donasi) dataDonasi = JSON.parse(donasi);
    if (pengeluaran) dataPengeluaran = JSON.parse(pengeluaran);
    
    updateDisplay();
}

function saveData() {
    localStorage.setItem('dataDonasi', JSON.stringify(dataDonasi));
    localStorage.setItem('dataPengeluaran', JSON.stringify(dataPengeluaran));
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
            <td>
                <button class="btn btn-edit" onclick="editDonasi('${item.id}')">Edit</button>
                <button class="btn btn-danger" onclick="hapusDonasi('${item.id}')">Hapus</button>
            </td>
        `;
    });

    if (filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">Tidak ada data</td></tr>';
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
            <td>
                <button class="btn btn-edit" onclick="editPengeluaran('${item.id}')">Edit</button>
                <button class="btn btn-danger" onclick="hapusPengeluaran('${item.id}')">Hapus</button>
            </td>
        `;
    });

    if (filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;">Tidak ada data</td></tr>';
    }
}

// ===== FORM HANDLING =====
document.getElementById('formDonasi').addEventListener('submit', function(e) {
    e.preventDefault();

    const nama = document.getElementById('namaDonatur').value;
    const jumlah = parseInt(document.getElementById('jumlahDonasi').value);
    const tanggal = document.getElementById('tanggalDonasi').value || new Date().toISOString().split('T')[0];
    const keterangan = document.getElementById('keteranganDonasi').value;

    dataDonasi.push({
        id: Date.now().toString(),
        nama,
        jumlah,
        tanggal,
        keterangan
    });

    saveData();
    updateDisplay();
    this.reset();
    alert('✅ Donasi berhasil ditambahkan!');
});

document.getElementById('formPengeluaran').addEventListener('submit', function(e) {
    e.preventDefault();

    const item = document.getElementById('itemBelanja').value;
    const jumlah = parseInt(document.getElementById('jumlahBelanja').value);
    const hargaSatuan = parseInt(document.getElementById('hargaSatuan').value);
    const tanggal = document.getElementById('tanggalBelanja').value || new Date().toISOString().split('T')[0];

    dataPengeluaran.push({
        id: Date.now().toString(),
        item,
        jumlah,
        hargaSatuan,
        tanggal
    });

    saveData();
    updateDisplay();
    this.reset();
    alert('✅ Pengeluaran berhasil ditambahkan!');
});

// ===== DELETE FUNCTIONS =====
function hapusDonasi(id) {
    if (confirm('Yakin hapus donasi ini?')) {
        dataDonasi = dataDonasi.filter(item => item.id !== id);
        saveData();
        updateDisplay();
        alert('✅ Data donasi dihapus!');
    }
}

function hapusPengeluaran(id) {
    if (confirm('Yakin hapus pengeluaran ini?')) {
        dataPengeluaran = dataPengeluaran.filter(item => item.id !== id);
        saveData();
        updateDisplay();
        alert('✅ Data pengeluaran dihapus!');
    }
}

// ===== EDIT FUNCTIONS =====
function editDonasi(id) {
    const item = dataDonasi.find(d => d.id === id);
    if (item) {
        document.getElementById('editId').value = id;
        document.getElementById('editType').value = 'donasi';
        document.getElementById('editLabel').textContent = 'Nama Donatur';
        document.getElementById('editValue').value = item.nama;
        document.getElementById('editJumlah').value = item.jumlah;
        openModal();
    }
}

function editPengeluaran(id) {
    const item = dataPengeluaran.find(d => d.id === id);
    if (item) {
        document.getElementById('editId').value = id;
        document.getElementById('editType').value = 'pengeluaran';
        document.getElementById('editLabel').textContent = 'Item Belanja';
        document.getElementById('editValue').value = item.item;
        document.getElementById('editJumlah').value = item.hargaSatuan;
        openModal();
    }
}

document.getElementById('formEdit').addEventListener('submit', function(e) {
    e.preventDefault();

    const id = document.getElementById('editId').value;
    const type = document.getElementById('editType').value;
    const value = document.getElementById('editValue').value;
    const jumlah = parseInt(document.getElementById('editJumlah').value);

    if (type === 'donasi') {
        const item = dataDonasi.find(d => d.id === id);
        if (item) {
            item.nama = value;
            item.jumlah = jumlah;
        }
    } else {
        const item = dataPengeluaran.find(d => d.id === id);
        if (item) {
            item.item = value;
            item.hargaSatuan = jumlah;
        }
    }

    saveData();
    updateDisplay();
    closeModal();
    alert('✅ Data berhasil diupdate!');
});

// ===== MODAL FUNCTIONS =====
function openModal() {
    document.body.style.overflow = 'hidden';
    document.getElementById('modalEdit').style.display = 'block';
}

function closeModal() {
    document.body.style.overflow = 'auto';
    document.getElementById('modalEdit').style.display = 'none';
}

document.querySelector('.close').addEventListener('click', closeModal);

window.addEventListener('click', function(event) {
    const modal = document.getElementById('modalEdit');
    if (event.target === modal) {
        closeModal();
    }
});

// ===== TAB NAVIGATION =====
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        const tabName = this.getAttribute('data-tab');
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
        this.classList.add('active');
        document.getElementById(tabName).classList.add('active');
    });
});

// ===== SEARCH =====
document.getElementById('searchDonatur').addEventListener('keyup', function() {
    displayDaftarDonasi(this.value);
});

document.getElementById('searchPengeluaran').addEventListener('keyup', function() {
    displayDaftarPengeluaran(this.value);
});

// ===== CHARTS =====
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

// ===== PRINT LAPORAN =====
function cetakLaporan() {
    const totalDonasi = hitungTotalDonasi();
    const totalPengeluaran = hitungTotalPengeluaran();
    const sisaDana = totalDonasi - totalPengeluaran;

    const isi = `
    LAPORAN KEUANGAN PANITIA PENGAJIAN TAHUN 2026
    ==============================================
    
    Tanggal Laporan: ${new Date().toLocaleDateString('id-ID')}
    Mode: ADMIN REPORT
    
    RINGKASAN KEUANGAN:
    - Total Pemasukan: ${formatRupiah(totalDonasi)}
    - Total Pengeluaran: ${formatRupiah(totalPengeluaran)}
    - Saldo Akhir: ${formatRupiah(sisaDana)}
    
    DAFTAR DONATUR:
    ${dataDonasi.map((d, i) => `${i + 1}. ${d.nama} - ${formatRupiah(d.jumlah)} (${d.tanggal})`).join('\n')}
    
    DAFTAR PENGELUARAN:
    ${dataPengeluaran.map((p, i) => `${i + 1}. ${p.item} (${p.jumlah}x ${formatRupiah(p.hargaSatuan)}) = ${formatRupiah(p.jumlah * p.hargaSatuan)}`).join('\n')}
    `;

    const printWindow = window.open('', '', 'height=400,width=600');
    printWindow.document.write('<pre>' + isi + '</pre>');
    printWindow.document.close();
    printWindow.print();
}

// Set default dates
const today = new Date().toISOString().split('T')[0];
document.getElementById('tanggalDonasi').value = today;
document.getElementById('tanggalBelanja').value = today;

// Load sample data if empty
if (dataDonasi.length === 0) {
    dataDonasi = [
        { id: '1', nama: 'Bapak Hasan', jumlah: 500000, tanggal: '2026-01-05', keterangan: 'Donasi rutin' },
        { id: '2', nama: 'Ibu Aisyah', jumlah: 300000, tanggal: '2026-01-10', keterangan: 'Donasi ikhlas' },
    ];
    
    dataPengeluaran = [
        { id: '1', item: 'Nasi Kuning', jumlah: 50, hargaSatuan: 15000, tanggal: '2026-01-20' },
        { id: '2', item: 'Lauk Pauk', jumlah: 50, hargaSatuan: 10000, tanggal: '2026-01-20' },
    ];
    
    saveData();
}