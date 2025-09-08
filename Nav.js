// Profile Edit JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    
    if (!isLoggedIn || !userData.username) {
        // Redirect to login page if not logged in
        window.location.href = '/HTML/Profile.html';
        return;
    }

    // Load user data into form
    loadUserData(userData);
    
    // Initialize event listeners
    initializeEventListeners();
});

// Load user data into form fields
function loadUserData(userData) {
    // Profile header
    document.getElementById('profileName').textContent = `${userData.firstName} ${userData.lastName}`;
    document.getElementById('profileRole').textContent = userData.role;
    document.getElementById('attendanceRate').textContent = `${userData.attendanceRate}%`;
    document.getElementById('attendedDays').textContent = userData.attendedDays;
    document.getElementById('absentDays').textContent = userData.absentDays;
    
    // Form fields
    document.getElementById('firstName').value = userData.firstName || '';
    document.getElementById('lastName').value = userData.lastName || '';
    document.getElementById('email').value = userData.email || '';
    document.getElementById('phone').value = userData.phone || '';
    document.getElementById('studentId').value = userData.studentId || '';
    document.getElementById('class').value = userData.class || '';
    document.getElementById('address').value = userData.address || '';
    document.getElementById('username').value = userData.username || '';
    
    // Privacy settings
    document.getElementById('showOnlineStatus').checked = userData.showOnlineStatus !== false;
    document.getElementById('emailNotifications').checked = userData.emailNotifications !== false;
    document.getElementById('browserNotifications').checked = userData.browserNotifications || false;
}

// Initialize all event listeners
function initializeEventListeners() {
    // Password toggle functionality
    document.querySelectorAll('.password-toggle').forEach(button => {
        button.addEventListener('click', function() {
            const targetId = this.getAttribute('data-target');
            const passwordInput = document.getElementById(targetId);
            const icon = this.querySelector('ion-icon');
            
            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                icon.name = 'eye-off-outline';
            } else {
                passwordInput.type = 'password';
                icon.name = 'eye-outline';
            }
        });
    });

    // Avatar upload functionality
    document.getElementById('profileAvatar').addEventListener('click', function() {
        document.getElementById('avatarUpload').click();
    });

    document.getElementById('avatarUpload').addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                document.getElementById('avatarImage').src = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    });

    // Form submission
    document.getElementById('profileForm').addEventListener('submit', function(e) {
        e.preventDefault();
        handleFormSubmission();
    });

    // Cancel button
    document.getElementById('cancelBtn').addEventListener('click', function() {
        const userData = JSON.parse(localStorage.getItem('userData') || '{}');
        loadUserData(userData);
        showMessage('การเปลี่ยนแปลงถูกยกเลิก', 'info');
    });

    // Modal close buttons
    document.getElementById('closeSuccessModal').addEventListener('click', function() {
        document.getElementById('successModal').classList.remove('active');
    });

    document.getElementById('closeErrorModal').addEventListener('click', function() {
        document.getElementById('errorModal').classList.remove('active');
    });

    document.getElementById('cancelConfirm').addEventListener('click', function() {
        document.getElementById('confirmModal').classList.remove('active');
    });

    document.getElementById('confirmSave').addEventListener('click', function() {
        document.getElementById('confirmModal').classList.remove('active');
        saveUserData();
    });

    // Quick action buttons
    document.querySelectorAll('.quick-action-btn').forEach(button => {
        button.addEventListener('click', function() {
            const card = this.closest('.quick-action-card');
            const title = card.querySelector('h3').textContent;
            showMessage(`ฟีเจอร์ "${title}" จะพร้อมใช้งานเร็วๆ นี้`, 'info');
        });
    });

    // Logout functionality
    document.getElementById('logoutBtn').addEventListener('click', function(e) {
        e.preventDefault();
        if (confirm('คุณต้องการออกจากระบบหรือไม่?')) {
            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('userData');
            window.location.href = '/HTML/Profile.html';
        }
    });

    // Close modals when clicking outside
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('success-modal') || 
            e.target.classList.contains('error-modal') || 
            e.target.classList.contains('confirm-modal')) {
            e.target.classList.remove('active');
        }
    });
}

// Handle form submission
function handleFormSubmission() {
    // Validate form
    if (!validateForm()) {
        return;
    }

    // Show confirmation modal
    document.getElementById('confirmModal').classList.add('active');
}

// Validate form data
function validateForm() {
    const firstName = document.getElementById('firstName').value.trim();
    const lastName = document.getElementById('lastName').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const studentId = document.getElementById('studentId').value.trim();
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    // Check required fields
    if (!firstName || !lastName || !email || !phone || !studentId) {
        showErrorModal('กรุณากรอกข้อมูลให้ครบถ้วน');
        return false;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showErrorModal('รูปแบบอีเมลไม่ถูกต้อง');
        return false;
    }

    // Validate phone number
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(phone.replace(/[-\s]/g, ''))) {
        showErrorModal('หมายเลขโทรศัพท์ไม่ถูกต้อง');
        return false;
    }

    // Validate password change
    if (newPassword || confirmPassword) {
        if (!currentPassword) {
            showErrorModal('กรุณากรอกรหัสผ่านปัจจุบัน');
            return false;
        }
        
        if (newPassword !== confirmPassword) {
            showErrorModal('รหัสผ่านใหม่ไม่ตรงกัน');
            return false;
        }
        
        if (newPassword.length < 6) {
            showErrorModal('รหัสผ่านใหม่ต้องมีอย่างน้อย 6 ตัวอักษร');
            return false;
        }
    }

    return true;
}

// Save user data
function saveUserData() {
    showLoading();
    
    // Simulate API call
    setTimeout(() => {
        hideLoading();
        
        try {
            // Get current user data
            const currentUserData = JSON.parse(localStorage.getItem('userData') || '{}');
            
            // Validate current password if changing password
            const currentPassword = document.getElementById('currentPassword').value;
            const newPassword = document.getElementById('newPassword').value;
            
            if (newPassword && currentPassword) {
                // In real application, this would be validated on server
                // For demo purposes, we'll assume the current password is correct
                if (currentPassword !== 'password123' && currentPassword !== 'teacher123' && currentPassword !== 'admin123') {
                    showErrorModal('รหัสผ่านปัจจุบันไม่ถูกต้อง');
                    return;
                }
            }
            
            // Update user data
            const updatedUserData = {
                ...currentUserData,
                firstName: document.getElementById('firstName').value.trim(),
                lastName: document.getElementById('lastName').value.trim(),
                email: document.getElementById('email').value.trim(),
                phone: document.getElementById('phone').value.trim(),
                studentId: document.getElementById('studentId').value.trim(),
                class: document.getElementById('class').value,
                address: document.getElementById('address').value.trim(),
                showOnlineStatus: document.getElementById('showOnlineStatus').checked,
                emailNotifications: document.getElementById('emailNotifications').checked,
                browserNotifications: document.getElementById('browserNotifications').checked,
                lastUpdated: new Date().toISOString()
            };
            
            // Save to localStorage
            localStorage.setItem('userData', JSON.stringify(updatedUserData));
            
            // Update profile header
            document.getElementById('profileName').textContent = `${updatedUserData.firstName} ${updatedUserData.lastName}`;
            
            // Clear password fields
            document.getElementById('currentPassword').value = '';
            document.getElementById('newPassword').value = '';
            document.getElementById('confirmPassword').value = '';
            
            // Show success message
            showSuccessModal();
            
        } catch (error) {
            console.error('Error saving user data:', error);
            showErrorModal('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
        }
    }, 1500);
}

// Show loading overlay
function showLoading() {
    document.getElementById('loadingOverlay').classList.add('active');
}

// Hide loading overlay
function hideLoading() {
    document.getElementById('loadingOverlay').classList.remove('active');
}

// Show success modal
function showSuccessModal() {
    document.getElementById('successModal').classList.add('active');
}

// Show error modal
function showErrorModal(message) {
    document.getElementById('errorMessage').textContent = message;
    document.getElementById('errorModal').classList.add('active');
}

// Show message (for info messages)
function showMessage(message, type = 'info') {
    // Create a simple toast notification
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <div class="toast-content">
            <ion-icon name="${type === 'info' ? 'information-circle' : 'checkmark-circle'}"></ion-icon>
            <span>${message}</span>
        </div>
    `;
    
    // Add styles for toast
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'info' ? '#3498db' : '#27ae60'};
        color: white;
        padding: 12px 16px;
        border-radius: 8px;
        z-index: 10000;
        display: flex;
        align-items: center;
        gap: 8px;
        transform: translateX(100%);
        transition: transform 0.3s ease;
    `;
    
    document.body.appendChild(toast);
    
    // Animate in
    setTimeout(() => {
        toast.style.transform = 'translateX(0)';
    }, 100);
    
    // Remove after 3 seconds
    setTimeout(() => {
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }, 3000);
}

// Input focus animations
document.querySelectorAll('.form-input, .form-select, .form-textarea').forEach(input => {
    input.addEventListener('focus', function() {
        this.parentElement.classList.add('focused');
    });
    
    input.addEventListener('blur', function() {
        if (!this.value) {
            this.parentElement.classList.remove('focused');
        }
    });
    
    // Check if input has value on load
    if (input.value) {
        input.parentElement.classList.add('focused');
    }
});

// Form validation on input change
document.querySelectorAll('.form-input').forEach(input => {
    input.addEventListener('input', function() {
        // Remove any existing error styling
        this.classList.remove('error');
        
        // Basic validation
        if (this.required && !this.value.trim()) {
            this.classList.add('error');
        } else if (this.type === 'email' && this.value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(this.value)) {
                this.classList.add('error');
            }
        }
    });
});

// Password strength indicator
document.getElementById('newPassword').addEventListener('input', function() {
    const password = this.value;
    let strength = 0;
    
    if (password.length >= 6) strength += 1;
    if (password.match(/[a-z]/)) strength += 1;
    if (password.match(/[A-Z]/)) strength += 1;
    if (password.match(/[0-9]/)) strength += 1;
    if (password.match(/[^a-zA-Z0-9]/)) strength += 1;
    
    // Remove existing strength indicator
    const existingIndicator = document.querySelector('.password-strength');
    if (existingIndicator) {
        existingIndicator.remove();
    }
    
    if (password.length > 0) {
        const strengthIndicator = document.createElement('div');
        strengthIndicator.className = 'password-strength';
        
        const strengthText = ['อ่อนมาก', 'อ่อน', 'ปานกลาง', 'แข็งแกร่ง', 'แข็งแกร่งมาก'][strength - 1];
        const strengthColor = ['#e74c3c', '#f39c12', '#f1c40f', '#2ecc71', '#27ae60'][strength - 1];
        
        strengthIndicator.innerHTML = `
            <div class="strength-bar">
                <div class="strength-fill" style="width: ${strength * 20}%; background-color: ${strengthColor}"></div>
            </div>
            <span style="color: ${strengthColor}; font-size: 0.8em;">${strengthText}</span>
        `;
        
        strengthIndicator.style.cssText = `
            margin-top: 5px;
            .strength-bar {
                height: 4px;
                background-color: #ecf0f1;
                border-radius: 2px;
                overflow: hidden;
            }
            .strength-fill {
                height: 100%;
                transition: width 0.3s ease;
            }
        `;
        
        this.parentElement.appendChild(strengthIndicator);
    }
});