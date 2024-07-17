// Replace with your GitHub repository details
const GITHUB_OWNER = 'rohitpatelmailid297';
const GITHUB_REPO = 'Ferra-workout-tracker.github.io';
const GITHUB_FILE_PATH = 'data.json';
const GITHUB_TOKEN = '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'; // Replace with your personal access token

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

async function saveCustomerData() {
    const customerTable = document.getElementById('customerTable');
    const customers = [];

    customerTable.querySelectorAll('tr').forEach(row => {
        const customer = {
            name: row.querySelector('.customer-name').textContent,
            days: []
        };
        row.querySelectorAll('.status').forEach(cell => {
            customer.days.push(cell.textContent.trim().toLowerCase());
        });
        customers.push(customer);
    });

    const jsonData = JSON.stringify(customers);
    try {
        await uploadFileToGitHub(GITHUB_OWNER, GITHUB_REPO, GITHUB_FILE_PATH, jsonData, GITHUB_TOKEN);
        console.log('Customer data saved successfully.');
    } catch (error) {
        console.error('Error saving customer data:', error);
    }
}

async function loadCustomerData() {
    try {
        const jsonData = await fetchFileFromGitHub(GITHUB_OWNER, GITHUB_REPO, GITHUB_FILE_PATH, GITHUB_TOKEN);
        const customers = JSON.parse(jsonData);
        
        const customerTable = document.getElementById('customerTable');
        customerTable.innerHTML = '';

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
                statusCell.classList.add('status', day === 'green' ? 'green' : 'red');
                statusCell.onclick = () => toggleStatus(statusCell);
                newRow.appendChild(statusCell);
            });

            customerTable.appendChild(newRow);
        });
    } catch (error) {
        console.error('Error loading customer data:', error);
    }
}

async function fetchFileFromGitHub(owner, repo, path, token) {
    const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
    console.log('Fetching URL:', url);
    const response = await fetch(url, {
        headers: {
            'Authorization': `token ${token}`,
            'Accept': 'application/vnd.github.v3.raw'
        }
    });
    if (!response.ok) {
        console.error('Response status:', response.status, response.statusText);
        throw new Error(`Could not fetch file: ${response.statusText}`);
    }
    return await response.text();
}

async function uploadFileToGitHub(owner, repo, path, content, token) {
    const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
    const sha = await getFileSha(owner, repo, path, token);
    console.log('Uploading file to GitHub:', url, sha);
    const response = await fetch(url, {
        method: 'PUT',
        headers: {
            'Authorization': `token ${token}`,
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            message: 'Update customer data',
            content: btoa(content),
            sha: sha
        })
    });
    if (!response.ok) {
        console.error('Failed response:', response.status, response.statusText);
        throw new Error(`Could not upload file: ${response.statusText}`);
    }
}

async function getFileSha(owner, repo, path, token) {
    const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
    console.log('Getting file SHA from GitHub:', url);
    const response = await fetch(url, {
        headers: {
            'Authorization': `token ${token}`,
            'Accept': 'application/vnd.github.v3+json'
        }
    });
    if (!response.ok) {
        console.error('Failed response:', response.status, response.statusText);
        throw new Error(`Could not get file SHA: ${response.statusText}`);
    }
    const data = await response.json();
    return data.sha;
}
