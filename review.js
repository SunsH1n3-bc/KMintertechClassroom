// feedback-system.js
class FeedbackSystem {
    constructor() {
        this.currentUser = null;
        this.feedbacks = [];
        this.archivedFeedbacks = [];
        this.selectedRating = 0;
        this.currentPage = 1;
        this.feedbacksPerPage = 10;
        
        this.init();
    }

    init() {
        this.checkUserAuthentication();
        this.loadStoredData();
        this.setupEventListeners();
        this.displayFeedbacks();
        this.updateStatistics();
        this.setupAutoArchive();
    }

    // ตรวจสอบการยืนยันตัวตนของผู้ใช้
    checkUserAuthentication() {
        const isLoggedIn = localStorage.getItem('isLoggedIn');
        const userData = localStorage.getItem('userData');
        
        if (isLoggedIn !== 'true' || !userData) {
            alert('กรุณาเข้าสู่ระบบก่อนใช้งาน');
            window.location.href = '/HTML/Profile.html';
            return;
        }
        
        this.currentUser = JSON.parse(userData);
        this.displayUserInfo();
        
        // แสดงส่วนที่เก็บถาวรสำหรับ admin และ teacher
        if (this.currentUser.role === 'admin' || this.currentUser.role === 'teacher') {
            document.getElementById('archivedSection').style.display = 'block';
        }
    }

    // แสดงข้อมูลผู้ใช้
    displayUserInfo() {
        const userName = document.getElementById('userName');
        const userAvatar = document.getElementById('userAvatar');
        
        if (userName && this.currentUser) {
            userName.textContent = `${this.currentUser.firstName} ${this.currentUser.lastName}`;
            
            // เปลี่ยนไอคอนตาม role
            const iconName = this.currentUser.role === 'teacher' ? 'person-circle' : 
                           this.currentUser.role === 'admin' ? 'shield-checkmark' : 'person';
            userAvatar.innerHTML = `<ion-icon name="${iconName}"></ion-icon>`;
        }
    }

    // โหลดข้อมูลจาก localStorage
    loadStoredData() {
        const storedFeedbacks = localStorage.getItem('feedbackData');
        const storedArchived = localStorage.getItem('archivedFeedbackData');
        
        if (storedFeedbacks) {
            this.feedbacks = JSON.parse(storedFeedbacks);
        }
        
        if (storedArchived) {
            this.archivedFeedbacks = JSON.parse(storedArchived);
        }
    }

    // บันทึกข้อมูลลง localStorage
    saveData() {
        localStorage.setItem('feedbackData', JSON.stringify(this.feedbacks));
        localStorage.setItem('archivedFeedbackData', JSON.stringify(this.archivedFeedbacks));
    }

    // ตั้งค่า Event Listeners
    setupEventListeners() {
        // Star Rating
        this.setupStarRating();
        
        // Character Counter
        this.setupCharacterCounter();
        
        // Form Submission
        const feedbackForm = document.getElementById('feedbackForm');
        feedbackForm.addEventListener('submit', (e) => this.handleFormSubmit(e));
        
        // Filter Controls
        document.getElementById('sortFilter').addEventListener('change', () => this.displayFeedbacks());
        document.getElementById('categoryFilter').addEventListener('change', () => this.displayFeedbacks());
        
        // Load More Button
        document.getElementById('loadMoreBtn').addEventListener('click', () => this.loadMoreFeedbacks());
        
        // Archived Section Toggle
        document.getElementById('toggleArchivedBtn').addEventListener('click', () => this.toggleArchivedSection());
        
        // Modal Close Events
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-overlay')) {
                this.closeModal(e.target.id);
            }
        });
    }

    // ตั้งค่าระบบให้คะแนนด้วยดาว
    setupStarRating() {
        const stars = document.querySelectorAll('.star');
        const ratingText = document.getElementById('ratingText');
        const ratingTexts = ['เลือกคะแนน', 'แย่มาก', 'แย่', 'ปานกลาง', 'ดี', 'ดีเยี่ยม'];
        
        stars.forEach(star => {
            star.addEventListener('mouseover', () => {
                const rating = parseInt(star.dataset.rating);
                this.highlightStars(rating);
                ratingText.textContent = ratingTexts[rating];
            });
            
            star.addEventListener('mouseout', () => {
                this.highlightStars(this.selectedRating);
                ratingText.textContent = this.selectedRating > 0 ? ratingTexts[this.selectedRating] : 'เลือกคะแนน';
            });
            
            star.addEventListener('click', () => {
                this.selectedRating = parseInt(star.dataset.rating);
                this.highlightStars(this.selectedRating);
                ratingText.textContent = ratingTexts[this.selectedRating];
            });
        });
    }

    // เน้นดาวตามคะแนน
    highlightStars(rating) {
        const stars = document.querySelectorAll('.star');
        stars.forEach((star, index) => {
            const icon = star.querySelector('ion-icon');
            if (index < rating) {
                icon.name = 'star';
                star.classList.add('active');
            } else {
                icon.name = 'star-outline';
                star.classList.remove('active');
            }
        });
    }

    // ตั้งค่าตัวนับอักษร
    setupCharacterCounter() {
        const textarea = document.getElementById('feedbackText');
        const charCount = document.getElementById('charCount');
        
        textarea.addEventListener('input', () => {
            const count = textarea.value.length;
            charCount.textContent = count;
            
            if (count > 450) {
                charCount.style.color = '#ff6b6b';
            } else if (count > 400) {
                charCount.style.color = '#ffa726';
            } else {
                charCount.style.color = '#666';
            }
        });
    }

    // จัดการการส่งฟอร์ม
    handleFormSubmit(e) {
        e.preventDefault();
        
        if (!this.validateForm()) {
            return;
        }
        
        const formData = new FormData(e.target);
        const feedbackData = {
            id: this.generateId(),
            userId: this.currentUser.username,
            userName: document.getElementById('anonymous').checked ? 'ผู้ใช้ไม่ระบุชื่อ' : `${this.currentUser.firstName} ${this.currentUser.lastName}`,
            userRole: this.currentUser.roleDisplay,
            rating: this.selectedRating,
            category: formData.get('category'),
            text: formData.get('feedbackText'),
            isAnonymous: document.getElementById('anonymous').checked,
            timestamp: new Date().toISOString(),
            createdAt: new Date()
        };
        
        this.showLoading();
        
        // จำลองการส่งข้อมูล
        setTimeout(() => {
            this.feedbacks.unshift(feedbackData);
            this.saveData();
            this.displayFeedbacks();
            this.updateStatistics();
            this.resetForm();
            this.hideLoading();
            this.showModal('successModal');
        }, 1000);
    }

    // ตรวจสอบความถูกต้องของฟอร์ม
    validateForm() {
        if (this.selectedRating === 0) {
            this.showModal('errorModal', 'กรุณาให้คะแนนก่อนส่งความคิดเห็น');
            return false;
        }
        
        const category = document.getElementById('category').value;
        if (!category) {
            this.showModal('errorModal', 'กรุณาเลือกหมวดหมู่');
            return false;
        }
        
        const text = document.getElementById('feedbackText').value.trim();
        if (!text || text.length < 10) {
            this.showModal('errorModal', 'กรุณาเขียนความคิดเห็นอย่างน้อย 10 ตัวอักษร');
            return false;
        }
        
        return true;
    }

    // รีเซ็ตฟอร์ม
    resetForm() {
        document.getElementById('feedbackForm').reset();
        this.selectedRating = 0;
        this.highlightStars(0);
        document.getElementById('ratingText').textContent = 'เลือกคะแนน';
        document.getElementById('charCount').textContent = '0';
        document.getElementById('charCount').style.color = '#666';
    }

    // แสดงความคิดเห็น
    displayFeedbacks() {
        const feedbackList = document.getElementById('feedbackList');
        const loadingMessage = document.getElementById('loadingMessage');
        const noFeedbackMessage = document.getElementById('noFeedbackMessage');
        const loadMoreContainer = document.getElementById('loadMoreContainer');
        
        loadingMessage.style.display = 'none';
        
        let filteredFeedbacks = this.getFilteredFeedbacks();
        
        if (filteredFeedbacks.length === 0) {
            feedbackList.innerHTML = '';
            noFeedbackMessage.style.display = 'block';
            loadMoreContainer.style.display = 'none';
            return;
        }
        
        noFeedbackMessage.style.display = 'none';
        
        const startIndex = 0;
        const endIndex = this.currentPage * this.feedbacksPerPage;
        const feedbacksToShow = filteredFeedbacks.slice(startIndex, endIndex);
        
        feedbackList.innerHTML = '';
        feedbacksToShow.forEach(feedback => {
            feedbackList.appendChild(this.createFeedbackElement(feedback));
        });
        
        // แสดงปุ่ม Load More ถ้ามีข้อมูลเพิ่มเติม
        if (endIndex < filteredFeedbacks.length) {
            loadMoreContainer.style.display = 'block';
        } else {
            loadMoreContainer.style.display = 'none';
        }
    }

    // ได้รับความคิดเห็นที่ผ่านการกรอง
    getFilteredFeedbacks() {
        let filtered = [...this.feedbacks];
        
        // Filter by category
        const categoryFilter = document.getElementById('categoryFilter').value;
        if (categoryFilter !== 'all') {
            filtered = filtered.filter(feedback => feedback.category === categoryFilter);
        }
        
        // Sort
        const sortFilter = document.getElementById('sortFilter').value;
        switch (sortFilter) {
            case 'newest':
                filtered.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
                break;
            case 'oldest':
                filtered.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
                break;
            case 'rating-high':
                filtered.sort((a, b) => b.rating - a.rating);
                break;
            case 'rating-low':
                filtered.sort((a, b) => a.rating - b.rating);
                break;
        }
        
        return filtered;
    }

    // สร้าง element สำหรับแสดงความคิดเห็น
    createFeedbackElement(feedback) {
        const feedbackElement = document.createElement('div');
        feedbackElement.className = 'feedback-item';
        
        const categoryNames = {
            'general': 'ทั่วไป',
            'ui': 'ใช้งาน/อินเทอร์เฟส',
            'performance': 'ประสิทธิภาพ',
            'feature': 'คุณสมบัติ',
            'bug': 'ปัญหา/ข้อผิดพลาด',
            'suggestion': 'ข้อเสนอแนะ'
        };
        
        const timeAgo = this.getTimeAgo(new Date(feedback.timestamp));
        const stars = this.generateStarDisplay(feedback.rating);
        
        feedbackElement.innerHTML = `
            <div class="feedback-header">
                <div class="feedback-user">
                    <div class="user-avatar">
                        <ion-icon name="${feedback.isAnonymous ? 'person-outline' : 'person'}"></ion-icon>
                    </div>
                    <div class="user-details">
                        <h4 class="user-name">${feedback.userName}</h4>
                        <span class="user-role">${feedback.isAnonymous ? 'ผู้ใช้' : feedback.userRole}</span>
                    </div>
                </div>
                <div class="feedback-meta">
                    <div class="feedback-rating">
                        ${stars}
                    </div>
                    <span class="feedback-time">${timeAgo}</span>
                </div>
            </div>
            <div class="feedback-content">
                <div class="feedback-category">
                    <ion-icon name="tag-outline"></ion-icon>
                    <span>${categoryNames[feedback.category] || feedback.category}</span>
                </div>
                <p class="feedback-text">${this.escapeHtml(feedback.text)}</p>
            </div>
            ${this.canDeleteFeedback(feedback) ? `
                <div class="feedback-actions">
                    <button class="delete-btn" onclick="feedbackSystem.deleteFeedback('${feedback.id}')">
                        <ion-icon name="trash-outline"></ion-icon>
                        <span>ลบ</span>
                    </button>
                </div>
            ` : ''}
        `;
        
        return feedbackElement;
    }

    // ตรวจสอบว่าสามารถลบความคิดเห็นได้หรือไม่
    canDeleteFeedback(feedback) {
        if (this.currentUser.role === 'admin') return true;
        if (feedback.userId === this.currentUser.username) return true;
        return false;
    }

    // ลบความคิดเห็น
    deleteFeedback(feedbackId) {
        if (confirm('คุณต้องการลบความคิดเห็นนี้หรือไม่?')) {
            this.feedbacks = this.feedbacks.filter(feedback => feedback.id !== feedbackId);
            this.saveData();
            this.displayFeedbacks();
            this.updateStatistics();
        }
    }

    // สร้างการแสดงผลดาว
    generateStarDisplay(rating) {
        let stars = '';
        for (let i = 1; i <= 5; i++) {
            if (i <= rating) {
                stars += '<ion-icon name="star" class="star-filled"></ion-icon>';
            } else {
                stars += '<ion-icon name="star-outline" class="star-empty"></ion-icon>';
            }
        }
        return stars;
    }

    // โหลดความคิดเห็นเพิ่มเติม
    loadMoreFeedbacks() {
        this.currentPage++;
        this.displayFeedbacks();
    }

    // อัปเดตสถิติ
    updateStatistics() {
        const totalFeedbacks = document.getElementById('totalFeedbacks');
        const averageRating = document.getElementById('averageRating');
        const recentFeedbacks = document.getElementById('recentFeedbacks');
        
        // จำนวนความคิดเห็นทั้งหมด
        totalFeedbacks.textContent = this.feedbacks.length;
        
        // คะแนนเฉลี่ย
        if (this.feedbacks.length > 0) {
            const avgRating = this.feedbacks.reduce((sum, feedback) => sum + feedback.rating, 0) / this.feedbacks.length;
            averageRating.textContent = avgRating.toFixed(1);
        } else {
            averageRating.textContent = '0.0';
        }
        
        // ความคิดเห็นวันนี้
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayFeedbacks = this.feedbacks.filter(feedback => {
            const feedbackDate = new Date(feedback.timestamp);
            feedbackDate.setHours(0, 0, 0, 0);
            return feedbackDate.getTime() === today.getTime();
        });
        recentFeedbacks.textContent = todayFeedbacks.length;
    }

    // ตั้งค่าระบบเก็บถาวรอัตโนมัติ (ทุก 24 ชั่วโมง)
    setupAutoArchive() {
        // ตรวจสอบและเก็บถาวรทุกครั้งที่โหลดหน้า
        this.archiveOldFeedbacks();
        
        // ตั้งให้ตรวจสอบทุก 1 ชั่วโมง
        setInterval(() => {
            this.archiveOldFeedbacks();
        }, 60 * 60 * 1000); // 1 ชั่วโมง
    }

    // เก็บถาวรความคิดเห็นที่เก่ากว่า 24 ชั่วโมง
    archiveOldFeedbacks() {
        const now = new Date();
        const twentyFourHoursAgo = new Date(now.getTime() - (24 * 60 * 60 * 1000));
        
        const feedbacksToArchive = this.feedbacks.filter(feedback => 
            new Date(feedback.timestamp) < twentyFourHoursAgo
        );
        
        if (feedbacksToArchive.length > 0) {
            // ย้ายไปยังถาวร
            this.archivedFeedbacks = [...this.archivedFeedbacks, ...feedbacksToArchive];
            
            // ลบออกจากรายการหลัก
            this.feedbacks = this.feedbacks.filter(feedback => 
                new Date(feedback.timestamp) >= twentyFourHoursAgo
            );
            
            this.saveData();
            this.displayFeedbacks();
            this.updateStatistics();
            
            console.log(`Archived ${feedbacksToArchive.length} old feedbacks`);
        }
    }

    // แสดง/ซ่อนส่วนถาวร
    toggleArchivedSection() {
        const archivedList = document.getElementById('archivedList');
        const toggleBtn = document.getElementById('toggleArchivedBtn');
        const icon = toggleBtn.querySelector('ion-icon');
        
        if (archivedList.style.display === 'none') {
            archivedList.style.display = 'block';
            icon.name = 'chevron-up-outline';
            this.displayArchivedFeedbacks();
        } else {
            archivedList.style.display = 'none';
            icon.name = 'chevron-down-outline';
        }
    }

    // แสดงความคิดเห็นที่เก็บถาวร
    displayArchivedFeedbacks() {
        const archivedList = document.getElementById('archivedList');
        
        if (this.archivedFeedbacks.length === 0) {
            archivedList.innerHTML = `
                <div class="no-feedback-message">
                    <ion-icon name="archive-outline"></ion-icon>
                    <p>ไม่มีความคิดเห็นที่เก็บถาวร</p>
                </div>
            `;
            return;
        }
        
        // เรียงตามวันที่ล่าสุด
        const sortedArchived = [...this.archivedFeedbacks].sort((a, b) => 
            new Date(b.timestamp) - new Date(a.timestamp)
        );
        
        archivedList.innerHTML = '';
        sortedArchived.forEach(feedback => {
            const feedbackElement = this.createFeedbackElement(feedback);
            feedbackElement.classList.add('archived-feedback');
            archivedList.appendChild(feedbackElement);
        });
    }

    // คำนวณเวลาที่ผ่านมา
    getTimeAgo(date) {
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);
        
        if (diffInSeconds < 60) {
            return 'เมื่อสักครู่';
        }
        
        const diffInMinutes = Math.floor(diffInSeconds / 60);
        if (diffInMinutes < 60) {
            return `${diffInMinutes} นาทีที่แล้ว`;
        }
        
        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) {
            return `${diffInHours} ชั่วโมงที่แล้ว`;
        }
        
        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays < 7) {
            return `${diffInDays} วันที่แล้ว`;
        }
        
        return date.toLocaleDateString('th-TH', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    // สร้าง ID แบบสุ่ม
    generateId() {
        return 'feedback_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
    }

    // Escape HTML เพื่อป้องกัน XSS
    escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, (m) => map[m]);
    }

    // แสดง Loading
    showLoading() {
        document.getElementById('loadingSpinner').style.display = 'flex';
    }

    // ซ่อน Loading
    hideLoading() {
        document.getElementById('loadingSpinner').style.display = 'none';
    }

    // แสดง Modal
    showModal(modalId, customMessage = '') {
        const modal = document.getElementById(modalId);
        if (customMessage && modalId === 'errorModal') {
            document.getElementById('errorMessage').textContent = customMessage;
        }
        modal.style.display = 'flex';
        
        // เพิ่ม animation
        setTimeout(() => {
            modal.classList.add('active');
        }, 10);
    }

    // ปิด Modal
    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        modal.classList.remove('active');
        
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300);
    }

    // เคลียร์ข้อมูลทั้งหมด (สำหรับ Admin)
    clearAllData() {
        if (this.currentUser.role !== 'admin') {
            alert('คุณไม่มีสิทธิ์ในการดำเนินการนี้');
            return;
        }
        
        if (confirm('คุณต้องการลบข้อมูลความคิดเห็นทั้งหมดหรือไม่? การดำเนินการนี้ไม่สามารถยกเลิกได้')) {
            this.feedbacks = [];
            this.archivedFeedbacks = [];
            this.saveData();
            this.displayFeedbacks();
            this.updateStatistics();
            alert('ลบข้อมูลทั้งหมดเรียบร้อยแล้ว');
        }
    }

    // ส่งออกข้อมูลเป็น JSON (สำหรับ Admin)
    exportData() {
        if (this.currentUser.role !== 'admin') {
            alert('คุณไม่มีสิทธิ์ในการดำเนินการนี้');
            return;
        }
        
        const exportData = {
            feedbacks: this.feedbacks,
            archivedFeedbacks: this.archivedFeedbacks,
            exportDate: new Date().toISOString(),
            exportedBy: this.currentUser.username
        };
        
        const dataStr = JSON.stringify(exportData, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const exportFileDefaultName = `feedback_data_${new Date().toISOString().split('T')[0]}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
    }

    // รีเซ็ตหน้าเมื่อเปลี่ยน filter
    resetPagination() {
        this.currentPage = 1;
    }
}

// ปิด Modal เมื่อคลิกนอก Modal
function closeModal(modalId) {
    if (window.feedbackSystem) {
        window.feedbackSystem.closeModal(modalId);
    }
}

// เริ่มต้นระบบเมื่อหน้าเว็บโหลดเสร็จ
document.addEventListener('DOMContentLoaded', function() {
    window.feedbackSystem = new FeedbackSystem();
});

// ป้องกันการปิดหน้าโดยไม่ได้ตั้งใจเมื่อกำลังพิมพ์
window.addEventListener('beforeunload', function(e) {
    const feedbackText = document.getElementById('feedbackText');
    if (feedbackText && feedbackText.value.trim().length > 0) {
        e.preventDefault();
        e.returnValue = 'คุณมีข้อความที่ยังไม่ได้บันทึก คุณต้องการออกจากหน้านี้หรือไม่?';
        return e.returnValue;
    }
});

// ฟังก์ชันสำหรับการจัดการ keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Ctrl/Cmd + Enter สำหรับส่งฟอร์ม
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        const feedbackForm = document.getElementById('feedbackForm');
        if (feedbackForm && document.activeElement.closest('.feedback-form-section')) {
            e.preventDefault();
            feedbackForm.dispatchEvent(new Event('submit', { cancelable: true }));
        }
    }
    
    // Escape สำหรับปิด Modal
    if (e.key === 'Escape') {
        const activeModals = document.querySelectorAll('.modal-overlay.active');
        activeModals.forEach(modal => {
            window.feedbackSystem.closeModal(modal.id);
        });
    }
});