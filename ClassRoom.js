// ระบบแก้ไขตารางเรียน
class ScheduleEditor {
    constructor() {
        this.isEditing = false;
        this.currentEditCell = null;
        this.originalContent = {};
        this.scheduleData = {};
        this.init();
    }

    init() {
        // เริ่มต้นระบบ
        this.loadScheduleData();
        this.bindEvents();
        this.addEditButtons();
    }

    // โหลดข้อมูลตารางเรียน
    loadScheduleData() {
        const cells = document.querySelectorAll('.subject-cell');
        cells.forEach(cell => {
            const day = cell.getAttribute('data-day');
            const period = cell.getAttribute('data-period');
            const key = `${day}-${period}`;
            
            const subjectName = cell.querySelector('.subject-name').textContent;
            const teacherName = cell.querySelector('.teacher-name').textContent;
            const roomName = cell.querySelector('.room-name').textContent;
            
            this.scheduleData[key] = {
                subject: subjectName,
                teacher: teacherName,
                room: roomName,
                color: this.getColorClass(cell)
            };
        });
    }

    // เพิ่มปุ่มควบคุม
    addEditButtons() {
        const header = document.querySelector('.header');
        const controlsDiv = document.createElement('div');
        controlsDiv.className = 'edit-controls';
        controlsDiv.innerHTML = `
            <button id="editMode" class="edit-btn">🖊️ แก้ไข</button>
            <button id="saveChanges" class="save-btn" style="display:none;">💾 บันทึก</button>
            <button id="cancelEdit" class="cancel-btn" style="display:none;">❌ ยกเลิก</button>
            <button id="addPeriod" class="add-btn" style="display:none;">➕ เพิ่มคาบ</button>
        `;
        
        // เพิ่ม CSS สำหรับปุ่ม
        const style = document.createElement('style');
        style.textContent = `
            .edit-controls {
                margin-top: 15px;
                display: flex;
                gap: 10px;
                justify-content: center;
                flex-wrap: wrap;
            }
            .edit-btn, .save-btn, .cancel-btn, .add-btn {
                padding: 8px 16px;
                border: none;
                border-radius: 5px;
                cursor: pointer;
                font-size: 0.9rem;
                transition: all 0.2s ease;
            }
            .edit-btn {
                background: #3498db;
                color: white;
            }
            .edit-btn:hover {
                background: #2980b9;
            }
            .save-btn {
                background: #27ae60;
                color: white;
            }
            .save-btn:hover {
                background: #219a52;
            }
            .cancel-btn {
                background: #e74c3c;
                color: white;
            }
            .cancel-btn:hover {
                background: #c0392b;
            }
            .add-btn {
                background: #f39c12;
                color: white;
            }
            .add-btn:hover {
                background: #e67e22;
            }
            .editing-mode {
                outline: 2px dashed #3498db;
                cursor: text;
            }
            .time-cell.editing {
                background: #e8f4f8 !important;
                cursor: text;
            }
            .editable-input {
                width: 100%;
                padding: 4px;
                border: 1px solid #3498db;
                border-radius: 3px;
                font-size: inherit;
                font-family: inherit;
                background: white;
                text-align: center;
            }
            .header.editing h1, .header.editing p {
                outline: 2px dashed #3498db;
                padding: 5px;
                border-radius: 3px;
                cursor: text;
            }
        `;
        document.head.appendChild(style);
        
        header.appendChild(controlsDiv);
        this.bindControlEvents();
    }

    // ผูกเหตุการณ์กับปุ่มควบคุม
    bindControlEvents() {
        document.getElementById('editMode').addEventListener('click', () => this.toggleEditMode());
        document.getElementById('saveChanges').addEventListener('click', () => this.saveChanges());
        document.getElementById('cancelEdit').addEventListener('click', () => this.cancelEdit());
        document.getElementById('addPeriod').addEventListener('click', () => this.addNewPeriod());
    }

    // ผูกเหตุการณ์
    bindEvents() {
        // คลิกเพื่อแก้ไข
        document.addEventListener('click', (e) => {
            if (this.isEditing) {
                this.handleEditClick(e);
            }
        });

        // กด Enter เพื่อบันทึก
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && this.isEditing) {
                this.finishEdit();
            }
            if (e.key === 'Escape' && this.isEditing) {
                this.cancelCurrentEdit();
            }
        });
    }

    // เปิด/ปิดโหมดแก้ไข
    toggleEditMode() {
        this.isEditing = !this.isEditing;
        const editBtn = document.getElementById('editMode');
        const saveBtn = document.getElementById('saveChanges');
        const cancelBtn = document.getElementById('cancelEdit');
        const addBtn = document.getElementById('addPeriod');
        
        if (this.isEditing) {
            editBtn.style.display = 'none';
            saveBtn.style.display = 'inline-block';
            cancelBtn.style.display = 'inline-block';
            addBtn.style.display = 'inline-block';
            this.enableEditMode();
        } else {
            editBtn.style.display = 'inline-block';
            saveBtn.style.display = 'none';
            cancelBtn.style.display = 'none';
            addBtn.style.display = 'none';
            this.disableEditMode();
        }
    }

    // เปิดใช้งานโหมดแก้ไข
    enableEditMode() {
        document.body.classList.add('editing-mode');
        document.querySelector('.header').classList.add('editing');
        
        // เพิ่มข้อความแนะนำ
        const info = document.createElement('div');
        info.id = 'edit-info';
        info.innerHTML = `
            <div style="background: #3498db; color: white; padding: 10px; text-align: center; font-size: 0.9rem;">
                💡 คลิกที่ช่องใดก็ได้เพื่อแก้ไข | กด Enter เพื่อยืนยัน | กด Escape เพื่อยกเลิก
            </div>
        `;
        document.querySelector('.container').insertBefore(info, document.querySelector('.table-container'));
        
        // ทำให้เซลล์สามารถแก้ไขได้
        const allCells = document.querySelectorAll('.subject-cell, .time-cell');
        allCells.forEach(cell => {
            cell.classList.add('editing-mode');
        });
    }

    // ปิดโหมดแก้ไข
    disableEditMode() {
        document.body.classList.remove('editing-mode');
        document.querySelector('.header').classList.remove('editing');
        
        // ลบข้อความแนะนำ
        const info = document.getElementById('edit-info');
        if (info) info.remove();
        
        // ลบคลาสแก้ไข
        const allCells = document.querySelectorAll('.subject-cell, .time-cell');
        allCells.forEach(cell => {
            cell.classList.remove('editing-mode');
        });
        
        this.finishEdit();
    }

    // จัดการคลิกเพื่อแก้ไข
    handleEditClick(e) {
        const target = e.target;
        
        // แก้ไขหัวข้อ
        if (target.matches('.header h1') || target.matches('.header p')) {
            this.editHeaderText(target);
            return;
        }
        
        // แก้ไขเวลา
        if (target.matches('.time-cell') || target.closest('.time-cell')) {
            this.editTimeCell(target.closest('.time-cell') || target);
            return;
        }
        
        // แก้ไขข้อมูลวิชา
        if (target.matches('.subject-name, .teacher-name, .room-name') || target.closest('.subject-cell')) {
            this.editSubjectCell(target);
            return;
        }
    }

    // แก้ไขหัวข้อ
    editHeaderText(element) {
        if (element.querySelector('input')) return;
        
        const originalText = element.textContent;
        const input = document.createElement('input');
        input.type = 'text';
        input.value = originalText;
        input.className = 'editable-input';
        input.style.width = '100%';
        input.style.fontSize = window.getComputedStyle(element).fontSize;
        input.style.fontWeight = window.getComputedStyle(element).fontWeight;
        input.style.textAlign = 'center';
        
        element.innerHTML = '';
        element.appendChild(input);
        input.focus();
        input.select();
        
        const finishEdit = () => {
            const newText = input.value.trim() || originalText;
            element.textContent = newText;
        };
        
        input.addEventListener('blur', finishEdit);
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                finishEdit();
            }
        });
    }

    // แก้ไขเซลล์เวลา
    editTimeCell(cell) {
        if (cell.querySelector('input')) return;
        
        const originalText = cell.innerHTML;
        const input = document.createElement('input');
        input.type = 'text';
        input.value = cell.textContent;
        input.className = 'editable-input';
        
        cell.innerHTML = '';
        cell.appendChild(input);
        cell.classList.add('editing');
        input.focus();
        input.select();
        
        const finishEdit = () => {
            const newText = input.value.trim();
            if (newText) {
                cell.innerHTML = newText.replace(/\n/g, '<br>');
            } else {
                cell.innerHTML = originalText;
            }
            cell.classList.remove('editing');
        };
        
        input.addEventListener('blur', finishEdit);
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                finishEdit();
            }
        });
    }

    // แก้ไขข้อมูลวิชา
    editSubjectCell(target) {
        const cell = target.closest('.subject-cell');
        if (!cell || cell.querySelector('input')) return;
        
        const subjectName = cell.querySelector('.subject-name');
        const teacherName = cell.querySelector('.teacher-name');
        const roomName = cell.querySelector('.room-name');
        
        // สร้างฟอร์มแก้ไข
        const form = document.createElement('div');
        form.className = 'edit-form';
        form.innerHTML = `
            <input type="text" class="subject-input" value="${subjectName.textContent}" placeholder="ชื่อวิชา">
            <input type="text" class="teacher-input" value="${teacherName.textContent}" placeholder="ชื่อครู">
            <input type="text" class="room-input" value="${roomName.textContent}" placeholder="ห้องเรียน">
            <div class="color-picker">
                <button type="button" class="color-option" data-color="color-none" style="background: #ffffff; border: 1px solid #ccc;"></button>
                <button type="button" class="color-option" data-color="color-blue" style="background: #eaf4fd;"></button>
                <button type="button" class="color-option" data-color="color-green" style="background: #eafaf1;"></button>
                <button type="button" class="color-option" data-color="color-yellow" style="background: #fef9e7;"></button>
                <button type="button" class="color-option" data-color="color-pink" style="background: #fdf2f8;"></button>
                <button type="button" class="color-option" data-color="color-purple" style="background: #f4f3ff;"></button>
                <button type="button" class="color-option" data-color="color-orange" style="background: #fff7ed;"></button>
                <button type="button" class="color-option" data-color="color-red" style="background: #fef2f2;"></button>
            </div>
        `;
        
        // เพิ่ม CSS สำหรับฟอร์ม
        if (!document.getElementById('edit-form-styles')) {
            const style = document.createElement('style');
            style.id = 'edit-form-styles';
            style.textContent = `
                .edit-form {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                    padding: 5px;
                }
                .edit-form input {
                    padding: 4px;
                    border: 1px solid #3498db;
                    border-radius: 3px;
                    font-size: 0.8rem;
                    text-align: center;
                }
                .color-picker {
                    display: flex;
                    gap: 2px;
                    justify-content: center;
                    margin-top: 4px;
                }
                .color-option {
                    width: 12px;
                    height: 12px;
                    border: 1px solid #ccc;
                    border-radius: 2px;
                    cursor: pointer;
                    transition: transform 0.1s ease;
                }
                .color-option:hover {
                    transform: scale(1.2);
                }
                .color-option.selected {
                    border: 2px solid #3498db;
                }
            `;
            document.head.appendChild(style);
        }
        
        const originalContent = cell.innerHTML;
        cell.innerHTML = '';
        cell.appendChild(form);
        
        // ไฮไลท์สีปัจจุบัน
        const currentColor = this.getColorClass(cell);
        const colorOption = form.querySelector(`[data-color="${currentColor}"]`);
        if (colorOption) colorOption.classList.add('selected');
        
        // ผูกเหตุการณ์เลือกสี
        form.querySelectorAll('.color-option').forEach(option => {
            option.addEventListener('click', () => {
                form.querySelectorAll('.color-option').forEach(o => o.classList.remove('selected'));
                option.classList.add('selected');
            });
        });
        
        // โฟกัสที่ input แรก
        form.querySelector('.subject-input').focus();
        
        const finishEdit = () => {
            const newSubject = form.querySelector('.subject-input').value.trim();
            const newTeacher = form.querySelector('.teacher-input').value.trim();
            const newRoom = form.querySelector('.room-input').value.trim();
            const selectedColor = form.querySelector('.color-option.selected');
            const newColor = selectedColor ? selectedColor.getAttribute('data-color') : 'color-none';
            
            // อัปเดตข้อมูล
            const day = cell.getAttribute('data-day');
            const period = cell.getAttribute('data-period');
            const key = `${day}-${period}`;
            
            this.scheduleData[key] = {
                subject: newSubject,
                teacher: newTeacher,
                room: newRoom,
                color: newColor
            };
            
            // อัปเดตหน้าตา
            cell.innerHTML = `
                <div class="cell-content">
                    <div class="subject-name">${newSubject}</div>
                    <div class="teacher-name">${newTeacher}</div>
                    <div class="room-name">${newRoom}</div>
                </div>
            `;
            
            // เปลี่ยนสี
            cell.className = `subject-cell ${newColor}`;
            cell.setAttribute('data-day', day);
            cell.setAttribute('data-period', period);
        };
        
        // ผูกเหตุการณ์
        form.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                finishEdit();
            }
            if (e.key === 'Escape') {
                cell.innerHTML = originalContent;
            }
        });
        
        // คลิกนอกฟอร์มเพื่อยืนยัน
        document.addEventListener('click', function outsideClick(e) {
            if (!cell.contains(e.target)) {
                finishEdit();
                document.removeEventListener('click', outsideClick);
            }
        });
    }

    // หาคลาสสี
    getColorClass(element) {
        const classes = element.className.split(' ');
        const colorClass = classes.find(cls => cls.startsWith('color-'));
        return colorClass || 'color-none';
    }

    // เพิ่มคาบเรียนใหม่
    addNewPeriod() {
        const tbody = document.querySelector('.schedule-table tbody');
        const newRow = document.createElement('tr');
        const periodNumber = tbody.querySelectorAll('tr').length - 1; // ลบแถวพัก
        
        newRow.innerHTML = `
            <td class="time-cell">คาบ ${periodNumber}<br>เวลาใหม่</td>
            <td class="subject-cell color-none" data-day="จันทร์" data-period="${periodNumber}">
                <div class="cell-content">
                    <div class="subject-name">วิชาใหม่</div>
                    <div class="teacher-name">ครูใหม่</div>
                    <div class="room-name">ห้องใหม่</div>
                </div>
            </td>
            <td class="subject-cell color-none" data-day="อังคาร" data-period="${periodNumber}">
                <div class="cell-content">
                    <div class="subject-name">วิชาใหม่</div>
                    <div class="teacher-name">ครูใหม่</div>
                    <div class="room-name">ห้องใหม่</div>
                </div>
            </td>
            <td class="subject-cell color-none" data-day="พุธ" data-period="${periodNumber}">
                <div class="cell-content">
                    <div class="subject-name">วิชาใหม่</div>
                    <div class="teacher-name">ครูใหม่</div>
                    <div class="room-name">ห้องใหม่</div>
                </div>
            </td>
            <td class="subject-cell color-none" data-day="พฤหัสบดี" data-period="${periodNumber}">
                <div class="cell-content">
                    <div class="subject-name">วิชาใหม่</div>
                    <div class="teacher-name">ครูใหม่</div>
                    <div class="room-name">ห้องใหม่</div>
                </div>
            </td>
            <td class="subject-cell color-none" data-day="ศุกร์" data-period="${periodNumber}">
                <div class="cell-content">
                    <div class="subject-name">วิชาใหม่</div>
                    <div class="teacher-name">ครูใหม่</div>
                    <div class="room-name">ห้องใหม่</div>
                </div>
            </td>
        `;
        
        tbody.appendChild(newRow);
        
        // เพิ่มคลาสแก้ไขให้เซลล์ใหม่
        newRow.querySelectorAll('.subject-cell, .time-cell').forEach(cell => {
            cell.classList.add('editing-mode');
        });
        
        alert('เพิ่มคาบเรียนใหม่แล้ว! คลิกที่เซลล์เพื่อแก้ไขข้อมูล');
    }

    // บันทึกการเปลี่ยนแปลง
    saveChanges() {
        alert('บันทึกการเปลี่ยนแปลงเรียบร้อย! ✅');
        console.log('ข้อมูลตารางเรียนที่บันทึก:', this.scheduleData);
        this.toggleEditMode();
    }

    // ยกเลิกการแก้ไข
    cancelEdit() {
        if (confirm('คุณต้องการยกเลิกการแก้ไขทั้งหมดหรือไม่?')) {
            location.reload(); // รีโหลดหน้าเพื่อกลับสู่สถานะเดิม
        }
    }

    // เสร็จสิ้นการแก้ไข
    finishEdit() {
        const inputs = document.querySelectorAll('.editable-input');
        inputs.forEach(input => {
            input.blur();
        });
        this.currentEditCell = null;
    }

    // ยกเลิกการแก้ไขปัจจุบัน
    cancelCurrentEdit() {
        if (this.currentEditCell) {
            this.currentEditCell.innerHTML = this.originalContent[this.currentEditCell.id] || this.currentEditCell.innerHTML;
            this.currentEditCell = null;
        }
    }
}

// เริ่มต้นระบบเมื่อหน้าเว็บโหลดเสร็จ
document.addEventListener('DOMContentLoaded', function() {
    new ScheduleEditor();
});

// เพิ่มฟังก์ชันส่งออกข้อมูล
function exportSchedule() {
    const scheduleData = JSON.stringify(window.scheduleEditor?.scheduleData || {}, null, 2);
    const blob = new Blob([scheduleData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'schedule-data.json';
    a.click();
    URL.revokeObjectURL(url);
}

// เพิ่มฟังก์ชันนำเข้าข้อมูล
function importSchedule() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                try {
                    const data = JSON.parse(e.target.result);
                    if (window.scheduleEditor) {
                        window.scheduleEditor.scheduleData = data;
                        location.reload();
                    }
                } catch (error) {
                    alert('ไฟล์ไม่ถูกต้อง!');
                }
            };
            reader.readAsText(file);
        }
    };
    input.click();
}