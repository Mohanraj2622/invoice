
// Generate QR Code for payment
function generatePaymentQRCode(phoneNumber, amount) {
    // Clear previous QR code if exists
    const qrContainer = document.getElementById('qrcode');
    if (qrContainer) {
        qrContainer.innerHTML = '';
    }

    const upiId = document.getElementById('upi-id').value;
    const paymentPhone = document.getElementById('payment-phone').value || phoneNumber;

    if (!upiId && !paymentPhone) {
        return null;
    }

    // Create QR code data for UPI payment
    let qrData;
    // add seller upi in the below
    if (upiId) {
        // Using UPI ID format
        qrData = `upi://pay?pa=${upiId}&pn=Store&am=${amount.toFixed(2)}&cu=INR`;
    } else {
        // Using phone number format
        qrData = `upi://pay?pa=${paymentPhone}@naviaxis&pn=Store&am=${amount.toFixed(2)}&cu=INR`;
    }

    // Create QR code element if not exists
    if (!qrContainer) {
        const qrDiv = document.createElement('div');
        qrDiv.id = 'qrcode';
        return { qrDiv, qrData };
    }

    return { qrContainer, qrData };
}

// Add Item button event listener
addItemBtn.addEventListener('click', addItemRow);

// Preview button event listener
previewBtn.addEventListener('click', function () {
    generateInvoicePreview();
    previewModal.style.display = 'block';
});

// Close modal event listener
closeModalBtn.addEventListener('click', function () {
    previewModal.style.display = 'none';
});

// Close modal when clicking outside
window.addEventListener('click', function (event) {
    if (event.target === previewModal) {
        previewModal.style.display = 'none';
    }
});

// Print button event listener
printBtn.addEventListener('click', function () {
    window.print();
});

// Generate invoice preview
function generateInvoicePreview() {
    const shopName = document.getElementById('shop-name').value;
    const shopAddress = document.getElementById('shop-address').value;
    const shopContact = document.getElementById('shop-contact').value;
    const shopGstin = document.getElementById('shop-gstin').value;
    const customerName = document.getElementById('customer-name').value;
    const customerPhone = document.getElementById('customer-phone').value;
    const invoiceDate = currentDatetimeElem.textContent;
    const invoiceNumber = invoiceNumberElem.textContent;
    const grandTotal = grandTotalElem.textContent;

    // Get total amount as number for QR code
    const totalAmount = parseFloat(grandTotal.replace('₹', '')) || 0;

    // Start building the preview HTML
    let previewHTML = `
        <div class="invoice-preview">
            <h1 style="margin:0">${shopName}</h1>
            <p>${shopAddress}</p>
            <p>${shopContact}</p>
            ${shopGstin ? `<p>GSTIN: ${shopGstin}</p>` : ''}
            <hr>
            
            <div style="display: flex; justify-content: space-between; margin: 20px 0;">
                <div>
                    <h3>Bill To:</h3>
                    <p>${customerName}</p>
                    <p>Phone: ${customerPhone}</p>
                </div>
                <div>
                    <h3>Invoice Details:</h3>
                    <p>Invoice #: ${invoiceNumber}</p>
                    <p>Date: ${invoiceDate}</p>
                </div>
            </div>
            
            <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
                <thead>
                    <tr style="background-color: #f2f2f2;">
                        <th style="padding: 10px; text-align: left; border-bottom: 2px solid #ddd;">Item</th>
                        <th style="padding: 10px; text-align: right; border-bottom: 2px solid #ddd;">Price</th>
                        <th style="padding: 10px; text-align: right; border-bottom: 2px solid #ddd;">Quantity</th>
                        <th style="padding: 10px; text-align: right; border-bottom: 2px solid #ddd;">Total</th>
                    </tr>
                </thead>
                <tbody>
    `;

    // Get all item rows
    const itemRows = document.querySelectorAll('.item-row');

    // Add rows to preview
    itemRows.forEach(row => {
        const productSelect = row.querySelector('.product-select');
        const productName = productSelect.options[productSelect.selectedIndex].textContent;
        const price = row.querySelector('.price-input').value;
        const quantity = row.querySelector('.quantity-input').value;
        const total = row.querySelector('[data-total]').textContent;

        previewHTML += `
            <tr style="border-bottom: 1px solid #ddd;">
                <td style="padding: 10px;">${productName}</td>
                <td style="padding: 10px; text-align: right;">₹${parseFloat(price).toFixed(2)}</td>
                <td style="padding: 10px; text-align: right;">${quantity}</td>
                <td style="padding: 10px; text-align: right;">${total}</td>
            </tr>
        `;
    });

    // Add grand total
    previewHTML += `
                </tbody>
                <tfoot>
                    <tr>
                        <td colspan="3" style="padding: 10px; text-align: right; font-weight: bold; border-top: 2px solid #ddd;">Grand Total:</td>
                        <td style="padding: 10px; text-align: right; font-weight: bold; border-top: 2px solid #ddd;">${grandTotal}</td>
                    </tr>
                </tfoot>
            </table>
    `;

    // Generate payment QR code
    const paymentPhone = document.getElementById('payment-phone').value;
    const qrInfo = generatePaymentQRCode(paymentPhone, totalAmount);

    if (qrInfo) {
        previewHTML += `
            <div class="qr-container">
                <p class="qr-title">Scan to Pay</p>
                <div id="qrcode"></div>
                <p class="payment-info">UPI Payment: ${document.getElementById('upi-id').value || paymentPhone + '@naviaxis'}</p>
                <p class="payment-info">Amount: ${grandTotal}</p>
            </div>
        `;
    }

    previewHTML += `
            <div style="margin-top: 40px; text-align: center;">
                <p>Thank you for your business!</p>
            </div>
        </div>
    `;

    // Set the preview content
    previewContent.innerHTML = previewHTML;

    // Generate QR code after the HTML is added to the DOM
    if (qrInfo) {
        new QRCode(document.getElementById('qrcode'), {
            text: qrInfo.qrData,
            width: 128,
            height: 128,
            colorDark: "#000000",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.H
        });
    }
}

// Save invoice data to Google Sheets
function saveToGoogleSheets() {
    // Check if user has entered customer information
    const customerName = document.getElementById('customer-name').value;
    const customerPhone = document.getElementById('customer-phone').value;

    if (!customerName || !customerPhone) {
        alert('Please enter customer name and phone number before saving.');
        return;
    }

    // Get all required data
    const shopName = document.getElementById('shop-name').value;
    const invoiceNumber = invoiceNumberElem.textContent;
    const invoiceDate = currentDatetimeElem.textContent;
    const grandTotal = grandTotalElem.textContent.replace('₹', '');

    // Get all items
    const itemRows = document.querySelectorAll('.item-row');
    let items = [];

    itemRows.forEach(row => {
        const productSelect = row.querySelector('.product-select');
        if (productSelect.selectedIndex > 0) { // If a product is selected
            const productName = productSelect.options[productSelect.selectedIndex].textContent;
            const price = row.querySelector('.price-input').value;
            const quantity = row.querySelector('.quantity-input').value;
            const total = row.querySelector('[data-total]').getAttribute('data-total');

            items.push({
                name: productName,
                price: price,
                quantity: quantity,
                total: total
            });
        }
    });

    // Check if we have any items
    if (items.length === 0) {
        alert('Please add at least one item before saving.');
        return;
    }

    // Prepare the invoice data
    const invoiceData = {
        invoiceNumber: invoiceNumber,
        invoiceDate: invoiceDate,
        shopName: shopName,
        customerName: customerName,
        customerPhone: customerPhone,
        items: JSON.stringify(items),
        grandTotal: grandTotal
    };

    // Show loading indicator
    const saveBtn = document.getElementById('save-btn');
    const originalText = saveBtn.textContent;
    saveBtn.textContent = 'Saving...';
    saveBtn.disabled = true;

    // Send data to Google Apps Script Web App
    // Replace 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL' with the URL you get after deploying your script
    fetch('YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL', {
        method: 'POST',
        mode: 'no-cors',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(invoiceData)
    })
        .then(response => {
            // Reset button
            saveBtn.textContent = originalText;
            saveBtn.disabled = false;

            // Show success message
            alert('Invoice saved to Google Sheets successfully!');
        })
        .catch(error => {
            // Reset button
            saveBtn.textContent = originalText;
            saveBtn.disabled = false;

            // Show error message
            console.error('Error:', error);
            alert('Failed to save invoice to Google Sheets. See console for details.');
        });
}
