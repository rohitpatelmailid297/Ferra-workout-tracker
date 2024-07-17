// scripts.js
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('addCustomerForm').addEventListener('submit', addCustomer);
    document.getElementById('addDayButton').addEventListener('click', addNewDay);

    loadCustomerData();
});

function toggleStatus(element) {
    if (element.classList.contains('green')) {
        element.classList.remove('green');
        element.classList.add('red');
        element.textContent = 'Red';
    } else {
        element.classList.remove('red');
        element.classList.add('green');
        element.textContent = 'Green';
    }
    saveCustomerData();
}

function addCustomer(event) {
    event.preventDefault();
    const customerName = document.getElementById('customerName').value.trim();
    if (!customerName) {
        alert('Please enter a valid customer name.');
        return;
    }

    const customerTable = document.getElementById('customerTable');
    const newRow = document.createElement('tr');

    const nameCell = document.createElement('td');
    const nameSpan = document.createElement('span');
    nameSpan.textContent = customerName;
    nameSpan.classList.add('customer-name');
    const editButton = document.createElement('button');
    editButton.textContent = 'Edit';
    editButton.classList.add('edit-button');
    editButton.onclick = () => editCustomerName(nameSpan);
    nameCell.appendChild(nameSpan);
    nameCell.appendChild(editButton);
    newRow.appendChild(nameCell);

    for (let i = 0; i < 7; i++) {
        const statusCell = document.createElement('td');
        statusCell.textContent = 'Red';
        statusCell.classList.add('status', 'red');
        statusCell.onclick = () => toggleStatus(statusCell);
        newRow.appendChild(statusCell);
    }

    customerTable.appendChild(newRow);
    document.getElementById('customerName').value = '';
    saveCustomerData();
}

function addNewDay() {
    const table = document.querySelector('table thead tr');
    const customerRows = document.querySelectorAll('#customerTable tr');

    // Add a new day header
    const newDayIndex = table.children.length;
    const newDayHeader = document.createElement('th');
    newDayHeader.textContent = `Day ${newDayIndex}`;
    table.appendChild(newDayHeader);

    // Add a new day cell to each customer row
    customerRows.forEach(row => {
        const newDayCell = document.createElement('td');
        newDayCell.textContent = 'Red';
        newDayCell.classList.add('status', 'red');
        newDayCell.onclick = () => toggleStatus(newDayCell);
        row.appendChild(newDayCell);

        // Remove the first day cell to keep the last 7 days
        if (row.children.length > 8) {
            row.removeChild(row.children[1]);
        }
    });

    // Remove the first day header to keep the last 7 days
    if (table.children.length > 8) {
        table.removeChild(table.children[1]);
    }
    saveCustomerData();
}

function editCustomerName(nameSpan) {
    const newName = prompt('Enter new name:', nameSpan.textContent);
    if (newName && newName.trim()) {
        nameSpan.textContent = newName.trim();
        saveCustomerData();
    }
}

function saveCustomerData() {
    const customerTable = document.getElementById('customerTable');
    const customers = [];

    customerTable.querySelectorAll('tr').forEach(row => {
        const customer = {
            name: row.querySelector('.customer-name').textContent,
            days: []
        };
        row.querySelectorAll('.status').forEach(cell => {
            customer.days.push(cell.classList.contains('green') ? 'green' : 'red');
        });
        customers.push(customer);
    });

    localStorage.setItem('customers', JSON.stringify(customers));
}

function loadCustomerData() {
    const customerTable = document.getElementById('customerTable');
    customerTable.innerHTML = '';
    const customers = JSON.parse(localStorage.getItem('customers') || '[]');

    customers.forEach(customer => {
        const newRow = document.createElement('tr');

        const nameCell = document.createElement('td');
        const nameSpan = document.createElement('span');
        nameSpan.textContent = customer.name;
        nameSpan.classList.add('customer-name');
        const editButton = document.createElement('button');
        editButton.textContent = 'Edit';
        editButton.classList.add('edit-button');
        editButton.onclick = () => editCustomerName(nameSpan);
        nameCell.appendChild(nameSpan);
        nameCell.appendChild(editButton);
        newRow.appendChild(nameCell);

        customer.days.forEach(day => {
            const statusCell = document.createElement('td');
            statusCell.textContent = day === 'green' ? 'Green' : 'Red';
            statusCell.classList.add('status', day);
            statusCell.onclick = () => toggleStatus(statusCell);
            newRow.appendChild(statusCell);
        });

        customerTable.appendChild(newRow);
    });
}
