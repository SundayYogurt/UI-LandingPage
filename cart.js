// cart.js

// ฟังก์ชันสำหรับโหลดข้อมูลตะกร้าสินค้าจาก localStorage
function loadCart() {
  const cartData = localStorage.getItem("cart");
  return cartData ? JSON.parse(cartData) : {};
}

// ฟังก์ชันสำหรับบันทึกข้อมูลตะกร้าสินค้าลงใน localStorage
function saveCart(cart) {
  localStorage.setItem("cart", JSON.stringify(cart));
}

// ประกาศตัวแปร cart และโหลดข้อมูลจาก localStorage
let cart = loadCart();

// ฟังก์ชันสำหรับอัปเดตไอคอนตะกร้า
function updateCartIcon() {
  const cartIcon = document.getElementById("cart-icon");
  if (cartIcon) {
    const totalItems = Object.values(cart).reduce(
      (sum, item) => sum + item.quantity,
      0
    );
    cartIcon.setAttribute("data-count", totalItems);
  }
}

// เพิ่มสินค้าเข้าไปในตะกร้า
document.querySelectorAll(".add-to-cart").forEach((button) => {
  button.addEventListener("click", async () => {
    const productId = button.getAttribute("data-product-id");
    const basePrice = parseFloat(button.getAttribute("data-price"));

    // แสดง SweetAlert เพื่อเลือกระหว่าง "พิเศษ" หรือ "ธรรมดา"
    const { value: type } = await Swal.fire({
      title: "เลือกประเภท",
      input: "select",
      inputOptions: {
        normal: "ธรรมดา",
        special: "พิเศษ (+15 บาท)",
      },
      inputPlaceholder: "เลือกประเภท",
      showCancelButton: true,
      inputValidator: (value) => {
        if (!value) {
          return "กรุณาเลือกประเภท";
        }
      },
    });

    if (type) {
      // คำนวณราคาเพิ่มเติมหากเลือก "พิเศษ"
      const price = type === "special" ? basePrice + 15 : basePrice;

      // แสดง SweetAlert เพื่อใส่หมายเหตุ
      const { value: note } = await Swal.fire({
        title: "ใส่หมายเหตุ",
        input: "text",
        inputPlaceholder: "กรุณาใส่หมายเหตุ (ถ้ามี)",
        showCancelButton: true,
      });

      if (note !== undefined) {
        // ถ้าผู้ใช้กด "ตกลง" หรือใส่ข้อความ
        // สร้าง productKey ที่รวมชื่อสินค้าและประเภท
        const productKey = `${productId}-${type}`;

        if (!cart[productKey]) {
          cart[productKey] = {
            productId: productId,
            quantity: 1,
            price: price,
            note: note || "",
            type: type,
          };
        } else {
          cart[productKey].quantity++;
          cart[productKey].note = note || cart[productKey].note;
        }

        saveCart(cart); // บันทึกข้อมูลตะกร้าลงใน localStorage
        updateCartDisplay();
        updateCartIcon(); // อัปเดตไอคอนตะกร้า

        // แสดง SweetAlert เมื่อเพิ่มสินค้าเรียบร้อย
        Swal.fire({
          icon: "success",
          title: "เพิ่มสินค้าเรียบร้อย",
          text: `${productId} (${
            type === "special" ? "พิเศษ" : "ธรรมดา"
          }) ถูกเพิ่มเข้าไปในตะกร้าสินค้า`,
          confirmButtonText: "ตกลง",
        });
      }
    }
  });
});

// อัปเดตการแสดงผลตะกร้าสินค้า
function updateCartDisplay() {
  const cartElement = document.getElementById("cart");
  if (!cartElement) return; // ถ้าไม่มี element นี้ในหน้า ให้ข้าม

  cartElement.innerHTML = "";

  let totalPrice = 0;

  const table = document.createElement("table");
  table.classList.add("table", "table-striped");

  const thead = document.createElement("thead");
  const headerRow = document.createElement("tr");
  const headers = [
    "Product",
    "Quantity",
    "Price",
    "Total",
    "Type",
    "Note",
    "Actions",
  ];
  headers.forEach((headerText) => {
    const th = document.createElement("th");
    th.textContent = headerText;
    headerRow.appendChild(th);
  });
  thead.appendChild(headerRow);
  table.appendChild(thead);

  const tbody = document.createElement("tbody");

  for (const productKey in cart) {
    const item = cart[productKey];
    const itemTotalPrice = item.quantity * item.price;
    totalPrice += itemTotalPrice;

    const tr = document.createElement("tr");

    const productNameCell = document.createElement("td");
    productNameCell.textContent = `${item.productId}`;
    tr.appendChild(productNameCell);

    const quantityCell = document.createElement("td");
    const quantityInput = document.createElement("input");
    quantityInput.type = "number";
    quantityInput.value = item.quantity;
    quantityInput.min = 1;
    quantityInput.addEventListener("change", (e) => {
      const newQuantity = parseInt(e.target.value);
      if (newQuantity > 0) {
        cart[productKey].quantity = newQuantity;
        saveCart(cart); // บันทึกข้อมูลตะกร้าลงใน localStorage
        updateCartDisplay();
        updateCartIcon(); // อัปเดตไอคอนตะกร้า
      }
    });
    quantityCell.appendChild(quantityInput);
    tr.appendChild(quantityCell);

    const priceCell = document.createElement("td");
    priceCell.textContent = `$${item.price.toFixed(2)}`;
    tr.appendChild(priceCell);

    const totalCell = document.createElement("td");
    totalCell.textContent = `$${itemTotalPrice.toFixed(2)}`;
    tr.appendChild(totalCell);

    const typeCell = document.createElement("td");
    typeCell.textContent =
      item.type === "special" ? "พิเศษ (+15 บาท)" : "ธรรมดา";
    tr.appendChild(typeCell);

    const noteCell = document.createElement("td");
    noteCell.textContent = item.note || "-";
    tr.appendChild(noteCell);

    const actionsCell = document.createElement("td");
    const deleteButton = document.createElement("button");
    deleteButton.innerHTML = '<i class="fa-solid fa-trash-can"></i>';
    deleteButton.classList.add("btn", "btn-danger", "delete-product");
    deleteButton.setAttribute("data-product-key", productKey);
    deleteButton.addEventListener("click", () => {
      delete cart[productKey];
      saveCart(cart); // บันทึกข้อมูลตะกร้าลงใน localStorage
      updateCartDisplay();
      updateCartIcon(); // อัปเดตไอคอนตะกร้า
    });
    actionsCell.appendChild(deleteButton);
    tr.appendChild(actionsCell);

    tbody.appendChild(tr);
  }

  table.appendChild(tbody);

  cartElement.appendChild(table);

  if (Object.keys(cart).length === 0) {
    cartElement.innerHTML = "<p>No items in cart.</p>";
  } else {
    const totalPriceElement = document.createElement("p");
    totalPriceElement.textContent = `Total Price: $${totalPrice.toFixed(2)}`;
    cartElement.appendChild(totalPriceElement);
  }
}

// เมื่อหน้าเว็บโหลดเสร็จ ให้อัปเดตการแสดงผลตะกร้าสินค้าและไอคอนตะกร้า
document.addEventListener("DOMContentLoaded", () => {
  updateCartDisplay();
  updateCartIcon(); // อัปเดตไอคอนตะกร้าเมื่อโหลดหน้าเว็บ
});

// ฟังก์ชันสำหรับพิมพ์ใบเสร็จ
document.getElementById("printCart")?.addEventListener("click", () => {
  printReceipt("ใบเสร็จรับเงิน", generateCartReceipt());
});

// ฟังก์ชันสำหรับสร้างใบเสร็จ
function generateCartReceipt() {
  let receiptContent = `
    <style>
      body {
        font-family: 'Arial', sans-serif;
        margin: 0;
        padding: 0;
        text-align: center;
      }
      table {
        width: 100%;
        border-collapse: collapse;
        margin: 20px 0;
      }
      th, td {
        padding: 10px;
        border: 1px solid #ddd;
        text-align: center;
      }
      th {
        background-color: #f4f4f4;
      }
      .total-price {
        font-size: 18px;
        font-weight: bold;
        margin-top: 20px;
      }
      .footer {
        margin-top: 30px;
        font-size: 14px;
        color: #555;
      }
      .store-name {
        font-size: 24px;
        font-weight: bold;
        margin-top: 20px;
      }
      .qr-code {
        margin-top: 20px;
        height: 100px;
        width: 100px;
        background-color: #f4f4f4;
        text-align: center;
        line-height: 100px;
        font-size: 14px;
        color: #aaa;
        margin-left: auto;
        margin-right: auto;
      }
    </style>
    <h2 class="store-name">Protein Diet24</h2>
    <h3>ใบเสร็จรับเงิน</h3>
    <p>วันที่และเวลา: ${new Date().toLocaleString()}</p>
    <table>
      <thead>
        <tr>
          <th>สินค้า</th>
          <th>จำนวน</th>
          <th>ราคาต่อหน่วย</th>
          <th>ราคารวม</th>
          <th>ประเภท</th>
          <th>หมายเหตุ</th>
        </tr>
      </thead>
      <tbody>
  `;

  let totalPrice = 0;

  for (const productKey in cart) {
    const item = cart[productKey];
    const itemTotalPrice = item.quantity * item.price;
    totalPrice += itemTotalPrice;

    receiptContent += `
      <tr>
        <td>${item.productId}</td>
        <td>${item.quantity}</td>
        <td>$${item.price.toFixed(2)}</td>
        <td>$${itemTotalPrice.toFixed(2)}</td>
        <td>${item.type === "special" ? "พิเศษ (+15 บาท)" : "ธรรมดา"}</td>
        <td class="note">${item.note || "-"}</td>
      </tr>
    `;
  }

  receiptContent += `
      </tbody>
    </table>
    <div class="total-price">ราคารวมทั้งหมด: $${totalPrice.toFixed(2)}</div>
    <div class="footer">
      ขอบคุณที่ใช้บริการ!<br>
      โทร: 088-888-8888<br>
      ที่อยู่: 123 ถนนสุขุมวิท, กรุงเทพฯ
    </div>
 
      <img class="qr-code" src="qr.png" alt="QR Code">

  `;

  return receiptContent;
}

// ฟังก์ชันสำหรับพิมพ์ใบเสร็จ
function printReceipt(title, content) {
  const printWindow = window.open("", "_blank");
  printWindow.document.write(`
    <html>
      <head>
        <title>${title}</title>
        <style>
          body {
            font-family: 'Arial', sans-serif;
            margin: 0;
            padding: 0;
            text-align: center;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
          }
          th, td {
            padding: 10px;
            border: 1px solid #ddd;
            text-align: center;
          }
          th {
            background-color: #f4f4f4;
          }
          .total-price {
            font-size: 18px;
            font-weight: bold;
            margin-top: 20px;
          }
          .footer {
            margin-top: 30px;
            font-size: 14px;
            color: #555;
          }
          .store-name {
            font-size: 24px;
            font-weight: bold;
            margin-top: 20px;
          }
          .qr-code {
            margin-top: 20px;
            height: 100px;
            width: 100px;
            background-color: #f4f4f4;
            text-align: center;
            line-height: 100px;
            font-size: 14px;
            color: #aaa;
            margin-left: auto;
            margin-right: auto;
          }
        </style>
      </head>
      <body>
        ${content}
      </body>
    </html>
  `);
  printWindow.document.close();
  printWindow.print();
}
