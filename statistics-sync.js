// Statistics Sync System - ระบบซิงค์ข้อมูลสถิติการเข้าเรียน
// ไฟล์นี้จะจัดการการซิงค์ข้อมูลสถิติระหว่างหน้า index.html และ Scan.html

// ตัวแปรสำหรับเก็บข้อมูลสถิติ
let attendanceStatistics = {
    totalPresent: 0,
    totalAbsent: 0,
    totalLate: 0,
    totalLeave: 0,
    attendanceRate: 0,
    weeklyData: [],
    monthlyData: [],
    subjectStats: [],
    lastUpdated: null
};

// ฟังก์ชันโหลดข้อมูลสถิติจาก localStorage
function loadAttendanceStatistics() {
    try {
        // โหลดข้อมูลการเข้าเรียนจาก Scan.html
        const savedAttendanceData = localStorage.getItem('studentAttendanceData');
        const userData = JSON.parse(localStorage.getItem('userData') || '{}');
        
        if (savedAttendanceData) {
            const attendanceData = JSON.parse(savedAttendanceData);
            calculateStatistics(attendanceData, userData);
        } else {
            // ใช้ข้อมูลเริ่มต้นหากไม่มีข้อมูล
            setDefaultStatistics(userData);
        }
        
        console.log('Statistics loaded:', attendanceStatistics);
        return attendanceStatistics;
    } catch (error) {
        console.error('Error loading attendance statistics:', error);
        setDefaultStatistics();
        return attendanceStatistics;
    }
}

// ฟังก์ชันคำนวณสถิติจากข้อมูลที่มี
function calculateStatistics(attendanceData, userData) {
    let totalPresent = 0;
    let totalAbsent = 0;
    let totalLate = 0;
    let totalLeave = 0;
    let subjectStats = [];
    
    // รวบรวมข้อมูลจากทุกระดับชั้น
    if (attendanceData.gradeData) {
        Object.keys(attendanceData.gradeData).forEach(grade => {
            attendanceData.gradeData[grade].forEach(student => {
                if (student.status) {
                    switch (student.status) {
                        case 'present':
                            totalPresent++;
                            break;
                        case 'absent':
                            totalAbsent++;
                            break;
                        case 'late':
                            totalLate++;
                            break;
                        case 'leave':
                            totalLeave++;
                            break;
                    }
                }
            });
        });
    }
    
    // คำนวณเปอร์เซ็นต์การเข้าเรียน
    const totalRecords = totalPresent + totalAbsent + totalLate + totalLeave;
    const attendanceRate = totalRecords > 0 ? Math.round(((totalPresent + totalLate) / totalRecords) * 100) : 0;
    
    // อัพเดทข้อมูลสถิติ
    attendanceStatistics = {
        totalPresent,
        totalAbsent,
        totalLate,
        totalLeave,
        attendanceRate,
        weeklyData: generateWeeklyData(totalPresent, totalAbsent, totalLate),
        monthlyData: generateMonthlyData(totalPresent, totalAbsent),
        subjectStats: calculateSubjectStats(attendanceData),
        lastUpdated: new Date().toISOString()
    };
    
    // บันทึกข้อมูลสถิติ
    saveStatisticsToStorage();
}

// ฟังก์ชันสร้างข้อมูลสถิติรายสัปดาห์
function generateWeeklyData(present, absent, late) {
    const weeklyData = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        
        // สร้างข้อมูลสุ่มตัวอย่างตามสัดส่วนที่มี
        const total = present + absent + late;
        const dailyPresent = total > 0 ? Math.floor((present / total) * (Math.random() * 5 + 3)) : Math.floor(Math.random() * 3);
        const dailyAbsent = total > 0 ? Math.floor((absent / total) * (Math.random() * 2 + 1)) : 0;
        const dailyRate = dailyPresent > 0 ? Math.round((dailyPresent / (dailyPresent + dailyAbsent)) * 100) : 0;
        
        weeklyData.push({
            date: date.toLocaleDateString('th-TH', { weekday: 'short', day: 'numeric' }),
            present: dailyPresent,
            absent: dailyAbsent,
            rate: dailyRate
        });
    }
    
    return weeklyData;
}

// ฟังก์ชันสร้างข้อมูลสถิติรายเดือน
function generateMonthlyData(present, absent) {
    const monthlyData = [];
    const currentMonth = new Date().getMonth();
    
    for (let i = 11; i >= 0; i--) {
        const date = new Date();
        date.setMonth(currentMonth - i);
        
        const monthPresent = Math.floor(present * (0.8 + Math.random() * 0.4));
        const monthAbsent = Math.floor(absent * (0.5 + Math.random() * 1));
        const monthRate = monthPresent > 0 ? Math.round((monthPresent / (monthPresent + monthAbsent)) * 100) : 0;
        
        monthlyData.push({
            month: date.toLocaleDateString('th-TH', { month: 'short' }),
            present: monthPresent,
            absent: monthAbsent,
            rate: monthRate
        });
    }
    
    return monthlyData;
}

// ฟังก์ชันคำนวณสถิติรายวิชา
function calculateSubjectStats(attendanceData) {
    const subjectStats = [];
    
    if (attendanceData.subjects) {
        attendanceData.subjects.forEach(subject => {
            let subjectPresent = 0;
            let subjectAbsent = 0;
            let subjectLate = 0;
            
            // นับข้อมูลการเข้าเรียนของรายวิชานี้
            if (attendanceData.gradeData) {
                Object.keys(attendanceData.gradeData).forEach(grade => {
                    attendanceData.gradeData[grade].forEach(student => {
                        if (student.subjectId === subject.id) {
                            switch (student.status) {
                                case 'present':
                                    subjectPresent++;
                                    break;
                                case 'absent':
                                    subjectAbsent++;
                                    break;
                                case 'late':
                                    subjectLate++;
                                    break;
                            }
                        }
                    });
                });
            }
            
            const total = subjectPresent + subjectAbsent + subjectLate;
            const rate = total > 0 ? Math.round(((subjectPresent + subjectLate) / total) * 100) : 0;
            
            if (total > 0) {
                subjectStats.push({
                    id: subject.id,
                    name: subject.name,
                    code: subject.code,
                    present: subjectPresent,
                    absent: subjectAbsent,
                    late: subjectLate,
                    rate: rate
                });
            }
        });
    }
    
    return subjectStats;
}

// ฟังก์ชันตั้งค่าสถิติเริ่มต้น
function setDefaultStatistics(userData = {}) {
    const defaultPresent = userData.attendedDays || 18;
    const defaultAbsent = userData.absentDays || 2;
    const defaultLate = userData.lateDays || 1;
    const defaultRate = userData.attendanceRate || 90;
    
    attendanceStatistics = {
        totalPresent: defaultPresent,
        totalAbsent: defaultAbsent,
        totalLate: defaultLate,
        totalLeave: 0,
        attendanceRate: defaultRate,
        weeklyData: generateWeeklyData(defaultPresent, defaultAbsent, defaultLate),
        monthlyData: generateMonthlyData(defaultPresent, defaultAbsent),
        subjectStats: [],
        lastUpdated: new Date().toISOString()
    };
    
    saveStatisticsToStorage();
}

// ฟังก์ชันบันทึกสถิติไปยัง localStorage
function saveStatisticsToStorage() {
    try {
        localStorage.setItem('attendanceStatistics', JSON.stringify(attendanceStatistics));
        console.log('Statistics saved to storage');
    } catch (error) {
        console.error('Error saving statistics:', error);
    }
}

// ฟังก์ชันอัพเดทสถิติในหน้า index.html
function updateIndexStatistics() {
    try {
        // อัพเดทสถิติการเข้าเรียน
        const presentElement = document.querySelector('.stat-card.attendance h4');
        if (presentElement) {
            presentElement.textContent = attendanceStatistics.totalPresent.toString();
        }
        
        const absentElement = document.querySelector('.stat-card.absence h4');
        if (absentElement) {
            absentElement.textContent = attendanceStatistics.totalAbsent.toString();
        }
        
        const lateElement = document.querySelector('.stat-card.late h4');
        if (lateElement) {
            lateElement.textContent = attendanceStatistics.totalLate.toString();
        }
        
        const percentageElement = document.querySelector('.stat-card.percentage h4');
        if (percentageElement) {
            percentageElement.textContent = `${attendanceStatistics.attendanceRate}%`;
        }
        
        // อัพเดท progress bars
        updateProgressBars();
        
        // อัพเดทข้อมูลแนวโน้ม
        updateTrendIndicators();
        
        console.log('Index statistics updated');
        
    } catch (error) {
        console.error('Error updating index statistics:', error);
    }
}

// ฟังก์ชันอัพเดท progress bars
function updateProgressBars() {
    const total = attendanceStatistics.totalPresent + attendanceStatistics.totalAbsent + 
                  attendanceStatistics.totalLate + attendanceStatistics.totalLeave;
    
    if (total === 0) return;
    
    // คำนวณเปอร์เซ็นต์แต่ละประเภท
    const presentPercentage = Math.round((attendanceStatistics.totalPresent / total) * 100);
    const absentPercentage = Math.round((attendanceStatistics.totalAbsent / total) * 100);
    const latePercentage = Math.round((attendanceStatistics.totalLate / total) * 100);
    const attendancePercentage = attendanceStatistics.attendanceRate;
    
    // อัพเดท progress bars
    const progressBars = document.querySelectorAll('.progress-fill');
    if (progressBars.length >= 4) {
        progressBars[0].style.width = `${attendancePercentage}%`; // เข้าเรียน
        progressBars[1].style.width = `${absentPercentage}%`;     // ขาดเรียน
        progressBars[2].style.width = `${latePercentage}%`;       // มาสาย
        progressBars[3].style.width = `${attendancePercentage}%`; // เปอร์เซ็นต์รวม
    }
}

// ฟังก์ชันอัพเดทตัวบ่งชี้แนวโน้ม
function updateTrendIndicators() {
    const trendElements = document.querySelectorAll('.stat-trend');
    
    trendElements.forEach((element, index) => {
        const trendValue = element.querySelector('span');
        if (trendValue) {
            let trend = 0;
            
            switch (index) {
                case 0: // เข้าเรียน
                    trend = Math.floor(Math.random() * 10) - 2; // -2 to +7
                    break;
                case 1: // ขาดเรียน
                    trend = Math.floor(Math.random() * 6) - 5; // -5 to 0
                    break;
                case 2: // มาสาย
                    trend = Math.floor(Math.random() * 4) - 2; // -2 to +1
                    break;
                case 3: // เปอร์เซ็นต์
                    trend = Math.floor(Math.random() * 8) + 1; // +1 to +8
                    break;
            }
            
            trendValue.textContent = `${trend >= 0 ? '+' : ''}${trend}%`;
            
            // อัพเดทคลาสแนวโน้ม
            element.className = 'stat-trend';
            if (trend > 0) {
                element.classList.add('up');
            } else if (trend < 0) {
                element.classList.add('down');
            } else {
                element.classList.add('neutral');
            }
        }
    });
}

// ฟังก์ชันตรวจสอบการเปลี่ยนแปลงข้อมูล
function checkForDataUpdates() {
    const savedData = localStorage.getItem('studentAttendanceData');
    const currentStats = localStorage.getItem('attendanceStatistics');
    
    if (savedData) {
        const attendanceData = JSON.parse(savedData);
        const userData = JSON.parse(localStorage.getItem('userData') || '{}');
        
        // สร้างสถิติใหม่จากข้อมูลปัจจุบัน
        const tempStats = { ...attendanceStatistics };
        calculateStatistics(attendanceData, userData);
        
        // เปรียบเทียบกับสถิติเดิม
        if (JSON.stringify(tempStats) !== JSON.stringify(attendanceStatistics)) {
            console.log('Data updated, refreshing statistics');
            updateIndexStatistics();
            return true;
        }
    }
    
    return false;
}

// ฟังก์ชันสำหรับการซิงค์ข้อมูลแบบ real-time
function initializeStatisticsSync() {
    // โหลดสถิติเริ่มต้น
    loadAttendanceStatistics();
    
    // อัพเดทหน้า index ถ้าเป็นหน้า index
    if (document.querySelector('.statistics')) {
        updateIndexStatistics();
    }
    
    // ตั้งค่าการตรวจสอบข้อมูลทุกๆ 10 วินาที
    setInterval(() => {
        if (checkForDataUpdates()) {
            // ถ้ามีการเปลี่ยนแปลง ให้แสดงการแจ้งเตือน
            if (typeof showNotification === 'function') {
                showNotification('ข้อมูลสถิติได้รับการอัพเดท', 'info');
            }
        }
    }, 10000);
    
    // ฟังการเปลี่ยนแปลงใน localStorage
    window.addEventListener('storage', function(e) {
        if (e.key === 'studentAttendanceData') {
            console.log('Storage changed, updating statistics');
            loadAttendanceStatistics();
            if (document.querySelector('.statistics')) {
                updateIndexStatistics();
            }
        }
    });
}

// ฟังก์ชันสำหรับการแจ้งเตือน (ถ้ามี)
function showNotification(message, type = 'info') {
    // สร้างการแจ้งเตือนแบบง่าย
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        z-index: 9999;
        font-size: 14px;
        max-width: 300px;
        transform: translateX(100%);
        transition: transform 0.3s ease;
    `;
    
    notification.innerHTML = `
        <ion-icon name="information-circle" style="margin-right: 8px;"></ion-icon>
        ${message}
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 4000);
}

// ฟังก์ชันสำหรับการส่งออกข้อมูลสถิติ
function exportStatisticsData() {
    const data = {
        statistics: attendanceStatistics,
        exportDate: new Date().toISOString(),
        user: JSON.parse(localStorage.getItem('userData') || '{}')
    };
    
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `attendance_statistics_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
}

// ฟังก์ชันสำหรับการนำเข้าข้อมูลสถิติ
function importStatisticsData(file) {
    const reader = new FileReader();
    
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            if (data.statistics) {
                attendanceStatistics = data.statistics;
                saveStatisticsToStorage();
                updateIndexStatistics();
                showNotification('นำเข้าข้อมูลสถิติสำเร็จ', 'success');
            }
        } catch (error) {
            console.error('Error importing statistics:', error);
            showNotification('เกิดข้อผิดพลาดในการนำเข้าข้อมูล', 'error');
        }
    };
    
    reader.readAsText(file);
}

// ฟังก์ชันรีเซ็ตสถิติ
function resetStatistics() {
    if (confirm('คุณแน่ใจหรือไม่ว่าต้องการรีเซ็ตข้อมูลสถิติทั้งหมด?')) {
        localStorage.removeItem('attendanceStatistics');
        setDefaultStatistics();
        updateIndexStatistics();
        showNotification('รีเซ็ตข้อมูลสถิติสำเร็จ', 'success');
    }
}

// Export functions สำหรับใช้งานในไฟล์อื่น
window.StatisticsSync = {
    initialize: initializeStatisticsSync,
    load: loadAttendanceStatistics,
    update: updateIndexStatistics,
    export: exportStatisticsData,
    import: importStatisticsData,
    reset: resetStatistics,
    getStatistics: () => attendanceStatistics
};

// Auto-initialize เมื่อ DOM โหลดเสร็จ
document.addEventListener('DOMContentLoaded', function() {
    initializeStatisticsSync();
});

console.log('Statistics Sync System loaded successfully!');