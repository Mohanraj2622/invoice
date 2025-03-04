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

// Variables
let tableData = [];
let filteredData = [];
let currentPage = 1;
let rowsPerPage = 10;
let currentFilter = '';
let currentFilterColumn = 0;
let currentSortColumn = null;
let currentSortOrder = 'asc';
let uniqueCustomers = new Set();
let uniqueShops = new Set();
let totalRevenue = 0;
let revenueChart, paymentMethodChart;

// DOM Elements
const searchInput = document.getElementById('searchInput');
const invoiceTableBody = document.getElementById('invoiceTableBody');
const columnFilterBtn = document.getElementById('columnFilterBtn');
const columnFilterOptions = document.getElementById('columnFilterOptions');
const filterButton = document.getElementById('filterButton');
const newInvoiceBtn = document.getElementById('newInvoiceBtn');
const invoiceModal = document.getElementById('invoiceModal');
const closeModal = document.getElementById('closeModal');
const invoiceDetails = document.getElementById('invoiceDetails');
const printInvoice = document.getElementById('printInvoice');
const downloadInvoice = document.getElementById('downloadInvoice');
const prevPageBtn = document.getElementById('prevPage');
const nextPageBtn = document.getElementById('nextPage');
const totalInvoicesElement = document.getElementById('totalInvoices');
const totalRevenueElement = document.getElementById('totalRevenue');
const totalCustomersElement = document.getElementById('totalCustomers');
const totalShopsElement = document.getElementById('totalShops');
const currentResultsElement = document.getElementById('currentResults');
const totalResultsElement = document.getElementById('totalResults');

// Fetch data from API
function fetchData() {
    // Show loading state
    invoiceTableBody.innerHTML = '<tr><td colspan="9" style="text-align:center;">Loading data...</td></tr>';

    fetch('https://script.google.com/macros/s/AKfycbw04vilzkUx-7p0b8r-Mu53dEmlcb5MRqftqlxBjvZ_E4jdpJ22prfFXk-zSAthzGPe/exec')
        .then(response => response.json())
        .then(data => {
            tableData = processData(data);
            filteredData = [...tableData];
            renderTable();
            updateDashboardStats();
            initCharts();
        })
        .catch(error => {
            console.error('Error fetching data:', error);
            invoiceTableBody.innerHTML = `<tr><td colspan="9" style="text-align:center;">Error loading data: ${error.message}</td></tr>`;
        });
}

// Function to convert "4 March 2025 at 09:55 am" to a valid date format
function parseCustomDate(dateStr) {
    if (!dateStr) return null;

    // Remove "at" and trim spaces
    dateStr = dateStr.replace(" at ", " ");

    // Parse using Date object
    const parsedDate = new Date(Date.parse(dateStr));

    // Check if date is valid
    if (isNaN(parsedDate.getTime())) {
        console.error("Invalid date format:", dateStr);
        return null;
    }

    return parsedDate;
}

// Process raw data into more usable format
function processData(rawData) {
    return rawData.map(row => {
        // Extract necessary data
        const invoiceNumber = row[0];
        const date = parseCustomDate(row[1]);
        const shopName = row[2];
        const customerName = row[3];
        const customerPhone = row[4];
        const paymentMethod = row[5];
        const upiId = row[6];
        const paymentPhone = row[7];
        const totalItems = parseInt(row[8]) || 0;
        // Ensure row[9] is a string before calling replace
        const grandTotalValue = row[9] ? row[9].toString() : '0';
        const grandTotal = parseFloat(grandTotalValue.replace(/[^\d.-]/g, '')) || 0;

        const timestamp = row[10];

        // Add to stats
        uniqueCustomers.add(customerPhone);
        uniqueShops.add(shopName);
        totalRevenue += grandTotal;

        // Generate random status for demo
        const statuses = ['paid', 'pending', 'failed'];
        const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];

        // Return processed row
        return {
            invoiceNumber,
            date,
            shopName,
            customerName,
            customerPhone,
            paymentMethod,
            upiId,
            paymentPhone,
            totalItems,
            grandTotal,
            timestamp,
            status: randomStatus
        };
    });
}

// Render table with filtered and paginated data
function renderTable() {
    // Clear table
    invoiceTableBody.innerHTML = '';

    // Apply filtering
    if (currentFilter) {
        const searchText = currentFilter.toLowerCase();
        filteredData = tableData.filter(row => {
            const value = getPropertyByColumnIndex(row, currentFilterColumn);
            return value.toString().toLowerCase().includes(searchText);
        });
    } else {
        filteredData = [...tableData];
    }

    // Apply sorting
    if (currentSortColumn !== null) {
        const columnHeader = document.querySelectorAll('th[data-sort]')[currentSortColumn];
        const sortType = columnHeader.getAttribute('data-sort');

        filteredData.sort((a, b) => {
            const aValue = getPropertyByColumnIndex(a, currentSortColumn);
            const bValue = getPropertyByColumnIndex(b, currentSortColumn);

            let comparison = 0;
            if (sortType === 'number') {
                comparison = parseFloat(aValue) - parseFloat(bValue);
            } else if (sortType === 'date') {
                comparison = new Date(aValue) - new Date(bValue);
            } else {
                comparison = aValue.toString().localeCompare(bValue.toString());
            }

            return currentSortOrder === 'asc' ? comparison : -comparison;
        });
    }

    // Calculate pagination
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    const paginatedData = filteredData.slice(startIndex, endIndex);

    // Update pagination info
    updatePaginationInfo();

    // Add rows to table
    if (paginatedData.length === 0) {
        invoiceTableBody.innerHTML = '<tr><td colspan="9" style="text-align:center;">No data found</td></tr>';
        return;
    }

    paginatedData.forEach(row => {
        const tr = document.createElement('tr');

        // Format currency
        const formattedAmount = new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR'
        }).format(row.grandTotal);

        // Format date
        const formattedDate = new Date(row.date).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });

        tr.innerHTML = `
              <td>${row.invoiceNumber}</td>
              <td>${formattedDate}</td>
              <td>${row.shopName}</td>
              <td>${row.customerName}</td>
              <td>${row.paymentMethod}</td>
              <td>${row.totalItems}</td>
              <td>${formattedAmount}</td>
              <td><span class="status status-${row.status}">${row.status.charAt(0).toUpperCase() + row.status.slice(1)}</span></td>
              <td class="action-cell">
                  <button class="action-btn view-btn" data-invoice="${row.invoiceNumber}"><i class="fas fa-eye"></i></button>
                  <button class="action-btn edit-btn" data-invoice="${row.invoiceNumber}"><i class="fas fa-edit"></i></button>
                  <button class="action-btn delete-btn" data-invoice="${row.invoiceNumber}"><i class="fas fa-trash"></i></button>
              </td>
          `;

        invoiceTableBody.appendChild(tr);
    });

    // Add event listeners to action buttons
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.addEventListener('click', () => showInvoiceDetails(btn.getAttribute('data-invoice')));
    });

    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', () => editInvoice(btn.getAttribute('data-invoice')));
    });

    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', () => deleteInvoice(btn.getAttribute('data-invoice')));
    });
}

// Helper function to get property value by column index
function getPropertyByColumnIndex(row, columnIndex) {
    switch (columnIndex) {
        case 0: return row.invoiceNumber;
        case 1: return row.date;
        case 2: return row.shopName;
        case 3: return row.customerName;
        case 4: return row.customerPhone;
        case 5: return row.paymentMethod;
        case 6: return row.upiId || '';
        case 7: return row.paymentPhone || '';
        case 8: return row.totalItems;
        case 9: return row.grandTotal;
        default: return '';
    }
}

// Update pagination info
function updatePaginationInfo() {
    const totalPages = Math.ceil(filteredData.length / rowsPerPage);

    // Update text info
    currentResultsElement.textContent = Math.min(rowsPerPage, filteredData.length);
    totalResultsElement.textContent = filteredData.length;

    // Update pagination controls
    const paginationElement = document.getElementById('pagination');

    // Clear existing pagination (except prev/next buttons)
    Array.from(paginationElement.querySelectorAll('.page-btn:not(#prevPage):not(#nextPage)'))
        .forEach(btn => btn.remove());

    // Update prev/next button states
    prevPageBtn.classList.toggle('disabled', currentPage === 1);
    nextPageBtn.classList.toggle('disabled', currentPage === totalPages || totalPages === 0);

    // Generate page buttons
    if (totalPages <= 5) {
        // Show all pages
        for (let i = 1; i <= totalPages; i++) {
            const pageBtn = createPageButton(i);
            paginationElement.insertBefore(pageBtn, nextPageBtn);
        }
    } else {
        // Show first, last, and some middle pages
        let pagesToShow = [1];

        if (currentPage > 2) {
            pagesToShow.push('...');
        }

        if (currentPage !== 1 && currentPage !== totalPages) {
            pagesToShow.push(currentPage);
        }

        if (currentPage < totalPages - 1) {
            pagesToShow.push('...');
        }

        pagesToShow.push(totalPages);

        // Create and insert page buttons
        pagesToShow.forEach(page => {
            if (page === '...') {
                const ellipsis = document.createElement('span');
                ellipsis.classList.add('page-btn');
                ellipsis.textContent = '...';
                paginationElement.insertBefore(ellipsis, nextPageBtn);
            } else {
                const pageBtn = createPageButton(page);
                paginationElement.insertBefore(pageBtn, nextPageBtn);
            }
        });
    }
}

// Create a page button
function createPageButton(pageNum) {
    const pageBtn = document.createElement('button');
    pageBtn.classList.add('page-btn');
    pageBtn.textContent = pageNum;

    if (pageNum === currentPage) {
        pageBtn.classList.add('active');
    }

    pageBtn.addEventListener('click', () => {
        currentPage = pageNum;
        renderTable();
    });

    return pageBtn;
}

// Update dashboard stats
function updateDashboardStats() {
    totalInvoicesElement.textContent = tableData.length;
    totalRevenueElement.textContent = new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR'
    }).format(totalRevenue);
    totalCustomersElement.textContent = uniqueCustomers.size;
    totalShopsElement.textContent = uniqueShops.size;
}

// Initialize charts with actual data only
function initCharts() {
    try {
        // Check if chart canvases exist
        const revenueCtx = document.getElementById('revenueChart');
        const paymentCtx = document.getElementById('paymentMethodChart');

        if (!revenueCtx || !paymentCtx) {
            console.error('Chart canvas elements not found');
            return;
        }

        // Destroy existing charts if they exist to prevent duplicates
        if (revenueChart) revenueChart.destroy();
        if (paymentMethodChart) paymentMethodChart.destroy();

        // REVENUE CHART - Use actual invoice data only
        const revenueLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const monthlyRevenue = Array(12).fill(0);

        tableData.forEach(invoice => {
            const invoiceDate = new Date(invoice.date);
            if (!isNaN(invoiceDate)) {
                const month = invoiceDate.getMonth(); // 0-11
                monthlyRevenue[month] += invoice.grandTotal;
            }
        });

        // If no actual data is available, show a message instead of using dummy data
        const hasRevenueData = monthlyRevenue.some(value => value > 0);
        if (!hasRevenueData) {
            console.warn("No revenue data available for the chart.");
            return;
        }

        revenueChart = new Chart(revenueCtx.getContext('2d'), {
            type: 'line',
            data: {
                labels: revenueLabels,
                datasets: [{
                    label: 'Revenue',
                    data: monthlyRevenue,
                    backgroundColor: 'rgba(67, 97, 238, 0.1)',
                    borderColor: '#4361ee',
                    borderWidth: 2,
                    tension: 0.3,
                    fill: true,
                    pointBackgroundColor: '#ffffff',
                    pointBorderColor: '#4361ee',
                    pointBorderWidth: 2,
                    pointRadius: 4,
                    pointHoverRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: '#ffffff',
                        titleColor: '#212529',
                        bodyColor: '#212529',
                        borderColor: '#e9ecef',
                        borderWidth: 1,
                        padding: 10,
                        displayColors: false,
                        callbacks: {
                            label: function (context) {
                                return new Intl.NumberFormat('en-IN', {
                                    style: 'currency',
                                    currency: 'INR'
                                }).format(context.raw);
                            }
                        }
                    }
                },
                scales: {
                    x: { grid: { display: false } },
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function (value) {
                                return '₹' + value.toLocaleString('en-IN');
                            }
                        }
                    }
                }
            }
        });

        // PAYMENT METHOD CHART - Use actual payment method distribution
        const paymentMethods = {};
        tableData.forEach(invoice => {
            const method = invoice.paymentMethod || 'Unknown';
            paymentMethods[method] = (paymentMethods[method] || 0) + 1;
        });

        const paymentLabels = Object.keys(paymentMethods);
        const paymentData = Object.values(paymentMethods);

        if (paymentLabels.length === 0) {
            console.warn("No payment method data available for the chart.");
            return;
        }

        const paymentColors = ['#4361ee', '#4CAF50', '#ff9e00', '#f72585', '#3f37c9', '#7209b7'];
        const extendedColors = paymentLabels.map((_, i) => paymentColors[i % paymentColors.length]);

        paymentMethodChart = new Chart(paymentCtx.getContext('2d'), {
            type: 'doughnut',
            data: {
                labels: paymentLabels,
                datasets: [{
                    data: paymentData,
                    backgroundColor: extendedColors,
                    borderWidth: 0,
                    borderRadius: 5,
                    hoverOffset: 5
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '70%',
                plugins: {
                    legend: {
                        position: 'right',
                        labels: { boxWidth: 15, padding: 15 }
                    },
                    tooltip: {
                        backgroundColor: '#ffffff',
                        titleColor: '#212529',
                        bodyColor: '#212529',
                        borderColor: '#e9ecef',
                        borderWidth: 1,
                        padding: 10,
                        callbacks: {
                            label: function (context) {
                                const total = paymentData.reduce((a, b) => a + b, 0);
                                const percent = Math.round((context.raw / total) * 100);
                                return `${context.label}: ${context.raw} (${percent}%)`;
                            }
                        }
                    }
                }
            }
        });

    } catch (error) {
        console.error('Error initializing charts:', error);
    }
}


// Show invoice details in modal
function showInvoiceDetails(invoiceNumber) {
    const invoice = tableData.find(row => row.invoiceNumber === invoiceNumber);

    if (!invoice) {
        return;
    }

    // Format data for display
    const formattedDate = new Date(invoice.date).toLocaleDateString('en-IN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    const formattedAmount = new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR'
    }).format(invoice.grandTotal);

    // Build modal content
    invoiceDetails.innerHTML = `
          <div style="padding: 15px; border: 1px solid #e9ecef; border-radius: 8px; margin-bottom: 20px;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 15px;">
                  <div>
                      <h4 style="margin-bottom: 5px;">${invoice.shopName}</h4>
                      <p style="color: #6c757d; margin: 0;">Invoice #${invoice.invoiceNumber}</p>
                  </div>
                  <div style="text-align: right;">
                      <span class="status status-${invoice.status}" style="margin-bottom: 5px;">
                          ${invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                      </span>
                      <p style="color: #6c757d; margin: 0;">${formattedDate}</p>
                  </div>
              </div>
              <hr style="margin: 15px 0; border: 0; border-top: 1px solid #e9ecef;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 15px;">
                  <div>
                      <p style="color: #6c757d; margin-bottom: 5px;">Customer Details</p>
                      <p style="margin: 0;"><strong>${invoice.customerName}</strong></p>
                      <p style="margin: 0;">${invoice.customerPhone}</p>
                  </div>
                  <div style="text-align: right;">
                      <p style="color: #6c757d; margin-bottom: 5px;">Payment Details</p>
                      <p style="margin: 0;"><strong>${invoice.paymentMethod}</strong></p>
                      <p style="margin: 0;">${invoice.upiId || invoice.paymentPhone || 'N/A'}</p>
                  </div>
              </div>
              <hr style="margin: 15px 0; border: 0; border-top: 1px solid #e9ecef;">
              <div style="text-align: right;">
                  <p style="margin: 0;">Items: <strong>${invoice.totalItems}</strong></p>
                  <p style="font-size: 1.2em; margin-top: 5px;">Total: <strong>${formattedAmount}</strong></p>
              </div>
          </div>
          
          <p style="color: #6c757d; font-size: 13px; text-align: center;">
              Generated on ${new Date(invoice.timestamp).toLocaleString()}
          </p>
      `;

    // Show modal
    invoiceModal.classList.add('active');
}

// Edit invoice (placeholder)
function editInvoice(invoiceNumber) {
    showCustomAlert(`Edit invoice ${invoiceNumber} (Functionality not implemented)`);
}

// Delete invoice with custom alert
function deleteInvoice(invoiceNumber) {
    showCustomAlert(`Are you sure you want to delete invoice ${invoiceNumber}?`, function (confirmed) {
        if (confirmed) {
            // Here you would make an API call to delete the invoice
            tableData = tableData.filter(row => row.invoiceNumber !== invoiceNumber);

            // Update filtered data and re-render
            if (currentFilter) {
                const searchText = currentFilter.toLowerCase();
                filteredData = tableData.filter(row => {
                    const value = getPropertyByColumnIndex(row, currentFilterColumn);
                    return value.toString().toLowerCase().includes(searchText);
                });
            } else {
                filteredData = [...tableData];
            }

            // Update stats and render
            updateDashboardStats();
            renderTable();
        }
    });
}

// Event listeners
document.addEventListener('DOMContentLoaded', function () {
    // Fetch and render initial data
    fetchData();

    // Search input
    searchInput.addEventListener('input', function () {
        currentFilter = this.value;
        currentPage = 1;
        renderTable();
    });

    // Column filter dropdown
    columnFilterBtn.addEventListener('click', function () {
        columnFilterOptions.classList.toggle('show');
    });

    // Close dropdown when clicking elsewhere
    document.addEventListener('click', function (event) {
        if (!event.target.closest('.filter-dropdown') && columnFilterOptions.classList.contains('show')) {
            columnFilterOptions.classList.remove('show');
        }
    });

    // Column filter options
    document.querySelectorAll('.filter-option').forEach(option => {
        option.addEventListener('click', function () {
            currentFilterColumn = parseInt(this.getAttribute('data-column'));

            // Update selected state
            document.querySelectorAll('.filter-option').forEach(opt => opt.classList.remove('selected'));
            this.classList.add('selected');

            // Update button text
            const columnName = this.textContent;
            document.querySelector('#columnFilterBtn span').textContent = columnName;

            // Close dropdown
            columnFilterOptions.classList.remove('show');

            // Apply filter if there's search text
            if (currentFilter) {
                renderTable();
            }
        });
    });

    // Sorting
    document.querySelectorAll('th[data-sort]').forEach((th, index) => {
        th.addEventListener('click', function () {
            if (currentSortColumn === index) {
                // Toggle sort direction
                currentSortOrder = currentSortOrder === 'asc' ? 'desc' : 'asc';
            } else {
                // Set new sort column
                currentSortColumn = index;
                currentSortOrder = 'asc';
            }

            // Update column headers
            document.querySelectorAll('th[data-sort]').forEach(header => {
                header.classList.remove('sort-asc', 'sort-desc');
            });

            this.classList.add(`sort-${currentSortOrder}`);

            // Re-render table
            renderTable();
        });
    });

    // Pagination controls
    prevPageBtn.addEventListener('click', function () {
        if (currentPage > 1) {
            currentPage--;
            renderTable();
        }
    });

    nextPageBtn.addEventListener('click', function () {
        const totalPages = Math.ceil(filteredData.length / rowsPerPage);
        if (currentPage < totalPages) {
            currentPage++;
            renderTable();
        }
    });

    // Modal close button
    closeModal.addEventListener('click', function () {
        invoiceModal.classList.remove('active');
    });

    // Close modal when clicking outside
    invoiceModal.addEventListener('click', function (event) {
        if (event.target === invoiceModal) {
            invoiceModal.classList.remove('active');
        }
    });

    // Print invoice
    printInvoice.addEventListener('click', function () {
        window.print();
    });

// Function to download the currently displayed invoice as an image
downloadInvoice.addEventListener('click', function () {
    const invoiceElement = document.getElementById('invoiceDetails'); // The displayed invoice section

    if (!invoiceElement) {
        showCustomAlert('Error: Invoice details not found!');
        return;
    }

    // Use html2canvas to capture the invoice as an image
    html2canvas(invoiceElement, {
        scale: 2, // Higher scale for better quality
        useCORS: true, // Allow cross-origin images
    }).then(canvas => {
        // Convert canvas to image URL
        const imgData = canvas.toDataURL('image/png');

        // Create a download link
        const link = document.createElement('a');
        link.href = imgData;
        link.download = `Invoice_${new Date().getTime()}.png`;

        // Trigger the download
        link.click();
    }).catch(error => {
        console.error('Error capturing invoice:', error);
        showCustomAlert('Failed to download invoice image. Please try again.');
    });
});

    // Chart filter buttons - Update only with actual data
    document.querySelectorAll('.chart-filter').forEach(filter => {
        filter.addEventListener('click', function () {
            // Update active state
            document.querySelectorAll('.chart-filter').forEach(f => f.classList.remove('active'));
            this.classList.add('active');

            // Get selected period
            const period = this.getAttribute('data-period');

            // Update chart data with actual revenue
            updateRevenueChart(period);
        });
    });

    // Function to update the revenue chart based on the selected filter
    function updateRevenueChart(period) {
        let revenueLabels = [];
        let revenueData = [];

        if (period === 'weekly') {
            revenueLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
            let weeklyRevenue = Array(7).fill(0);

            tableData.forEach(invoice => {
                const invoiceDate = new Date(invoice.date);
                if (!isNaN(invoiceDate)) {
                    const dayOfWeek = invoiceDate.getDay(); // 0=Sunday, 6=Saturday
                    const index = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Adjust to start from Monday
                    weeklyRevenue[index] += invoice.grandTotal;
                }
            });

            revenueData = weeklyRevenue;

        } else if (period === 'monthly') {
            revenueLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            let monthlyRevenue = Array(12).fill(0);

            tableData.forEach(invoice => {
                const invoiceDate = new Date(invoice.date);
                if (!isNaN(invoiceDate)) {
                    const month = invoiceDate.getMonth(); // 0-11
                    monthlyRevenue[month] += invoice.grandTotal;
                }
            });

            revenueData = monthlyRevenue;

        } else if (period === 'yearly') {
            const currentYear = new Date().getFullYear();
            const yearRange = [currentYear - 4, currentYear - 3, currentYear - 2, currentYear - 1, currentYear];
            revenueLabels = yearRange.map(y => y.toString());
            let yearlyRevenue = Array(5).fill(0);

            tableData.forEach(invoice => {
                const invoiceDate = new Date(invoice.date);
                if (!isNaN(invoiceDate)) {
                    const year = invoiceDate.getFullYear();
                    const index = yearRange.indexOf(year);
                    if (index !== -1) {
                        yearlyRevenue[index] += invoice.grandTotal;
                    }
                }
            });

            revenueData = yearlyRevenue;
        }

        // Update the revenue chart with actual data
        if (revenueChart) {
            revenueChart.data.labels = revenueLabels;
            revenueChart.data.datasets[0].data = revenueData;
            revenueChart.update();
        }
    }

    // open invoice page
    document.getElementById("newInvoiceBtn").addEventListener("click", function () {
        window.location.href = "index.html";
    });

    // Filter button (placeholder)
    filterButton.addEventListener('click', function () {
        showCustomAlert('Advanced filtering functionality not implemented');
    });
});