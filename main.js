// ============================================
// BIẾN TOÀN CỤC
// ============================================
let products = []; // Danh sách tất cả sản phẩm
let currentPage = 1; // Trang hiện tại
let itemsPerPage = 10; // Số sản phẩm mỗi trang

// ============================================
// 1. LOAD DỮ LIỆU TỪ SERVER
// ============================================
async function loadData() {
  try {
    const response = await fetch("http://localhost:3000/products");
    if (!response.ok) throw new Error("Không thể tải dữ liệu");

    products = await response.json();
    console.log("✅ Đã tải", products.length, "sản phẩm");
    renderProducts();
  } catch (error) {
    console.error("❌ Lỗi:", error);
    showToast("Không thể tải dữ liệu", "danger");
  }
}

// ============================================
// 2. HIỂN THỊ SẢN PHẨM
// ============================================
function renderProducts() {
  const tbody = document.getElementById("productContainer");
  const start = (currentPage - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  const pageProducts = products.slice(start, end);

  // Cập nhật số lượng hiển thị
  document.getElementById("resultCount").textContent = products.length;
  document.getElementById("lastUpdated").textContent =
    new Date().toLocaleTimeString();

  // Hiển thị trạng thái rỗng
  if (products.length === 0) {
    tbody.innerHTML = "";
    document.getElementById("emptyState").classList.remove("d-none");
    return;
  }
  document.getElementById("emptyState").classList.add("d-none");

  // Render từng sản phẩm
  tbody.innerHTML = pageProducts
    .map((product) => {
      const deletedClass = product.isDeleted ? "deleted-product-row" : "";
      return `
      <tr class="${deletedClass}">
        <td class="text-center">
          <img src="${product.images[0]}" alt="${product.title}" 
               style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px;">
        </td>
        <td>
          <strong>${product.title}</strong>
          <br><small class="text-muted">ID: ${product.id}</small>
        </td>
        <td>
          <span class="badge bg-primary">${product.category.name}</span>
        </td>
        <td>
          <small>${product.description.substring(0, 80)}...</small>
        </td>
        <td class="text-end">
          <span class="text-danger fw-bold">$${product.price}</span>
        </td>
        <td class="text-center">
          <button class="btn btn-sm btn-info" onclick="viewProduct(${product.id})" title="Xem">
            <i class="fas fa-eye"></i>
          </button>
          <button class="btn btn-sm btn-warning" onclick="editProduct(${product.id})" title="Sửa">
            <i class="fas fa-edit"></i>
          </button>
          <button class="btn btn-sm btn-secondary" onclick="openComments(${product.id})" title="Bình luận">
            <i class="fas fa-comments"></i>
            <span class="badge bg-light text-dark">${(product.comments || []).length}</span>
          </button>
          <button class="btn btn-sm btn-danger" onclick="deleteProduct(${product.id})" title="Xóa">
            <i class="fas fa-trash"></i>
          </button>
        </td>
      </tr>
    `;
    })
    .join("");

  renderPagination();
}

// ============================================
// 3. PHÂN TRANG
// ============================================
function renderPagination() {
  const totalPages = Math.ceil(products.length / itemsPerPage);
  const paginationDiv = document.getElementById("pagination");

  if (totalPages <= 1) {
    paginationDiv.innerHTML = "";
    return;
  }

  let html = `
    <li class="page-item ${currentPage === 1 ? "disabled" : ""}">
      <a class="page-link" href="#" onclick="changePage(${currentPage - 1}); return false;">
        <i class="fas fa-chevron-left"></i>
      </a>
    </li>
  `;

  for (let i = 1; i <= totalPages; i++) {
    html += `
      <li class="page-item ${currentPage === i ? "active" : ""}">
        <a class="page-link" href="#" onclick="changePage(${i}); return false;">${i}</a>
      </li>
    `;
  }

  html += `
    <li class="page-item ${currentPage === totalPages ? "disabled" : ""}">
      <a class="page-link" href="#" onclick="changePage(${currentPage + 1}); return false;">
        <i class="fas fa-chevron-right"></i>
      </a>
    </li>
  `;

  paginationDiv.innerHTML = html;
}

function changePage(page) {
  const totalPages = Math.ceil(products.length / itemsPerPage);
  if (page < 1 || page > totalPages) return;

  currentPage = page;
  renderProducts();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function changeItemsPerPage() {
  itemsPerPage = parseInt(document.getElementById("itemsPerPage").value);
  currentPage = 1;
  renderProducts();
}

// ============================================
// 4. TÌM KIẾM THEO TÊN
// ============================================
// Hàm loại bỏ dấu tiếng Việt
// function removeVietnameseTones(str) {
//   str = str.toLowerCase();
//   str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
//   str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
//   str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
//   str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
//   str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
//   str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
//   str = str.replace(/đ/g, "d");
//   return str;
// }

function removeVietnameseTones(str) {
  //Normalize và loại bỏ dấu
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase();
}
async function searchProducts() {
  const searchValue = document
    .getElementById("searchInput")
    .value.trim()
    .toLowerCase();

  if (searchValue === "") {
    loadData(); // Load lại tất cả
    return;
  }

  try {
    // Load lại toàn bộ dữ liệu từ server
    const response = await fetch("http://localhost:3000/products");
    if (!response.ok) throw new Error("Không thể tải dữ liệu");

    const allProducts = await response.json();

    // Loại bỏ dấu cho từ khóa tìm kiếm
    const searchNoTone = removeVietnameseTones(searchValue);

    // Tìm kiếm trong mảng sản phẩm (có dấu và không dấu)
    const found = allProducts.filter((p) => {
      const titleLower = p.title.toLowerCase();
      const titleNoTone = removeVietnameseTones(titleLower);
      return (
        titleLower.includes(searchValue) || titleNoTone.includes(searchNoTone)
      );
    });

    if (found.length > 0) {
      products = found;
      currentPage = 1;
      renderProducts();
      showToast("Tìm thấy " + found.length + " sản phẩm", "success");
    } else {
      products = [];
      renderProducts();
      showToast("Không tìm thấy sản phẩm: " + searchValue, "warning");
    }
  } catch (error) {
    console.error(error);
    showToast("Lỗi khi tìm kiếm", "danger");
  }
}

// ============================================
// 5. SẮP XẾP THEO GIÁ
// ============================================
function sortByPrice(order) {
  if (order === "asc") {
    products.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
    showToast("Sắp xếp giá tăng dần", "info");
  } else {
    products.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
    showToast("Sắp xếp giá giảm dần", "info");
  }
  currentPage = 1;
  renderProducts();
}

function sortByName(order) {
  if (order === "asc") {
    products.sort((a, b) => a.title.localeCompare(b.title));
    showToast("Sắp xếp tên A-Z", "info");
  } else {
    products.sort((a, b) => b.title.localeCompare(a.title));
    showToast("Sắp xếp tên Z-A", "info");
  }
  currentPage = 1;
  renderProducts();
}

// ============================================
// 6. XEM CHI TIẾT SẢN PHẨM
// ============================================
function viewProduct(id) {
  const product = products.find((p) => p.id == id);
  if (!product) return;

  const imageUrl =
    product.images && product.images[0] ? product.images[0] : "No image";

  alert(
    `🛍️ Sản phẩm: ${product.title}\n💰 Giá: $${product.price}\n📦 Danh mục: ${product.category.name}\n📝 Mô tả: ${product.description}\n🖼️ Image: ${imageUrl}\n🆔 ID: ${product.id}`,
  );
}

// ============================================
// 7. TẠO SẢN PHẨM MỚI
// ============================================
function openCreateModal() {
  document.getElementById("createTitle").value = "";
  document.getElementById("createCategory").value = "";
  document.getElementById("createPrice").value = "";
  document.getElementById("createDescription").value = "";
  document.getElementById("createImageUrl").value = "";

  const modal = new bootstrap.Modal(
    document.getElementById("createProductModal"),
  );
  modal.show();
}

async function submitCreateProduct() {
  const title = document.getElementById("createTitle").value.trim();
  const category = document.getElementById("createCategory").value;
  const price = document.getElementById("createPrice").value;
  const description = document.getElementById("createDescription").value.trim();
  const imageUrl = document.getElementById("createImageUrl").value.trim();

  if (!title || !category || !price || !description) {
    showToast("Vui lòng điền đầy đủ thông tin", "warning");
    return;
  }

  // Tính ID mới = maxId + 1
  const maxId =
    products.length > 0
      ? Math.max.apply(
          null,
          products.map((p) => parseInt(p.id)),
        )
      : 0;
  const newId = (maxId + 1).toString(); // Chuyển sang String

  // Nếu imageUrl rỗng thì dùng placeholder
  const finalImageUrl =
    imageUrl || "https://via.placeholder.com/400x400?text=No+Image";

  const newProduct = {
    id: newId,
    title: title,
    price: parseFloat(price),
    description: description,
    images: [finalImageUrl],
    category: { id: 1, name: category },
    comments: [],
    isDeleted: false,
  };

  try {
    const response = await fetch("http://localhost:3000/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newProduct),
    });

    if (!response.ok) throw new Error("Không thể tạo sản phẩm");

    showToast("✅ Tạo sản phẩm thành công!", "success");
    bootstrap.Modal.getInstance(
      document.getElementById("createProductModal"),
    ).hide();
    loadData();
  } catch (error) {
    console.error(error);
    showToast("❌ Lỗi khi tạo sản phẩm", "danger");
  }
}

// ============================================
// 8. SỬA SẢN PHẨM
// ============================================
function editProduct(id) {
  const product = products.find((p) => p.id == id);
  if (!product) return;

  // Điền dữ liệu vào form
  document.getElementById("editProductId").value = product.id;
  document.getElementById("editTitle").value = product.title;
  document.getElementById("editCategory").value = product.category.name;
  document.getElementById("editPrice").value = product.price;
  document.getElementById("editDescription").value = product.description;
  document.getElementById("editImageUrl").value = product.images[0] || "";

  // Mở modal
  const modal = new bootstrap.Modal(
    document.getElementById("editProductModal"),
  );
  modal.show();
}

async function submitEditProduct() {
  const id = document.getElementById("editProductId").value;
  const title = document.getElementById("editTitle").value.trim();
  const category = document.getElementById("editCategory").value;
  const price = document.getElementById("editPrice").value;
  const description = document.getElementById("editDescription").value.trim();
  const imageUrl = document.getElementById("editImageUrl").value.trim();

  if (!title || !category || !price || !description) {
    showToast("Vui lòng điền đầy đủ thông tin", "warning");
    return;
  }

  const product = products.find((p) => p.id == id);
  if (!product) return;

  // Nếu imageUrl rỗng thì giữ ảnh cũ hoặc dùng placeholder
  const finalImageUrl =
    imageUrl ||
    product.images[0] ||
    "https://via.placeholder.com/400x400?text=No+Image";

  const updatedProduct = Object.assign({}, product, {
    title: title,
    price: parseFloat(price),
    description: description,
    images: [finalImageUrl],
    category: { id: product.category.id, name: category },
  });

  try {
    const response = await fetch(`http://localhost:3000/products/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedProduct),
    });

    if (!response.ok) throw new Error("Không thể cập nhật");

    showToast("✅ Cập nhật thành công!", "success");
    bootstrap.Modal.getInstance(
      document.getElementById("editProductModal"),
    ).hide();
    loadData();
  } catch (error) {
    console.error(error);
    showToast("❌ Lỗi khi cập nhật", "danger");
  }
}

// ============================================
// 9. XÓA MỀM SẢN PHẨM (isDeleted = true)
// ============================================
async function deleteProduct(id) {
  if (!confirm("Bạn có chắc muốn xóa sản phẩm này?")) return;

  const product = products.find((p) => p.id == id);
  if (!product) return;

  // Đánh dấu xóa mềm
  product.isDeleted = true;

  try {
    const response = await fetch(`http://localhost:3000/products/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(product),
    });

    if (!response.ok) throw new Error("Không thể xóa");

    showToast("🗑️ Đã xóa sản phẩm (xóa mềm)", "warning");
    renderProducts(); // Render lại để hiển thị gạch ngang
  } catch (error) {
    console.error(error);
    showToast("❌ Lỗi khi xóa", "danger");
  }
}

// ============================================
// 10. QUẢN LÝ COMMENTS
// ============================================
// Hàm format thời gian
function formatDate(dateString) {
  if (!dateString) return "Vừa xong";
  const date = new Date(dateString);
  const now = new Date();
  const diff = now - date;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "Vừa xong";
  if (minutes < 60) return `${minutes} phút trước`;
  if (hours < 24) return `${hours} giờ trước`;
  if (days < 7) return `${days} ngày trước`;

  return date.toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function openComments(productId) {
  const product = products.find((p) => p.id == productId);
  if (!product) return;

  document.getElementById("commentsProductId").value = productId;
  renderComments(product);

  const modal = new bootstrap.Modal(document.getElementById("commentsModal"));
  modal.show();
}

function renderComments(product) {
  const container = document.getElementById("commentsContainer");
  const comments = product.comments || [];

  if (comments.length === 0) {
    container.innerHTML = `
      <div class="alert alert-info">
        <i class="fas fa-info-circle"></i> Chưa có bình luận nào
      </div>
    `;
    return;
  }

  container.innerHTML = comments
    .map(
      (comment, index) => `
    <div class="card mb-2 comment-card">
      <div class="card-body py-3">
        <p class="mb-2 comment-text">${comment.text}</p>
        <div class="d-flex justify-content-between align-items-center">
          <small class="text-muted comment-date">
            <i class="fas fa-clock me-1"></i>${formatDate(comment.createdAt || comment.date)}
          </small>
          <button class="btn btn-sm btn-danger" onclick="deleteComment(${product.id}, ${index})">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
    </div>
  `,
    )
    .join("");
}

async function submitComment() {
  const productId = document.getElementById("commentsProductId").value;
  const commentText = document.getElementById("commentText").value.trim();

  if (!commentText) {
    showToast("Vui lòng nhập bình luận", "warning");
    return;
  }

  const product = products.find((p) => p.id == productId);
  if (!product) return;

  if (!product.comments) product.comments = [];

  const newComment = {
    id: Date.now().toString(),
    text: commentText,
    postId: productId,
    createdAt: new Date().toISOString(),
    date: new Date().toLocaleString("vi-VN"),
  };

  product.comments.push(newComment);

  try {
    const response = await fetch(
      `http://localhost:3000/products/${productId}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(product),
      },
    );

    if (!response.ok) throw new Error("Không thể thêm bình luận");

    document.getElementById("commentText").value = "";
    renderComments(product);
    renderProducts(); // Cập nhật số lượng comment
    showToast("✅ Đã thêm bình luận", "success");
  } catch (error) {
    console.error(error);
    showToast("❌ Lỗi khi thêm bình luận", "danger");
  }
}

async function deleteComment(productId, commentIndex) {
  if (!confirm("Xóa bình luận này?")) return;

  const product = products.find((p) => p.id == productId);
  if (!product) return;

  product.comments.splice(commentIndex, 1);

  try {
    const response = await fetch(
      `http://localhost:3000/products/${productId}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(product),
      },
    );

    if (!response.ok) throw new Error("Không thể xóa bình luận");

    renderComments(product);
    renderProducts();
    showToast("🗑️ Đã xóa bình luận", "warning");
  } catch (error) {
    console.error(error);
    showToast("❌ Lỗi khi xóa bình luận", "danger");
  }
}

// ============================================
// 11. THÔNG BÁO TOAST
// ============================================
function showToast(message, type = "info") {
  const toastContainer = document.createElement("div");
  toastContainer.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 9999;
  `;

  toastContainer.innerHTML = `
    <div class="alert alert-${type} alert-dismissible fade show" role="alert">
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    </div>
  `;

  document.body.appendChild(toastContainer);

  setTimeout(() => {
    toastContainer.remove();
  }, 3000);
}

// ============================================
// 12. KHỞI ĐỘNG ỨNG DỤNG
// ============================================
document.addEventListener("DOMContentLoaded", loadData);
