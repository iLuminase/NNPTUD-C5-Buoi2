//Sử dụng db.json và load data ra giao diện

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

// Hàm render sản phẩm từ dữ liệu
async function renderProducts() {
  const container = document.getElementById("productContainer");
  const products = await loadData();

  if (!products || products.length === 0) {
    container.innerHTML =
      '<p style="color: red; padding: 20px; grid-column: 1 / -1;">Lỗi: Không thể tải dữ liệu! Kiểm tra file db.json</p>';
    return;
  }

  products.forEach((product) => {
    const productCard = document.createElement("div");
    productCard.className = "product-card";
    productCard.innerHTML = `
      <img src="${product.images[0]}" alt="${product.title}" class="product-image">
      <div class="product-info">
        <h3 class="product-title">${product.title}</h3>
        <p class="product-description">${product.description}</p>
        <div class="product-footer">
          <span class="product-price">$${product.price}</span>
          <span class="product-category">${product.category.name}</span>
        </div>
      </div>
    `;
    container.appendChild(productCard);
  });
}

// Gọi hàm render khi DOM sẵn sàng
document.addEventListener("DOMContentLoaded", renderProducts);
