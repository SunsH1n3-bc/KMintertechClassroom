// College News Website JavaScript
document.addEventListener('DOMContentLoaded', function() {
    
    // ข้อมูลข่าวสารจำลอง
    const newsData = [
        {
            id: 1,
            type: 'urgent',
            title: 'ประกาศเลื่อนการสอบกลางภาค',
            content: 'เนื่องจากสถานการณ์พิเศษ ทางวิทยาลัยขอประกาศเลื่อนการสอบกลางภาคออกไป...',
            date: '2568-07-13',
            author: 'งานวิชาการ',
            views: 245
        },
        {
            id: 2,
            type: 'news',
            title: 'กิจกรรมวันภาษาไทยแห่งชาติ',
            content: 'ขอเชิญนักศึกษาทุกคนร่วมกิจกรรมวันภาษาไทยแห่งชาติ วันที่ 29 กรกฎาคม 2568...',
            date: '2568-07-12',
            author: 'งานกิจการนักศึกษา',
            views: 189
        },
        {
            id: 3,
            type: 'announcement',
            title: 'ประกาศรับสมัครทุนการศึกษา',
            content: 'เปิดรับสมัครทุนการศึกษาสำหรับนักศึกษาที่มีผลการเรียนดีเยี่ยม...',
            date: '2568-07-11',
            author: 'งานทุนการศึกษา',
            views: 156
        },
        {
            id: 4,
            type: 'event',
            title: 'งานแสดงผลงานนักศึกษา',
            content: 'ขอเชิญร่วมชมงานแสดงผลงานนักศึกษา ภาควิชาคอมพิวเตอร์ และเทคโนโลยีสารสนเทศ...',
            date: '2568-07-10',
            author: 'ภาควิชาคอมพิวเตอร์',
            views: 123
        },
        {
            id: 5,
            type: 'news',
            title: 'การปรับปรุงระบบห้องสมุด',
            content: 'ห้องสมุดกำลังปรับปรุงระบบใหม่ เพื่อให้บริการที่ดียิ่งขึ้น...',
            date: '2568-07-09',
            author: 'งานห้องสมุด',
            views: 98
        },
        {
            id: 6,
            type: 'announcement',
            title: 'ตารางสอบปลายภาค',
            content: 'ประกาศตารางสอบปลายภาคเรียนที่ 1 ปีการศึกษา 2568...',
            date: '2568-07-08',
            author: 'งานทะเบียน',
            views: 301
        }
    ];

    // ตัวแปรสำหรับเก็บสถานะ
    let currentFilter = 'all';
    let currentPage = 1;
    let itemsPerPage = 6;
    let filteredNews = [...newsData];

    // ฟังก์ชันสำหรับปิดแจ้งเตือนด่วน
    function initUrgentNotification() {
        const closeBtn = document.querySelector('.close-btn');
        const urgentNotification = document.querySelector('.urgent-notification');
        
        if (closeBtn && urgentNotification) {
            closeBtn.addEventListener('click', function() {
                urgentNotification.style.transform = 'translateY(-100%)';
                urgentNotification.style.opacity = '0';
                setTimeout(() => {
                    urgentNotification.style.display = 'none';
                }, 300);
            });
        }
    }

    // ฟังก์ชันสำหรับค้นหาข่าวสาร
    function initSearch() {
        const searchInput = document.querySelector('.search-input');
        const searchBtn = document.querySelector('.search-btn');
        
        function performSearch() {
            const searchTerm = searchInput.value.toLowerCase().trim();
            
            if (searchTerm === '') {
                filteredNews = newsData.filter(news => 
                    currentFilter === 'all' || news.type === currentFilter
                );
            } else {
                filteredNews = newsData.filter(news => {
                    const matchesSearch = news.title.toLowerCase().includes(searchTerm) ||
                                        news.content.toLowerCase().includes(searchTerm) ||
                                        news.author.toLowerCase().includes(searchTerm);
                    const matchesFilter = currentFilter === 'all' || news.type === currentFilter;
                    return matchesSearch && matchesFilter;
                });
            }
            
            currentPage = 1;
            renderNews();
            updatePagination();
        }

        if (searchInput && searchBtn) {
            searchInput.addEventListener('input', debounce(performSearch, 300));
            searchBtn.addEventListener('click', performSearch);
            searchInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    performSearch();
                }
            });
        }
    }

    // ฟังก์ชันสำหรับ debounce
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // ฟังก์ชันสำหรับฟิลเตอร์ข่าวสาร
    function initFilter() {
        const filterButtons = document.querySelectorAll('.filter-btn');
        
        filterButtons.forEach(button => {
            button.addEventListener('click', function() {
                // อัพเดต active state
                filterButtons.forEach(btn => btn.classList.remove('active'));
                this.classList.add('active');
                
                // อัพเดตฟิลเตอร์
                currentFilter = this.getAttribute('data-filter');
                
                // กรองข่าวสาร
                const searchTerm = document.querySelector('.search-input').value.toLowerCase().trim();
                
                if (currentFilter === 'all') {
                    filteredNews = newsData.filter(news => 
                        searchTerm === '' || 
                        news.title.toLowerCase().includes(searchTerm) ||
                        news.content.toLowerCase().includes(searchTerm) ||
                        news.author.toLowerCase().includes(searchTerm)
                    );
                } else {
                    filteredNews = newsData.filter(news => {
                        const matchesType = news.type === currentFilter;
                        const matchesSearch = searchTerm === '' || 
                                            news.title.toLowerCase().includes(searchTerm) ||
                                            news.content.toLowerCase().includes(searchTerm) ||
                                            news.author.toLowerCase().includes(searchTerm);
                        return matchesType && matchesSearch;
                    });
                }
                
                currentPage = 1;
                renderNews();
                updatePagination();
                
                // เพิ่มเอฟเฟกต์การเปลี่ยน
                const newsGrid = document.querySelector('.news-grid');
                newsGrid.style.opacity = '0.7';
                newsGrid.style.transform = 'translateY(10px)';
                
                setTimeout(() => {
                    newsGrid.style.opacity = '1';
                    newsGrid.style.transform = 'translateY(0)';
                }, 200);
            });
        });
    }

    // ฟังก์ชันสำหรับแสดงผลข่าวสาร
    function renderNews() {
        const newsGrid = document.querySelector('.news-grid');
        if (!newsGrid) return;
        
        // คำนวณข่าวสารที่จะแสดงในหน้าปัจจุบัน
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const newsToShow = filteredNews.slice(startIndex, endIndex);
        
        // สร้าง HTML สำหรับข่าวสาร
        newsGrid.innerHTML = newsToShow.map((news, index) => {
            const badgeClass = `${news.type}-badge`;
            const badgeText = getBadgeText(news.type);
            const formattedDate = formatDate(news.date);
            
            return `
                <article class="news-card ${news.type}" style="animation-delay: ${index * 0.1}s">
                    <div class="news-header">
                        <span class="news-badge ${badgeClass}">${badgeText}</span>
                        <span class="news-date">${formattedDate}</span>
                    </div>
                    <div class="news-content">
                        <h3>${news.title}</h3>
                        <p>${news.content}</p>
                    </div>
                    <div class="news-footer">
                        <span class="news-author">โดย: ${news.author}</span>
                        <div class="news-actions">
                            <span class="news-views">👁️ ${news.views}</span>
                            <a href="#" class="read-more" data-news-id="${news.id}">อ่านต่อ</a>
                        </div>
                    </div>
                </article>
            `;
        }).join('');
        
        // เพิ่ม event listeners สำหรับปุ่ม "อ่านต่อ"
        const readMoreBtns = newsGrid.querySelectorAll('.read-more');
        readMoreBtns.forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                const newsId = parseInt(this.getAttribute('data-news-id'));
                showNewsModal(newsId);
            });
        });
    }

    // ฟังก์ชันสำหรับแสดง modal ข่าวสาร
    function showNewsModal(newsId) {
        const news = newsData.find(n => n.id === newsId);
        if (!news) return;
        
        // สร้าง modal
        const modal = document.createElement('div');
        modal.className = 'news-modal';
        modal.innerHTML = `
            <div class="modal-overlay">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2>${news.title}</h2>
                        <button class="modal-close">×</button>
                    </div>
                    <div class="modal-body">
                        <div class="modal-meta">
                            <span class="news-badge ${news.type}-badge">${getBadgeText(news.type)}</span>
                            <span class="news-date">${formatDate(news.date)}</span>
                            <span class="news-author">โดย: ${news.author}</span>
                            <span class="news-views">👁️ ${news.views}</span>
                        </div>
                        <div class="modal-text">
                            <p>${news.content}</p>
                            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.</p>
                            <p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // เพิ่ม CSS สำหรับ modal
        if (!document.querySelector('#modal-styles')) {
            const modalStyles = document.createElement('style');
            modalStyles.id = 'modal-styles';
            modalStyles.textContent = `
                .news-modal {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    z-index: 1000;
                    animation: fadeIn 0.3s ease-out;
                }
                
                .modal-overlay {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.5);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    backdrop-filter: blur(5px);
                }
                
                .modal-content {
                    background: white;
                    border-radius: 12px;
                    max-width: 600px;
                    width: 90%;
                    max-height: 80vh;
                    overflow-y: auto;
                    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
                    animation: slideInUp 0.3s ease-out;
                }
                
                .modal-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 1.5rem;
                    border-bottom: 1px solid #e2e8f0;
                }
                
                .modal-header h2 {
                    color: #1e293b;
                    font-size: 1.5rem;
                    margin: 0;
                }
                
                .modal-close {
                    background: none;
                    border: none;
                    font-size: 1.5rem;
                    cursor: pointer;
                    color: #64748b;
                    padding: 0.5rem;
                    border-radius: 50%;
                    transition: all 0.2s;
                }
                
                .modal-close:hover {
                    background: #f1f5f9;
                    color: #1e293b;
                }
                
                .modal-body {
                    padding: 1.5rem;
                }
                
                .modal-meta {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 1rem;
                    margin-bottom: 1.5rem;
                    padding-bottom: 1rem;
                    border-bottom: 1px solid #e2e8f0;
                }
                
                .modal-text p {
                    margin-bottom: 1rem;
                    line-height: 1.7;
                    color: #334155;
                }
                
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                
                @keyframes slideInUp {
                    from { 
                        opacity: 0;
                        transform: translateY(50px);
                    }
                    to { 
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                .news-actions {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                }
                
                .news-views {
                    color: #64748b;
                    font-size: 0.9rem;
                }
            `;
            document.head.appendChild(modalStyles);
        }
        
        document.body.appendChild(modal);
        document.body.style.overflow = 'hidden';
        
        // เพิ่ม event listeners สำหรับปิด modal
        const closeBtn = modal.querySelector('.modal-close');
        const overlay = modal.querySelector('.modal-overlay');
        
        closeBtn.addEventListener('click', closeModal);
        overlay.addEventListener('click', function(e) {
            if (e.target === overlay) {
                closeModal();
            }
        });
        
        function closeModal() {
            modal.style.animation = 'fadeOut 0.3s ease-out';
            setTimeout(() => {
                document.body.removeChild(modal);
                document.body.style.overflow = '';
            }, 300);
        }
        
        // เพิ่ม animation สำหรับ fadeOut
        const fadeOutKeyframes = `
            @keyframes fadeOut {
                from { opacity: 1; }
                to { opacity: 0; }
            }
        `;
        
        if (!document.querySelector('#fadeout-styles')) {
            const fadeOutStyles = document.createElement('style');
            fadeOutStyles.id = 'fadeout-styles';
            fadeOutStyles.textContent = fadeOutKeyframes;
            document.head.appendChild(fadeOutStyles);
        }
        
        // เพิ่มจำนวนการดู
        news.views++;
        renderNews();
    }

    // ฟังก์ชันสำหรับ pagination
    function initPagination() {
        const paginationSection = document.querySelector('.pagination');
        if (!paginationSection) return;
        
        paginationSection.addEventListener('click', function(e) {
            if (e.target.classList.contains('page-btn')) {
                const btnText = e.target.textContent;
                
                if (btnText === '« ก่อนหน้า') {
                    if (currentPage > 1) {
                        currentPage--;
                        renderNews();
                        updatePagination();
                    }
                } else if (btnText === 'ถัดไป »') {
                    const totalPages = Math.ceil(filteredNews.length / itemsPerPage);
                    if (currentPage < totalPages) {
                        currentPage++;
                        renderNews();
                        updatePagination();
                    }
                } else if (!isNaN(parseInt(btnText))) {
                    currentPage = parseInt(btnText);
                    renderNews();
                    updatePagination();
                }
            }
        });
    }

    // ฟังก์ชันสำหรับอัพเดต pagination
    function updatePagination() {
        const pagination = document.querySelector('.pagination');
        if (!pagination) return;
        
        const totalPages = Math.ceil(filteredNews.length / itemsPerPage);
        
        let paginationHTML = '';
        
        // ปุ่มก่อนหน้า
        paginationHTML += `
            <button class="page-btn" ${currentPage === 1 ? 'disabled' : ''}>
                « ก่อนหน้า
            </button>
        `;
        
        // หมายเลขหน้า
        for (let i = 1; i <= totalPages; i++) {
            if (i === currentPage) {
                paginationHTML += `<button class="page-btn active">${i}</button>`;
            } else {
                paginationHTML += `<button class="page-btn">${i}</button>`;
            }
        }
        
        // ปุ่มถัดไป
        paginationHTML += `
            <button class="page-btn" ${currentPage === totalPages ? 'disabled' : ''}>
                ถัดไป »
            </button>
        `;
        
        pagination.innerHTML = paginationHTML;
    }

    // ฟังก์ชันสำหรับเลื่อนหน้าเว็บแบบนุ่มนวล
    function initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }

    // ฟังก์ชันสำหรับเอฟเฟกต์ parallax
    function initParallaxEffect() {
        window.addEventListener('scroll', function() {
            const scrolled = window.pageYOffset;
            const heroSection = document.querySelector('.hero-section');
            
            if (heroSection) {
                const rate = scrolled * -0.5;
                heroSection.style.transform = `translateY(${rate}px)`;
            }
        });
    }

    // ฟังก์ชันสำหรับ back to top button
    function initBackToTop() {
        // สร้างปุ่ม back to top
        const backToTopBtn = document.createElement('button');
        backToTopBtn.className = 'back-to-top';
        backToTopBtn.innerHTML = '↑';
        backToTopBtn.setAttribute('aria-label', 'กลับไปด้านบน');
        
        // เพิ่ม CSS สำหรับปุ่ม
        const backToTopStyles = document.createElement('style');
        backToTopStyles.textContent = `
            .back-to-top {
                position: fixed;
                bottom: 2rem;
                right: 2rem;
                width: 50px;
                height: 50px;
                background: var(--primary-blue);
                color: white;
                border: none;
                border-radius: 50%;
                font-size: 1.5rem;
                cursor: pointer;
                opacity: 0;
                visibility: hidden;
                transform: translateY(100px);
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                z-index: 1000;
                box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
            }
            
            .back-to-top.visible {
                opacity: 1;
                visibility: visible;
                transform: translateY(0);
            }
            
            .back-to-top:hover {
                background: var(--dark-blue);
                transform: translateY(-2px);
                box-shadow: 0 8px 20px rgba(37, 99, 235, 0.4);
            }
        `;
        
        document.head.appendChild(backToTopStyles);
        document.body.appendChild(backToTopBtn);
        
        // แสดง/ซ่อนปุ่มตามการเลื่อน
        window.addEventListener('scroll', function() {
            if (window.pageYOffset > 300) {
                backToTopBtn.classList.add('visible');
            } else {
                backToTopBtn.classList.remove('visible');
            }
        });
        
        // เพิ่ม event listener สำหรับคลิก
        backToTopBtn.addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // ฟังก์ชันช่วยเหลือ
    function getBadgeText(type) {
        const badgeTexts = {
            'urgent': 'ด่วน',
            'news': 'ข่าวสาร',
            'announcement': 'ประกาศ',
            'event': 'กิจกรรม'
        };
        return badgeTexts[type] || 'ทั่วไป';
    }

    function formatDate(dateString) {
        const date = new Date(dateString);
        const day = date.getDate();
        const month = date.getMonth() + 1;
        const year = date.getFullYear() + 543; // แปลงเป็นพ.ศ.
        
        const months = [
            'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
            'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
        ];
        
        return `${day} ${months[month - 1]} ${year}`;
    }

    // เริ่มต้นระบบทั้งหมด
    function init() {
        initUrgentNotification();
        initSearch();
        initFilter();
        initPagination();
        initSmoothScroll();
        initParallaxEffect();
        initBackToTop();
        
        // แสดงข่าวสารเริ่มต้น
        renderNews();
        updatePagination();
        
        // เพิ่ม loading animation
        document.body.classList.add('loaded');
    }

    // เรียกใช้ฟังก์ชัน init
    init();
    
    // เพิ่มประสิทธิภาพด้วย Service Worker (ถ้าต้องการ)
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', function() {
            // navigator.serviceWorker.register('/sw.js');
        });
    }
});

// ฟังก์ชันสำหรับแสดงการแจ้งเตือน
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    // เพิ่ม CSS สำหรับการแจ้งเตือน
    if (!document.querySelector('#notification-styles')) {
        const notificationStyles = document.createElement('style');
        notificationStyles.id = 'notification-styles';
        notificationStyles.textContent = `
            .notification {
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 1rem 1.5rem;
                background: white;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                z-index: 1001;
                animation: slideInRight 0.3s ease-out;
                max-width: 300px;
            }
            
            .notification.success {
                border-left: 4px solid #10b981;
            }
            
            .notification.error {
                border-left: 4px solid #ef4444;
            }
            
            .notification.info {
                border-left: 4px solid #3b82f6;
            }
            
            @keyframes slideInRight {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
        `;
        document.head.appendChild(notificationStyles);
    }
    
    document.body.appendChild(notification);
    
    // ลบการแจ้งเตือนหลังจาก 3 วินาที
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease-out';
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// ฟังก์ชันสำหรับโหลดข้อมูลเพิ่มเติม (จำลอง)
function loadMoreNews() {
    return new Promise((resolve) => {
        setTimeout(() => {
            const moreNews = [
                {
                    id: 7,
                    type: 'news',
                    title: 'ข่าวสารใหม่ที่ 1',
                    content: 'เนื้อหาข่าวสารใหม่...',
                    date: '2568-07-07',
                    author: 'งานประชาสัมพันธ์',
                    views: 45
                },
                {
                    id: 8,
                    type: 'event',
                    title: 'กิจกรรมใหม่',
                    content: 'รายละเอียดกิจกรรม...',
                    date: '2568-07-06',
                    author: 'งานกิจกรรม',
                    views: 67
                }
            ];
            resolve(moreNews);
        }, 1000);
    });
}