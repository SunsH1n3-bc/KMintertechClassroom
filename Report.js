// Error Report Dashboard JavaScript
class ErrorReportDashboard {
    constructor() {
        this.errors = [
            {
                id: 1,
                time: '2025-07-06 14:30:25',
                type: 'HTTP Error',
                statusCode: '404',
                page: '/products/item-123',
                message: 'Page not found',
                priority: 'กลาง',
                status: 'pending'
            },
            {
                id: 2,
                time: '2025-07-06 14:25:10',
                type: 'Database Error',
                statusCode: '500',
                page: '/user/login',
                message: 'Connection timeout',
                priority: 'สูง',
                status: 'pending'
            },
            {
                id: 3,
                time: '2025-07-06 14:20:45',
                type: 'JavaScript Error',
                statusCode: '-',
                page: '/checkout',
                message: 'Undefined variable \'price\'',
                priority: 'สูง',
                status: 'pending'
            },
            {
                id: 4,
                time: '2025-07-06 14:15:30',
                type: 'HTTP Error',
                statusCode: '403',
                page: '/admin/dashboard',
                message: 'Access denied',
                priority: 'กลาง',
                status: 'pending'
            },
            {
                id: 5,
                time: '2025-07-06 14:10:15',
                type: 'Server Error',
                statusCode: '502',
                page: '/api/users',
                message: 'Bad gateway',
                priority: 'สูง',
                status: 'pending'
            }
        ];
        
        this.filteredErrors = [...this.errors];
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateSummary();
        this.renderErrorTable();
        this.updateFrequentErrors();
        this.startRealTimeUpdates();
    }

    setupEventListeners() {
        // Filter form
        const filterForm = document.querySelector('section:last-of-type form');
        if (filterForm) {
            filterForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.applyFilters();
            });

            filterForm.addEventListener('reset', () => {
                setTimeout(() => this.resetFilters(), 100);
            });
        }

        // Fix form
        const fixForm = document.querySelector('section:nth-of-type(4) form');
        if (fixForm) {
            fixForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleErrorFix();
            });
        }

        // Table row clicks
        document.addEventListener('click', (e) => {
            if (e.target.closest('tbody tr')) {
                this.handleRowClick(e.target.closest('tr'));
            }
        });
    }

    updateSummary() {
        const totalErrors = this.errors.length;
        const todayErrors = this.errors.filter(error => 
            error.time.includes('2025-07-06')).length;
        const criticalErrors = this.errors.filter(error => 
            error.priority === 'สูง').length;

        // Update summary cards
        const summaryCards = document.querySelectorAll('section:first-of-type > div > div p');
        if (summaryCards.length >= 3) {
            summaryCards[0].textContent = `${totalErrors} รายการ`;
            summaryCards[1].textContent = `${todayErrors} รายการ`;
            summaryCards[2].textContent = `${criticalErrors} รายการ`;
        }
    }

    renderErrorTable() {
        const tbody = document.querySelector('tbody');
        if (!tbody) return;

        tbody.innerHTML = '';
        
        this.filteredErrors.forEach(error => {
            const row = document.createElement('tr');
            row.dataset.errorId = error.id;
            row.innerHTML = `
                <td>${error.time}</td>
                <td>${error.type}</td>
                <td>${error.statusCode}</td>
                <td>${error.page}</td>
                <td>${error.message}</td>
                <td><span class="priority-${this.getPriorityClass(error.priority)}">${error.priority}</span></td>
            `;
            tbody.appendChild(row);
        });
    }

    getPriorityClass(priority) {
        switch (priority) {
            case 'สูง': return 'high';
            case 'กลาง': return 'medium';
            case 'ต่ำ': return 'low';
            default: return 'medium';
        }
    }

    updateFrequentErrors() {
        const errorCounts = {};
        this.errors.forEach(error => {
            const key = `${error.statusCode} - ${error.type}`;
            errorCounts[key] = (errorCounts[key] || 0) + 1;
        });

        const sortedErrors = Object.entries(errorCounts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5);

        const ul = document.querySelector('section:nth-of-type(3) ul');
        if (ul) {
            ul.innerHTML = sortedErrors.map(([error, count]) => 
                `<li>${error} (${count} ครั้ง)</li>`
            ).join('');
        }
    }

    applyFilters() {
        const dateFrom = document.getElementById('date-from').value;
        const dateTo = document.getElementById('date-to').value;
        const errorType = document.getElementById('error-type').value;
        const priority = document.getElementById('priority').value;

        this.filteredErrors = this.errors.filter(error => {
            let matches = true;

            if (dateFrom && error.time.split(' ')[0] < dateFrom) {
                matches = false;
            }
            if (dateTo && error.time.split(' ')[0] > dateTo) {
                matches = false;
            }
            if (errorType !== 'all' && !error.type.toLowerCase().includes(errorType)) {
                matches = false;
            }
            if (priority !== 'all') {
                const priorityMap = {
                    'low': 'ต่ำ',
                    'medium': 'กลาง',
                    'high': 'สูง',
                    'critical': 'วิกฤต'
                };
                if (error.priority !== priorityMap[priority]) {
                    matches = false;
                }
            }

            return matches;
        });

        this.renderErrorTable();
        this.showFilterResults();
    }

    resetFilters() {
        this.filteredErrors = [...this.errors];
        this.renderErrorTable();
        this.hideFilterResults();
    }

    showFilterResults() {
        const resultsCount = this.filteredErrors.length;
        let notification = document.querySelector('.filter-notification');
        
        if (!notification) {
            notification = document.createElement('div');
            notification.className = 'filter-notification';
            notification.style.cssText = `
                background: #d4edda;
                color: #155724;
                padding: 1rem;
                margin: 1rem 0;
                border-radius: 6px;
                border: 1px solid #c3e6cb;
            `;
            document.querySelector('section:nth-of-type(2)').insertBefore(
                notification, 
                document.querySelector('table')
            );
        }
        
        notification.textContent = `พบข้อผิดพลาด ${resultsCount} รายการตามเงื่อนไขที่กำหนด`;
    }

    hideFilterResults() {
        const notification = document.querySelector('.filter-notification');
        if (notification) {
            notification.remove();
        }
    }

    handleRowClick(row) {
        const errorId = parseInt(row.dataset.errorId);
        const error = this.errors.find(e => e.id === errorId);
        
        if (error) {
            document.getElementById('error-id').value = error.id;
            this.showErrorDetails(error);
        }
    }

    showErrorDetails(error) {
        // Create modal or highlight selected row
        document.querySelectorAll('tbody tr').forEach(row => {
            row.classList.remove('selected');
        });
        
        const selectedRow = document.querySelector(`tr[data-error-id="${error.id}"]`);
        if (selectedRow) {
            selectedRow.classList.add('selected');
            selectedRow.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }

    handleErrorFix() {
        const errorId = document.getElementById('error-id').value;
        const status = document.getElementById('status').value;
        const notes = document.getElementById('notes').value;

        if (!errorId) {
            this.showNotification('กรุณาระบุรหัสข้อผิดพลาด', 'error');
            return;
        }

        const error = this.errors.find(e => e.id == errorId);
        if (error) {
            error.status = status;
            error.notes = notes;
            error.updatedAt = new Date().toLocaleString('th-TH');
            
            this.showNotification('บันทึกข้อมูลการแก้ไขเรียบร้อยแล้ว', 'success');
            this.clearFixForm();
        } else {
            this.showNotification('ไม่พบข้อผิดพลาดที่ระบุ', 'error');
        }
    }

    clearFixForm() {
        document.getElementById('error-id').value = '';
        document.getElementById('status').value = 'pending';
        document.getElementById('notes').value = '';
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            border-radius: 6px;
            color: white;
            font-weight: 600;
            z-index: 1000;
            animation: slideIn 0.3s ease-out;
            max-width: 400px;
        `;

        switch (type) {
            case 'success':
                notification.style.background = '#28a745';
                break;
            case 'error':
                notification.style.background = '#dc3545';
                break;
            default:
                notification.style.background = '#667eea';
        }

        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    startRealTimeUpdates() {
        // Simulate real-time updates
        setInterval(() => {
            if (Math.random() > 0.95) { // 5% chance every 30 seconds
                this.addNewError();
            }
        }, 30000);
    }

    addNewError() {
        const newError = {
            id: Date.now(),
            time: new Date().toLocaleString('th-TH'),
            type: ['HTTP Error', 'Database Error', 'JavaScript Error', 'Server Error'][Math.floor(Math.random() * 4)],
            statusCode: ['404', '500', '403', '502'][Math.floor(Math.random() * 4)],
            page: ['/products', '/user/login', '/checkout', '/admin'][Math.floor(Math.random() * 4)],
            message: 'New error detected',
            priority: ['ต่ำ', 'กลาง', 'สูง'][Math.floor(Math.random() * 3)],
            status: 'pending'
        };

        this.errors.unshift(newError);
        this.filteredErrors = [...this.errors];
        this.updateSummary();
        this.renderErrorTable();
        this.updateFrequentErrors();
        
        this.showNotification('พบข้อผิดพลาดใหม่!', 'error');
    }

    // Export data functionality
    exportData() {
        const data = this.filteredErrors.map(error => ({
            เวลา: error.time,
            ประเภท: error.type,
            รหัสสถานะ: error.statusCode,
            หน้าเว็บ: error.page,
            ข้อความ: error.message,
            ความสำคัญ: error.priority
        }));

        const csv = this.convertToCSV(data);
        this.downloadCSV(csv, 'error_report.csv');
    }

    convertToCSV(data) {
        const headers = Object.keys(data[0]);
        const csvContent = [
            headers.join(','),
            ...data.map(row => headers.map(header => `"${row[header]}"`).join(','))
        ].join('\n');
        
        return csvContent;
    }

    downloadCSV(csv, filename) {
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        link.click();
    }
}

// Additional CSS for JavaScript functionality
const additionalCSS = `
    <style>
        .selected {
            background-color: #e3f2fd !important;
            border-left: 4px solid #2196f3 !important;
        }
        
        .priority-high {
            background: #dc3545;
            color: white;
            padding: 0.25rem 0.5rem;
            border-radius: 4px;
            font-size: 0.8rem;
            font-weight: 600;
        }
        
        .priority-medium {
            background: #fd7e14;
            color: white;
            padding: 0.25rem 0.5rem;
            border-radius: 4px;
            font-size: 0.8rem;
            font-weight: 600;
        }
        
        .priority-low {
            background: #28a745;
            color: white;
            padding: 0.25rem 0.5rem;
            border-radius: 4px;
            font-size: 0.8rem;
            font-weight: 600;
        }
        
        tbody tr {
            cursor: pointer;
            transition: all 0.3s ease;
        }
        
        tbody tr:hover {
            background-color: #f8f9fa;
            transform: translateX(2px);
        }
        
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
        
        .export-btn {
            background: #28a745;
            color: white;
            padding: 0.5rem 1rem;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 0.9rem;
            margin-left: 1rem;
        }
        
        .export-btn:hover {
            background: #218838;
        }
    </style>
`;

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Add additional CSS
    document.head.insertAdjacentHTML('beforeend', additionalCSS);
    
    // Initialize dashboard
    window.errorDashboard = new ErrorReportDashboard();
    
    // Add export button
    const filterSection = document.querySelector('section:last-of-type');
    if (filterSection) {
        const exportBtn = document.createElement('button');
        exportBtn.className = 'export-btn';
        exportBtn.textContent = 'ส่งออกข้อมูล';
        exportBtn.onclick = () => window.errorDashboard.exportData();
        filterSection.appendChild(exportBtn);
    }
});

// Utility functions
function refreshData() {
    window.errorDashboard.updateSummary();
    window.errorDashboard.renderErrorTable();
    window.errorDashboard.updateFrequentErrors();
}

function addTestError() {
    window.errorDashboard.addNewError();
}