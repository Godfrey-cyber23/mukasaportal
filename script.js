// ==========================================
// --- AUTH & UI LOGIC ---
// ==========================================

function showLogin() { document.getElementById('loginForm').classList.remove('hidden'); document.getElementById('forgotForm').classList.add('hidden'); document.getElementById('signupForm').classList.add('hidden'); }
function showForgotPassword() { document.getElementById('loginForm').classList.add('hidden'); document.getElementById('forgotForm').classList.remove('hidden'); }
function showSignup() { document.getElementById('loginForm').classList.add('hidden'); document.getElementById('signupForm').classList.remove('hidden'); }

function loginToPortal() { 
    document.getElementById('authSection').classList.add('hidden'); 
    document.getElementById('dashboardSection').classList.remove('hidden'); 
    document.getElementById('dashboardSection').classList.add('flex'); 
    navigateTo('dashboard'); 
}

function logout() { 
    document.getElementById('dashboardSection').classList.add('hidden'); 
    document.getElementById('authSection').classList.remove('hidden'); 
    showLogin(); 
}

// --- Mobile Sidebar Logic ---
function openMobileMenu() {
    document.getElementById('sidebar').classList.remove('hidden');
    document.getElementById('sidebar').classList.add('absolute');
    document.getElementById('sidebar-overlay').classList.remove('hidden');
}

function closeMobileMenu() {
    const sidebar = document.getElementById('sidebar');
    if (window.innerWidth < 768 && !sidebar.classList.contains('hidden')) {
        sidebar.classList.add('hidden');
        sidebar.classList.remove('absolute');
        document.getElementById('sidebar-overlay').classList.add('hidden');
    }
}

// --- Modals Logic ---
function openModal(modalId) { document.getElementById(modalId).classList.add('active'); }
function closeModal(modalId) { document.getElementById(modalId).classList.remove('active'); }
window.onclick = function(event) { if (event.target.classList.contains('modal-overlay')) { event.target.classList.remove('active'); } }

// ==========================================
// --- SPA ROUTING LOGIC ---
// ==========================================

async function navigateTo(pageId) {
    // Update Sidebar UI
    document.querySelectorAll('.sidebar-link').forEach(link => link.classList.remove('active'));
    const activeLink = document.querySelector(`.sidebar-link[data-page="${pageId}"]`);
    if(activeLink) activeLink.classList.add('active');

    // Update Title
    const titles = { dashboard: 'Dashboard', calendar: 'Calendar', treasury: 'Treasury Hub', secretary: 'Secretary Hub', vault: 'Document Vault' };
    document.getElementById('pageTitle').textContent = titles[pageId] || 'Dashboard';

    // Close mobile menu automatically when a link is clicked
    closeMobileMenu();

    // Fetch the HTML file
    try {
        const response = await fetch(`pages/${pageId}.html`);
        if (!response.ok) throw new Error('Page not found');
        const html = await response.text();
        document.getElementById('content-container').innerHTML = html;

        // Run specific scripts after page loads
        if (pageId === 'dashboard') initCharts();
        if (pageId === 'calendar') initCalendar(); // Initialize dynamic calendar
        
        // Scroll to top of content container on page change
        document.getElementById('content-container').parentElement.scrollTop = 0;

    } catch (error) {
        console.error("Error loading page:", error);
        document.getElementById('content-container').innerHTML = `<div class="text-center text-red-500 mt-10"><h2 class="text-2xl font-bold">Error Loading Page</h2><p>Please ensure you are running this app using a local server (e.g., VS Code Live Server).</p></div>`;
    }
}

// ==========================================
// --- MOCK DATA ---
// ==========================================

const feeData = [
    { name: "John Doe", amount: 50, status: "Paid", date: "Nov 10, 2023" },
    { name: "Jane Smith", amount: 50, status: "Unpaid", date: "-" },
    { name: "Peter Jones", amount: 50, status: "Paid", date: "Nov 12, 2023" },
];

const minuteData = {
    title: "Executive Board Meeting",
    date: "November 12, 2023",
    content: "1. Opening Prayer\n2. Reading of previous minutes\n3. Matters Arising: Budget for Deanery Sports Fest approved at $150.\n4. Treasury Report: $2,450 collected in Nov."
};

// ==========================================
// --- EXPORT FUNCTIONS (PDF, EXCEL, DOCX) ---
// ==========================================

function exportFeesToExcel() {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(feeData);
    XLSX.utils.book_append_sheet(wb, ws, "Nov Fees");
    XLSX.writeFile(wb, "Mukasa_Nov_Fees.xlsx");
}

function generateReceiptPDF(name, amount) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.setFillColor(30, 58, 138); doc.rect(0, 0, 220, 40, 'F');
    doc.setTextColor(255, 255, 255); doc.setFontSize(24); doc.text("MUKASA Executive Portal", 20, 25);
    doc.setFontSize(10); doc.setTextColor(217, 119, 6); doc.text('"The blood of the martyrs is the seed of our faith"', 20, 35);
    doc.setTextColor(0, 0, 0); doc.setFontSize(18); doc.text("OFFICIAL RECEIPT", 20, 60);
    doc.setFontSize(12);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 75);
    doc.text(`Received From: ${name}`, 20, 85);
    doc.text(`Amount: $${amount}.00`, 20, 95);
    doc.line(20, 150, 100, 150); doc.text("Treasurer Signature", 20, 160);
    doc.save(`Mukasa_Receipt_${name.replace(/\s+/g, '_')}.pdf`);
}

function saveReceiptFromModal() {
    const name = document.getElementById('fee-member').value;
    const amount = document.getElementById('fee-amount').value;
    generateReceiptPDF(name, parseInt(amount));
    closeModal('modal-fee');
}

function exportMinutesToDOCX() {
    const html = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><style>body { font-family: Arial; } h1 { color: #1e3a8a; }</style></head><body><h1>MUKASA Executive Portal</h1><p><em>"The blood of the martyrs is the seed of our faith"</em></p><hr><h2>Meeting: ${minuteData.title}</h2><p><strong>Date:</strong> ${minuteData.date}</p><br><p style="white-space: pre-line;">${minuteData.content}</p></body></html>`;
    const blob = new Blob(['\ufeff', html], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a'); link.href = url; link.download = `Mukasa_Minutes.doc`; document.body.appendChild(link); link.click(); document.body.removeChild(link);
}

function exportMinutesToPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.setFillColor(30, 58, 138); doc.rect(0, 0, 220, 40, 'F');
    doc.setTextColor(255, 255, 255); doc.setFontSize(24); doc.text("MUKASA Executive Portal", 20, 25);
    doc.setTextColor(0, 0, 0); doc.setFontSize(16); doc.text(`Meeting: ${minuteData.title}`, 20, 60);
    doc.setFontSize(12); doc.text(`Date: ${minuteData.date}`, 20, 70);
    doc.autoTable({ startY: 80, head: [['Agenda / Minutes']], body: minuteData.content.split('\n').map(line => [line]), theme: 'grid', headStyles: { fillColor: [30, 58, 138] }, columnStyles: { 0: { cellWidth: 170 } } });
    doc.save(`Mukasa_Minutes.pdf`);
}

// ==========================================
// --- CHART.JS INITIALIZATION ---
// ==========================================

function initCharts() {
    const ctxBar = document.getElementById('revenueChart');
    if(!ctxBar) return;
    if(window.barChart) window.barChart.destroy();
    window.barChart = new Chart(ctxBar.getContext('2d'), { type: 'bar', data: { labels: ['June', 'July', 'Aug', 'Sept', 'Oct', 'Nov'], datasets: [{ label: 'Revenue', data: [1200, 1900, 1500, 2100, 2200, 2450], backgroundColor: '#1e3a8a', borderRadius: 4 }, { label: 'Expenses', data: [800, 1200, 1000, 1400, 1100, 800], backgroundColor: '#d97706', borderRadius: 4 }] }, options: { responsive: true, plugins: { legend: { position: 'bottom' } }, scales: { y: { beginAtZero: true } } } });
    
    const ctxDoughnut = document.getElementById('budgetChart');
    if(!ctxDoughnut) return;
    if(window.doughnutChart) window.doughnutChart.destroy();
    window.doughnutChart = new Chart(ctxDoughnut.getContext('2d'), { type: 'doughnut', data: { labels: ['Venue', 'Food', 'Transport', 'Stationery'], datasets: [{ data: [300, 250, 150, 100], backgroundColor: ['#1e3a8a', '#d97706', '#10b981', '#ef4444'] }] }, options: { responsive: true, plugins: { legend: { position: 'bottom' } } } });
}

// ==========================================
// --- DYNAMIC CALENDAR LOGIC ---
// ==========================================

let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();
const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

// Initialize calendar when page loads
function initCalendar() {
    populateSelects();
    renderCalendar(currentMonth, currentYear);
}

// Populate Month and Year dropdowns
function populateSelects() {
    const monthSelect = document.getElementById('selectMonth');
    const yearSelect = document.getElementById('selectYear');
    
    if(!monthSelect || !yearSelect) return;

    // Clear existing options first to prevent duplicates if user navigates away and back
    monthSelect.innerHTML = '';
    yearSelect.innerHTML = '';

    months.forEach((m, i) => {
        let opt = document.createElement('option');
        opt.value = i;
        opt.textContent = m;
        monthSelect.appendChild(opt);
    });

    let yearNow = new Date().getFullYear();
    for(let i = yearNow - 5; i <= yearNow + 5; i++) {
        let opt = document.createElement('option');
        opt.value = i;
        opt.textContent = i;
        yearSelect.appendChild(opt);
    }

    // Set dropdowns to current month/year
    monthSelect.value = currentMonth;
    yearSelect.value = currentYear;
}

// Jump to selected Month/Year from dropdowns
function jumpToDate() {
    currentMonth = parseInt(document.getElementById('selectMonth').value);
    currentYear = parseInt(document.getElementById('selectYear').value);
    renderCalendar(currentMonth, currentYear);
}

// Change month via arrows
function changeMonth(direction) {
    currentMonth += direction;
    if(currentMonth > 11) { currentMonth = 0; currentYear++; }
    if(currentMonth < 0) { currentMonth = 11; currentYear--; }
    
    // Update dropdowns to match
    document.getElementById('selectMonth').value = currentMonth;
    document.getElementById('selectYear').value = currentYear;
    
    renderCalendar(currentMonth, currentYear);
}

// Go back to today
function goToToday() {
    currentMonth = new Date().getMonth();
    currentYear = new Date().getFullYear();
    document.getElementById('selectMonth').value = currentMonth;
    document.getElementById('selectYear').value = currentYear;
    renderCalendar(currentMonth, currentYear);
}

// Render the calendar grid
function renderCalendar(month, year) {
    const grid = document.getElementById('calendarGrid');
    const title = document.getElementById('calendarMonthYear');
    
    if(!grid || !title) return;

    title.textContent = `${months[month]} ${year}`;
    
    // Clear previous grid days
    grid.innerHTML = "";

    // Get first day of the month and total days in the month
    const firstDay = new Date(year, month, 1).getDay();
    const totalDays = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();

    const today = new Date();
    const isCurrentMonth = today.getMonth() === month && today.getFullYear() === year;

    // Add blank days before the 1st of the month
    for (let i = 0; i < firstDay; i++) {
        const blank = document.createElement('div');
        blank.className = 'h-10 w-10';
        grid.appendChild(blank);
    }

    // Add actual days
    for (let day = 1; day <= totalDays; day++) {
        const dayCell = document.createElement('div');
        // Base classes for perfect circles and centering
        dayCell.className = 'h-10 w-10 flex items-center justify-center mx-auto cursor-pointer hover:bg-gray-100 rounded-full transition text-gray-700';
        dayCell.textContent = day;

        // Highlight today
        if (isCurrentMonth && day === today.getDate()) {
            dayCell.className = 'h-10 w-10 flex items-center justify-center mx-auto bg-brand text-white rounded-full font-bold hover:bg-blue-900 transition shadow-sm';
        }
        
        // Mock events (e.g., on the 15th and 20th)
        if (day === 15) {
             dayCell.className = 'h-10 w-10 flex items-center justify-center mx-auto bg-accent text-white rounded-full font-bold hover:bg-yellow-700 transition shadow-sm';
        }
         if (day === 20) {
             dayCell.className = 'h-10 w-10 flex items-center justify-center mx-auto bg-accent text-white rounded-full font-bold hover:bg-yellow-700 transition shadow-sm';
        }

        grid.appendChild(dayCell);
    }
}

// Toggle Deanery Annual Plan view
function toggleDeaneryPlan() {
    const planSection = document.getElementById('deaneryPlanSection');
    if(planSection) {
        planSection.classList.toggle('hidden');
    }
}