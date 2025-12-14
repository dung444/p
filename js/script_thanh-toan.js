// script_thanh-toan.js
document.addEventListener("DOMContentLoaded", () => {
  // ===== HIỂN THỊ THÔNG TIN USER =====
  const currentUser = JSON.parse(localStorage.getItem("currentUser") || "null");
  const userInfo = document.getElementById("user-info");
  const logoutBtn = document.getElementById("logout-btn");

  if (!currentUser) {
    alert("Vui lòng đăng nhập để tiếp tục thanh toán!");
    window.location.href = "Login.html";
    return;
  }

  userInfo.textContent = currentUser.fullname || "Tài khoản";
  logoutBtn.style.display = "inline-block";
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("currentUser");
    window.location.href = "Login.html";
  });

  // ===== LẤY DANH SÁCH SẢN PHẨM CHỌN THANH TOÁN =====
  const selectedProducts = JSON.parse(
    localStorage.getItem("selectedProducts") || "[]"
  );
  const buyContainer = document.querySelector(".buy-container");

  if (!selectedProducts.length) {
    buyContainer.innerHTML = `
      <div class="empty-order">
        <p>Hiện chưa có sản phẩm nào trong đơn hàng.</p>
        <a href="all-product.html" class="btn-continue">Tiếp tục mua sắm</a>
      </div>
    `;
    return;
  }

  // ===== HIỂN THỊ SẢN PHẨM =====
  let totalAmount = 0;

  selectedProducts.forEach((product) => {
    const price = parseFloat(product.price) || 0;
    const lineTotal = price * (product.quantity || 1);
    totalAmount += lineTotal;

    const productElement = document.createElement("div");
    productElement.classList.add("product-item");
    productElement.innerHTML = `
      <div class="product-image">
        <img src="${product.image}" alt="${product.name}" />
      </div>
      <div class="product-details">
        <h4>${product.name}</h4>
        <p>Số lượng: <strong>${product.quantity}</strong></p>
        <p>Đơn giá: <span class="price">₫${price.toLocaleString()}</span></p>
      </div>
      <div class="product-line-total">
        <span class="label">Thành tiền</span>
        <span class="value">₫${lineTotal.toLocaleString()}</span>
      </div>
    `;
    buyContainer.appendChild(productElement);
  });

  // ===== KHUNG TỔNG TIỀN + ĐỊA CHỈ =====
  const bottomLayout = document.createElement("div");
  bottomLayout.className = "checkout-bottom";

  // --- TÓM TẮT ĐƠN HÀNG ---
  const summary = document.createElement("div");
  summary.className = "order-summary";
  summary.innerHTML = `
    <h3>Tóm tắt đơn hàng</h3>
    <div class="order-summary-row">
      <span>Tạm tính (${selectedProducts.length} sản phẩm)</span>
      <span class="order-summary-value">₫${totalAmount.toLocaleString()}</span>
    </div>
    <div class="order-summary-row">
      <span>Phí vận chuyển</span>
      <span class="order-summary-value">₫0</span>
    </div>
    <div class="order-summary-row total">
      <span>Tổng thanh toán</span>
      <span class="order-summary-value" id="order-total">₫${totalAmount.toLocaleString()}</span>
    </div>
  `;

  // --- FORM ĐỊA CHỈ ---
  const addressForm = document.createElement("div");
  addressForm.classList.add("address-form");
  addressForm.innerHTML = `
    <h3>Địa chỉ giao hàng</h3>
    <p class="address-note">
      Vui lòng chọn chính xác Tỉnh/Thành, Quận/Huyện, Phường/Xã để đơn hàng được giao nhanh hơn.
    </p>
    <label for="province">Tỉnh/Thành phố</label>
    <select id="province" required>
      <option value="">Chọn Tỉnh/Thành phố</option>
      <option value="Hà Nội">Hà Nội</option>
      <option value="Hưng Yên">Hưng Yên</option>
    </select>

    <label for="district">Quận/Huyện</label>
    <select id="district" required>
      <option value="">Chọn Quận/Huyện</option>
    </select>

    <label for="ward">Phường/Xã</label>
    <select id="ward" required>
      <option value="">Chọn Phường/Xã</option>
    </select>

    <button id="place-order-btn" type="button">
      ĐẶT HÀNG
    </button>
  `;

  bottomLayout.appendChild(summary);
  bottomLayout.appendChild(addressForm);
  buyContainer.appendChild(bottomLayout);

  // ===== DỮ LIỆU ĐỊA LÝ GIẢ LẬP =====
  const locationData = {
    "Hà Nội": {
      "Quận Ba Đình": ["Phường Cống Vị", "Phường Điện Biên"],
      "Quận Hoàn Kiếm": ["Phường Hàng Bạc", "Phường Hàng Bồ"],
    },
    "Hưng Yên": {
      "Huyện Yên Mỹ": ["Yên Phú", "Yên Hòa"],
      "Huyện Khoái Châu": ["Dạ Trạch", "Đại Hưng"],
    },
  };

  // ===== XỬ LÝ CHỌN TỈNH =====
  const provinceSelect = document.getElementById("province");
  const districtSelect = document.getElementById("district");
  const wardSelect = document.getElementById("ward");

  provinceSelect.addEventListener("change", (event) => {
    const selectedProvince = event.target.value;

    districtSelect.innerHTML = `<option value="">Chọn Quận/Huyện</option>`;
    wardSelect.innerHTML = `<option value="">Chọn Phường/Xã</option>`;

    if (locationData[selectedProvince]) {
      Object.keys(locationData[selectedProvince]).forEach((district) => {
        const option = document.createElement("option");
        option.value = district;
        option.textContent = district;
        districtSelect.appendChild(option);
      });
    }
  });

  // ===== XỬ LÝ CHỌN HUYỆN =====
  districtSelect.addEventListener("change", (event) => {
    const selectedProvince = provinceSelect.value;
    const selectedDistrict = event.target.value;

    wardSelect.innerHTML = `<option value="">Chọn Phường/Xã</option>`;

    if (
      locationData[selectedProvince] &&
      locationData[selectedProvince][selectedDistrict]
    ) {
      locationData[selectedProvince][selectedDistrict].forEach((ward) => {
        const option = document.createElement("option");
        option.value = ward;
        option.textContent = ward;
        wardSelect.appendChild(option);
      });
    }
  });

  // ===== ĐẶT HÀNG =====
  document
    .getElementById("place-order-btn")
    .addEventListener("click", () => {
      const province = provinceSelect.value;
      const district = districtSelect.value;
      const ward = wardSelect.value;

      if (!province || !district || !ward) {
        alert("Vui lòng chọn đầy đủ địa chỉ giao hàng!");
        return;
      }

      const selectedProducts = JSON.parse(
        localStorage.getItem("selectedProducts") || "[]"
      );
      if (!selectedProducts.length) {
        alert("Không có sản phẩm nào trong đơn hàng!");
        return;
      }

      const fullAddress = `${ward}, ${district}, ${province}`;
      const orders = JSON.parse(localStorage.getItem("orders") || "[]");

      const orderTotal = selectedProducts.reduce((sum, p) => {
        const price = parseFloat(p.price) || 0;
        const qty = p.quantity || 1;
        return sum + price * qty;
      }, 0);

      const newOrder = {
        id: `o_${Date.now()}_${orders.length}`, // id ổn định cho trang admin
        user: currentUser,
        products: selectedProducts,
        address: fullAddress,
        total: orderTotal,
        status: "pending", // Chờ xác nhận
        payment: "unpaid", // Chưa thanh toán
        timestamp: Date.now(),
      };

      orders.push(newOrder);
      localStorage.setItem("orders", JSON.stringify(orders));

      alert("Đặt hàng thành công! Cảm ơn bạn đã mua sắm tại Life&Cooking 💙");
      localStorage.removeItem("selectedProducts");
      window.location.href = "Shopping.html";
    });
});
