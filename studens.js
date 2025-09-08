// แยกข้อมูลแต่ละชั้นปี
        let gradeData = {
            'ปวช.1/1': [],
            'ปวช.1/2': [],
            'ปวช.1/3': [],
            'ปวช.1/4': [],
            'ปวช.1/5': [],
            'ปวช.1/6': [],
            'ปวช.2/1': [],
            'ปวช.2/3': [],
            'ปวช.2/4': [],
            'ปวช.3/1': [],
            'ปวช.3/3': [],
            'ปวช.3/5': []
        };
        
        let currentGrade = null;
        let editingStudentId = null;

        // ฟังก์ชันสำหรับจัดรูปแบบเวลา
        function formatTime(date) {
            const hours = date.getHours().toString().padStart(2, '0');
            const minutes = date.getMinutes().toString().padStart(2, '0');
            return `${hours}:${minutes}น.`;
        }

        // ฟังก์ชันสำหรับแสดงข้อความสถานะพร้อมเวลา
        function getStatusMessage(status, time) {
            const statusMessages = {
                'present': 'เข้าเรียน',
                'absent': 'ขาดเรียน',
                'late': 'มาสาย',
                'leave': 'ลา'
            };
            return `${statusMessages[status]} เวลา ${time}`;
        }

        // Toggle between single and bulk add forms
        document.getElementById('singleToggle').addEventListener('click', function() {
            document.getElementById('singleToggle').classList.add('active');
            document.getElementById('bulkToggle').classList.remove('active');
            document.getElementById('addStudentForm').classList.add('active');
            document.getElementById('bulkAddForm').classList.remove('active');
        });

        document.getElementById('bulkToggle').addEventListener('click', function() {
            document.getElementById('bulkToggle').classList.add('active');
            document.getElementById('singleToggle').classList.remove('active');
            document.getElementById('bulkAddForm').classList.add('active');
            document.getElementById('addStudentForm').classList.remove('active');
        });

        // เพิ่มนักเรียนรายบุคคล
        document.getElementById('addStudentForm').addEventListener('submit', function(e) {
            e.preventDefault();
            
            const name = document.getElementById('studentName').value.trim();
            const grade = document.getElementById('gradeLevel').value;
            
            if (name && grade) {
                const student = {
                    id: Date.now(),
                    name: name,
                    grade: grade,
                    status: null,
                    statusTime: null
                };
                
                gradeData[grade].push(student);
                document.getElementById('studentName').value = '';
                document.getElementById('gradeLevel').value = '';
                
                updateGradeTabs();
                if (currentGrade === grade) {
                    displayStudents();
                    updateSummary();
                }
                
                // แสดงข้อความสำเร็จ
                showSuccessMessage('เพิ่มนักเรียนสำเร็จ!');
            }
        });

        // เพิ่มนักเรียนหลายคน
        document.getElementById('bulkAddForm').addEventListener('submit', function(e) {
            e.preventDefault();
            
            const names = document.getElementById('bulkStudentNames').value.trim();
            const grade = document.getElementById('bulkGradeLevel').value;
            
            if (names && grade) {
                const nameList = names.split('\n').filter(name => name.trim() !== '');
                let addedCount = 0;
                
                nameList.forEach(name => {
                    const trimmedName = name.trim();
                    if (trimmedName) {
                        const student = {
                            id: Date.now() + Math.random(),
                            name: trimmedName,
                            grade: grade,
                            status: null,
                            statusTime: null
                        };
                        
                        gradeData[grade].push(student);
                        addedCount++;
                    }
                });
                
                document.getElementById('bulkStudentNames').value = '';
                document.getElementById('bulkGradeLevel').value = '';
                
                updateGradeTabs();
                if (currentGrade === grade) {
                    displayStudents();
                    updateSummary();
                }
                
                // แสดงข้อความสำเร็จ
                showSuccessMessage(`เพิ่มนักเรียนสำเร็จ ${addedCount} คน!`);
            }
        });

        // แสดงข้อความสำเร็จ
        function showSuccessMessage(message) {
            const successDiv = document.createElement('div');
            successDiv.innerHTML = `
                <div style="position: fixed; top: 20px; right: 20px; z-index: 1001; 
                           background: linear-gradient(135deg, #059669 0%, #10b981 100%); 
                           color: white; padding: 15px 25px; border-radius: 12px; 
                           box-shadow: 0 8px 32px rgba(5, 150, 105, 0.3);
                           font-weight: 600; animation: slideIn 0.3s ease;">
                    ✅ ${message}
                </div>
            `;
            document.body.appendChild(successDiv);
            
            setTimeout(() => {
                successDiv.remove();
            }, 3000);
        }

        // อัพเดทแท็บชั้นปี
        function updateGradeTabs() {
            const tabsContainer = document.getElementById('gradeTabs');
            tabsContainer.innerHTML = '';
            
            Object.keys(gradeData).forEach(grade => {
                if (gradeData[grade].length > 0) {
                    const button = document.createElement('button');
                    button.className = 'tab-button';
                    button.setAttribute('data-grade', grade);
                    button.innerHTML = `
                        <div style="font-weight: 700; margin-bottom: 5px;">${grade}</div>
                        <div style="font-size: 0.9em; opacity: 0.8;">${gradeData[grade].length} คน</div>
                    `;
                    button.addEventListener('click', function() {
                        currentGrade = grade;
                        updateActiveTab();
                        displayStudents();
                        updateSummary();
                        showCurrentGradeInfo();
                    });
                    tabsContainer.appendChild(button);
                }
            });
            
            // ถ้าไม่มีแท็บที่เลือก ให้เลือกแท็บแรก
            if (currentGrade === null && tabsContainer.children.length > 0) {
                currentGrade = tabsContainer.children[0].getAttribute('data-grade');
                updateActiveTab();
                displayStudents();
                updateSummary();
                showCurrentGradeInfo();
            }
        }

        // อัพเดทแท็บที่เลือก
        function updateActiveTab() {
            document.querySelectorAll('.tab-button').forEach(btn => {
                btn.classList.remove('active');
            });
            if (currentGrade) {
                const activeBtn = document.querySelector(`[data-grade="${currentGrade}"]`);
                if (activeBtn) {
                    activeBtn.classList.add('active');
                }
            }
        }

        // แสดงข้อมูลชั้นปีปัจจุบัน
        function showCurrentGradeInfo() {
            const infoDiv = document.getElementById('currentGradeInfo');
            const nameSpan = document.getElementById('currentGradeName');
            
            if (currentGrade) {
                const studentCount = gradeData[currentGrade].length;
                const checkedCount = gradeData[currentGrade].filter(s => s.status !== null).length;
                nameSpan.textContent = `📚 ${currentGrade} • จำนวน ${studentCount} คน • เช็คชื่อแล้ว ${checkedCount} คน`;
                infoDiv.style.display = 'block';
            } else {
                infoDiv.style.display = 'none';
            }
        }

        // แสดงนักเรียน
        function displayStudents() {
            const container = document.getElementById('studentsContainer');
            
            if (!currentGrade || gradeData[currentGrade].length === 0) {
                container.innerHTML = `
                    <div class="empty-state">
                        <h3>ไม่มีนักเรียนในระดับชั้นนี้</h3>
                        <p>เพิ่มนักเรียนเพื่อเริ่มต้นใช้งานระบบเช็คชื่อ</p>
                    </div>
                `;
                return;
            }

            container.innerHTML = '<div class="students-grid"></div>';
            const grid = container.querySelector('.students-grid');
            
            gradeData[currentGrade].forEach(student => {
                const studentCard = document.createElement('div');
                studentCard.className = 'student-card';
                
                // สร้าง HTML สำหรับแสดงเวลา
                let statusTimeHTML = '';
                if (student.status && student.statusTime) {
                    const statusMessage = getStatusMessage(student.status, student.statusTime);
                    statusTimeHTML = `
                        <div class="status-time ${student.status}">
                            📝 ${statusMessage}
                        </div>
                    `;
                }
                
                studentCard.innerHTML = `
                    <div class="student-header">
                        <div class="student-name">${student.name}</div>
                        <div class="student-actions">
                            <button class="btn btn-secondary btn-small" onclick="editStudent(${student.id})">
                                ✏️ แก้ไข
                            </button>
                            <button class="btn btn-danger btn-small" onclick="deleteStudent(${student.id})">
                                🗑️ ลบ
                            </button>
                        </div>
                    </div>
                    <div class="status-buttons">
                        <button class="status-btn present ${student.status === 'present' ? 'active' : ''}" 
                                onclick="setStatus(${student.id}, 'present')">
                            ✅ เข้าเรียน
                        </button>
                        <button class="status-btn absent ${student.status === 'absent' ? 'active' : ''}" 
                                onclick="setStatus(${student.id}, 'absent')">
                            ❌ ขาดเรียน
                        </button>
                        <button class="status-btn late ${student.status === 'late' ? 'active' : ''}" 
                                onclick="setStatus(${student.id}, 'late')">
                            ⏰ มาสาย
                        </button>
                        <button class="status-btn leave ${student.status === 'leave' ? 'active' : ''}" 
                                onclick="setStatus(${student.id}, 'leave')">
                            📋 ลา
                        </button>
                    </div>
                    ${statusTimeHTML}
                `;
                grid.appendChild(studentCard);
            });
        }

        // ตั้งค่าสถานะ
        function setStatus(studentId, status) {
            if (!currentGrade) return;
            
            const student = gradeData[currentGrade].find(s => s.id === studentId);
            if (student) {
                student.status = status;
                student.statusTime = formatTime(new Date()); // บันทึกเวลาปัจจุบัน
                displayStudents();
                updateSummary();
                showCurrentGradeInfo();
            }
        }

        // ลบนักเรียน
        function deleteStudent(studentId) {
            if (!currentGrade) return;
            
            const student = gradeData[currentGrade].find(s => s.id === studentId);
            if (student && confirm(`คุณต้องการลบ "${student.name}" ใช่หรือไม่?`)) {
                const index = gradeData[currentGrade].findIndex(s => s.id === studentId);
                if (index > -1) {
                    gradeData[currentGrade].splice(index, 1);
                    displayStudents();
                    updateSummary();
                    updateGradeTabs();
                    showCurrentGradeInfo();
                }
            }
        }

        // แก้ไขนักเรียน
        function editStudent(studentId) {
            if (!currentGrade) return;
            
            const student = gradeData[currentGrade].find(s => s.id === studentId);
            if (student) {
                editingStudentId = studentId;
                document.getElementById('editStudentName').value = student.name;
                document.getElementById('editModal').style.display = 'block';
            }
        }

        // ปิด Modal
        function closeEditModal() {
            document.getElementById('editModal').style.display = 'none';
            editingStudentId = null;
        }

        // บันทึกการแก้ไข
        document.getElementById('editStudentForm').addEventListener('submit', function(e) {
            e.preventDefault();
            
            if (!currentGrade || !editingStudentId) return;
            
            const newName = document.getElementById('editStudentName').value.trim();
            if (newName) {
                const student = gradeData[currentGrade].find(s => s.id === editingStudentId);
                if (student) {
                    student.name = newName;
                    displayStudents();
                    closeEditModal();
                    showSuccessMessage('แก้ไขข้อมูลสำเร็จ!');
                }
            }
        });

        // ปิด Modal เมื่อคลิกนอก Modal
        window.onclick = function(event) {
            const modal = document.getElementById('editModal');
            if (event.target === modal) {
                closeEditModal();
            }
        }

        // อัพเดทสรุป
        function updateSummary() {
            const summary = document.getElementById('summary');
            
            if (!currentGrade || gradeData[currentGrade].length === 0) {
                summary.style.display = 'none';
                return;
            }

            summary.style.display = 'block';
            
            const students = gradeData[currentGrade];
            const counts = {
                present: students.filter(s => s.status === 'present').length,
                absent: students.filter(s => s.status === 'absent').length,
                late: students.filter(s => s.status === 'late').length,
                leave: students.filter(s => s.status === 'leave').length
            };

            document.getElementById('presentCount').textContent = counts.present;
            document.getElementById('absentCount').textContent = counts.absent;
            document.getElementById('lateCount').textContent = counts.late;
            document.getElementById('leaveCount').textContent = counts.leave;
        }

        // เพิ่ม CSS สำหรับ animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
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
        document.head.appendChild(style);

        // เริ่มต้นโปรแกรม
        updateGradeTabs();
        updateSummary();

        