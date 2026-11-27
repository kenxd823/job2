document.addEventListener('DOMContentLoaded', function () {
    const userForm = document.getElementById('userForm');
    const nameInput = document.getElementById('name');
    const lastnameInput = document.getElementById('lastname');
    const ageInput = document.getElementById('age');

    const allowedKeys = [
        'Backspace',
        'Delete',
        'Tab',
        'Escape',
        'Enter',
        'ArrowLeft',
        'ArrowRight',
        'Home',
        'End'
    ];

    // อนุญาตเฉพาะตัวอักษรภาษาไทย (ก-ฮ, สระ, วรรณยุกต์) ภาษาอังกฤษ และเว้นวรรค (ไม่รวมตัวเลขและสัญลักษณ์)
    const letterCharPattern = /^[a-zA-Z\u0E01-\u0E3A\u0E40-\u0E4E ]$/;
    const nonLetterPattern = /[^a-zA-Z\u0E01-\u0E3A\u0E40-\u0E4E ]/g;
    const validNamePattern = /^[a-zA-Z\u0E01-\u0E3A\u0E40-\u0E4E ]+$/;

    function restrictToLettersOnly(inputElement) {
        inputElement.addEventListener('keydown', function (event) {
            if (
                allowedKeys.includes(event.key) ||
                event.ctrlKey ||
                event.metaKey ||
                event.isComposing ||
                event.key === 'Process' ||
                event.key === 'Unidentified'
            ) {
                return;
            }

            if (!letterCharPattern.test(event.key)) {
                event.preventDefault();
            }
        });

        function sanitizeValue() {
            const cleaned = inputElement.value.replace(nonLetterPattern, '');
            if (inputElement.value !== cleaned) {
                inputElement.value = cleaned;
            }
        }

        inputElement.addEventListener('input', function (event) {
            if (!event.isComposing) {
                sanitizeValue();
            }
        });

        inputElement.addEventListener('compositionend', sanitizeValue);
    }

    // บังคับให้ช่องชื่อและนามสกุลกรอกได้เฉพาะตัวอักษรเท่านั้น
    restrictToLettersOnly(nameInput);
    restrictToLettersOnly(lastnameInput);

    // บังคับให้ช่องอายุกรอกได้เฉพาะตัวเลข 0-9 และไม่เกิน 3 ตัว
    ageInput.addEventListener('keydown', function (event) {
        if (allowedKeys.includes(event.key) || event.ctrlKey || event.metaKey) {
            return;
        }

        // ห้ามกรอกตัวอักษรหรือสัญลักษณ์ที่ไม่ใช่ตัวเลข
        if (!/^[0-9]$/.test(event.key)) {
            event.preventDefault();
            return;
        }

        // ห้ามกรอกเกิน 3 ตัว (ยกเว้นกรณีคลุมดำเพื่อพิมพ์ทับ)
        const hasSelection = ageInput.selectionStart !== ageInput.selectionEnd;
        if (ageInput.value.length >= 3 && !hasSelection) {
            event.preventDefault();
        }
    });

    // กรองค่าอีกครั้งเผื่อกรณีวาง (Paste) หรือพิมพ์ผ่านคีย์บอร์ดภาษาไทย/มือถือ
    ageInput.addEventListener('input', function () {
        ageInput.value = ageInput.value.replace(/\D/g, '').slice(0, 3);
    });

    userForm.addEventListener('submit', function (event) {
        event.preventDefault();

        const name = nameInput.value.trim();
        const lastname = lastnameInput.value.trim();
        const ageValue = ageInput.value.trim();
        const age = Number(ageValue);

        if (!name || !validNamePattern.test(name)) {
            alert('กรุณากรอกชื่อเป็นตัวอักษรเท่านั้น');
            nameInput.focus();
            return;
        }

        if (!lastname || !validNamePattern.test(lastname)) {
            alert('กรุณากรอกนามสกุลเป็นตัวอักษรเท่านั้น');
            lastnameInput.focus();
            return;
        }

        if (!/^\d{1,3}$/.test(ageValue) || age < 0 || age > 150) {
            alert('กรุณากรอกอายุเป็นตัวเลข 0 - 150 (ไม่เกิน 3 หลัก)');
            ageInput.focus();
            return;
        }

        alert(`ข้อมูลที่กรอก\nชื่อ: ${name}\nนามสกุล: ${lastname}\nอายุ: ${age} ปี`);
    });
});
