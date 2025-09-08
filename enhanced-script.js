// Enhanced JavaScript for Scan Check In System - UPDATED VERSION WITH STATISTICS SYNC

// DOM Elements
const currentDateElement = document.getElementById('current-date');
const currentTimeElement = document.getElementById('current-time');
const navLinks = document.querySelectorAll('.nav-link');
const actionButtons = document.querySelectorAll('.action-btn');
const periodSelector = document.querySelector('.period-selector');
const notificationIcon = document.querySelector('.notification-icon');
const notificationBadge = document.querySelector('.notification-badge');

// State Management
let currentNotifications = 3;
let weatherData = null;
let scheduleData = null;
let currentUserRole = null;
let statisticsUpdateInterval = null;

// User Role Management
function setUserRole(role) {
    currentUserRole = role;
    console.log('User role set to:', role);
    
    try {
        localStorage.setItem('userRole', role);
    } catch (e) {
        console.warn('Cannot save to localStorage:', e);
    }
    
    updateUIByRole(role);
}

function getUserRole() {
    if (currentUserRole) {
        return currentUserRole;
    }
    
    try {
        const savedRole = localStorage.getItem('userRole');
        if (savedRole) {
            currentUserRole = savedRole;
            return savedRole;
        }
    } catch (e) {
        console.warn('Cannot read from localStorage:', e);
    }
    
    const userRoleElement = document.getElementById('displayUserRole');
    if (userRoleElement) {
        const roleText = userRoleElement.textContent.trim();
        if (roleText === 'นักเรียน' || roleText === 'student') {
            currentUserRole = 'student';
            return 'student';
        } else if (roleText === 'ครู' || roleText === 'teacher') {
            currentUserRole = 'teacher';
            return 'teacher';
        } else if (roleText === 'แอดมิน' || roleText === 'admin') {
            currentUserRole = 'admin';
            return 'admin';
        }
    }
    
    return 'student';
}

function updateUIByRole(role) {
    const checkinElements = document.querySelectorAll('.checkin-feature');
    
    if (role === 'student' || role === 'นักเรียน') {
        checkinElements.forEach(element => {
            element.style.display = 'none';
            element.style.visibility = 'hidden';
            element.setAttribute('aria-hidden', 'true');
        });
        
        document.body.classList.add('role-student');
        document.body.classList.remove('role-teacher', 'role-admin');
        
        console.log('Hidden checkin features for student role');
    } else {
        checkinElements.forEach(element => {
            element.style.display = '';
            element.style.visibility = '';
            element.removeAttribute('aria-hidden');
        });
        
        document.body.classList.remove('role-student');
        if (role === 'teacher' || role === 'ครู') {
            document.body.classList.add('role-teacher');
            document.body.classList.remove('role-admin');
        } else if (role === 'admin' || role === 'แอดมิน') {
            document.body.classList.add('role-admin');
            document.body.classList.remove('role-teacher');
        }
        
        console.log('Shown checkin features for role:', role);
    }
    
    updateNavigationByRole(role);
}

function updateNavigationByRole(role) {
    const checkinNavItem = document.querySelector('.nav-item.checkin-feature');
    
    if (role === 'student' || role === 'นักเรียน') {
        if (checkinNavItem) {
            checkinNavItem.style.display = 'none';
        }
    } else {
        if (checkinNavItem) {
            checkinNavItem.style.display = '';
        }
    }
}

// Initialize Application
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM Content Loaded - Initializing app...');
    initializeApp();
});

function initializeApp() {
    updateDateTime();
    setupEventListeners();
    setActiveNavigation();
    loadUserData();
    setupFloatingAnimations();
    initializeTooltips();
    setupRippleEffects();
    loadWeatherData();
    setupScheduleUpdates();
    setupNotifications();
    setupProgressBars();
    setupCardAnimations();
    
    // Initialize user role management
    initializeUserRole();
    
    // Initialize statistics sync (ถ้ามี StatisticsSync)
    if (typeof window.StatisticsSync !== 'undefined') {
        initializeStatisticsSync();
    }
    
    // Debug buttons after initialization
    setTimeout(() => {
        debugButtons();
        testButtonClicks();
    }, 1000);
}

function initializeUserRole() {
    const role = getUserRole();
    console.log('Detected user role:', role);
    updateUIByRole(role);
}

// Statistics Integration - ฟังก์ชันสำหรับซิงค์สถิติ
function initializeStatisticsSync() {
    console.log('Initializing statistics sync...');
    
    // อัพเดทสถิติเริ่มต้น
    updateStatisticsFromScanData();
    
    // ตั้งค่าการอัพเดทสถิติทุกๆ 15 วินาที
    statisticsUpdateInterval = setInterval(() => {
        updateStatisticsFromScanData();
    }, 15000);
    
    // ฟังการเปลี่ยนแปลงใน localStorage
    window.addEventListener('storage', function(e) {
        if (e.key === 'studentAttendanceData' || e.key === 'attendanceStatistics') {
            console.log('Attendance data changed, updating statistics...');
            updateStatisticsFromScanData();
        }
    });
}

// ฟังก์ชันอัพเดทสถิติจากข้อมูล Scan.html
function updateStatisticsFromScanData() {
    try {
        // โหลดข้อมูลจาก localStorage
        const attendanceData = JSON.parse(localStorage.getItem('studentAttendanceData') || '{}');
        const userData = JSON.parse(localStorage.getItem('userData') || '{}');
        
        // คำนวณสถิติใหม่
        const statistics = calculateStatisticsFromData(attendanceData, userData);
        
        // อัพเดท UI
        updateStatisticsDisplay(statistics);
        
        // บันทึกสถิติที่คำนวณได้
        localStorage.setItem('calculatedStatistics', JSON.stringify(statistics));
        
        console.log('Statistics updated:', statistics);
        
    } catch (error) {
        console.error('Error updating statistics:', error);
    }
}

// ฟังก์ชันคำนวณสถิติจากข้อมูล
function calculateStatisticsFromData(attendanceData, userData) {
    let totalPresent = 0;
    let totalAbsent = 0;
    let totalLate = 0;
    let totalLeave = 0;
    
    // คำนวณจากข้อมูลการเข้าเรียน
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
    
    // ใช้ข้อมูลจาก userData เป็น fallback
    const totalRecords = totalPresent + totalAbsent + totalLate + totalLeave;
    
    if (totalRecords === 0) {
        // ใช้ข้อมูลเริ่มต้นจาก userData
        totalPresent = userData.attendedDays || 18;
        totalAbsent = userData.absentDays || 2;
        totalLate = userData.lateDays || 1;
        totalLeave = 0;
    }
    
    // คำนวณเปอร์เซ็นต์การเข้าเรียน
    const finalTotal = totalPresent + totalAbsent + totalLate + totalLeave;
    const attendanceRate = finalTotal > 0 ? 
        Math.round(((totalPresent + totalLate) / finalTotal) * 100) : 
        (userData.attendanceRate || 90);
    
    return {
        totalPresent,
        totalAbsent,
        totalLate,
        totalLeave,
        attendanceRate,
        lastUpdated: new Date().toISOString()
    };
}

// ฟังก์ชันอัพเดทการแสดงผลสถิติ
function updateStatisticsDisplay(statistics) {
    // อัพเดทตัวเลขสถิติ
    const presentElement = document.querySelector('.stat-card.attendance h4');
    if (presentElement) {
        animateNumber(presentElement, parseInt(presentElement.textContent) || 0, statistics.totalPresent);
    }
    
    const absentElement = document.querySelector('.stat-card.absence h4');
    if (absentElement) {
        animateNumber(absentElement, parseInt(absentElement.textContent) || 0, statistics.totalAbsent);
    }
    
    const lateElement = document.querySelector('.stat-card.late h4');
    if (lateElement) {
        animateNumber(lateElement, parseInt(lateElement.textContent) || 0, statistics.totalLate);
    }
    
    const percentageElement = document.querySelector('.stat-card.percentage h4');
    if (percentageElement) {
        const currentRate = parseInt(percentageElement.textContent.replace('%', '')) || 0;
        animatePercentage(percentageElement, currentRate, statistics.attendanceRate);
    }
    
    // อัพเดท progress bars
    updateProgressBarsFromStatistics(statistics);
    
    // อัพเดทแนวโน้ม
    updateTrendIndicators(statistics);
}

// ฟังก์ชันแอนิเมชันตัวเลข
function animateNumber(element, fromValue, toValue) {
    const duration = 1000; // 1 วินาที
    const steps = 30;
    const stepValue = (toValue - fromValue) / steps;
    let currentStep = 0;
    
    const interval = setInterval(() => {
        currentStep++;
        const currentValue = Math.round(fromValue + (stepValue * currentStep));
        element.textContent = currentValue;
        
        if (currentStep >= steps) {
            clearInterval(interval);
            element.textContent = toValue;
        }
    }, duration / steps);
}

// ฟังก์ชันแอนิเมชันเปอร์เซ็นต์
function animatePercentage(element, fromValue, toValue) {
    const duration = 1000;
    const steps = 30;
    const stepValue = (toValue - fromValue) / steps;
    let currentStep = 0;
    
    const interval = setInterval(() => {
        currentStep++;
        const currentValue = Math.round(fromValue + (stepValue * currentStep));
        element.textContent = `${currentValue}%`;
        
        if (currentStep >= steps) {
            clearInterval(interval);
            element.textContent = `${toValue}%`;
        }
    }, duration / steps);
}

// ฟังก์ชันอัพเดท progress bars จากสถิติ
function updateProgressBarsFromStatistics(statistics) {
    const total = statistics.totalPresent + statistics.totalAbsent + 
                  statistics.totalLate + statistics.totalLeave;
    
    if (total === 0) return;
    
    const progressBars = document.querySelectorAll('.progress-fill');
    if (progressBars.length >= 4) {
        // คำนวณเปอร์เซ็นต์แต่ละประเภท
        const presentPercentage = Math.round((statistics.totalPresent / total) * 100);
        const absentPercentage = Math.round((statistics.totalAbsent / total) * 100);
        const latePercentage = Math.round((statistics.totalLate / total) * 100);
        
        // แอนิเมชัน progress bars
        animateProgressBar(progressBars[0], statistics.attendanceRate);
        animateProgressBar(progressBars[1], absentPercentage);
        animateProgressBar(progressBars[2], latePercentage);
        animateProgressBar(progressBars[3], statistics.attendanceRate);
    }
}

// ฟังก์ชันแอนิเมชัน progress bar
function animateProgressBar(progressBar, targetPercentage) {
    const currentWidth = parseInt(progressBar.style.width) || 0;
    const duration = 1500;
    const steps = 40;
    const stepValue = (targetPercentage - currentWidth) / steps;
    let currentStep = 0;
    
    const interval = setInterval(() => {
        currentStep++;
        const currentValue = Math.round(currentWidth + (stepValue * currentStep));
        progressBar.style.width = `${Math.max(0, Math.min(100, currentValue))}%`;
        
        if (currentStep >= steps) {
            clearInterval(interval);
            progressBar.style.width = `${Math.max(0, Math.min(100, targetPercentage))}%`;
        }
    }, duration / steps);
}

// ฟังก์ชันอัพเดทตัวบ่งชี้แนวโน้ม
function updateTrendIndicators(statistics) {
    const trendElements = document.querySelectorAll('.stat-trend');
    
    // โหลดสถิติก่อนหน้า
    const previousStats = JSON.parse(localStorage.getItem('previousStatistics') || '{}');
    
    trendElements.forEach((element, index) => {
        const trendValue = element.querySelector('span');
        if (trendValue) {
            let trend = 0;
            let currentValue = 0;
            let previousValue = 0;
            
            switch (index) {
                case 0: // เข้าเรียน
                    currentValue = statistics.totalPresent;
                    previousValue = previousStats.totalPresent || 0;
                    break;
                case 1: // ขาดเรียน
                    currentValue = statistics.totalAbsent;
                    previousValue = previousStats.totalAbsent || 0;
                    break;
                case 2: // มาสาย
                    currentValue = statistics.totalLate;
                    previousValue = previousStats.totalLate || 0;
                    break;
                case 3: // เปอร์เซ็นต์
                    currentValue = statistics.attendanceRate;
                    previousValue = previousStats.attendanceRate || 90;
                    break;
            }
            
            // คำนวณแนวโน้ม
            if (previousValue > 0) {
                trend = Math.round(((currentValue - previousValue) / previousValue) * 100);
            } else {
                trend = currentValue > 0 ? 5 : 0; // ค่าเริ่มต้น
            }
            
            // จำกัดค่าแนวโน้ม
            trend = Math.max(-99, Math.min(99, trend));
            
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
    
    // บันทึกสถิติปัจจุบันเป็นสถิติก่อนหน้าสำหรับครั้งถัดไป
    localStorage.setItem('previousStatistics', JSON.stringify(statistics));
}

// Event Listeners Setup
function setupEventListeners() {
    console.log('Setting up event listeners...');
    
    // Navigation links
    navLinks.forEach(link => {
        link.addEventListener('click', handleNavClick);
        link.addEventListener('mouseenter', showTooltip);
        link.addEventListener('mouseleave', hideTooltip);
    });

    // Action buttons
    actionButtons.forEach((btn, index) => {
        console.log(`Setting up button ${index + 1}:`, btn);
        
        btn.addEventListener('click', handleActionClick);
        btn.onclick = function(e) {
            handleActionClick.call(this, e);
        };
        btn.setAttribute('onclick', 'handleDirectClick(this)');
        
        btn.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleActionClick.call(this, e);
            }
        });
    });

    // Period selector
    if (periodSelector) {
        periodSelector.addEventListener('change', handlePeriodChange);
    }

    // Notification icon
    if (notificationIcon) {
        notificationIcon.addEventListener('click', handleNotificationClick);
    }

    // Window resize
    window.addEventListener('resize', handleWindowResize);
    
    // Visibility change
    document.addEventListener('visibilitychange', handleVisibilityChange);
}

// Action Button Click Handler
function handleActionClick(e) {
    console.log('Button clicked!', this);
    
    if (e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    const button = this;
    const targetPage = button.getAttribute('data-page');
    
    console.log('Target page:', targetPage);
    
    if (!targetPage) {
        console.error('No data-page attribute found on button');
        showErrorMessage('ไม่พบลิงก์ที่ต้องการ');
        return;
    }
    
    // Check user role for checkin features
    const userRole = getUserRole();
    if (isCheckinFeature(targetPage) && (userRole === 'student' || userRole === 'นักเรียน')) {
        console.log('Blocking checkin feature for student role');
        showErrorMessage('คุณไม่มีสิทธิ์เข้าถึงฟีเจอร์นี้');
        return;
    }
    
    // Disable button to prevent multiple clicks
    button.disabled = true;
    
    // Animation effect
    button.style.transform = 'scale(0.95)';
    button.style.transition = 'transform 0.1s ease';
    
    const originalContent = button.innerHTML;
    
    button.innerHTML = `
        <ion-icon name="hourglass"></ion-icon>
        <span>กำลังโหลด...</span>
        <div class="btn-ripple"></div>
    `;
    
    createRipple(button);
    
    setTimeout(() => {
        try {
            console.log('Attempting navigation to:', targetPage);
            window.location.href = targetPage;
        } catch (error) {
            console.error('Navigation error:', error);
            showErrorMessage('ไม่สามารถเปิดหน้านี้ได้ กรุณาลองใหม่อีกครั้ง');
            
            button.style.transform = 'scale(1)';
            button.innerHTML = originalContent;
            button.disabled = false;
        }
    }, 800);
}

// Helper functions
function isCheckinFeature(targetPage) {
    const checkinPages = [
        '/HTML/studens.html',
        '/HTML/students.html',
        '/HTML/checkin.html'
    ];
    return checkinPages.includes(targetPage);
}

// Navigation Click Handler
function handleNavClick(e) {
    e.preventDefault();
    
    const href = this.getAttribute('href');
    const userRole = getUserRole();
    
    if (isCheckinFeature(href) && (userRole === 'student' || userRole === 'นักเรียน')) {
        console.log('Blocking navigation to checkin feature for student role');
        showErrorMessage('คุณไม่มีสิทธิ์เข้าถึงหน้านี้');
        return;
    }
    
    navLinks.forEach(navLink => navLink.classList.remove('active'));
    this.classList.add('active');
    createRipple(this);
    
    setTimeout(() => {
        if (href && href !== '#') {
            window.location.href = href;
        }
    }, 200);
}

// Global function for direct onclick
function handleDirectClick(button) {
    console.log('Direct click function called');
    const targetPage = button.getAttribute('data-page');
    
    if (!targetPage) {
        console.error('No data-page attribute found');
        return;
    }
    
    const userRole = getUserRole();
    if (isCheckinFeature(targetPage) && (userRole === 'student' || userRole === 'นักเรียน')) {
        console.log('Blocking direct click to checkin feature for student role');
        showErrorMessage('คุณไม่มีสิทธิ์เข้าถึงฟีเจอร์นี้');
        return;
    }
    
    console.log('Direct navigation to:', targetPage);
    window.location.href = targetPage;
}

// Make functions globally available
window.handleDirectClick = handleDirectClick;
window.setUserRole = setUserRole;
window.getUserRole = getUserRole;

// Test and Debug functions
function testButtonClicks() {
    console.log('=== Testing Button Clicks ===');
    
    actionButtons.forEach((btn, index) => {
        const dataPage = btn.getAttribute('data-page');
        console.log(`Button ${index + 1}:`, {
            element: btn,
            dataPage: dataPage,
            hasClickListener: btn.onclick !== null,
            hasEventListener: btn.addEventListener !== undefined
        });
        
        btn.addEventListener('mousedown', function() {
            console.log(`Button ${index + 1} mousedown detected`);
        });
    });
}

function createRipple(element) {
    const ripple = element.querySelector('.nav-ripple, .btn-ripple');
    if (ripple) {
        ripple.classList.remove('active');
        ripple.offsetHeight;
        ripple.classList.add('active');
        
        setTimeout(() => {
            ripple.classList.remove('active');
        }, 600);
    }
}

function showErrorMessage(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #ff4757;
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        z-index: 9999;
        font-size: 14px;
        max-width: 300px;
        transform: translateX(100%);
        transition: transform 0.3s ease;
    `;
    
    errorDiv.innerHTML = `
        <ion-icon name="alert-circle" style="margin-right: 8px;"></ion-icon>
        ${message}
    `;
    
    document.body.appendChild(errorDiv);
    
    setTimeout(() => {
        errorDiv.style.transform = 'translateX(0)';
    }, 100);
    
    setTimeout(() => {
        errorDiv.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.parentNode.removeChild(errorDiv);
            }
        }, 300);
    }, 4000);
}

function debugButtons() {
    console.log('=== Button Debug Info ===');
    console.log('Total action buttons found:', actionButtons.length);
    console.log('Current user role:', getUserRole());
    
    actionButtons.forEach((btn, index) => {
        const dataPage = btn.getAttribute('data-page');
        console.log(`Button ${index + 1}:`, {
            element: btn,
            dataPage: dataPage,
            hasOnclick: btn.onclick !== null,
            classList: btn.classList.toString(),
            innerHTML: btn.innerHTML.substring(0, 50) + '...'
        });
    });
    
    const scanButton = document.querySelector('[data-page="/HTML/ScanQRCode.html"]');
    if (scanButton) {
        console.log('Scan button found:', scanButton);
    } else {
        console.log('Scan button NOT found!');
    }
}

// Date and Time Management
function updateDateTime() {
    const now = new Date();
    const dateOptions = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    };
    const timeOptions = { 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit' 
    };
    
    if (currentDateElement) {
        currentDateElement.textContent = now.toLocaleDateString('th-TH', dateOptions);
    }
    if (currentTimeElement) {
        currentTimeElement.textContent = now.toLocaleTimeString('th-TH', timeOptions);
    }
}

// Placeholder functions
function setActiveNavigation() {}
function loadUserData() {}
function setupFloatingAnimations() {}
function initializeTooltips() {}
function setupRippleEffects() {}
function loadWeatherData() {}
function setupScheduleUpdates() {}
function setupNotifications() {}
function setupProgressBars() {}
function setupCardAnimations() {}
function showTooltip() {}
function hideTooltip() {}
function handlePeriodChange() {}
function handleNotificationClick() {}
function handleWindowResize() {}
function handleVisibilityChange() {}

// Update time every second
setInterval(updateDateTime, 1000);

// Export functions for external use
window.CheckInSystem = {
    updateDateTime,
    debugButtons,
    handleActionClick,
    handleDirectClick,
    testButtonClicks,
    setUserRole,
    getUserRole,
    updateUIByRole,
    initializeUserRole,
    updateStatisticsFromScanData,
    calculateStatisticsFromData,
    updateStatisticsDisplay
};

// Cleanup function
function cleanup() {
    if (statisticsUpdateInterval) {
        clearInterval(statisticsUpdateInterval);
    }
}

// Cleanup on page unload
window.addEventListener('beforeunload', cleanup);

console.log('Enhanced Script with Statistics Sync loaded successfully!');

// User Management System - ระบบจัดการข้อมูลผู้ใช้และการซิงค์ข้อมูล

// ตัวแปรสำหรับเก็บข้อมูลผู้ใช้
let currentUserData = null;
let userRole = null;
let userStatistics = null;

// ฟังก์ชันตรวจสอบการล็อกอิน
function checkUserLogin() {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const userData = localStorage.getItem('userData');
    
    if (isLoggedIn !== 'true' || !userData) {
        console.log('User not logged in, redirecting to login page');
        window.location.href = '/HTML/Profile.html';
        return false;
    }
    
    try {
        currentUserData = JSON.parse(userData);
        userRole = currentUserData.role || localStorage.getItem('userRole') || 'student';
        console.log('User login verified:', currentUserData.username, 'Role:', userRole);
        return true;
    } catch (error) {
        console.error('Error parsing user data:', error);
        window.location.href = '/HTML/Profile.html';
        return false;
    }
}

// ฟังก์ชันอัพเดทการแสดงชื่อผู้ใช้
function updateUserDisplay() {
    if (!currentUserData) return;
    
    try {
        // อัพเดทชื่อผู้ใช้
        const userNameElement = document.getElementById('displayUserName');
        if (userNameElement && currentUserData.firstName && currentUserData.lastName) {
            userNameElement.textContent = `${currentUserData.firstName} ${currentUserData.lastName}`;
        }
        
        // อัพเดทบทบาท
        const userRoleElement = document.getElementById('displayUserRole');
        if (userRoleElement) {
            const roleDisplay = getRoleDisplayName(userRole);
            userRoleElement.textContent = roleDisplay;
        }
        
        // อัพเดทข้อมูลเพิ่มเติม
        updateAdditionalUserInfo();
        
        console.log('User display updated successfully');
        
    } catch (error) {
        console.error('Error updating user display:', error);
    }
}

// ฟังก์ชันแปลงชื่อบทบาทเป็นภาษาไทย
function getRoleDisplayName(role) {
    const roleNames = {
        'student': 'นักเรียน',
        'teacher': 'ครู',
        'admin': 'ผู้ดูแลระบบ'
    };
    return roleNames[role] || currentUserData.roleDisplay || role || 'ผู้ใช้งาน';
}

// ฟังก์ชันอัพเดทข้อมูลผู้ใช้เพิ่มเติม
function updateAdditionalUserInfo() {
    // อัพเดทข้อมูลในส่วนต่างๆ ของหน้า
    const welcomeElements = document.querySelectorAll('.welcome-user-name');
    welcomeElements.forEach(element => {
        if (currentUserData.firstName) {
            element.textContent = currentUserData.firstName;
        }
    });
    
    // อัพเดทรหัสนักเรียน/ครู
    const idElements = document.querySelectorAll('.user-id');
    idElements.forEach(element => {
        if (currentUserData.studentId || currentUserData.teacherId) {
            element.textContent = currentUserData.studentId || currentUserData.teacherId || 'ไม่ระบุ';
        }
    });
    
    // อัพเดทชั้นเรียน
    const classElements = document.querySelectorAll('.user-class');
    classElements.forEach(element => {
        if (currentUserData.class) {
            element.textContent = currentUserData.class;
        }
    });
}

// ฟังก์ชันตั้งค่าสิทธิ์ตามบทบาท
function setupRoleBasedFeatures() {
    if (!userRole) return;
    
    console.log('Setting up role-based features for:', userRole);
    
    const checkinElements = document.querySelectorAll('.checkin-feature');
    
    if (userRole === 'student' || userRole === 'นักเรียน') {
        // ซ่อนฟีเจอร์เช็คอินสำหรับนักเรียน
        checkinElements.forEach(element => {
            element.style.display = 'none';
            element.style.visibility = 'hidden';
            element.setAttribute('aria-hidden', 'true');
        });
        
        document.body.classList.add('role-student');
        document.body.classList.remove('role-teacher', 'role-admin');
        
        console.log('Hidden checkin features for student');
        
    } else if (userRole === 'teacher' || userRole === 'ครู') {
        // แสดงฟีเจอร์เช็คอินสำหรับครู
        checkinElements.forEach(element => {
            element.style.display = '';
            element.style.visibility = '';
            element.removeAttribute('aria-hidden');
        });
        
        document.body.classList.add('role-teacher');
        document.body.classList.remove('role-student', 'role-admin');
        
        console.log('Shown checkin features for teacher');
        
    } else if (userRole === 'admin' || userRole === 'ผู้ดูแลระบบ') {
        // แสดงฟีเจอร์ทั้งหมดสำหรับแอดมิน
        checkinElements.forEach(element => {
            element.style.display = '';
            element.style.visibility = '';
            element.removeAttribute('aria-hidden');
        });
        
        document.body.classList.add('role-admin');
        document.body.classList.remove('role-student', 'role-teacher');
        
        console.log('Shown all features for admin');
    }
    
    // อัพเดท navigation menu
    updateNavigationByRole();
    
    // ตั้งค่า user role ใน global scope
    if (typeof setUserRole === 'function') {
        setUserRole(userRole);
    }
}

// ฟังก์ชันอัพเดท navigation ตามบทบาท
function updateNavigationByRole() {
    const checkinNavItems = document.querySelectorAll('.nav-item.checkin-feature');
    
    if (userRole === 'student' || userRole === 'นักเรียน') {
        checkinNavItems.forEach(item => {
            item.style.display = 'none';
        });
    } else {
        checkinNavItems.forEach(item => {
            item.style.display = '';
        });
    }
}

// ฟังก์ชันโหลดและซิงค์สถิติผู้ใช้
function loadAndSyncUserStatistics() {
    if (!currentUserData) return;
    
    try {
        // โหลดสถิติจาก localStorage
        const savedStats = localStorage.getItem('attendanceStatistics');
        const attendanceData = localStorage.getItem('studentAttendanceData');
        
        if (savedStats) {
            userStatistics = JSON.parse(savedStats);
        }
        
        // คำนวณสถิติจากข้อมูลการเข้าเรียนล่าสุด
        if (attendanceData) {
            const newStats = calculateUserStatistics(JSON.parse(attendanceData));
            if (newStats) {
                userStatistics = newStats;
                updateStatisticsInUserData();
            }
        }
        
        // ใช้ข้อมูลเริ่มต้นถ้าไม่มีสถิติ
        if (!userStatistics) {
            userStatistics = getDefaultUserStatistics();
        }
        
        console.log('User statistics loaded:', userStatistics);
        
    } catch (error) {
        console.error('Error loading user statistics:', error);
        userStatistics = getDefaultUserStatistics();
    }
}

// ฟังก์ชันคำนวณสถิติผู้ใช้
function calculateUserStatistics(attendanceData) {
    let totalPresent = 0;
    let totalAbsent = 0;
    let totalLate = 0;
    let totalLeave = 0;
    
    // รวบรวมข้อมูลจากทุกระดับชั้น
    if (attendanceData.gradeData) {
        Object.keys(attendanceData.gradeData).forEach(grade => {
            attendanceData.gradeData[grade].forEach(student => {
                // กรองเฉพาะข้อมูลของผู้ใช้ปัจจุบัน (ถ้ามี)
                if (student.username === currentUserData.username || !student.username) {
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
                }
            });
        });
    }
    
    // คำนวณเปอร์เซ็นต์การเข้าเรียน
    const total = totalPresent + totalAbsent + totalLate + totalLeave;
    const attendanceRate = total > 0 ? 
        Math.round(((totalPresent + totalLate) / total) * 100) : 0;
    
    return {
        totalPresent,
        totalAbsent,
        totalLate,
        totalLeave,
        attendanceRate,
        lastUpdated: new Date().toISOString()
    };
}

// ฟังก์ชันได้รับสถิติเริ่มต้น
function getDefaultUserStatistics() {
    return {
        totalPresent: currentUserData.attendedDays || 18,
        totalAbsent: currentUserData.absentDays || 2,
        totalLate: currentUserData.lateDays || 1,
        totalLeave: 0,
        attendanceRate: currentUserData.attendanceRate || 90,
        lastUpdated: new Date().toISOString()
    };
}

// ฟังก์ชันอัพเดทสถิติใน userData
function updateStatisticsInUserData() {
    if (!userStatistics || !currentUserData) return;
    
    currentUserData.attendedDays = userStatistics.totalPresent;
    currentUserData.absentDays = userStatistics.totalAbsent;
    currentUserData.lateDays = userStatistics.totalLate;
    currentUserData.attendanceRate = userStatistics.attendanceRate;
    
    // บันทึกกลับไปยัง localStorage
    try {
        localStorage.setItem('userData', JSON.stringify(currentUserData));
        console.log('User statistics updated in userData');
    } catch (error) {
        console.error('Error saving updated userData:', error);
    }
}

// ฟังก์ชันปรับแต่งข้อความต้อนรับ
function personalizeWelcomeMessage() {
    if (!currentUserData.firstName) return;
    
    // อัพเดทข้อความต้อนรับ
    const welcomeTitle = document.querySelector('.welcome-section h2');
    if (welcomeTitle) {
        welcomeTitle.textContent = `ยินดีต้อนรับ คุณ${currentUserData.firstName}`;
    }
    
    // อัพเดทข้อความรอง
    const welcomeSubtitle = document.querySelector('.welcome-section p');
    if (welcomeSubtitle) {
        const greetingTime = getGreetingTime();
        welcomeSubtitle.textContent = `${greetingTime} วันนี้เป็นอย่างไรบ้าง? จัดการการเข้าเรียนของคุณได้อย่างง่ายดาย`;
    }
}

// ฟังก์ชันกำหนดคำทักทายตามเวลา
function getGreetingTime() {
    const hour = new Date().getHours();
    
    if (hour < 12) {
        return 'สวัสดีตอนเช้า';
    } else if (hour < 17) {
        return 'สวัสดีตอนบ่าย';
    } else {
        return 'สวัสดีตอนเย็น';
    }
}

// ฟังก์ชันแสดงข้อมูลเฉพาะบทบาท
function displayRoleSpecificContent() {
    if (!userRole || !currentUserData) return;
    
    switch (userRole) {
        case 'student':
        case 'นักเรียน':
            displayStudentContent();
            break;
        case 'teacher':
        case 'ครู':
            displayTeacherContent();
            break;
        case 'admin':
        case 'ผู้ดูแลระบบ':
            displayAdminContent();
            break;
    }
}

// ฟังก์ชันแสดงเนื้อหาสำหรับนักเรียน
function displayStudentContent() {
    // อัพเดทรหัสนักเรียน
    const studentIdElements = document.querySelectorAll('.student-id');
    studentIdElements.forEach(element => {
        element.textContent = currentUserData.studentId || 'ไม่ระบุ';
    });
    
    // อัพเดทชั้นเรียน
    const classElements = document.querySelectorAll('.student-class');
    classElements.forEach(element => {
        element.textContent = currentUserData.class || 'ไม่ระบุ';
    });
    
    // ปรับแต่งเมนูสำหรับนักเรียน
    customizeStudentMenu();
}

// ฟังก์ชันแสดงเนื้อหาสำหรับครู
function displayTeacherContent() {
    // อัพเดทรหัสครู
    const teacherIdElements = document.querySelectorAll('.teacher-id');
    teacherIdElements.forEach(element => {
        element.textContent = currentUserData.teacherId || currentUserData.studentId || 'ไม่ระบุ';
    });
    
    // แสดงข้อมูลวิชาที่สอน
    const subjectElements = document.querySelectorAll('.teacher-subjects');
    subjectElements.forEach(element => {
        element.textContent = currentUserData.subjects || 'ไม่ระบุ';
    });
}

// ฟังก์ชันแสดงเนื้อหาสำหรับแอดมิน
function displayAdminContent() {
    console.log('Admin content displayed for:', currentUserData.firstName);
    
    // เพิ่มตัวเลือกพิเศษสำหรับแอดมิน
    addAdminControls();
}

// ฟังก์ชันปรับแต่งเมนูสำหรับนักเรียน
function customizeStudentMenu() {
    // เปลี่ยนข้อความในปุ่มต่างๆ ให้เหมาะสมกับนักเรียน
    const actionButtons = document.querySelectorAll('.action-btn');
    actionButtons.forEach(button => {
        const span = button.querySelector('span');
        if (span && span.textContent === 'เช็คอิน') {
            span.textContent = 'ดูสถิติ';
            button.setAttribute('data-page', '/HTML/Scan.html');
        }
    });
}

// ฟังก์ชันเพิ่มตัวควบคุมสำหรับแอดมิน
function addAdminControls() {
    // เพิ่มปุ่มจัดการระบบสำหรับแอดมิน
    const userSection = document.querySelector('.user-section');
    if (userSection && !userSection.querySelector('.admin-controls')) {
        const adminControls = document.createElement('div');
        adminControls.className = 'admin-controls';
        adminControls.innerHTML = `
            <button class="admin-btn" onclick="openSystemSettings()" title="ตั้งค่าระบบ">
                <ion-icon name="settings-outline"></ion-icon>
            </button>
        `;
        userSection.appendChild(adminControls);
    }
}

// ฟังก์ชันออกจากระบบ
function logout() {
    if (confirm('คุณต้องการออกจากระบบหรือไม่?')) {
        try {
            // ลบข้อมูลการล็อกอิน
            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('userData');
            localStorage.removeItem('userRole');
            localStorage.removeItem('attendanceStatistics');
            
            // รีเซ็ตตัวแปร
            currentUserData = null;
            userRole = null;
            userStatistics = null;
            
            console.log('User logged out successfully');
            
            // กลับไปหน้าล็อกอิน
            window.location.href = '/HTML/Profile.html';
            
        } catch (error) {
            console.error('Error during logout:', error);
            alert('เกิดข้อผิดพลาดในการออกจากระบบ');
        }
    }
}

// ฟังก์ชันเพิ่มปุ่มออกจากระบบ
function addLogoutButton() {
    const userSection = document.querySelector('.user-section');
    if (userSection && !userSection.querySelector('.logout-btn')) {
        const logoutBtn = document.createElement('button');
        logoutBtn.innerHTML = '<ion-icon name="log-out-outline"></ion-icon>';
        logoutBtn.className = 'logout-btn';
        logoutBtn.onclick = logout;
        logoutBtn.title = 'ออกจากระบบ';
        logoutBtn.style.cssText = `
            background: none;
            border: none;
            color: #64748b;
            cursor: pointer;
            padding: 8px;
            border-radius: 6px;
            margin-left: 10px;
            transition: all 0.2s ease;
        `;
        
        // Add hover effect
        logoutBtn.addEventListener('mouseenter', function() {
            this.style.backgroundColor = '#f1f5f9';
            this.style.color = '#ef4444';
        });
        
        logoutBtn.addEventListener('mouseleave', function() {
            this.style.backgroundColor = 'transparent';
            this.style.color = '#64748b';
        });
        
        userSection.appendChild(logoutBtn);
    }
}

// ฟังก์ชันการนำทางที่มีการตรวจสอบสิทธิ์
function navigateWithAuth(page) {
    if (!userRole) {
        console.warn('User role not set, cannot navigate');
        return;
    }
    
    // ตรวจสอบสิทธิ์สำหรับหน้าต่างๆ
    const restrictedPages = ['/HTML/studens.html', '/HTML/students.html', '/HTML/checkin.html'];
    
    if (restrictedPages.some(p => page.includes(p)) && 
        (userRole === 'student' || userRole === 'นักเรียน')) {
        
        showAccessDeniedMessage('คุณไม่มีสิทธิ์เข้าถึงหน้านี้');
        return;
    }
    
    // Navigation ปกติ
    window.location.href = page;
}

// ฟังก์ชันแสดงข้อความไม่มีสิทธิ์เข้าถึง
function showAccessDeniedMessage(message) {
    const alertDiv = document.createElement('div');
    alertDiv.className = 'access-denied-alert';
    alertDiv.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        border: 2px solid #ef4444;
        border-radius: 12px;
        padding: 20px;
        box-shadow: 0 10px 25px rgba(0,0,0,0.2);
        z-index: 10000;
        text-align: center;
        max-width: 400px;
        width: 90%;
    `;
    
    alertDiv.innerHTML = `
        <div style="color: #ef4444; font-size: 48px; margin-bottom: 16px;">
            <ion-icon name="lock-closed"></ion-icon>
        </div>
        <h3 style="color: #ef4444; margin-bottom: 12px;">ไม่มีสิทธิ์เข้าถึง</h3>
        <p style="color: #64748b; margin-bottom: 20px;">${message}</p>
        <button onclick="closeAccessDeniedAlert()" style="
            background: #ef4444;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 6px;
            cursor: pointer;
            font-weight: 500;
        ">ตกลง</button>
    `;
    
    document.body.appendChild(alertDiv);
    
    // Auto close after 5 seconds
    setTimeout(() => {
        closeAccessDeniedAlert();
    }, 5000);
}

// ฟังก์ชันปิด alert
function closeAccessDeniedAlert() {
    const alert = document.querySelector('.access-denied-alert');
    if (alert) {
        alert.remove();
    }
}

// ฟังก์ชันสำหรับตั้งค่าระบบ (สำหรับแอดมิน)
function openSystemSettings() {
    if (userRole !== 'admin' && userRole !== 'ผู้ดูแลระบบ') {
        showAccessDeniedMessage('เฉพาะผู้ดูแลระบบเท่านั้นที่สามารถเข้าถึงการตั้งค่าได้');
        return;
    }
    
    // เปิดหน้าตั้งค่าระบบ
    window.location.href = '/HTML/admin-settings.html';
}

// ฟังก์ชันติดตามการเปลี่ยนแปลงข้อมูลผู้ใช้
function watchUserDataChanges() {
    // ฟังการเปลี่ยนแปลงใน localStorage
    window.addEventListener('storage', function(e) {
        if (e.key === 'userData') {
            console.log('User data changed, reloading...');
            
            try {
                const newUserData = JSON.parse(e.newValue || '{}');
                if (newUserData.username !== currentUserData?.username) {
                    // ผู้ใช้เปลี่ยน - รีโหลดหน้า
                    window.location.reload();
                } else {
                    // อัพเดทข้อมูลเดิม
                    currentUserData = newUserData;
                    updateUserDisplay();
                }
            } catch (error) {
                console.error('Error handling user data change:', error);
            }
        } else if (e.key === 'isLoggedIn' && e.newValue !== 'true') {
            // ถูกล็อกเอาท์จากที่อื่น
            window.location.href = '/HTML/Profile.html';
        }
    });
}

// ฟังก์ชันเริ่มต้นระบบจัดการผู้ใช้
function initializeUserManagement() {
    console.log('Initializing user management system...');
    
    // ตรวจสอบการล็อกอิน
    if (!checkUserLogin()) {
        return false;
    }
    
    // อัพเดทการแสดงผล
    updateUserDisplay();
    
    // ตั้งค่าสิทธิ์ตามบทบาท
    setupRoleBasedFeatures();
    
    // โหลดและซิงค์สถิติ
    loadAndSyncUserStatistics();
    
    // ปรับแต่งข้อความต้อนรับ
    personalizeWelcomeMessage();
    
    // แสดงเนื้อหาเฉพาะบทบาท
    displayRoleSpecificContent();
    
    // เพิ่มปุ่มออกจากระบบ
    addLogoutButton();
    
    // ติดตามการเปลี่ยนแปลงข้อมูล
    watchUserDataChanges();
    
    console.log('User management system initialized successfully');
    return true;
}

// ฟังก์ชันเพิ่ม event listener สำหรับปุ่มที่มีการตรวจสอบสิทธิ์
function setupAuthenticatedEventListeners() {
    // เพิ่ม event listener สำหรับปุ่มที่มี data-page
    document.addEventListener('click', function(e) {
        const element = e.target.closest('[data-page]');
        if (element) {
            e.preventDefault();
            const page = element.getAttribute('data-page');
            navigateWithAuth(page);
        }
    });
    
    // เพิ่ม event listener สำหรับ navigation links
    document.addEventListener('click', function(e) {
        const navLink = e.target.closest('.nav-link[href]');
        if (navLink) {
            const href = navLink.getAttribute('href');
            if (href && href !== '#' && !href.startsWith('javascript:')) {
                e.preventDefault();
                navigateWithAuth(href);
            }
        }
    });
}

// Export functions for global use
window.UserManagement = {
    initialize: initializeUserManagement,
    checkLogin: checkUserLogin,
    updateDisplay: updateUserDisplay,
    logout: logout,
    getCurrentUser: () => currentUserData,
    getUserRole: () => userRole,
    getUserStatistics: () => userStatistics,
    navigateWithAuth: navigateWithAuth
};

// Make functions globally available
window.logout = logout;
window.navigateWithAuth = navigateWithAuth;
window.closeAccessDeniedAlert = closeAccessDeniedAlert;
window.openSystemSettings = openSystemSettings;

// Auto-initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    if (initializeUserManagement()) {
        setupAuthenticatedEventListeners();
    }
});

console.log('User Management System loaded successfully!');

// Enhanced Multi-User System for Scan Check In
// ระบบสนับสนุนผู้ใช้หลายคนพร้อมกัน

// ===== 1. MULTI-USER DATA STRUCTURE =====
const MultiUserSystem = {
    currentSession: null,
    activeSessions: new Map(),
    sessionTimeout: 30 * 60 * 1000, // 30 minutes
    maxConcurrentUsers: 50, // จำกัดผู้ใช้พร้อมกัน
    
    // สร้าง Session ID เฉพาะ
    generateSessionId() {
        return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    },
    
    // สร้าง User Session
    createUserSession(userData) {
        const sessionId = this.generateSessionId();
        const session = {
            sessionId: sessionId,
            userData: userData,
            role: userData.role || 'student',
            loginTime: new Date().toISOString(),
            lastActivity: new Date().toISOString(),
            isActive: true,
            statistics: null,
            preferences: {}
        };
        
        this.activeSessions.set(sessionId, session);
        this.currentSession = session;
        
        // บันทึกใน localStorage พร้อม session ID
        this.saveSessionToStorage(session);
        
        console.log('User session created:', sessionId, 'for user:', userData.username);
        return session;
    },
    
    // บันทึก Session ลง localStorage
    saveSessionToStorage(session) {
        const sessionData = {
            sessionId: session.sessionId,
            userData: session.userData,
            role: session.role,
            loginTime: session.loginTime,
            lastActivity: session.lastActivity,
            statistics: session.statistics,
            preferences: session.preferences
        };
        
        // บันทึกข้อมูล session ปัจจุบัน
        localStorage.setItem('currentSession', JSON.stringify(sessionData));
        
        // บันทึกรายการ session ทั้งหมด
        const allSessions = this.getAllSessionsFromStorage();
        allSessions[session.sessionId] = sessionData;
        localStorage.setItem('allUserSessions', JSON.stringify(allSessions));
        
        // เก็บข้อมูลสถิติแยกตาม user
        const userStatsKey = `userStats_${session.userData.username}`;
        if (session.statistics) {
            localStorage.setItem(userStatsKey, JSON.stringify(session.statistics));
        }
    },
    
    // ดึงข้อมูล Session ทั้งหมดจาก localStorage
    getAllSessionsFromStorage() {
        try {
            return JSON.parse(localStorage.getItem('allUserSessions') || '{}');
        } catch (error) {
            console.error('Error loading sessions:', error);
            return {};
        }
    },
    
    // โหลด Session ปัจจุบัน
    loadCurrentSession() {
        try {
            const sessionData = localStorage.getItem('currentSession');
            if (sessionData) {
                const session = JSON.parse(sessionData);
                
                // ตรวจสอบว่า session ยังไม่หมดอายุ
                const sessionAge = Date.now() - new Date(session.loginTime).getTime();
                if (sessionAge < this.sessionTimeout) {
                    this.currentSession = session;
                    this.activeSessions.set(session.sessionId, session);
                    return session;
                }
            }
            return null;
        } catch (error) {
            console.error('Error loading current session:', error);
            return null;
        }
    },
    
    // อัปเดตกิจกรรมล่าสุด
    updateLastActivity(sessionId = null) {
        const targetSessionId = sessionId || this.currentSession?.sessionId;
        if (!targetSessionId) return;
        
        const session = this.activeSessions.get(targetSessionId);
        if (session) {
            session.lastActivity = new Date().toISOString();
            this.saveSessionToStorage(session);
        }
    },
    
    // ตรวจสอบและล้าง Session ที่หมดอายุ
    cleanExpiredSessions() {
        const now = Date.now();
        const expiredSessions = [];
        
        this.activeSessions.forEach((session, sessionId) => {
            const lastActivity = new Date(session.lastActivity).getTime();
            if (now - lastActivity > this.sessionTimeout) {
                expiredSessions.push(sessionId);
            }
        });
        
        // ลบ Session ที่หมดอายุ
        expiredSessions.forEach(sessionId => {
            this.activeSessions.delete(sessionId);
            console.log('Expired session removed:', sessionId);
        });
        
        // อัปเดต localStorage
        this.updateStorageAfterCleanup();
        
        return expiredSessions.length;
    },
    
    // อัปเดต Storage หลังจากลบ Session ที่หมดอายุ
    updateStorageAfterCleanup() {
        const activeSessions = {};
        this.activeSessions.forEach((session, sessionId) => {
            activeSessions[sessionId] = {
                sessionId: session.sessionId,
                userData: session.userData,
                role: session.role,
                loginTime: session.loginTime,
                lastActivity: session.lastActivity,
                statistics: session.statistics,
                preferences: session.preferences
            };
        });
        localStorage.setItem('allUserSessions', JSON.stringify(activeSessions));
    },
    
    // ล็อกเอาต์ Session ปัจจุบัน
    logoutCurrentSession() {
        if (!this.currentSession) return;
        
        const sessionId = this.currentSession.sessionId;
        
        // ลบจาก activeSessions
        this.activeSessions.delete(sessionId);
        
        // ลบจาก localStorage
        localStorage.removeItem('currentSession');
        const allSessions = this.getAllSessionsFromStorage();
        delete allSessions[sessionId];
        localStorage.setItem('allUserSessions', JSON.stringify(allSessions));
        
        // รีเซ็ต current session
        this.currentSession = null;
        
        console.log('Session logged out:', sessionId);
    },
    
    // ได้รับข้อมูลผู้ใช้ทั้งหมดที่ออนไลน์
    getOnlineUsers() {
        this.cleanExpiredSessions(); // ล้าง session หมดอายุก่อน
        
        const onlineUsers = [];
        this.activeSessions.forEach(session => {
            if (session.isActive) {
                onlineUsers.push({
                    username: session.userData.username,
                    firstName: session.userData.firstName,
                    lastName: session.userData.lastName,
                    role: session.role,
                    loginTime: session.loginTime,
                    lastActivity: session.lastActivity
                });
            }
        });
        
        return onlineUsers;
    }
};

// ===== 2. ENHANCED USER MANAGEMENT =====
const EnhancedUserManager = {
    currentUser: null,
    userSessions: new Map(),
    
    // ล็อกอินผู้ใช้ใหม่
    async loginUser(loginData) {
        try {
            // ตรวจสอบจำนวนผู้ใช้ออนไลน์
            if (MultiUserSystem.activeSessions.size >= MultiUserSystem.maxConcurrentUsers) {
                throw new Error('ระบบเต็ม กรุณาลองใหม่ในภายหลัง');
            }
            
            // สร้าง session ใหม่
            const session = MultiUserSystem.createUserSession(loginData);
            this.currentUser = session;
            
            // โหลดสถิติเฉพาะของผู้ใช้
            await this.loadUserSpecificData(session);
            
            // อัปเดต UI
            this.updateUserInterface(session);
            
            // เริ่มต้น activity tracking
            this.startActivityTracking();
            
            return session;
            
        } catch (error) {
            console.error('Login failed:', error);
            throw error;
        }
    },
    
    // โหลดข้อมูลเฉพาะของผู้ใช้
    async loadUserSpecificData(session) {
        const username = session.userData.username;
        
        // โหลดสถิติเฉพาะของผู้ใช้
        const userStatsKey = `userStats_${username}`;
        const userStats = localStorage.getItem(userStatsKey);
        if (userStats) {
            session.statistics = JSON.parse(userStats);
        } else {
            // สร้างสถิติเริ่มต้น
            session.statistics = this.createDefaultStats(session.userData);
            localStorage.setItem(userStatsKey, JSON.stringify(session.statistics));
        }
        
        // โหลดการตั้งค่าเฉพาะของผู้ใช้
        const userPrefsKey = `userPrefs_${username}`;
        const userPrefs = localStorage.getItem(userPrefsKey);
        if (userPrefs) {
            session.preferences = JSON.parse(userPrefs);
        } else {
            session.preferences = this.createDefaultPreferences();
            localStorage.setItem(userPrefsKey, JSON.stringify(session.preferences));
        }
        
        // โหลดข้อมูลการเข้าเรียนเฉพาะของผู้ใช้
        await this.loadUserAttendanceData(session);
    },
    
    // โหลดข้อมูลการเข้าเรียนเฉพาะของผู้ใช้
    async loadUserAttendanceData(session) {
        const username = session.userData.username;
        const attendanceKey = `attendance_${username}`;
        
        const attendanceData = localStorage.getItem(attendanceKey);
        if (attendanceData) {
            session.attendanceData = JSON.parse(attendanceData);
        } else {
            session.attendanceData = this.createDefaultAttendanceData();
            localStorage.setItem(attendanceKey, JSON.stringify(session.attendanceData));
        }
    },
    
    // สร้างสถิติเริ่มต้น
    createDefaultStats(userData) {
        return {
            totalPresent: userData.attendedDays || 0,
            totalAbsent: userData.absentDays || 0,
            totalLate: userData.lateDays || 0,
            totalLeave: 0,
            attendanceRate: userData.attendanceRate || 0,
            lastUpdated: new Date().toISOString()
        };
    },
    
    // สร้างการตั้งค่าเริ่มต้น
    createDefaultPreferences() {
        return {
            theme: 'light',
            language: 'th',
            notifications: true,
            autoLogout: 30,
            dashboard: {
                showStatistics: true,
                showSchedule: true,
                showActivities: true
            }
        };
    },
    
    // สร้างข้อมูลการเข้าเรียนเริ่มต้น
    createDefaultAttendanceData() {
        return {
            records: [],
            summary: {
                present: 0,
                absent: 0,
                late: 0,
                leave: 0
            },
            lastUpdated: new Date().toISOString()
        };
    },
    
    // อัปเดต UI สำหรับผู้ใช้
    updateUserInterface(session) {
        const userData = session.userData;
        
        // อัปเดตชื่อผู้ใช้
        const userNameElement = document.getElementById('displayUserName');
        if (userNameElement && userData.firstName && userData.lastName) {
            userNameElement.textContent = `${userData.firstName} ${userData.lastName}`;
        }
        
        // อัปเดตบทบาท
        const userRoleElement = document.getElementById('displayUserRole');
        if (userRoleElement) {
            userRoleElement.textContent = this.getRoleDisplayName(session.role);
        }
        
        // อัปเดตสถิติ
        if (session.statistics) {
            this.updateStatisticsDisplay(session.statistics);
        }
        
        // ตั้งค่าสิทธิ์ตามบทบาท
        this.setupRoleBasedAccess(session.role);
        
        // แสดงข้อมูลออนไลน์
        this.displayOnlineStatus();
    },
    
    // แสดงสถานะออนไลน์
    displayOnlineStatus() {
        const onlineUsers = MultiUserSystem.getOnlineUsers();
        
        // สร้าง indicator สำหรับผู้ใช้ออนไลน์
        let onlineIndicator = document.querySelector('.online-users-indicator');
        if (!onlineIndicator) {
            onlineIndicator = document.createElement('div');
            onlineIndicator.className = 'online-users-indicator';
            onlineIndicator.style.cssText = `
                position: fixed;
                bottom: 20px;
                right: 20px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 8px 12px;
                border-radius: 20px;
                font-size: 12px;
                font-weight: 500;
                box-shadow: 0 4px 12px rgba(0,0,0,0.2);
                z-index: 1000;
                cursor: pointer;
                transition: all 0.3s ease;
            `;
            document.body.appendChild(onlineIndicator);
            
            // เพิ่ม hover effect
            onlineIndicator.addEventListener('mouseenter', () => {
                onlineIndicator.style.transform = 'scale(1.05)';
            });
            onlineIndicator.addEventListener('mouseleave', () => {
                onlineIndicator.style.transform = 'scale(1)';
            });
        }
        
        onlineIndicator.innerHTML = `
            <ion-icon name="people" style="margin-right: 6px;"></ion-icon>
            ${onlineUsers.length} คนออนไลน์
        `;
        
        // เพิ่ม tooltip แสดงรายชื่อ
        onlineIndicator.title = onlineUsers.map(user => 
            `${user.firstName} ${user.lastName} (${this.getRoleDisplayName(user.role)})`
        ).join('\n');
    },
    
    // ได้รับชื่อบทบาทภาษาไทย
    getRoleDisplayName(role) {
        const roleNames = {
            'student': 'นักเรียน',
            'teacher': 'ครู', 
            'admin': 'ผู้ดูแลระบบ'
        };
        return roleNames[role] || role;
    },
    
    // ตั้งค่าสิทธิ์ตามบทบาท
    setupRoleBasedAccess(role) {
        const checkinElements = document.querySelectorAll('.checkin-feature');
        
        if (role === 'student') {
            checkinElements.forEach(element => {
                element.style.display = 'none';
            });
        } else {
            checkinElements.forEach(element => {
                element.style.display = '';
            });
        }
    },
    
    // อัปเดตการแสดงสถิติ
    updateStatisticsDisplay(statistics) {
        // อัปเดตตัวเลขสถิติ
        const elements = {
            present: document.querySelector('.stat-card.attendance h4'),
            absent: document.querySelector('.stat-card.absence h4'),
            late: document.querySelector('.stat-card.late h4'),
            percentage: document.querySelector('.stat-card.percentage h4')
        };
        
        if (elements.present) {
            this.animateNumber(elements.present, statistics.totalPresent);
        }
        if (elements.absent) {
            this.animateNumber(elements.absent, statistics.totalAbsent);
        }
        if (elements.late) {
            this.animateNumber(elements.late, statistics.totalLate);
        }
        if (elements.percentage) {
            elements.percentage.textContent = `${statistics.attendanceRate}%`;
        }
    },
    
    // แอนิเมชันตัวเลข
    animateNumber(element, targetValue) {
        const currentValue = parseInt(element.textContent) || 0;
        const duration = 1000;
        const steps = 30;
        const stepValue = (targetValue - currentValue) / steps;
        let currentStep = 0;
        
        const interval = setInterval(() => {
            currentStep++;
            const value = Math.round(currentValue + (stepValue * currentStep));
            element.textContent = value;
            
            if (currentStep >= steps) {
                clearInterval(interval);
                element.textContent = targetValue;
            }
        }, duration / steps);
    },
    
    // เริ่มต้นการติดตามกิจกรรม
    startActivityTracking() {
        // อัปเดตกิจกรรมทุกๆ 30 วินาที
        setInterval(() => {
            MultiUserSystem.updateLastActivity();
        }, 30000);
        
        // ล้าง session หมดอายุทุกๆ 5 นาที
        setInterval(() => {
            const cleaned = MultiUserSystem.cleanExpiredSessions();
            if (cleaned > 0) {
                this.displayOnlineStatus(); // อัปเดตจำนวนผู้ใช้ออนไลน์
            }
        }, 300000);
        
        // ติดตามการเคลื่อนไหวของเมาส์และคีย์บอร์ด
        ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'].forEach(event => {
            document.addEventListener(event, () => {
                MultiUserSystem.updateLastActivity();
            }, { passive: true });
        });
    },
    
    // บันทึกข้อมูลผู้ใช้
    saveUserData(sessionId = null) {
        const session = sessionId ? 
            MultiUserSystem.activeSessions.get(sessionId) : 
            this.currentUser;
            
        if (!session) return;
        
        const username = session.userData.username;
        
        // บันทึกสถิติ
        if (session.statistics) {
            localStorage.setItem(`userStats_${username}`, JSON.stringify(session.statistics));
        }
        
        // บันทึกการตั้งค่า
        if (session.preferences) {
            localStorage.setItem(`userPrefs_${username}`, JSON.stringify(session.preferences));
        }
        
        // บันทึกข้อมูลการเข้าเรียน
        if (session.attendanceData) {
            localStorage.setItem(`attendance_${username}`, JSON.stringify(session.attendanceData));
        }
        
        // อัปเดต session
        MultiUserSystem.saveSessionToStorage(session);
    },
    
    // ล็อกเอาต์
    async logout() {
        if (!this.currentUser) return;
        
        // บันทึกข้อมูลก่อนล็อกเอาต์
        this.saveUserData();
        
        // ลบ online indicator
        const onlineIndicator = document.querySelector('.online-users-indicator');
        if (onlineIndicator) {
            onlineIndicator.remove();
        }
        
        // ล็อกเอาต์ session
        MultiUserSystem.logoutCurrentSession();
        
        // รีเซ็ตตัวแปร
        this.currentUser = null;
        
        // กลับไปหน้าล็อกอิน
        window.location.href = '/HTML/Profile.html';
    }
};

// ===== 3. CONCURRENT DATA MANAGEMENT =====
const ConcurrentDataManager = {
    syncQueue: new Map(),
    isSyncing: false,
    
    // อัปเดตข้อมูลพร้อมกัน
    async updateUserData(username, dataType, newData) {
        const updateKey = `${username}_${dataType}_${Date.now()}`;
        
        this.syncQueue.set(updateKey, {
            username,
            dataType,
            data: newData,
            timestamp: Date.now()
        });
        
        if (!this.isSyncing) {
            await this.processSyncQueue();
        }
    },
    
    // ประมวลผลคิวการซิงค์
    async processSyncQueue() {
        if (this.isSyncing) return;
        this.isSyncing = true;
        
        try {
            for (const [key, update] of this.syncQueue) {
                await this.processUpdate(update);
                this.syncQueue.delete(key);
            }
        } catch (error) {
            console.error('Sync error:', error);
        } finally {
            this.isSyncing = false;
        }
    },
    
    // ประมวลผลการอัปเดต
    async processUpdate(update) {
        const { username, dataType, data } = update;
        const storageKey = `${dataType}_${username}`;
        
        try {
            // อัปเดตข้อมูลใน localStorage
            localStorage.setItem(storageKey, JSON.stringify(data));
            
            // ส่งสัญญาณการอัปเดตให้ผู้ใช้อื่น
            this.broadcastUpdate(username, dataType, data);
            
        } catch (error) {
            console.error('Update processing error:', error);
        }
    },
    
    // ส่งสัญญาณการอัปเดต
    broadcastUpdate(username, dataType, data) {
        const updateEvent = new CustomEvent('userDataUpdate', {
            detail: {
                username,
                dataType,
                data,
                timestamp: Date.now()
            }
        });
        
        window.dispatchEvent(updateEvent);
    }
};

// ===== 4. REAL-TIME SYNCHRONIZATION =====
const RealTimeSync = {
    updateInterval: null,
    syncInterval: 15000, // 15 seconds
    
    // เริ่มต้นการซิงค์แบบเรียลไทม์
    start() {
        // ซิงค์ข้อมูลทุกๆ 15 วินาที
        this.updateInterval = setInterval(() => {
            this.syncAllUsers();
        }, this.syncInterval);
        
        // ฟังการเปลี่ยนแปลงข้อมูล
        window.addEventListener('userDataUpdate', (event) => {
            this.handleUserDataUpdate(event.detail);
        });
        
        console.log('Real-time sync started');
    },
    
    // หยุดการซิงค์
    stop() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
        
        console.log('Real-time sync stopped');
    },
    
    // ซิงค์ข้อมูลผู้ใช้ทั้งหมด
    async syncAllUsers() {
        const onlineUsers = MultiUserSystem.getOnlineUsers();
        
        for (const user of onlineUsers) {
            await this.syncUserSpecificData(user.username);
        }
        
        // อัปเดตสถานะออนไลน์
        EnhancedUserManager.displayOnlineStatus();
    },
    
    // ซิงค์ข้อมูลเฉพาะของผู้ใช้
    async syncUserSpecificData(username) {
        try {
            // ซิงค์สถิติ
            const statsKey = `userStats_${username}`;
            const stats = localStorage.getItem(statsKey);
            if (stats) {
                const parsedStats = JSON.parse(stats);
                this.updateUserStats(username, parsedStats);
            }
            
            // ซิงค์ข้อมูลการเข้าเรียน
            const attendanceKey = `attendance_${username}`;
            const attendance = localStorage.getItem(attendanceKey);
            if (attendance) {
                const parsedAttendance = JSON.parse(attendance);
                this.updateUserAttendance(username, parsedAttendance);
            }
            
        } catch (error) {
            console.error('Sync error for user:', username, error);
        }
    },
    
    // อัปเดตสถิติผู้ใช้
    updateUserStats(username, stats) {
        // อัปเดตสถิติในหน้าจอของผู้ใช้ปัจจุบัน
        if (EnhancedUserManager.currentUser?.userData.username === username) {
            EnhancedUserManager.currentUser.statistics = stats;
            EnhancedUserManager.updateStatisticsDisplay(stats);
        }
    },
    
    // อัปเดตข้อมูลการเข้าเรียนผู้ใช้
    updateUserAttendance(username, attendance) {
        // อัปเดตข้อมูลการเข้าเรียนในหน้าจอของผู้ใช้ปัจจุบัน
        if (EnhancedUserManager.currentUser?.userData.username === username) {
            EnhancedUserManager.currentUser.attendanceData = attendance;
        }
    },
    
    // จัดการการอัปเดตข้อมูลผู้ใช้
    handleUserDataUpdate(detail) {
        const { username, dataType, data } = detail;
        
        // อัปเดตข้อมูลในระบบ
        const session = Array.from(MultiUserSystem.activeSessions.values())
            .find(s => s.userData.username === username);
            
        if (session) {
            switch (dataType) {
                case 'userStats':
                    session.statistics = data;
                    break;
                case 'attendance':
                    session.attendanceData = data;
                    break;
                case 'userPrefs':
                    session.preferences = data;
                    break;
            }
        }
    }
};

// ===== 5. INITIALIZATION AND CLEANUP =====
const MultiUserInitializer = {
    // เริ่มต้นระบบ
    async initialize() {
        console.log('Initializing multi-user system...');
        
        try {
            // โหลด session ปัจจุบัน
            const currentSession = MultiUserSystem.loadCurrentSession();
            
            if (currentSession) {
                // มี session อยู่แล้ว
                EnhancedUserManager.currentUser = currentSession;
                await EnhancedUserManager.loadUserSpecificData(currentSession);
                EnhancedUserManager.updateUserInterface(currentSession);
                EnhancedUserManager.startActivityTracking();
                
                console.log('Existing session restored:', currentSession.userData.username);
            } else {
                // ไม่มี session - ต้องล็อกอิน
                console.log('No valid session found');
                return false;
            }
            
            // เริ่มต้นการซิงค์แบบเรียลไทม์
            RealTimeSync.start();
            
            // ติดตั้งการทำความสะอาดอัตโนมัติ
            this.setupAutoCleanup();
            
            console.log('Multi-user system initialized successfully');
            return true;
            
        } catch (error) {
            console.error('Multi-user system initialization failed:', error);
            return false;
        }
    },
    
    // ติดตั้งการทำความสะอาดอัตโนมัติ
    setupAutoCleanup() {
        // ทำความสะอาดทุกๆ 10 นาที
        setInterval(() => {
            MultiUserSystem.cleanExpiredSessions();
            this.cleanupOldData();
        }, 600000);
        
        // ทำความสะอาดเมื่อปิดหน้าต่าง
        window.addEventListener('beforeunload', () => {
            this.cleanup();
        });
        
        // ทำความสะอาดเมื่อหน้าต่างไม่ active
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                EnhancedUserManager.saveUserData();
            } else {
                MultiUserSystem.updateLastActivity();
            }
        });
    },
    
    // ทำความสะอาดข้อมูลเก่า
    cleanupOldData() {
        const now = Date.now();
        const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days
        
        // ตรวจสอบข้อมูลใน localStorage
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && (key.startsWith('userStats_') || 
                       key.startsWith('attendance_') || 
                       key.startsWith('userPrefs_'))) {
                try {
                    const data = JSON.parse(localStorage.getItem(key) || '{}');
                    const lastUpdated = new Date(data.lastUpdated || 0).getTime();
                    
                    if (now - lastUpdated > maxAge) {
                        localStorage.removeItem(key);
                        console.log('Cleaned old data:', key);
                    }
                } catch (error) {
                    console.error('Error cleaning data:', key, error);
                }
            }
        }
    },
    
    // ทำความสะอาดเมื่อปิดระบบ
    cleanup() {
        console.log('Cleaning up multi-user system...');
        
        // หยุดการซิงค์
        RealTimeSync.stop();
        
        // บันทึกข้อมูลผู้ใช้ปัจจุบัน
        if (EnhancedUserManager.currentUser) {
            EnhancedUserManager.saveUserData();
        }
        
        // อัปเดตเวลากิจกรรมล่าสุด
        MultiUserSystem.updateLastActivity();
    }
};

// ===== 6. GLOBAL INTEGRATION FUNCTIONS =====

// ฟังก์ชันล็อกอินสำหรับหลายผู้ใช้
async function multiUserLogin(loginData) {
    try {
        const session = await EnhancedUserManager.loginUser(loginData);
        
        // เริ่มต้นการซิงค์
        RealTimeSync.start();
        
        return {
            success: true,
            session: session,
            message: 'เข้าสู่ระบบสำเร็จ'
        };
    } catch (error) {
        return {
            success: false,
            error: error.message,
            message: 'ไม่สามารถเข้าสู่ระบบได้'
        };
    }
}

// ฟังก์ชันล็อกเอาต์สำหรับหลายผู้ใช้
async function multiUserLogout() {
    try {
        await EnhancedUserManager.logout();
        RealTimeSync.stop();
        
        return {
            success: true,
            message: 'ออกจากระบบสำเร็จ'
        };
    } catch (error) {
        return {
            success: false,
            error: error.message,
            message: 'เกิดข้อผิดพลาดในการออกจากระบบ'
        };
    }
}

// ฟังก์ชันอัปเดตสถิติแบบหลายผู้ใช้
async function updateMultiUserStatistics(newStats) {
    if (!EnhancedUserManager.currentUser) return;
    
    const username = EnhancedUserManager.currentUser.userData.username;
    
    // อัปเดตใน session ปัจจุบัน
    EnhancedUserManager.currentUser.statistics = newStats;
    
    // บันทึกลง localStorage
    await ConcurrentDataManager.updateUserData(username, 'userStats', newStats);
    
    // อัปเดต UI
    EnhancedUserManager.updateStatisticsDisplay(newStats);
}

// ฟังก์ชันอัปเดตข้อมูลการเข้าเรียนแบบหลายผู้ใช้
async function updateMultiUserAttendance(attendanceData) {
    if (!EnhancedUserManager.currentUser) return;
    
    const username = EnhancedUserManager.currentUser.userData.username;
    
    // อัปเดตใน session ปัจจุบัน
    EnhancedUserManager.currentUser.attendanceData = attendanceData;
    
    // บันทึกลง localStorage
    await ConcurrentDataManager.updateUserData(username, 'attendance', attendanceData);
    
    // คำนวณสถิติใหม่
    const newStats = calculateStatsFromAttendance(attendanceData);
    await updateMultiUserStatistics(newStats);
}

// ฟังก์ชันคำนวณสถิติจากข้อมูลการเข้าเรียน
function calculateStatsFromAttendance(attendanceData) {
    const summary = attendanceData.summary || { present: 0, absent: 0, late: 0, leave: 0 };
    const total = summary.present + summary.absent + summary.late + summary.leave;
    const attendanceRate = total > 0 ? Math.round(((summary.present + summary.late) / total) * 100) : 0;
    
    return {
        totalPresent: summary.present,
        totalAbsent: summary.absent,
        totalLate: summary.late,
        totalLeave: summary.leave,
        attendanceRate: attendanceRate,
        lastUpdated: new Date().toISOString()
    };
}

// ฟังก์ชันดูผู้ใช้ออนไลน์
function getOnlineUsers() {
    return MultiUserSystem.getOnlineUsers();
}

// ฟังก์ชันเช็คสถานะการล็อกอิน
function isUserLoggedIn() {
    return EnhancedUserManager.currentUser !== null;
}

// ฟังก์ชันดึงข้อมูลผู้ใช้ปัจจุบัน
function getCurrentUser() {
    return EnhancedUserManager.currentUser;
}

// ===== 7. EVENT HANDLERS FOR EXISTING SYSTEM =====

// เชื่อมต่อกับระบบเดิม
function integrateWithExistingSystem() {
    // แทนที่ฟังก์ชันเดิม
    if (typeof window.checkUserLogin === 'function') {
        window.originalCheckUserLogin = window.checkUserLogin;
        window.checkUserLogin = function() {
            const session = MultiUserSystem.loadCurrentSession();
            if (session) {
                // อัปเดตตัวแปรเดิมให้เข้ากับระบบใหม่
                window.currentUserData = session.userData;
                window.userRole = session.role;
                return true;
            }
            return false;
        };
    }
    
    // แทนที่ฟังก์ชันอัปเดตสถิติเดิม
    if (typeof window.updateStatisticsFromScanData === 'function') {
        window.originalUpdateStatisticsFromScanData = window.updateStatisticsFromScanData;
        window.updateStatisticsFromScanData = async function() {
            if (EnhancedUserManager.currentUser) {
                // ใช้ระบบใหม่
                const attendanceKey = `attendance_${EnhancedUserManager.currentUser.userData.username}`;
                const attendanceData = JSON.parse(localStorage.getItem(attendanceKey) || '{}');
                
                if (attendanceData.records) {
                    const newStats = calculateStatsFromAttendance(attendanceData);
                    await updateMultiUserStatistics(newStats);
                }
            } else {
                // ใช้ระบบเดิม
                window.originalUpdateStatisticsFromScanData();
            }
        };
    }
    
    // แทนที่ฟังก์ชันล็อกเอาต์เดิม
    if (typeof window.logout === 'function') {
        window.originalLogout = window.logout;
        window.logout = async function() {
            if (isUserLoggedIn()) {
                await multiUserLogout();
            } else {
                window.originalLogout();
            }
        };
    }
}

// ===== 8. ENHANCED UI COMPONENTS =====

// สร้าง UI สำหรับการจัดการผู้ใช้หลายคน
function createMultiUserUI() {
    // สร้าง User Switcher (สำหรับแอดมิน)
    if (EnhancedUserManager.currentUser?.role === 'admin') {
        createUserSwitcher();
    }
    
    // สร้าง Activity Monitor
    createActivityMonitor();
    
    // สร้าง Session Timer
    createSessionTimer();
}

// สร้าง User Switcher สำหรับแอดมิน
function createUserSwitcher() {
    const userSwitcher = document.createElement('div');
    userSwitcher.className = 'user-switcher';
    userSwitcher.style.cssText = `
        position: fixed;
        top: 80px;
        left: 20px;
        background: white;
        border: 1px solid #e2e8f0;
        border-radius: 12px;
        padding: 16px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        z-index: 1000;
        max-height: 200px;
        overflow-y: auto;
        min-width: 200px;
    `;
    
    const title = document.createElement('h4');
    title.textContent = 'ผู้ใช้ออนไลน์';
    title.style.cssText = 'margin: 0 0 12px 0; font-size: 14px; color: #334155;';
    userSwitcher.appendChild(title);
    
    const userList = document.createElement('div');
    userList.className = 'online-user-list';
    userSwitcher.appendChild(userList);
    
    updateUserSwitcher(userList);
    document.body.appendChild(userSwitcher);
    
    // อัปเดตทุกๆ 30 วินาที
    setInterval(() => updateUserSwitcher(userList), 30000);
}

// อัปเดต User Switcher
function updateUserSwitcher(userList) {
    const onlineUsers = getOnlineUsers();
    
    userList.innerHTML = '';
    
    onlineUsers.forEach(user => {
        const userItem = document.createElement('div');
        userItem.className = 'user-item';
        userItem.style.cssText = `
            padding: 8px 12px;
            margin: 4px 0;
            background: #f8fafc;
            border-radius: 6px;
            cursor: pointer;
            transition: all 0.2s ease;
            font-size: 13px;
        `;
        
        userItem.innerHTML = `
            <div style="font-weight: 500; color: #334155;">
                ${user.firstName} ${user.lastName}
            </div>
            <div style="font-size: 11px; color: #64748b;">
                ${user.role} • ${getTimeAgo(user.lastActivity)}
            </div>
        `;
        
        userItem.addEventListener('mouseenter', () => {
            userItem.style.backgroundColor = '#e2e8f0';
        });
        
        userItem.addEventListener('mouseleave', () => {
            userItem.style.backgroundColor = '#f8fafc';
        });
        
        userList.appendChild(userItem);
    });
}

// สร้าง Activity Monitor
function createActivityMonitor() {
    const monitor = document.createElement('div');
    monitor.className = 'activity-monitor';
    monitor.style.cssText = `
        position: fixed;
        bottom: 80px;
        right: 20px;
        background: white;
        border: 1px solid #e2e8f0;
        border-radius: 12px;
        padding: 12px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        z-index: 1000;
        font-size: 12px;
        color: #64748b;
    `;
    
    monitor.innerHTML = `
        <div id="session-info">
            <div>เซสชัน: ${EnhancedUserManager.currentUser?.sessionId.split('_')[2] || 'Unknown'}</div>
            <div>เข้าสู่ระบบ: ${formatTime(EnhancedUserManager.currentUser?.loginTime)}</div>
            <div id="activity-time">กิจกรรมล่าสุด: เมื่อสักครู่</div>
        </div>
    `;
    
    document.body.appendChild(monitor);
    
    // อัปเดตเวลากิจกรรมทุกวินาที
    setInterval(() => {
        const activityTime = document.getElementById('activity-time');
        if (activityTime && EnhancedUserManager.currentUser) {
            const lastActivity = EnhancedUserManager.currentUser.lastActivity;
            activityTime.textContent = `กิจกรรมล่าสุด: ${getTimeAgo(lastActivity)}`;
        }
    }, 1000);
}

// สร้าง Session Timer
function createSessionTimer() {
    const timer = document.createElement('div');
    timer.className = 'session-timer';
    timer.style.cssText = `
        position: fixed;
        top: 50%;
        right: -180px;
        transform: translateY(-50%);
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 12px 20px;
        border-radius: 12px 0 0 12px;
        font-size: 12px;
        font-weight: 500;
        transition: right 0.3s ease;
        cursor: pointer;
        z-index: 999;
    `;
    
    timer.innerHTML = `
        <div>เซสชัน</div>
        <div id="session-duration">00:00:00</div>
    `;
    
    // แสดงเมื่อ hover
    timer.addEventListener('mouseenter', () => {
        timer.style.right = '0px';
    });
    
    timer.addEventListener('mouseleave', () => {
        timer.style.right = '-180px';
    });
    
    document.body.appendChild(timer);
    
    // อัปเดตเวลาเซสชัน
    setInterval(() => {
        const durationElement = document.getElementById('session-duration');
        if (durationElement && EnhancedUserManager.currentUser) {
            const loginTime = new Date(EnhancedUserManager.currentUser.loginTime);
            const now = new Date();
            const duration = now - loginTime;
            durationElement.textContent = formatDuration(duration);
        }
    }, 1000);
}

// ===== 9. UTILITY FUNCTIONS =====

// แปลงเวลาเป็นข้อความ
function getTimeAgo(timestamp) {
    const now = Date.now();
    const time = new Date(timestamp).getTime();
    const diff = now - time;
    
    if (diff < 60000) return 'เมื่อสักครู่';
    if (diff < 3600000) return `${Math.floor(diff / 60000)} นาทีที่แล้ว`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} ชั่วโมงที่แล้ว`;
    return `${Math.floor(diff / 86400000)} วันที่แล้ว`;
}

// จัดรูปแบบเวลา
function formatTime(timestamp) {
    return new Date(timestamp).toLocaleTimeString('th-TH', {
        hour: '2-digit',
        minute: '2-digit'
    });
}

// จัดรูปแบบระยะเวลา
function formatDuration(milliseconds) {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    return `${String(hours).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
}

// ===== 10. INITIALIZATION AND EXPORT =====

// เริ่มต้นระบบเมื่อ DOM โหลดเสร็จ
document.addEventListener('DOMContentLoaded', async function() {
    console.log('Initializing enhanced multi-user system...');
    
    // เริ่มต้นระบบหลายผู้ใช้
    const initialized = await MultiUserInitializer.initialize();
    
    if (initialized) {
        // เชื่อมต่อกับระบบเดิม
        integrateWithExistingSystem();
        
        // สร้าง UI เพิ่มเติม
        createMultiUserUI();
        
        console.log('Enhanced multi-user system ready!');
    } else {
        console.log('Multi-user system initialization failed - using fallback');
        
        // ใช้ระบบเดิมแทน
        if (typeof window.initializeUserManagement === 'function') {
            window.initializeUserManagement();
        }
    }
});

// Export ฟังก์ชันสำคัญ
window.MultiUserSystem = {
    // Core functions
    login: multiUserLogin,
    logout: multiUserLogout,
    getCurrentUser: getCurrentUser,
    getOnlineUsers: getOnlineUsers,
    isLoggedIn: isUserLoggedIn,
    
    // Data management
    updateStatistics: updateMultiUserStatistics,
    updateAttendance: updateMultiUserAttendance,
    
    // System management
    cleanExpiredSessions: () => MultiUserSystem.cleanExpiredSessions(),
    getSessionInfo: () => EnhancedUserManager.currentUser,
    
    // Advanced features
    ConcurrentDataManager,
    RealTimeSync,
    EnhancedUserManager
};

console.log('Enhanced Multi-User System loaded successfully!');