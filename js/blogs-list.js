const blogsData = [
    {
        title: "What is Dollar Knight? Meet the Budgeting App That's Changing How You Save",
        description: "Learn what Dollar Knight is and how this budgeting app simplifies budgeting, savings goals, and subscription management. Experience now with 7 day free trial.",
        category: "App Introduction",
        date: "2025-09-13",
        dateDisplay: "September 13, 2025",
        url: "blog.html"
    },
    {
        title: "Creating a Personal Budget: Your Guide to Financial Control",
        description: "Learn how to create a personal budget that works for you. Discover practical steps to track income, categorize expenses, and build a sustainable financial plan.",
        category: "Personal Finance",
        date: "2025-12-16",
        dateDisplay: "December 16, 2025",
        url: "blog-personal-budget.html"
    }
];

let currentPage = 1;
let itemsPerPage = 5;

function renderBlogs() {
    const blogsList = document.getElementById('blogs-list');
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedBlogs = blogsData.slice(startIndex, endIndex);

    blogsList.innerHTML = '';

    if (paginatedBlogs.length === 0) {
        blogsList.innerHTML = '<p class="no-blogs">No blogs found.</p>';
        return;
    }

    paginatedBlogs.forEach(blog => {
        const blogCard = document.createElement('article');
        blogCard.className = 'blog-card';
        blogCard.innerHTML = `
            <div class="blog-card-header">
                <h2><a href="${blog.url}">${blog.title}</a></h2>
                <div class="blog-card-meta">
                    <span class="blog-card-category">${blog.category}</span>
                    <time datetime="${blog.date}">${blog.dateDisplay}</time>
                </div>
            </div>
            <p class="blog-card-description">${blog.description}</p>
            <a href="${blog.url}" class="read-more-btn">Read More →</a>
        `;
        blogsList.appendChild(blogCard);
    });

    updatePaginationControls();
}

function updatePaginationControls() {
    const totalPages = Math.ceil(blogsData.length / itemsPerPage);
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const pageInfo = document.getElementById('page-info');

    prevBtn.disabled = currentPage === 1;
    nextBtn.disabled = currentPage === totalPages;
    pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
}

function changePage(direction) {
    const totalPages = Math.ceil(blogsData.length / itemsPerPage);
    
    if (direction === 'next' && currentPage < totalPages) {
        currentPage++;
    } else if (direction === 'prev' && currentPage > 1) {
        currentPage--;
    }
    
    renderBlogs();
    window.scrollTo(0, 0);
}

function handleItemsPerPageChange(value) {
    itemsPerPage = parseInt(value);
    currentPage = 1;
    renderBlogs();
}

document.addEventListener('DOMContentLoaded', function() {
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const itemsSelect = document.getElementById('items-select');

    if (prevBtn) {
        prevBtn.addEventListener('click', () => changePage('prev'));
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', () => changePage('next'));
    }
    
    if (itemsSelect) {
        itemsSelect.addEventListener('change', (e) => handleItemsPerPageChange(e.target.value));
    }

    renderBlogs();
});
