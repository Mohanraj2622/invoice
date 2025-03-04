// Function to show custom alert
function showCustomAlert(message) {
    const customAlert = document.getElementById('custom-alert');
    const customAlertMessage = document.getElementById('custom-alert-message');
    const customAlertClose = document.getElementById('custom-alert-close');

    if (customAlert && customAlertMessage && customAlertClose) {
        // Set the alert message
        customAlertMessage.textContent = message;

        // Show the alert
        customAlert.style.display = 'flex';

        // Close the alert when the OK button is clicked
        customAlertClose.addEventListener('click', () => {
            customAlert.style.display = 'none';
        });
    } else {
        console.error('Custom alert elements not found!');
    }
}

document.addEventListener("keydown", function (event) {
    if (event.ctrlKey && (event.key === "=" || event.key === "-" || event.key === "0")) {
        event.preventDefault();
    }
});

document.addEventListener("wheel", function (event) {
    if (event.ctrlKey) {
        event.preventDefault();
    }
}, { passive: false });

// Product Catalog with built-in prices
const products = [
    // shawarma
    { id: 'prod1', name: "Nesamani Shawarma-Reg", price: 60 },
    { id: 'prod2', name: "Nesamani Shawarma-Spe", price: 80 },
    { id: 'prod3', name: "Pushpa Shawarma-Spe", price: 90 },
    { id: 'prod4', name: "Pushpa Shawarma-Rge", price: 70 },
    { id: 'prod5', name: "Ghost Rider Shawarma-Spe", price: 110 },
    { id: 'prod6', name: "Cheese Shawarma-Spe", price: 130 },
    { id: 'prod7', name: "Cheese Shawarma-Rge", price: 100 },
    { id: 'prod8', name: "Ghost Rider Shawarma-Rge", price: 90 },
    { id: 'prod9', name: "Plate Shawarma-Rge", price: 130 },
    { id: 'prod10', name: "Plate Shawarma-Spe", price: 160 },
    { id: 'prod11', name: "Bun Shawarma-Rge", price: 40 },
    { id: 'prod12', name: "Bun Shawarma-Spe", price: 60 },
    { id: 'prod13', name: "Hariyali Shawarma-Rge", price: 70 },
    { id: 'prod14', name: "Hariyali Shawarma-Spe", price: 90 },
    { id: 'prod15', name: "Maxican Shawarma-Rge", price: 80 },
    { id: 'prod16', name: "Maxican Shawarma-Spe", price: 100 },
    { id: 'prod17', name: "Jumbo Shawarma-Rge", price: 110 },
    { id: 'prod18', name: "Jumbo Shawarma-Spe", price: 140 },
    //fried chiken
    { id: 'prod19', name: "Wings(5p)", price: 120 },
    { id: 'prod20', name: "Lolipop(5p)", price: 120 },
    { id: 'prod21', name: "Hot Wings(5p)", price: 130 },
    { id: 'prod22', name: "Chicken Leg(2p)", price: 120 },
    { id: 'prod23', name: "Hot Lolipop(5p)", price: 130 },
    { id: 'prod24', name: "Chicken Popcorn", price: 100 },
    // BBQ
    { id: 'prod25', name: "BBQ Wings(5p)", price: 120 },
    { id: 'prod26', name: "BBQ Lolipop(5p)", price: 120 },
    { id: 'prod27', name: "BBQ Chicken Leg(5p)", price: 120 },
    //chaats
    { id: 'prod28', name: "French Fries", price: 50 },
    { id: 'prod29', name: "Hot Fries", price: 60 },
    { id: 'prod30', name: "Cheesy Fries", price: 70 },
    { id: 'prod31', name: "Cheesy Fries with Popcorn", price: 160 },
    // momos
    { id: 'prod32', name: "Veg Momos", price: 70 },
    { id: 'prod33', name: "Chicken Momos", price: 80 },
    // mayonnaise
    { id: 'prod34', name: "Extra Mayonnaise", price: 10 },
    { id: 'prod35', name: "Extra Kuboos", price: 15 },
    // today special's
    { id: 'prod36', name: "Kothu Shawarma", price: 130 },
    { id: 'prod37', name: "Fried Chicken pop corn Shawarma", price: 100 },

    // custom item
    { id: 'prod38', name: "Custom Item", price: 0 }
];

// DOM Elements
const addItemBtn = document.getElementById('add-item');
const itemsContainer = document.getElementById('items-container');
const grandTotalElem = document.getElementById('grand-total');
const previewBtn = document.getElementById('preview-btn');
const saveBtn = document.getElementById('save-btn');
const whatsappBtn = document.getElementById('whatsapp-btn');
const modalWhatsappBtn = document.getElementById('modal-whatsapp-btn');
const previewModal = document.getElementById('preview-modal');
const previewContent = document.getElementById('preview-content');
const closeModalBtn = document.querySelector('.close');
const printBtn = document.getElementById('print-btn');
const currentDatetimeElem = document.getElementById('current-datetime');
const invoiceNumberElem = document.getElementById('invoice-number');
const upiDetailsPanel = document.getElementById('upi-details-panel');
const paymentMethodRadios = document.getElementsByName('payment-method');
const upiIdInput = document.getElementById('upi-id');
const paymentPhoneInput = document.getElementById('payment-phone');
const qrcodeContainer = document.getElementById('qrcode-container');
const saveShopBtn = document.getElementById('save-shop-info');

// Set current date and time
function updateDateTime() {
    const now = new Date();
    const options = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    currentDatetimeElem.textContent = now.toLocaleDateString('en-IN', options);
}

// Generate Invoice Number
function generateInvoiceNumber() {
    const now = new Date();
    const year = now.getFullYear().toString().slice(-2);
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');

    invoiceNumberElem.textContent = `INV-${year}${month}${day}-${random}`;
}

// Initialize date, time and invoice number
updateDateTime();
generateInvoiceNumber();

// Payment Method Handling
function initPaymentMethodHandling() {
    toggleUPIDetailsVisibility();
    paymentMethodRadios.forEach(radio => {
        radio.addEventListener('change', toggleUPIDetailsVisibility);
    });

    if (upiIdInput && paymentPhoneInput) {
        upiIdInput.addEventListener('input', generateQRCode);
        paymentPhoneInput.addEventListener('input', generateQRCode);
    }
}

// Toggle UPI Details visibility based on payment method selection
function toggleUPIDetailsVisibility() {
    const selectedPaymentMethod = document.querySelector('input[name="payment-method"]:checked').value;
    if (upiDetailsPanel) {
        if (selectedPaymentMethod === 'upi') {
            upiDetailsPanel.style.display = 'block';
            generateQRCode();
        } else {
            upiDetailsPanel.style.display = 'none';
        }
    }
}

// Generate QR Code for UPI payments
function generateQRCode() {
    if (!qrcodeContainer) return;
    qrcodeContainer.innerHTML = '';
    const upiId = upiIdInput.value.trim();
    const paymentPhone = paymentPhoneInput.value.trim();
    const amount = parseFloat(grandTotalElem.textContent.replace('₹', '')) || 0;
    if (upiId || paymentPhone) {
        let upiLink = 'upi://pay?';
        if (upiId) {
            upiLink += `pa=${encodeURIComponent(upiId)}`;
        } else if (paymentPhone) {
            upiLink += `pa=${encodeURIComponent(paymentPhone)}@naviaxis`;
        }
        upiLink += `&pn=${encodeURIComponent('Shawarma Spot')}`;
        upiLink += `&am=${amount.toFixed(2)}`;
        upiLink += `&cu=INR`;
        new QRCode(qrcodeContainer, {
            text: upiLink,
            width: 128,
            height: 128,
            colorDark: "#000000",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.H
        });
        const caption = document.createElement('p');
        caption.textContent = 'Scan to pay via UPI';
        caption.className = 'qrcode-caption';
        qrcodeContainer.appendChild(caption);
    }
}

// Update grand total
function updateGrandTotal() {
    const itemRows = document.querySelectorAll('.item-row');
    let total = 0;
    itemRows.forEach(row => {
        const totalElem = row.querySelector('[data-total]');
        if (totalElem) {
            total += parseFloat(totalElem.getAttribute('data-total')) || 0;
        }
    });
    grandTotalElem.textContent = `₹${total.toFixed(2)}`;
    if (document.querySelector('input[name="payment-method"]:checked')?.value === 'naviaxis') {
        generateQRCode();
    }
}

// Create product dropdown
function createProductDropdown() {
    const select = document.createElement('select');
    select.className = 'product-select';
    const defaultOption = document.createElement('option');
    defaultOption.value = "";
    defaultOption.textContent = "Select a product";
    select.appendChild(defaultOption);
    products.forEach((product, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = product.name;
        option.setAttribute('data-price', product.price);
        select.appendChild(option);
    });
    select.addEventListener('change', function () {
        const selectedIndex = this.value;
        if (selectedIndex !== "") {
            const row = this.closest('.item-row');
            const priceInput = row.querySelector('.price-input');
            const selectedOption = this.options[this.selectedIndex];
            if (products[selectedIndex].name === "Custom Item") {
                priceInput.value = "";
                priceInput.removeAttribute('readonly');
            } else {
                priceInput.value = parseFloat(selectedOption.getAttribute('data-price')).toFixed(2);
                priceInput.setAttribute('readonly', 'readonly');
            }
            calculateRowTotal(row);
        }
    });
    return select;
}

// Calculate row total
function calculateRowTotal(row) {
    const priceInput = row.querySelector('.price-input');
    const quantityInput = row.querySelector('.quantity-input');
    const totalElem = row.querySelector('[data-total]');
    const price = parseFloat(priceInput.value) || 0;
    const quantity = parseInt(quantityInput.value) || 0;
    const total = price * quantity;
    totalElem.textContent = `₹${total.toFixed(2)}`;
    totalElem.setAttribute('data-total', total);
    updateGrandTotal();
}

// Add a new item row
function addItemRow() {
    const row = document.createElement('div');
    row.className = 'item-row';
    const productDropdown = createProductDropdown();
    const priceInput = document.createElement('input');
    priceInput.type = 'number';
    priceInput.className = 'price-input';
    priceInput.placeholder = 'Price';
    priceInput.step = '0.01';
    priceInput.min = '0';
    priceInput.addEventListener('input', () => calculateRowTotal(row));
    const quantityInput = document.createElement('input');
    quantityInput.type = 'number';
    quantityInput.className = 'quantity-input';
    quantityInput.placeholder = 'Qty';
    quantityInput.value = '1';
    quantityInput.min = '1';
    quantityInput.addEventListener('input', () => calculateRowTotal(row));
    const totalElem = document.createElement('div');
    totalElem.className = 'row-total';
    totalElem.textContent = '₹0.00';
    totalElem.setAttribute('data-total', '0');
    const removeBtn = document.createElement('button');
    removeBtn.className = 'btn-remove';
    removeBtn.innerHTML = '<i class="fas fa-trash"></i>';
    removeBtn.addEventListener('click', function () {
        row.remove();
        updateGrandTotal();
    });
    row.appendChild(productDropdown);
    row.appendChild(priceInput);
    row.appendChild(quantityInput);
    row.appendChild(totalElem);
    row.appendChild(removeBtn);
    itemsContainer.appendChild(row);
}

// Event listener for add item button
if (addItemBtn) {
    addItemBtn.addEventListener('click', addItemRow);
}

// Generate preview content including payment method
function generatePreview() {
    const shopName = document.getElementById('shop-name').value;
    const shopAddress = document.getElementById('shop-address').value;
    const shopContact = document.getElementById('shop-contact').value;
    const shopGstin = document.getElementById('shop-gstin').value;
    const invoiceNumber = invoiceNumberElem.textContent;
    const currentDatetime = currentDatetimeElem.textContent;
    const customerName = document.getElementById('customer-name').value;
    const customerPhone = document.getElementById('customer-phone').value;
    const paymentMethod = document.querySelector('input[name="payment-method"]:checked').value;
    const items = [];
    document.querySelectorAll('.item-row').forEach(row => {
        const productSelect = row.querySelector('.product-select');
        if (productSelect && productSelect.selectedIndex > 0) {
            const productName = productSelect.options[productSelect.selectedIndex].textContent;
            const price = parseFloat(row.querySelector('.price-input').value) || 0;
            const quantity = parseInt(row.querySelector('.quantity-input').value) || 0;
            const total = parseFloat(row.querySelector('[data-total]').getAttribute('data-total')) || 0;
            items.push({ name: productName, price, quantity, total });
        }
    });
    const grandTotal = parseFloat(grandTotalElem.textContent.replace('₹', '')) || 0;
    let html = `
        <div class="invoice-preview">
            <div class="preview-header">
                <div class="shop-info">
                    <h2>${shopName || 'Shawarma Spot'}</h2>
                    <p>${shopAddress || 'Krishnagiri, Tamil Nadu'}</p>
                    <p>${shopContact || 'Phone: +91 98765 43210'}</p>
                    ${shopGstin ? `<p>GSTIN: ${shopGstin}</p>` : ''}
                </div>
                <div class="invoice-info">
                    <h3>Invoice #: ${invoiceNumber}</h3>
                    <p>Date: ${currentDatetime}</p>
                </div>
            </div>
            <div class="customer-info">
                <h3>Customer Information</h3>
                <p>Name: ${customerName || 'N/A'}</p>
                <p>Phone: ${customerPhone || 'N/A'}</p>
            </div>
            <div class="payment-info">
                <h3>Payment Method</h3>
                <p>${paymentMethod === 'cash' ? '<i class="fas fa-money-bill-wave"></i> Cash Payment' : '<i class="fas fa-mobile-alt"></i> UPI Payment'}</p>
            </div>
            <div class="items-table">
                <table>
                    <thead>
                        <tr>
                            <th>Item</th>
                            <th>Price</th>
                            <th>Quantity</th>
                            <th>Total</th>
                        </tr>
                    </thead>
                    <tbody>
    `;
    if (items.length > 0) {
        items.forEach(item => {
            html += `
                <tr>
                    <td>${item.name}</td>
                    <td>₹${item.price.toFixed(2)}</td>
                    <td>${item.quantity}</td>
                    <td>₹${item.total.toFixed(2)}</td>
                </tr>
            `;
        });
    } else {
        html += `
            <tr>
                <td colspan="4" style="text-align: center;">No items added</td>
            </tr>
        `;
    }
    html += `
                    </tbody>
                    <tfoot>
                        <tr>
                            <td colspan="3"><strong>Grand Total</strong></td>
                            <td><strong>₹${grandTotal.toFixed(2)}</strong></td>
                        </tr>
                    </tfoot>
                </table>
            </div>
    `;
    if (paymentMethod === 'upi') {
        const upiId = upiIdInput.value.trim();
        const paymentPhone = paymentPhoneInput.value.trim();
        html += `
            <div class="upi-payment-info">
                <h3>UPI Payment Details</h3>
        `;
        if (qrcodeContainer && qrcodeContainer.innerHTML && (upiId || paymentPhone)) {
            html += `
                <div class="qrcode-preview">
                    ${qrcodeContainer.innerHTML}
                </div>
            `;
        }
        html += `
                <p>UPI ID: ${upiId || 'N/A'}</p>
                <p>Payment Phone: ${paymentPhone || 'N/A'}</p>
            </div>
        `;
    }
    html += `
            <div class="thank-you">
                <p>Thank you for your business!</p>
                <p>Visit Again!</p>
            </div>
        </div>
    `;
    return html;
}

// WhatsApp functionality
function sendToWhatsApp() {
    const customerPhone = document.getElementById('customer-phone').value.trim();
    if (!customerPhone) {
        showCustomAlert('Please enter customer phone number for WhatsApp');
        return;
    }
    const shopName = document.getElementById('shop-name').value || 'Shawarma Spot';
    const invoiceNumber = invoiceNumberElem.textContent;
    const customerName = document.getElementById('customer-name').value;
    const paymentMethod = document.querySelector('input[name="payment-method"]:checked').value;
    let message = `*Invoice from ${shopName}*\n`;
    message += `Invoice #: ${invoiceNumber}\n`;
    message += `Date: ${currentDatetimeElem.textContent}\n\n`;
    if (customerName) {
        message += `Customer: ${customerName}\n\n`;
    }
    message += `Payment Method: ${paymentMethod === 'cash' ? 'Cash' : 'UPI'}\n\n`;
    message += `*Items:*\n`;
    const itemRows = document.querySelectorAll('.item-row');
    itemRows.forEach(row => {
        const productSelect = row.querySelector('.product-select');
        if (productSelect && productSelect.selectedIndex > 0) {
            const productName = productSelect.options[productSelect.selectedIndex].textContent;
            const price = parseFloat(row.querySelector('.price-input').value) || 0;
            const quantity = parseInt(row.querySelector('.quantity-input').value) || 0;
            const total = parseFloat(row.querySelector('[data-total]').getAttribute('data-total')) || 0;
            message += `${productName} x ${quantity} = ₹${total.toFixed(2)}\n`;
        }
    });
    const grandTotal = parseFloat(grandTotalElem.textContent.replace('₹', '')) || 0;
    message += `\n*Grand Total: ₹${grandTotal.toFixed(2)}*\n\n`;
    if (paymentMethod === 'upi') {
        const upiId = upiIdInput.value.trim();
        const paymentPhone = paymentPhoneInput.value.trim();
        if (upiId || paymentPhone) {
            message += `*UPI Payment Details:*\n`;
            if (upiId) message += `UPI ID: ${upiId}\n`;
            if (paymentPhone) message += `Payment Phone: ${paymentPhone}\n`;
        }
    }
    message += `\nThank you for your business! Visit Again!`;
    let formattedPhone = customerPhone.replace(/\D/g, '');
    if (!formattedPhone.startsWith('91')) {
        formattedPhone = `91${formattedPhone}`;
    }
    const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
}

// Save functionality
function saveInvoice() {
    const invoiceData = {
        shopName: document.getElementById('shop-name').value || 'Shawarma Spot',
        shopAddress: document.getElementById('shop-address').value || '',
        shopContact: document.getElementById('shop-contact').value || '',
        shopGstin: document.getElementById('shop-gstin').value || '',
        invoiceNumber: invoiceNumberElem.textContent,
        datetime: currentDatetimeElem.textContent, // Add date and time
        customerName: document.getElementById('customer-name').value || '',
        customerPhone: document.getElementById('customer-phone').value || '',
        paymentMethod: document.querySelector('input[name="payment-method"]:checked').value, // Add payment method
        upiId: document.getElementById('upi-id').value || '',
        paymentPhone: document.getElementById('payment-phone').value || '',
        items: [],
        grandTotal: parseFloat(grandTotalElem.textContent.replace('₹', '')) || 0
    };

    // Add items to the invoiceData object
    document.querySelectorAll('.item-row').forEach(row => {
        const productSelect = row.querySelector('.product-select');
        if (productSelect && productSelect.selectedIndex > 0) {
            const productName = productSelect.options[productSelect.selectedIndex].textContent;
            const price = parseFloat(row.querySelector('.price-input').value) || 0;
            const quantity = parseInt(row.querySelector('.quantity-input').value) || 0;
            const total = parseFloat(row.querySelector('[data-total]').getAttribute('data-total')) || 0;
            invoiceData.items.push({ name: productName, price, quantity, total });
        }
    });

    // Show loading indicator
    const saveBtn = document.getElementById('save-btn');
    if (!saveBtn) return;
    const originalText = saveBtn.textContent;
    saveBtn.textContent = 'Saving...';
    saveBtn.disabled = true;

    // Send data to Google Apps Script Web App
    fetch('https://script.google.com/macros/s/AKfycbwVxK-UXidz3LWKRbspNr-aDTZJhmmGN6EhBr-9R-WJ8dmAaED-d4n8jFRKMYSBIydZ/exec', {
        method: 'POST',
        mode: 'no-cors',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(invoiceData)
    })
        .then(response => {
            saveBtn.textContent = originalText;
            saveBtn.disabled = false;
            showCustomAlert('Invoice saved to Google Sheets successfully!');
            appendSendButton();
        })
        .catch(error => {
            saveBtn.textContent = originalText;
            saveBtn.disabled = false;
            console.error('Error:', error);
            showCustomAlert('Failed to save invoice to Google Sheets. See console for details.');
        });
}

// Hide and unhide the existing WhatsApp button after successful save
function appendSendButton() {
    const whatsappBtn = document.getElementById('whatsapp-btn');

    if (whatsappBtn) {
        // Unhide the button if it's hidden
        whatsappBtn.style.display = 'block'; // or 'inline-block' depending on your CSS
    } else {
        console.error('WhatsApp button not found!');
    }
}

// Preview modal functionality
if (previewBtn) {
    previewBtn.addEventListener('click', function () {
        previewContent.innerHTML = generatePreview();
        previewModal.style.display = 'block';
    });
}

// Close modal
if (closeModalBtn) {
    closeModalBtn.addEventListener('click', function () {
        previewModal.style.display = 'none';
    });
}
/*
// Print functionality
if (printBtn) {
    printBtn.addEventListener('click', function () {
        window.print();
    });
}*/

if (printBtn) {
    printBtn.addEventListener('click', function () {
        // Generate the invoice content for printing
        const printContent = generatePreview(); // Ensure this function returns valid HTML content

        if (!printContent || printContent.trim() === "") {
            console.error("Error: Invoice content is empty!");
            showCustomAlert("Invoice content is empty. Cannot generate PDF.");
            return;
        }

        // Send the print content to the WebView (for Android integration)
        if (window.Android && typeof window.Android.generatePreview === 'function') {
            window.Android.generatePreview(printContent);
        } else {
            // Create a container div for the invoice content
            const container = document.createElement('div');
            container.innerHTML = printContent;
            container.style.width = '210mm';
            container.style.minHeight = '297mm'; // Ensure A4 full height
            container.style.padding = '10mm';
            container.style.background = '#fff'; // Ensure white background
            container.style.visibility = 'hidden';
            container.style.position = 'absolute';
            container.style.left = '-9999px';
            document.body.appendChild(container);

            // Wait for content to be fully rendered before generating PDF
            setTimeout(() => {
                generatePDF(container);
            }, 500);

            function generatePDF(element) {
                const now = new Date();
                const filename = `invoice_${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}.pdf`;

                const opt = {
                    margin: [10, 10, 10, 10],
                    filename: filename,
                    image: { type: 'jpeg', quality: 0.98 },
                    html2canvas: {
                        scale: 2,
                        useCORS: true,
                        logging: true,
                        onclone: (doc) => {
                            // Ensure styles are applied before capturing the image
                            const clonedElement = doc.body.querySelector('div'); // Find the cloned div
                            if (clonedElement) {
                                clonedElement.style.display = 'block';
                            } else {
                                console.warn("Cloned element not found!");
                            }
                        }
                    },
                    jsPDF: {
                        unit: 'mm',
                        format: 'a4',
                        orientation: 'portrait'
                    }
                };

                html2pdf().from(element).set(opt).save().then(() => {
                    document.body.removeChild(element);
                }).catch(error => {
                    console.error('PDF generation failed:', error);
                    showCustomAlert('Failed to generate PDF. Please try again.');
                });
            }
        }
    });
}


// WhatsApp buttons
if (whatsappBtn) {
    whatsappBtn.addEventListener('click', sendToWhatsApp);
}

if (modalWhatsappBtn) {
    modalWhatsappBtn.addEventListener('click', sendToWhatsApp);
}

// Save button
if (saveBtn) {
    saveBtn.addEventListener('click', saveInvoice);
}

// Close modal when clicking outside
window.addEventListener('click', function (event) {
    if (event.target === previewModal) {
        previewModal.style.display = 'none';
    }
});

// Save shop info button event listener
if (saveShopBtn) {
    saveShopBtn.addEventListener('click', saveShopInformation);
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function () {
    initPaymentMethodHandling();
    addItemRow();
});
