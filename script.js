document.addEventListener('DOMContentLoaded', () => {
  const tableBody = document.querySelector('#csvTable tbody');
  const websiteFilter = document.getElementById('websiteFilter');
  const freqFilter = document.getElementById('freqFilter');
  const freqFilterMob = document.getElementById('freqFilterMob');
  const categoryFilter = document.getElementById('categoryFilter');
  const clearFilters = document.getElementById('clearFilters');
  const clearFiltersMob = document.getElementById('clearFiltersMob');
  let csvData = tableData;
  let filteredData = csvData;
  let currentSortColumn = '';
  let ascendingOrder = true;
  let activeWebsiteFilters = [];
  let activeFreqFilters = [];
  let activeCategoryFilters = [];

  // Populate the table initially
  populateTable(filteredData);
  generateFilters();

  // Populate the table
  function populateTable(data) {
    tableBody.innerHTML = data.map(row => `
      <tr>
        <td style="text-align: right;">
          <img src="${getFavicon(row.url)}" alt="" width="20"/>
        </td>
        <td>${row.website}</td>
        <td>${row.category}</td>
        <td>${row.freq}</td>
        <td><a href="${row.url}" target="_blank">${row.linkName}</a></td>
        <td>${row.notes}</td>
      </tr>
    `).join('');
  }

  // Fetch website favicon
  function getFavicon(url) {
    return `${new URL(url).origin}/favicon.ico`;
  }

  // Generate filter cards
  function generateFilters() {
    const websites = [...new Set(csvData.map(row => row.website))];
    const freqs = [...new Set(csvData.map(row => row.freq))];
    const categories = [...new Set(csvData.map(row => row.category))];

    // Function to create filter buttons dynamically
    function createFilterButtons(filterArray, type) {
      return filterArray.map(item => `
        <button class="filter-btn material-btn" data-filter="${item}" data-type="${type}">
          ${item}
        </button>
      `).join('');
    }
       
    // Initial rendering of filter buttons
    websiteFilter.innerHTML = websites.sort().map(website => `<button class="filter-btn material-btn" data-filter="${website}" data-type="website">${website}</button>`).join('');
    freqFilter.innerHTML = freqs.sort().map(freq => `<button class="filter-btn material-btn" data-filter="${freq}" data-type="freq">${freq}</button>`).join('');
    freqFilterMob.innerHTML = freqs.sort().map(freq => `<button class="filter-btn material-btn" data-filter="${freq}" data-type="freq">${freq}</button>`).join('');
    categoryFilter.innerHTML = categories.sort().map(category => `<button class="filter-btn material-btn" data-filter="${category}" data-type="category">${category}</button>`).join('');

    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', handleFilterClick);
    });

    // Add a textbox for each filter section
    websiteFilter.insertAdjacentHTML('beforebegin', '<input type="text" id="websiteSearch" placeholder="Search website... | W to focus">');
    categoryFilter.insertAdjacentHTML('beforebegin', '<input type="text" id="categorySearch" placeholder="Search category... | C to focus">');

    // Add event listeners for textbox input
    document.getElementById('websiteSearch').addEventListener('input', () => filterButtons('website'));
    document.getElementById('categorySearch').addEventListener('input', () => filterButtons('category'));
    // --- Keyboard Shortcut Logic ---
    document.addEventListener('keydown', (event) => {
      if (event.key === 'C') {
        const categorySearch = document.getElementById('categorySearch'); 
        categorySearch.focus();
        categorySearch.value = ''; // Clear the textbox content
      } else if (event.key === 'W') {
        const websiteSearch = document.getElementById('websiteSearch');
        websiteSearch.focus();
        websiteSearch.value = ''; // Clear the textbox content
      }
    });
  }

  // Function to filter buttons based on textbox input
  function filterButtons(type) {
    const searchText = document.getElementById(`${type}Search`).value.toLowerCase();
    const filterContainer = document.getElementById(`${type}Filter`);
    const buttons = filterContainer.querySelectorAll('.filter-btn');

    buttons.forEach(button => {
      const buttonText = button.textContent.toLowerCase();
      button.style.display = buttonText.includes(searchText) ? 'inline-block' : 'none';
    });
  }

  // Handle filter button click
  function handleFilterClick(event) {
    const filter = event.target.getAttribute('data-filter');
    const type = event.target.getAttribute('data-type');

    if (type === 'website') {
      toggleFilter(filter, activeWebsiteFilters);
    } else if (type === 'freq') {
      toggleFilter(filter, activeFreqFilters);
    } else {
      toggleFilter(filter, activeCategoryFilters);
    }

    applyFilters();
    toggleButtonHighlight(event.target);
  }

  // Toggle filter logic
  function toggleFilter(filter, filterArray) {
    if (filterArray.includes(filter)) {
      filterArray.splice(filterArray.indexOf(filter), 1);
    } else {
      filterArray.push(filter);
    }
  }

  // Apply selected filters
  function applyFilters() {
    filteredData = csvData.filter(row => {
      const websiteMatch = activeWebsiteFilters.length === 0 || activeWebsiteFilters.includes(row.website);
      const freqMatch = activeFreqFilters.length === 0 || activeFreqFilters.includes(row.freq);
      const categoryMatch = activeCategoryFilters.length === 0 || activeCategoryFilters.includes(row.category);
      return websiteMatch && freqMatch && categoryMatch;
    });
    populateTable(filteredData);
  }

  // Handle Clear All filters button
  clearFilters.addEventListener('click', () => {
    activeWebsiteFilters = [];
    activeFreqFilters = [];
    activeCategoryFilters = [];
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    filteredData = csvData;
    populateTable(filteredData);
  });
  
  // Handle Clear All filters button - Mob
  clearFiltersMob.addEventListener('click', () => {
    activeWebsiteFilters = [];
    activeFreqFilters = [];
    activeCategoryFilters = [];
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    filteredData = csvData;
    populateTable(filteredData);
  });
  

  // Toggle button highlight
  function toggleButtonHighlight(button) {
    button.classList.toggle('active');
  }

  // Handle sorting
  document.querySelectorAll('th.sortable').forEach(header => {
    header.addEventListener('click', () => {
      const column = header.getAttribute('data-column');
      sortTableByColumn(column, header);
    });
  });

  // Sort table by the selected column
  function sortTableByColumn(column, header) {
    ascendingOrder = currentSortColumn === column ? !ascendingOrder : true;
    currentSortColumn = column;

    filteredData.sort((a, b) => {
      let valA = a[column];
      let valB = b[column];
      
      valA = valA.toLowerCase();
      valB = valB.toLowerCase();

      if (valA < valB) return ascendingOrder ? -1 : 1;
      if (valA > valB) return ascendingOrder ? 1 : -1;
      return 0;
    });

    populateTable(filteredData);
    updateSortIcons(header);
  }

  // Update sort icons in table header
  function updateSortIcons(header) {
    document.querySelectorAll('th').forEach(th => th.classList.remove('sorted-asc', 'sorted-desc'));
    header.classList.add(ascendingOrder ? 'sorted-asc' : 'sorted-desc');
  }
});
