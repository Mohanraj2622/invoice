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
    { name: "Nesamani Shawarma-Rgl", price: 50 },
    { name: "Nesamani Shawarma-Spl", price: 80 },
    { name: "Pushpa Shawarma", price: 90 },
    { name: "Pubg Shawarma", price: 100 },
    { name: "Ghost Rider Shawarma", price: 110 },
    { name: "Cheese Shawarma", price: 120 },
    { name: "Custom Item", price: 0 }
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
