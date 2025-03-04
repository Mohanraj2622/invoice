
// Generate QR Code for UPI payments
function generateQRCode() {
    if (!qrcodeContainer) return;
    
    // Clear previous QR code
    qrcodeContainer.innerHTML = '';
    
    const upiId = upiIdInput.value.trim();
    const paymentPhone = paymentPhoneInput.value.trim();
    const amount = parseFloat(grandTotalElem.textContent.replace('₹', '')) || 0;
    
    if (upiId || paymentPhone) {
        // Create UPI payment link (format: upi://pay?pa=UPI_ID&pn=NAME&am=AMOUNT)
        let upiLink = 'upi://pay?';
        
        if (upiId) {
            upiLink += `pa=${encodeURIComponent(upiId)}`;
        } else if (paymentPhone) {
            upiLink += `pa=${encodeURIComponent(paymentPhone)}@upi`;
        }
        
        upiLink += `&pn=${encodeURIComponent('Shawarma Spot')}`;
        upiLink += `&am=${amount.toFixed(2)}`;
        upiLink += `&cu=INR`;
        
        // Create QR code
        new QRCode(qrcodeContainer, {
            text: upiLink,
            width: 128,
            height: 128,
            colorDark: "#000000",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.H
        });
        
        // Add caption
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
    
    // Update QR code if UPI is selected
    if (document.querySelector('input[name="payment-method"]:checked')?.value === 'upi') {
        generateQRCode();
    }
}

// Create product dropdown
function createProductDropdown() {
    const select = document.createElement('select');
    select.className = 'product-select';

    // Add default option
    const defaultOption = document.createElement('option');
    defaultOption.value = "";
    defaultOption.textContent = "Select a product";
    select.appendChild(defaultOption);

    // Add product options
    products.forEach((product, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = product.name;
        option.setAttribute('data-price', product.price);
        select.appendChild(option);
    });

    // Event listener for product selection
    select.addEventListener('change', function () {
        const selectedIndex = this.value;
        if (selectedIndex !== "") {
            const row = this.closest('.item-row');
            const priceInput = row.querySelector('.price-input');
            const selectedOption = this.options[this.selectedIndex];

            // If custom item is selected, allow user to enter a price
            if (products[selectedIndex].name === "Custom Item") {
                priceInput.value = "";
                priceInput.removeAttribute('readonly');
            } else {
                priceInput.value = parseFloat(selectedOption.getAttribute('data-price')).toFixed(2);
                priceInput.setAttribute('readonly', 'readonly');
            }

            // Update total for this row
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

    // Create product dropdown
    const productDropdown = createProductDropdown();

    // Create price input
    const priceInput = document.createElement('input');
    priceInput.type = 'number';
    priceInput.className = 'price-input';
    priceInput.placeholder = 'Price';
    priceInput.step = '0.01';
    priceInput.min = '0';
    priceInput.addEventListener('input', () => calculateRowTotal(row));

    // Create quantity input
    const quantityInput = document.createElement('input');
    quantityInput.type = 'number';
    quantityInput.className = 'quantity-input';
    quantityInput.placeholder = 'Qty';
    quantityInput.value = '1';
    quantityInput.min = '1';
    quantityInput.addEventListener('input', () => calculateRowTotal(row));

    // Create total element
    const totalElem = document.createElement('div');
    totalElem.className = 'row-total';
    totalElem.textContent = '₹0.00';
    totalElem.setAttribute('data-total', '0');

    // Create remove button
    const removeBtn = document.createElement('button');
    removeBtn.className = 'btn-remove';
    removeBtn.innerHTML = '<i class="fas fa-trash"></i>';
    removeBtn.addEventListener('click', function () {
        row.remove();
        updateGrandTotal();
    });

    // Add elements to the row
    row.appendChild(productDropdown);
    row.appendChild(priceInput);
    row.appendChild(quantityInput);
    row.appendChild(totalElem);
    row.appendChild(removeBtn);

    // Add row to container
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
    
    // Get all items
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
    
    // Generate HTML for preview
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
    
    // Add UPI QR code if payment method is UPI
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