// Data Storage
let dataMasuk = JSON.parse(localStorage.getItem('data_masuk')) || [];
let dataKeluar = JSON.parse(localStorage.getItem('data_keluar')) || [];

// DOM Elements
const suratTableBody = document.getElementById('surat-table-body');
const searchInput = document.getElementById('search-input');
const suratTypeSelect = document.getElementById('surat-type');
const totalMasukElement = document.getElementById('total-masuk');
const totalKeluarElement = document.getElementById('total-keluar');
const lastMasukElement = document.getElementById('last-masuk');
const lastKeluarElement = document.getElementById('last-keluar');

// Initialize Dashboard
function initDashboard() {
    updateStats();
    renderTable(dataMasuk);
    setupEventListeners();
}

// Update Statistics
function updateStats() {
    totalMasukElement.textContent = dataMasuk.length;
    totalKeluarElement.textContent = dataKeluar.length;
    
    if (dataMasuk.length > 0) {
        const lastMasuk = dataMasuk[dataMasuk.length - 1];
        lastMasukElement.textContent = `${lastMasuk.nomor} - ${lastMasuk.perihal.substring(0, 20)}...`;
    }
    
    if (dataKeluar.length > 0) {
        const lastKeluar = dataKeluar[dataKeluar.length - 1];
        lastKeluarElement.textContent = `${lastKeluar.nomor} - ${lastKeluar.perihal.substring(0, 20)}...`;
    }
}

// Render Surat Table
function renderTable(data) {
    suratTableBody.innerHTML = '';
    
    if (data.length === 0) {
        const emptyRow = document.createElement('tr');
        emptyRow.innerHTML = `
            <td colspan="5" class="px-6 py-4 text-center text-gray-500">
                Tidak ada data surat
            </td>
        `;
        suratTableBody.appendChild(emptyRow);
        return;
    }
    
    data.forEach(surat => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${surat.nomor}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${formatDate(surat.tanggal)}</td>
            <td class="px-6 py-4 text-sm text-gray-500">${surat.perihal}</td>
            <td class="px-6 py-4 text-sm text-gray-500">${surat.deskripsi.substring(0, 50)}${surat.deskripsi.length > 50 ? '...' : ''}</td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button class="text-blue-600 hover:text-blue-900 mr-3 edit-btn" data-id="${surat.id}">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="text-red-600 hover:text-red-900 delete-btn" data-id="${surat.id}">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        suratTableBody.appendChild(row);
    });
}

// Format Date to DD/MM/YYYY
function formatDate(dateString) {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}

// Setup Event Listeners
function setupEventListeners() {
    // Search functionality
    searchInput.addEventListener('input', () => {
        const searchTerm = searchInput.value.toLowerCase();
        const currentData = suratTypeSelect.value === 'masuk' ? dataMasuk : dataKeluar;
        
        const filteredData = currentData.filter(surat => 
            surat.nomor.toLowerCase().includes(searchTerm) ||
            surat.perihal.toLowerCase().includes(searchTerm) ||
            surat.deskripsi.toLowerCase().includes(searchTerm)
        );
        
        renderTable(filteredData);
    });
    
    // Surat type change
    suratTypeSelect.addEventListener('change', () => {
        const currentData = suratTypeSelect.value === 'masuk' ? dataMasuk : dataKeluar;
        renderTable(currentData);
        searchInput.value = '';
    });
    
    // Delete button click
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('delete-btn') || e.target.closest('.delete-btn')) {
            const button = e.target.classList.contains('delete-btn') ? e.target : e.target.closest('.delete-btn');
            const id = button.dataset.id;
            const isMasuk = suratTypeSelect.value === 'masuk';
            
            if (confirm('Apakah Anda yakin ingin menghapus surat ini?')) {
                if (isMasuk) {
                    dataMasuk = dataMasuk.filter(surat => surat.id !== id);
                    localStorage.setItem('data_masuk', JSON.stringify(dataMasuk));
                } else {
                    dataKeluar = dataKeluar.filter(surat => surat.id !== id);
                    localStorage.setItem('data_keluar', JSON.stringify(dataKeluar));
                }
                
                showToast('Surat berhasil dihapus', 'success');
                renderTable(isMasuk ? dataMasuk : dataKeluar);
                updateStats();
            }
        }
    });
}

// Show Toast Notification
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <div class="flex items-center">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'} mr-2"></i>
            <span>${message}</span>
        </div>
    `;
    
    document.body.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 10);
    
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Export to CSV function
function exportToCSV(data, filename) {
    const headers = ['Nomor Urut', 'Tanggal Surat', 'Perihal', 'Deskripsi'];
    const csvRows = [];
    
    // Add headers
    csvRows.push(headers.join(','));
    
    // Add data rows
    for (const surat of data) {
        const values = [
            `"${surat.nomor}"`,
            `"${formatDate(surat.tanggal)}"`,
            `"${surat.perihal}"`,
            `"${surat.deskripsi}"`
        ];
        csvRows.push(values.join(','));
    }
    
    // Create CSV content
    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    // Create download link
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}_${new Date().toISOString().slice(0,10)}.csv`);
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Initialize when dashboard is loaded
if (window.location.pathname.includes('dashboard.html')) {
    document.addEventListener('DOMContentLoaded', initDashboard);
}

// Initialize when export page is loaded
if (window.location.pathname.includes('export.html')) {
    document.addEventListener('DOMContentLoaded', () => {
        document.getElementById('export-masuk-btn').addEventListener('click', () => {
            exportToCSV(dataMasuk, 'surat_masuk');
            showToast('Data surat masuk berhasil diexport', 'success');
        });
        
        document.getElementById('export-keluar-btn').addEventListener('click', () => {
            exportToCSV(dataKeluar, 'surat_keluar');
            showToast('Data surat keluar berhasil diexport', 'success');
        });
    });
}

// Form handling for input pages
if (window.location.pathname.includes('input_masuk.html') || window.location.pathname.includes('input_keluar.html')) {
    document.addEventListener('DOMContentLoaded', () => {
        const isMasuk = window.location.pathname.includes('input_masuk.html');
        const form = document.getElementById('surat-form');
        const dateInput = document.getElementById('tanggal');
        
        // Set default date to today
        const today = new Date().toISOString().split('T')[0];
        dateInput.value = today;
        
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const formData = new FormData(form);
            const surat = {
                id: Date.now().toString(),
                nomor: formData.get('nomor'),
                tanggal: formData.get('tanggal'),
                perihal: formData.get('perihal'),
                deskripsi: formData.get('deskripsi')
            };
            
            // Validate
            if (!surat.nomor || !surat.tanggal || !surat.perihal) {
                showToast('Harap isi semua field yang wajib diisi', 'error');
                return;
            }
            
            // Save to storage
            if (isMasuk) {
                dataMasuk.push(surat);
                localStorage.setItem('data_masuk', JSON.stringify(dataMasuk));
            } else {
                dataKeluar.push(surat);
                localStorage.setItem('data_keluar', JSON.stringify(dataKeluar));
            }
            
            showToast(`Surat ${isMasuk ? 'masuk' : 'keluar'} berhasil disimpan`, 'success');
            form.reset();
            dateInput.value = today;
        });
    });
}