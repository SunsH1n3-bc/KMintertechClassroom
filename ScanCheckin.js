// QR Code Attendance System JavaScript
class QRAttendanceSystem {
    constructor() {
        this.scanner = null;
        this.isScanning = false;
        this.attendanceList = [];
        this.currentScanData = null;
        
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadAttendanceData();
        this.updateAttendanceDisplay();
    }

    bindEvents() {
        // Scanner control buttons
        document.getElementById('start-scan-btn').addEventListener('click', () => this.startScan());
        document.getElementById('stop-scan-btn').addEventListener('click', () => this.stopScan());
        
        // Attendance form buttons
        document.getElementById('confirm-attendance').addEventListener('click', () => this.confirmAttendance());
        document.getElementById('cancel-attendance').addEventListener('click', () => this.cancelAttendance());
    }

    async startScan() {
        try {
            const videoElement = document.getElementById('qr-video');
            const startBtn = document.getElementById('start-scan-btn');
            const stopBtn = document.getElementById('stop-scan-btn');

            // Initialize QR Scanner
            this.scanner = new QrScanner(
                videoElement,
                (result) => this.handleScanResult(result),
                {
                    returnDetailedScanResult: true,
                    highlightScanRegion: true,
                    highlightCodeOutline: true,
                }
            );

            await this.scanner.start();
            this.isScanning = true;

            // Update button states
            startBtn.disabled = true;
            stopBtn.disabled = false;

            this.showMessage('เริ่มสแกน QR Code แล้ว', 'info');
        } catch (error) {
            console.error('Error starting scanner:', error);
            this.showMessage('ไม่สามารถเริ่มสแกนได้ กรุณาตรวจสอบกล้อง', 'error');
        }
    }

    stopScan() {
        if (this.scanner) {
            this.scanner.stop();
            this.scanner.destroy();
            this.scanner = null;
            this.isScanning = false;

            // Update button states
            document.getElementById('start-scan-btn').disabled = false;
            document.getElementById('stop-scan-btn').disabled = true;

            // Hide attendance form
            document.getElementById('attendance-form').style.display = 'none';

            this.showMessage('หยุดสแกน QR Code แล้ว', 'info');
        }
    }

    handleScanResult(result) {
        try {
            // Parse QR code data (expecting JSON format)
            const qrData = JSON.parse(result.data);
            
            // Validate required fields
            if (!qrData.studentId || !qrData.studentName || !qrData.classCode) {
                throw new Error('QR Code ไม่ถูกต้อง');
            }

            // Check if student already checked in
            const existingAttendance = this.attendanceList.find(
                attendance => attendance.studentId === qrData.studentId && 
                attendance.classCode === qrData.classCode
            );

            if (existingAttendance) {
                this.showMessage('นักเรียนคนนี้ลงชื่อเข้าเรียนแล้ว', 'error');
                return;
            }

            // Store scan data and show form
            this.currentScanData = qrData;
            this.showAttendanceForm(qrData);
            
        } catch (error) {
            console.error('Error parsing QR code:', error);
            this.showMessage('QR Code ไม่ถูกต้อง กรุณาสแกนใหม่', 'error');
        }
    }

    showAttendanceForm(qrData) {
        const form = document.getElementById('attendance-form');
        const currentTime = new Date().toLocaleString('th-TH');

        // Fill form with data
        document.getElementById('student-id').value = qrData.studentId;
        document.getElementById('student-name').value = qrData.studentName;
        document.getElementById('class-code').value = qrData.classCode;
        document.getElementById('attendance-time').value = currentTime;

        // Show form
        form.style.display = 'block';
        form.scrollIntoView({ behavior: 'smooth' });
    }

    confirmAttendance() {
        if (!this.currentScanData) {
            this.showMessage('ไม่มีข้อมูลการสแกน', 'error');
            return;
        }

        const attendanceData = {
            studentId: this.currentScanData.studentId,
            studentName: this.currentScanData.studentName,
            classCode: this.currentScanData.classCode,
            attendanceTime: new Date().toLocaleString('th-TH'),
            timestamp: new Date().getTime(),
            status: this.getAttendanceStatus()
        };

        // Add to attendance list
        this.attendanceList.push(attendanceData);
        
        // Save to memory storage
        this.saveAttendanceData();
        
        // Update display
        this.updateAttendanceDisplay();
        
        // Hide form
        document.getElementById('attendance-form').style.display = 'none';
        
        // Clear current scan data
        this.currentScanData = null;
        
        this.showMessage('บันทึกการเข้าเรียนสำเร็จ', 'success');
    }

    cancelAttendance() {
        // Hide form
        document.getElementById('attendance-form').style.display = 'none';
        
        // Clear current scan data
        this.currentScanData = null;
        
        this.showMessage('ยกเลิกการบันทึกเข้าเรียน', 'info');
    }

    getAttendanceStatus() {
        const now = new Date();
        const currentTime = now.getHours() * 60 + now.getMinutes();
        const classStartTime = 8 * 60; // 8:00 AM in minutes
        
        return currentTime <= classStartTime + 15 ? 'เข้าเรียน' : 'เข้าเรียนสาย';
    }

    updateAttendanceDisplay() {
        const tbody = document.getElementById('attendance-tbody');
        const totalStudents = document.getElementById('total-students');
        
        // Clear existing rows
        tbody.innerHTML = '';
        
        // Sort attendance by timestamp (newest first)
        const sortedAttendance = this.attendanceList.sort((a, b) => b.timestamp - a.timestamp);
        
        // Add rows
        sortedAttendance.forEach((attendance, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${attendance.studentId}</td>
                <td>${attendance.studentName}</td>
                <td>${attendance.classCode}</td>
                <td>${attendance.attendanceTime}</td>
                <td>
                    <span class="status-${attendance.status === 'เข้าเรียน' ? 'present' : 'late'}">
                        ${attendance.status}
                    </span>
                </td>
            `;
            tbody.appendChild(row);
        });
        
        // Update total count
        totalStudents.textContent = `นักเรียนทั้งหมด: ${this.attendanceList.length} คน`;
    }

    saveAttendanceData() {
        // Save to memory (in a real application, this would save to a database)
        // For demo purposes, we'll just keep it in memory
        console.log('Attendance data saved:', this.attendanceList);
    }

    loadAttendanceData() {
        // Load from memory (in a real application, this would load from a database)
        // For demo purposes, we'll start with empty data
        this.attendanceList = [];
        
        // Sample data for demonstration
        this.addSampleData();
    }

    addSampleData() {
        // Add some sample attendance data for demonstration
        const sampleData = [
            {
                studentId: 'STD001',
                studentName: 'นางสาวสมใจ ใจดี',
                classCode: 'CS101',
                attendanceTime: new Date(Date.now() - 1000000).toLocaleString('th-TH'),
                timestamp: Date.now() - 1000000,
                status: 'เข้าเรียน'
            },
            {
                studentId: 'STD002',
                studentName: 'นายสมชาย ขยันเรียน',
                classCode: 'CS101',
                attendanceTime: new Date(Date.now() - 800000).toLocaleString('th-TH'),
                timestamp: Date.now() - 800000,
                status: 'เข้าเรียน'
            },
            {
                studentId: 'STD003',
                studentName: 'นางสาวสมหญิง เก่งงาม',
                classCode: 'CS101',
                attendanceTime: new Date(Date.now() - 600000).toLocaleString('th-TH'),
                timestamp: Date.now() - 600000,
                status: 'เข้าเรียนสาย'
            }
        ];
        
        this.attendanceList = sampleData;
    }

    showMessage(message, type) {
        const messageBox = document.getElementById('message-box');
        const messageText = document.getElementById('message-text');
        
        // Remove existing classes
        messageBox.classList.remove('success', 'error', 'info');
        
        // Add new class
        messageBox.classList.add(type);
        
        // Set message
        messageText.textContent = message;
        
        // Show message
        messageBox.style.display = 'block';
        
        // Auto hide after 3 seconds
        setTimeout(() => {
            messageBox.style.display = 'none';
        }, 3000);
    }

    // Generate sample QR code data (for testing)
    generateSampleQRData() {
        return {
            studentId: 'STD' + String(Math.floor(Math.random() * 1000)).padStart(3, '0'),
            studentName: 'นักเรียนทดสอบ ' + Math.floor(Math.random() * 100),
            classCode: 'CS101',
            timestamp: Date.now()
        };
    }
}

// Initialize the system when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.attendanceSystem = new QRAttendanceSystem();
});

// Additional utility functions
function exportAttendanceData() {
    if (window.attendanceSystem && window.attendanceSystem.attendanceList.length > 0) {
        const data = window.attendanceSystem.attendanceList;
        const csv = convertToCSV(data);
        downloadCSV(csv, 'attendance_' + new Date().toISOString().split('T')[0] + '.csv');
    } else {
        alert('ไม่มีข้อมูลการเข้าเรียนให้ส่งออก');
    }
}

function convertToCSV(data) {
    const headers = ['รหัสนักเรียน', 'ชื่อ-นามสกุล', 'รหัสวิชา', 'เวลาเข้าเรียน', 'สถานะ'];
    const csv = [headers.join(',')];
    
    data.forEach(row => {
        const values = [
            row.studentId,
            row.studentName,
            row.classCode,
            row.attendanceTime,
            row.status
        ];
        csv.push(values.join(','));
    });
    
    return csv.join('\n');
}

function downloadCSV(csv, filename) {
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', filename);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}