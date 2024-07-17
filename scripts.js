document.addEventListener('DOMContentLoaded', () => {
    const sheetUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRCCvThZQTtbS8p8JArbW3-wNs_OBRebKw7S7efQHIqC_78rf7vYysF2hLXFyiiscOSHJwi8QGJz-EP/pubhtml?gid=0&single=true';

    fetch(sheetUrl)
        .then(response => response.text())
        .then(data => {
            const parser = new DOMParser();
            const doc = parser.parseFromString(data, 'text/html');
            const table = doc.querySelector('table');
            
            const tableContainer = document.getElementById('table-container');
            tableContainer.innerHTML = '';
            tableContainer.appendChild(table);
        })
        .catch(error => {
            console.error('Error fetching data:', error);
            const tableContainer = document.getElementById('table-container');
            tableContainer.textContent = 'Error fetching data. Please check the console for more details.';
        });
});
