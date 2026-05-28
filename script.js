document.addEventListener('DOMContentLoaded', function() {
    const qrForm = document.getElementById('qrForm');
    if (qrForm) {
        qrForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const plate = document.getElementById('plate').value.trim().toUpperCase();
            const phone = document.getElementById('phone').value.trim();
            const phoneError = document.getElementById('phone-error');
            const phonePattern = /^1[3-9]\d{9}$/;

            if (!phonePattern.test(phone)) {
                phoneError.textContent = '请输入合法的手机号码';
                return;
            } else {
                phoneError.textContent = '';
            }

            generateQRCode(plate, phone);
        });
    }
});

function generateQRCode(plate, phone) {
    const hiddenPhone = phone.substring(0, 3) + '****' + phone.substring(7);
    const qrContent = 'tel:' + phone;
    const modeText = '扫码后直接拨号';

    // 显示结果
    document.getElementById('input-box').style.display = 'none';
    document.getElementById('result-box').style.display = 'block';

    document.getElementById('result-plate').textContent = plate;
    document.getElementById('result-phone').textContent = hiddenPhone;
    document.getElementById('result-mode').innerHTML = '<i class="fa-solid fa-circle-info"></i> ' + modeText;

    // 生成二维码
    const qrcodeDiv = document.getElementById('qrcode');
    qrcodeDiv.innerHTML = '';

    const qr = new QRCode(qrcodeDiv, {
        text: qrContent,
        width: 220,
        height: 220,
        colorDark: '#000000',
        colorLight: '#ffffff',
        correctLevel: QRCode.CorrectLevel.H
    });

    // 等待二维码渲染完成后绘制可打印卡片
    setTimeout(function() {
        drawPrintableCard(plate, hiddenPhone);
    }, 600);
}

function drawPrintableCard(plate, hiddenPhone) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const scale = 3;
    const w = 340 * scale;
    const h = 520 * scale;
    canvas.width = w;
    canvas.height = h;

    // 背景
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, w, h);

    // 顶部装饰条
    const gradient = ctx.createLinearGradient(0, 0, w, 0);
    gradient.addColorStop(0, '#3498db');
    gradient.addColorStop(1, '#2980b9');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, 12 * scale);

    // 标题
    ctx.fillStyle = '#2c3e50';
    ctx.font = 'bold ' + (28 * scale) + 'px "Microsoft YaHei", "PingFang SC", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('临时停车 扫码挪车', w / 2, 60 * scale);

    // 分隔线
    ctx.strokeStyle = '#e0e5ec';
    ctx.lineWidth = 1 * scale;
    ctx.beginPath();
    ctx.moveTo(30 * scale, 78 * scale);
    ctx.lineTo((340 - 30) * scale, 78 * scale);
    ctx.stroke();

    // 车牌信息
    ctx.fillStyle = '#555';
    ctx.font = (16 * scale) + 'px "Microsoft YaHei", "PingFang SC", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('车牌号', 40 * scale, 110 * scale);

    // 车牌框
    ctx.strokeStyle = '#3498db';
    ctx.lineWidth = 2 * scale;
    ctx.strokeRect(40 * scale, 120 * scale, (340 - 80) * scale, 50 * scale);
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(40 * scale, 120 * scale, (340 - 80) * scale, 50 * scale);

    ctx.fillStyle = '#2c3e50';
    ctx.font = 'bold ' + (24 * scale) + 'px "Microsoft YaHei", "PingFang SC", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(plate, w / 2, 153 * scale);

    // 电话信息（脱敏显示）
    ctx.fillStyle = '#555';
    ctx.font = (16 * scale) + 'px "Microsoft YaHei", "PingFang SC", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('联系电话', 40 * scale, 200 * scale);

    ctx.fillStyle = '#2c3e50';
    ctx.font = 'bold ' + (22 * scale) + 'px "Microsoft YaHei", "PingFang SC", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(hiddenPhone, w / 2, 232 * scale);

    // 二维码区域背景
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(45 * scale, 260 * scale, (340 - 90) * scale, (340 - 90) * scale);
    ctx.strokeStyle = '#e0e5ec';
    ctx.lineWidth = 2 * scale;
    ctx.strokeRect(45 * scale, 260 * scale, (340 - 90) * scale, (340 - 90) * scale);

    // 绘制二维码
    const qrcodeDiv = document.getElementById('qrcode');
    const qrImg = qrcodeDiv.querySelector('img');
    if (qrImg && qrImg.src) {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = function() {
            const qrSize = 220 * scale;
            const qrX = (w - qrSize) / 2;
            const qrY = 270 * scale;
            ctx.drawImage(img, qrX, qrY, qrSize, qrSize);

            // 二维码下方提示
            ctx.fillStyle = '#666';
            ctx.font = (13 * scale) + 'px "Microsoft YaHei", "PingFang SC", sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('用手机自带扫码或相机扫码，识别后可直接拨号', w / 2, 510 * scale);

            // 底部提示
            ctx.fillStyle = '#e74c3c';
            ctx.font = 'bold ' + (15 * scale) + 'px "Microsoft YaHei", "PingFang SC", sans-serif';
            ctx.fillText('如有急事，请扫码联系车主', w / 2, 545 * scale);

            ctx.fillStyle = '#999';
            ctx.font = (11 * scale) + 'px "Microsoft YaHei", "PingFang SC", sans-serif';
            ctx.fillText('请勿遮挡车牌，文明停车', w / 2, 570 * scale);

            // 存储 canvas 引用供下载使用
            window.printableCanvas = canvas;
        };
        img.src = qrImg.src;
    }
}

function downloadQR() {
    if (!window.printableCanvas) {
        alert('卡片尚未生成完成，请稍后再试');
        return;
    }

    const plate = document.getElementById('result-plate').textContent;
    const link = document.createElement('a');
    link.download = '挪车卡片_' + plate + '.png';
    link.href = window.printableCanvas.toDataURL('image/png');
    link.click();
}

function resetForm() {
    document.getElementById('result-box').style.display = 'none';
    document.getElementById('input-box').style.display = 'block';
    document.getElementById('plate').value = '';
    document.getElementById('phone').value = '';
    document.getElementById('qrcode').innerHTML = '';
    window.printableCanvas = null;
}