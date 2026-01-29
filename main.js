//Sử dụng db.json và load data ra giao diện

let allProducts = []; // Lưu toàn bộ dữ liệu sản phẩm
let filteredProducts = []; // Lưu dữ liệu sau khi filter
let currentPage = 1; // Trang hiện tại
let itemsPerPage = 10; // Số sản phẩm mỗi trang

// Hàm lấy dữ liệu từ db.json
async function loadData() {
  try {
    console.log("Đang load dữ liệu từ db.json...");
    const response = await fetch("./db.json");

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const products = await response.json();
    console.log("Load dữ liệu thành công:", products.length, "sản phẩm");
    return products;
  } catch (error) {
    console.error("Lỗi khi tải dữ liệu:", error);
    return [];
  }
}

// Hàm render sản phẩm dưới dạng bảng
function renderProducts(products = filteredProducts) {
  const container = document.getElementById("productContainer");
  const emptyState = document.getElementById("emptyState");
  const resultCount = document.getElementById("resultCount");
  const lastUpdated = document.getElementById("lastUpdated");

  container.innerHTML = "";

  // Update timestamp
  const now = new Date();
  lastUpdated.textContent = now.toLocaleTimeString();

  if (!products || products.length === 0) {
    emptyState.classList.remove("d-none");
    resultCount.textContent = "0";
    document.querySelector(".table-responsive").style.display = "none";
    document.getElementById("pagination").innerHTML = "";
    return;
  }

  emptyState.classList.add("d-none");
  document.querySelector(".table-responsive").style.display = "block";

  // Tính toán phân trang
  const totalPages = Math.ceil(products.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedProducts = products.slice(startIndex, endIndex);

  // Update result count
  resultCount.textContent = `${startIndex + 1}-${Math.min(endIndex, products.length)} of ${products.length}`;

  // Render các sản phẩm của trang hiện tại
  paginatedProducts.forEach((product) => {
    const row = document.createElement("tr");
    row.id = `product-row-${product.id}`;
    row.innerHTML = `
      <td class="text-center">
        <img 
          src="${product.images[0]}" 
          alt="${product.title}" 
          class="img-thumbnail" 
          style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px;"
        />
      </td>
      <td>
        <strong class="d-block" id="title-${product.id}">${product.title}</strong>
        <small class="text-muted">ID: ${product.id}</small>
      </td>
      <td>
        <span class="badge bg-primary rounded-pill" id="category-${product.id}">${product.category.name}</span>
      </td>
      <td>
        <small class="text-muted" id="description-${product.id}">${product.description.substring(0, 80)}${product.description.length > 80 ? "..." : ""}</small>
      </td>
      <td class="text-end">
        <span class="text-danger fw-bold fs-5" id="price-${product.id}">$${product.price}</span>
      </td>
      <td class="text-center">
        <div class="btn-group btn-group-sm" role="group" id="actions-${product.id}">
          <button class="btn btn-info" onclick="viewProduct(${product.id})" title="View details">
            <i class="fas fa-eye"></i>
          </button>
          <button class="btn btn-warning" onclick="enableEdit(${product.id})" title="Edit product">
            <i class="fas fa-edit"></i>
          </button>
          <button class="btn btn-danger" onclick="deleteProduct(${product.id})" title="Delete product">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </td>
    `;
    container.appendChild(row);
  });

  // Render pagination
  renderPagination(totalPages);
}

// Hàm render pagination controls
function renderPagination(totalPages) {
  const pagination = document.getElementById("pagination");
  pagination.innerHTML = "";

  if (totalPages <= 1) {
    return;
  }

  // Previous button
  const prevLi = document.createElement("li");
  prevLi.className = `page-item ${currentPage === 1 ? "disabled" : ""}`;
  prevLi.innerHTML = `
    <a class="page-link" href="#" onclick="changePage(${currentPage - 1}); return false;">
      <i class="fas fa-chevron-left"></i>
    </a>
  `;
  pagination.appendChild(prevLi);

  // Page numbers
  const maxVisiblePages = 5;
  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

  if (endPage - startPage < maxVisiblePages - 1) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }

  // First page
  if (startPage > 1) {
    const firstLi = document.createElement("li");
    firstLi.className = "page-item";
    firstLi.innerHTML = `
      <a class="page-link" href="#" onclick="changePage(1); return false;">1</a>
    `;
    pagination.appendChild(firstLi);

    if (startPage > 2) {
      const dotsLi = document.createElement("li");
      dotsLi.className = "page-item disabled";
      dotsLi.innerHTML = `<span class="page-link">...</span>`;
      pagination.appendChild(dotsLi);
    }
  }

  // Page numbers
  for (let i = startPage; i <= endPage; i++) {
    const li = document.createElement("li");
    li.className = `page-item ${i === currentPage ? "active" : ""}`;
    li.innerHTML = `
      <a class="page-link" href="#" onclick="changePage(${i}); return false;">${i}</a>
    `;
    pagination.appendChild(li);
  }

  // Last page
  if (endPage < totalPages) {
    if (endPage < totalPages - 1) {
      const dotsLi = document.createElement("li");
      dotsLi.className = "page-item disabled";
      dotsLi.innerHTML = `<span class="page-link">...</span>`;
      pagination.appendChild(dotsLi);
    }

    const lastLi = document.createElement("li");
    lastLi.className = "page-item";
    lastLi.innerHTML = `
      <a class="page-link" href="#" onclick="changePage(${totalPages}); return false;">${totalPages}</a>
    `;
    pagination.appendChild(lastLi);
  }

  // Next button
  const nextLi = document.createElement("li");
  nextLi.className = `page-item ${currentPage === totalPages ? "disabled" : ""}`;
  nextLi.innerHTML = `
    <a class="page-link" href="#" onclick="changePage(${currentPage + 1}); return false;">
      <i class="fas fa-chevron-right"></i>
    </a>
  `;
  pagination.appendChild(nextLi);
}

// Hàm thay đổi trang
function changePage(page) {
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  if (page < 1 || page > totalPages) {
    return;
  }

  currentPage = page;
  renderProducts();

  // Scroll to top of table
  document.querySelector(".table-responsive").scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
}

// Hàm thay đổi số lượng items per page
function changeItemsPerPage() {
  const select = document.getElementById("itemsPerPage");
  itemsPerPage = parseInt(select.value);
  currentPage = 1; // Reset về trang 1
  renderProducts();
}

// Hàm tìm kiếm theo tên (onChange và onInput)
function searchProducts() {
  const searchInput = document
    .getElementById("searchInput")
    .value.toLowerCase();

  filteredProducts = allProducts.filter((product) =>
    product.title.toLowerCase().includes(searchInput),
  );

  currentPage = 1; // Reset về trang 1 khi tìm kiếm
  console.log(`Tìm thấy ${filteredProducts.length} sản phẩm`);
  renderProducts(filteredProducts);
}

// Hàm sắp xếp theo tên (A-Z, Z-A)
function sortByName(order) {
  filteredProducts.sort((a, b) => {
    if (order === "asc") {
      return a.title.localeCompare(b.title);
    } else {
      return b.title.localeCompare(a.title);
    }
  });

  currentPage = 1; // Reset về trang 1 khi sắp xếp
  console.log(`Sắp xếp theo tên: ${order === "asc" ? "A-Z" : "Z-A"}`);
  renderProducts();
}

// Hàm sắp xếp theo giá (Tăng, Giảm)
function sortByPrice(order) {
  filteredProducts.sort((a, b) => {
    if (order === "asc") {
      return a.price - b.price;
    } else {
      return b.price - a.price;
    }
  });

  currentPage = 1; // Reset về trang 1 khi sắp xếp
  console.log(`Sắp xếp theo giá: ${order === "asc" ? "Tăng" : "Giảm"}`);
  renderProducts();
}

// Hàm chỉnh sửa sản phẩm - Enable inline editing
function enableEdit(productId) {
  const product = allProducts.find((p) => p.id === productId);
  if (!product) return;

  // Get elements
  const titleEl = document.getElementById(`title-${productId}`);
  const categoryEl = document.getElementById(`category-${productId}`);
  const priceEl = document.getElementById(`price-${productId}`);
  const descriptionEl = document.getElementById(`description-${productId}`);
  const actionsEl = document.getElementById(`actions-${productId}`);
  const row = document.getElementById(`product-row-${productId}`);

  // Store original values
  row.dataset.originalTitle = product.title;
  row.dataset.originalCategory = product.category.name;
  row.dataset.originalPrice = product.price;
  row.dataset.originalDescription = product.description;

  // Get unique categories from all products
  const categories = [...new Set(allProducts.map((p) => p.category.name))];

  // Replace with input fields
  titleEl.innerHTML = `<input type="text" class="form-control form-control-sm" value="${product.title}" id="edit-title-${productId}">`;

  // Category dropdown
  categoryEl.innerHTML = `
    <select class="form-select form-select-sm" id="edit-category-${productId}">
      ${categories.map((cat) => `<option value="${cat}" ${cat === product.category.name ? "selected" : ""}>${cat}</option>`).join("")}
    </select>
  `;

  priceEl.innerHTML = `<input type="number" class="form-control form-control-sm text-end" value="${product.price}" id="edit-price-${productId}" step="0.01">`;
  descriptionEl.innerHTML = `<textarea class="form-control form-control-sm" rows="2" id="edit-description-${productId}">${product.description}</textarea>`;

  // Change action buttons to Save/Cancel
  actionsEl.innerHTML = `
    <div class="btn-group btn-group-sm" role="group">
      <button class="btn btn-success" onclick="saveEdit(${productId})" title="Save changes">
        <i class="fas fa-check"></i> Save
      </button>
      <button class="btn btn-secondary" onclick="cancelEdit(${productId})" title="Cancel editing">
        <i class="fas fa-times"></i> Cancel
      </button>
    </div>
  `;

  // Highlight row
  row.classList.add("table-warning");
}

// Hàm lưu chỉnh sửa
function saveEdit(productId) {
  const row = document.getElementById(`product-row-${productId}`);

  // Get new values
  const newTitle = document
    .getElementById(`edit-title-${productId}`)
    .value.trim();
  const newCategory = document.getElementById(
    `edit-category-${productId}`,
  ).value;
  const newPrice = parseFloat(
    document.getElementById(`edit-price-${productId}`).value,
  );
  const newDescription = document
    .getElementById(`edit-description-${productId}`)
    .value.trim();

  // Validate
  if (!newTitle) {
    alert("Product name cannot be empty!");
    return;
  }
  if (!newCategory) {
    alert("Please select a category!");
    return;
  }
  if (isNaN(newPrice) || newPrice <= 0) {
    alert("Please enter a valid price!");
    return;
  }
  if (!newDescription) {
    alert("Description cannot be empty!");
    return;
  }

  // Update in allProducts array
  const productIndex = allProducts.findIndex((p) => p.id === productId);
  if (productIndex !== -1) {
    allProducts[productIndex].title = newTitle;
    allProducts[productIndex].category.name = newCategory;
    allProducts[productIndex].price = newPrice;
    allProducts[productIndex].description = newDescription;
  }

  // Update in filteredProducts array
  const filteredIndex = filteredProducts.findIndex((p) => p.id === productId);
  if (filteredIndex !== -1) {
    filteredProducts[filteredIndex].title = newTitle;
    filteredProducts[filteredIndex].category.name = newCategory;
    filteredProducts[filteredIndex].price = newPrice;
    filteredProducts[filteredIndex].description = newDescription;
  }

  console.log(`Updated product ${productId}:`, {
    newTitle,
    newCategory,
    newPrice,
    newDescription,
  });

  // Re-render to show updated data
  renderProducts();

  // Show success message
  showToast("Product updated successfully!", "success");
}

// Hàm hủy chỉnh sửa
function cancelEdit(productId) {
  // Simply re-render to restore original view
  renderProducts();
  showToast("Edit cancelled", "info");
}

// Hàm hiển thị toast notification
function showToast(message, type = "info") {
  // Create toast element
  const toast = document.createElement("div");
  toast.className = `alert alert-${type} position-fixed top-0 start-50 translate-middle-x mt-3`;
  toast.style.zIndex = "9999";
  toast.style.minWidth = "300px";
  toast.innerHTML = `
    <i class="fas fa-${type === "success" ? "check-circle" : type === "danger" ? "exclamation-circle" : "info-circle"} me-2"></i>
    ${message}
  `;

  document.body.appendChild(toast);

  // Auto remove after 3 seconds
  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transition = "opacity 0.3s";
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// Hàm xem chi tiết sản phẩm (cải tiến)
function viewProduct(productId) {
  const product = allProducts.find((p) => p.id === productId);
  if (product) {
    const details = `
      <strong>Product Details</strong>
      
      Name: ${product.title}
      Category: ${product.category.name}
      Price: $${product.price}
      
      Description:
      ${product.description}
      
      Created: ${new Date(product.creationAt).toLocaleDateString()}
      Updated: ${new Date(product.updatedAt).toLocaleDateString()}
    `;
    alert(details);
  }
}

// Update editProduct function
function editProduct(productId) {
  enableEdit(productId);
}

// Hàm xóa sản phẩm
function deleteProduct(productId) {
  if (confirm("Bạn có chắc chắn muốn xóa sản phẩm này?")) {
    allProducts = allProducts.filter((p) => p.id !== productId);
    filteredProducts = filteredProducts.filter((p) => p.id !== productId);
    console.log(`Đã xóa sản phẩm ID: ${productId}`);
    renderProducts();
  }
}

// Hàm khởi tạo - load dữ liệu và render
async function initializeApp() {
  allProducts = await loadData();
  filteredProducts = [...allProducts]; // Copy toàn bộ dữ liệu vào filtered
  renderProducts();
}

// Gọi hàm khởi tạo khi DOM sẵn sàng
document.addEventListener("DOMContentLoaded", initializeApp);
