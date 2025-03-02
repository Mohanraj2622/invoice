
// Send to WhatsApp function
function sendToWhatsApp() {
    const customerPhone = document.getElementById('customer-phone').value.replace(/[^0-9]/g, '');
    if (!customerPhone) {
        alert('Please enter a valid customer phone number.');
        return;
    }

    const shopName = document.getElementById('shop-name').value;
    const invoiceNumber = invoiceNumberElem.textContent;
    const grandTotal = grandTotalElem.textContent;

    let message = `*Invoice from ${shopName}*\n`;
    message += `Invoice #: ${invoiceNumber}\n`;
    message += `Date: ${currentDatetimeElem.textContent}\n\n`;
    message += `*Items:*\n`;

    // Get all item rows
    const itemRows = document.querySelectorAll('.item-row');

    // Add items to message
    itemRows.forEach(row => {
        const productSelect = row.querySelector('.product-select');
        if (productSelect.selectedIndex > 0) { // Only include selected products
            const productName = productSelect.options[productSelect.selectedIndex].textContent;
            const quantity = row.querySelector('.quantity-input').value;
            const total = row.querySelector('[data-total]').textContent;
            message += `${productName} x${quantity}: ${total}\n`;
        }
    });

    message += `\n*Grand Total: ${grandTotal}*\n\n`;

    // Add payment info if provided
    const upiId = document.getElementById('upi-id').value;
    const paymentPhone = document.getElementById('payment-phone').value;
    if (upiId || paymentPhone) {
        message += `*Payment Details:*\n`;
        if (upiId) message += `UPI ID: ${upiId}\n`;
        if (paymentPhone) message += `Payment Phone: ${paymentPhone}\n`;
    }

    message += `Thank you for your business!`;

    // Encode the message for URL
    const encodedMessage = encodeURIComponent(message);

    // Open WhatsApp with the message
    window.open(`https://wa.me/${customerPhone}?text=${encodedMessage}`, '_blank');


}

// WhatsApp button event listeners
whatsappBtn.addEventListener('click', sendToWhatsApp);
modalWhatsappBtn.addEventListener('click', sendToWhatsApp);

// Add first item row on page load
addItemRow();