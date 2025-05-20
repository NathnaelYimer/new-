class FIMenuSettings {
  constructor() {
    this.productData = this.loadInitialProductData()
    this.settings = this.loadSavedSettings()
    this.columnOrder = ["platinum", "gold", "silver", "bronze", "iron"]
    this.cacheDOM()
    this.createToastContainer()
    this.createColumnNameModal()
    this.bindEvents()
    this.applySettings()
    this.setupCrossTabSync()
  }

  // Load initial product data
  loadInitialProductData() {
    return {
      "Extended Warranty": {
        price: 613.16,
        description:
          "Comprehensive coverage that extends the manufacturer's warranty, protecting your vehicle against mechanical and electrical failures beyond the original warranty period.",
        terms:
          "Coverage varies by plan level. Deductibles may apply. Valid at any authorized service center. Transferable if vehicle is sold. Exclusions apply for wear and tear items and routine maintenance.",
      },
      "Rust Proofing": {
        price: 617.94,
        description:
          "Advanced protection that helps prevent rust and corrosion on your vehicle's body and undercarriage, extending its lifespan and maintaining its value.",
        terms:
          "Annual inspections required to maintain coverage. Covers perforation due to rust from the inside out. Does not cover surface rust from external damage. 5-year warranty included.",
      },
      "Paint Protection": {
        price: 608.39,
        description:
          "Premium sealant that creates a protective barrier over your vehicle's paint, guarding against environmental damage, UV rays, and minor scratches.",
        terms:
          "Requires proper maintenance and care. Not a substitute for regular washing. Does not cover damage from accidents or improper care. Reapplication recommended every 2 years.",
      },
      "Fabric/Leather Protection": {
        price: 261.84,
        description:
          "Specialized treatment that repels stains and spills on your vehicle's interior surfaces, making cleanup easier and preserving the appearance of seats and carpets.",
        terms:
          "Spills must be cleaned promptly. Does not prevent damage from sharp objects or burns. Reapplication may be necessary after deep cleaning. 3-year protection plan included.",
      },
      "Key Fob Replacement": {
        price: 871.21,
        description:
          "Coverage for the repair or replacement of your vehicle's key fob in case of loss, theft, or damage, saving you from expensive dealer replacement costs.",
        terms:
          "Limited to 2 replacements per contract period. $50 deductible per claim. Programming fees included. Must provide proof of loss or damage. 24-hour assistance available.",
      },
      GAP: {
        price: 990.27,
        description:
          "Guaranteed Asset Protection covers the difference between what you owe on your vehicle and its actual cash value if it's totaled or stolen.",
        terms:
          "Must be purchased within 30 days of vehicle financing. Maximum benefit of $50,000. Primary insurance deductible coverage up to $1,000. Not available for leased vehicles in some states.",
      },
      "Scratch/Dent Repair": {
        price: 1095.96,
        description:
          "Convenient repair service for minor scratches, dents, and dings on your vehicle's exterior, maintaining its appearance and value without affecting your insurance.",
        terms:
          "Repairs limited to dents smaller than 4 inches in diameter. Paint touch-up for scratches less than 6 inches. Unlimited number of repairs during contract period. $0 deductible per claim.",
      },
    }
  }

  // Cache DOM elements
  cacheDOM() {
    this.sidebar = document.getElementById("sidebar")
    this.mainContent = document.getElementById("main-content")
    this.sidebarToggle = document.getElementById("sidebar-toggle")
    this.mobileToggle = document.getElementById("mobile-toggle")
    this.closeSettings = document.getElementById("close-settings")
    this.saveSettingsBtn = document.querySelector(".save-settings-btn")
    this.tabButtons = document.querySelectorAll(".tab-button")
    this.tabContents = document.querySelectorAll(".tab-content")
    this.platinumFirstToggle = document.getElementById("show-platinum-first")
    this.columnNamesGrid = document.querySelector(".column-names-grid")
    this.productTable = document.querySelector(".product-assignment-table tbody")
    this.productsGrid = document.querySelector(".products-grid")
    this.editModal = document.getElementById("editProductModal")
    this.editNameInput = document.getElementById("edit-product-name")
    this.editPriceInput = document.getElementById("edit-product-price")
    this.editDescInput = document.getElementById("edit-product-description")
    this.saveEditBtn = document.querySelector(".save-edit-btn")
    this.addProductBtn = document.querySelector(".add-product-btn")
    this.newProductName = document.getElementById("new-product-name")
    this.newProductPrice = document.getElementById("new-product-price")
    this.newProductDesc = document.getElementById("new-product-description")

    // Initialize Bootstrap modal
    this.bootstrapModal = new window.bootstrap.Modal(this.editModal)
  }

  // Create toast container
  createToastContainer() {
    const toastContainer = document.querySelector(".toast-container")
    if (!toastContainer) {
      const newToastContainer = document.createElement("div")
      newToastContainer.className = "toast-container"
      document.body.appendChild(newToastContainer)
      this.toastContainer = newToastContainer
    } else {
      this.toastContainer = toastContainer
    }
  }

  // Create column name modal
  createColumnNameModal() {
    const existingModal = document.getElementById("columnNameModal")
    if (existingModal) {
      this.columnNameModal = existingModal
      return
    }

    const modal = document.createElement("div")
    modal.className = "column-name-modal"
    modal.id = "columnNameModal"
    modal.setAttribute("role", "dialog")
    modal.setAttribute("aria-labelledby", "columnNameModalTitle")
    modal.innerHTML = `
      <div class="column-name-modal-content">
        <div class="column-name-modal-header">
          <h3 class="column-name-modal-title" id="columnNameModalTitle">Edit Column Name</h3>
          <button class="column-name-modal-close" aria-label="Close">&times;</button>
        </div>
        <div class="column-name-modal-body">
          <div class="mb-3">
            <label for="column-name-input" class="form-label">Column Name</label>
            <input type="text" class="form-control" id="column-name-input">
            <input type="hidden" id="column-type">
          </div>
        </div>
        <div class="column-name-modal-footer">
          <button class="btn btn-secondary cancel-column-name">Cancel</button>
          <button class="btn btn-primary save-column-name">Save</button>
        </div>
      </div>
    `
    document.body.appendChild(modal)
    this.columnNameModal = modal

    // Add event listeners for the modal
    this.columnNameModal
      .querySelector(".column-name-modal-close")
      .addEventListener("click", () => this.closeColumnNameModal())
    this.columnNameModal
      .querySelector(".cancel-column-name")
      .addEventListener("click", () => this.closeColumnNameModal())
    this.columnNameModal.querySelector(".save-column-name").addEventListener("click", () => this.saveColumnName())
    this.columnNameModal.addEventListener("click", (e) => {
      if (e.target === this.columnNameModal) this.closeColumnNameModal()
    })
  }

  // Load saved settings
  loadSavedSettings() {
    const saved = localStorage.getItem("menuSettings")
    if (!saved) {
      return {
        version: "1.0",
        platinumFirst: true,
        columnNames: {
          platinum: "Platinum",
          gold: "Gold",
          silver: "Silver",
          bronze: "Bronze",
          iron: "Iron",
        },
        columnVisibility: {
          platinum: true,
          gold: true,
          silver: true,
          bronze: true,
          iron: false,
        },
        productData: this.productData,
        productAssignments: {
          platinum: [
            "Extended Warranty",
            "Rust Proofing",
            "Paint Protection",
            "Fabric/Leather Protection",
            "Key Fob Replacement",
            "GAP",
            "Scratch/Dent Repair",
          ],
          gold: [
            "Extended Warranty",
            "Rust Proofing",
            "Paint Protection",
            "Fabric/Leather Protection",
            "Key Fob Replacement",
            "GAP",
          ],
          silver: ["Extended Warranty", "Rust Proofing", "Paint Protection", "Key Fob Replacement", "GAP"],
          bronze: ["Extended Warranty", "Key Fob Replacement", "GAP"],
          iron: ["Extended Warranty", "Key Fob Replacement"],
        },
        productOrder: Object.keys(this.productData),
      }
    }

    const settings = JSON.parse(saved)

    // Ensure all required properties exist
    if (!settings.productAssignments) {
      settings.productAssignments = {
        platinum: [],
        gold: [],
        silver: [],
        bronze: [],
        iron: [],
      }
    }

    if (!settings.productOrder) {
      settings.productOrder = Object.keys(this.productData)
    }

    // Update productData with any saved changes
    if (settings.productData) {
      this.productData = settings.productData
    }

    return settings
  }

  // Setup cross-tab synchronization
  setupCrossTabSync() {
    // Try to use BroadcastChannel API for modern browsers
    try {
      this.broadcastChannel = new BroadcastChannel("fiMenuSettings")
      this.broadcastChannel.onmessage = (event) => {
        if (event.data && event.data.type === "settings-updated") {
          // Load the updated settings from localStorage
          const updatedSettings = JSON.parse(localStorage.getItem("menuSettings"))
          if (updatedSettings) {
            this.settings = updatedSettings
            this.productData = updatedSettings.productData || this.productData
            this.applySettings()
            this.showToast("Settings updated from another tab")
          }
        }
      }
    } catch (error) {
      console.log("BroadcastChannel not supported, falling back to storage event")
      // Fallback to storage event for older browsers
      window.addEventListener("storage", (event) => {
        if (event.key === "menuSettings") {
          const updatedSettings = JSON.parse(event.newValue)
          if (updatedSettings) {
            this.settings = updatedSettings
            this.productData = updatedSettings.productData || this.productData
            this.applySettings()
            this.showToast("Settings updated from another tab")
          }
        }
      })
    }
  }

  // Broadcast settings changes to other tabs
  broadcastSettingsChange() {
    if (this.broadcastChannel) {
      this.broadcastChannel.postMessage({ type: "settings-updated" })
    }
  }

  // Bind event listeners
  bindEvents() {
    // Sidebar toggles
    this.sidebarToggle.addEventListener("click", () => this.toggleSidebar("desktop"))
    this.mobileToggle.addEventListener("click", () => this.toggleSidebar("mobile"))
    document.addEventListener("click", (e) => this.handleOutsideClick(e))
    window.addEventListener("resize", () => this.handleResize())

    // Close settings
    this.closeSettings.addEventListener("click", () => this.saveAndRedirect("index.html"))
    this.saveSettingsBtn.addEventListener("click", () => this.saveAndRedirect("index.html"))

    // Tab switching
    this.tabButtons.forEach((btn) => btn.addEventListener("click", () => this.switchTab(btn.getAttribute("data-tab"))))

    // Platinum first and visibility toggles
    this.platinumFirstToggle.addEventListener("change", () => this.updateColumnOrder())
    document
      .querySelectorAll(".column-visibility-toggle input")
      .forEach((toggle) => toggle.addEventListener("change", () => this.updateColumnOrder()))

    // Column name inputs
    document
      .querySelectorAll(".column-name-item input[type='text']")
      .forEach((input) => input.addEventListener("change", () => this.updateColumnName(input)))

    // Product actions
    this.bindProductActions()

    // Editable prices
    this.bindEditablePrices()

    // Add product
    this.addProductBtn.addEventListener("click", () => this.addProduct())

    // Save edited product
    this.saveEditBtn.addEventListener("click", () => this.saveEditedProduct())

    // Initialize drag and drop
    this.initProductReordering()
  }

  // Toggle sidebar
  toggleSidebar(mode) {
    if (mode === "desktop") {
      this.sidebar.classList.toggle("collapsed")
      this.mainContent.classList.toggle("expanded")
    } else {
      this.sidebar.classList.toggle("mobile-open")
    }
  }

  // Handle outside click for mobile sidebar
  handleOutsideClick(e) {
    if (
      window.innerWidth <= 768 &&
      !this.sidebar.contains(e.target) &&
      e.target !== this.mobileToggle &&
      this.sidebar.classList.contains("mobile-open")
    ) {
      this.sidebar.classList.remove("mobile-open")
    }
  }

  // Handle window resize
  handleResize() {
    if (window.innerWidth > 768) {
      this.sidebar.classList.remove("mobile-open")
    }
  }

  // Switch tabs
  switchTab(tabId) {
    this.tabButtons.forEach((btn) => {
      btn.classList.remove("active")
      btn.setAttribute("aria-selected", "false")
    })
    this.tabContents.forEach((content) => content.classList.remove("active"))

    const activeButton = document.querySelector(`.tab-button[data-tab="${tabId}"]`)
    activeButton.classList.add("active")
    activeButton.setAttribute("aria-selected", "true")

    const activeContent = document.getElementById(tabId)
    activeContent.classList.add("active")

    if (tabId === "product-assignment") {
      this.updateColumnOrder()
    }
  }

  // Update column name from input
  updateColumnName(input) {
    const columnType = input.id.replace("-name", "")
    const newName = input.value.trim()

    if (!newName) {
      input.value = this.settings.columnNames[columnType]
      this.showToast("Column name cannot be empty", "error")
      return
    }

    this.settings.columnNames[columnType] = newName

    // Update column name in product assignment table
    document
      .querySelectorAll(`.editable-column-name[data-column="${columnType}"] .column-display-name`)
      .forEach((el) => (el.textContent = newName))

    // Update column visibility label
    const visibilityLabel = document.querySelector(`label[for="${columnType}-visible"]`)
    if (visibilityLabel) {
      visibilityLabel.textContent = newName
    }

    this.autoSaveSettings()
  }

  // Open column name modal
  openColumnNameModal(columnType) {
    document.getElementById("column-name-input").value = this.settings.columnNames[columnType]
    document.getElementById("column-type").value = columnType
    this.columnNameModal.style.display = "flex"
  }

  // Save column name from modal
  saveColumnName() {
    const newName = document.getElementById("column-name-input").value.trim()
    const columnType = document.getElementById("column-type").value

    if (!newName) {
      this.showToast("Column name cannot be empty", "error")
      return
    }

    this.settings.columnNames[columnType] = newName

    // Update input in column names tab
    const input = document.getElementById(`${columnType}-name`)
    if (input) {
      input.value = newName
    }

    // Update column visibility label
    const visibilityLabel = document.querySelector(`label[for="${columnType}-visible"]`)
    if (visibilityLabel) {
      visibilityLabel.textContent = newName
    }

    // Update column name in product assignment table
    document
      .querySelectorAll(`.editable-column-name[data-column="${columnType}"] .column-display-name`)
      .forEach((el) => (el.textContent = newName))

    this.closeColumnNameModal()
    this.autoSaveSettings()
  }

  // Close column name modal
  closeColumnNameModal() {
    this.columnNameModal.style.display = "none"
  }

  // Update column order
  updateColumnOrder() {
    const platinumFirst = this.platinumFirstToggle.checked
    const columnVisibility = {
      platinum: document.getElementById("platinum-visible").checked,
      gold: document.getElementById("gold-visible").checked,
      silver: document.getElementById("silver-visible").checked,
      bronze: document.getElementById("bronze-visible").checked,
      iron: document.getElementById("iron-visible").checked,
    }

    // Update settings
    this.settings.platinumFirst = platinumFirst
    this.settings.columnVisibility = columnVisibility

    // Determine column order
    let order = [...this.columnOrder]
    if (!platinumFirst) {
      order = order.slice().reverse()
    }

    // Filter visible columns
    const visibleColumns = order.filter((col) => columnVisibility[col])

    // Update column names grid
    this.updateColumnNamesGrid(order, columnVisibility)

    // Update product assignment table
    this.updateProductAssignmentTable(visibleColumns)

    this.autoSaveSettings()
  }

  // Update column names grid
  updateColumnNamesGrid(order, columnVisibility) {
    // Get all column name items
    const columnItems = Array.from(this.columnNamesGrid.querySelectorAll(".column-name-item"))

    // Skip the platinum first toggle which is the first child
    const toggleItem = columnItems.shift()

    // Remove all column items except the toggle
    columnItems.forEach((item) => item.remove())

    // Add back in the correct order
    order.forEach((col) => {
      const item = columnItems.find((item) => item.querySelector(`#${col}-name`))
      if (item) {
        this.columnNamesGrid.appendChild(item)
      }
    })
  }

  // Update product assignment table
  updateProductAssignmentTable(visibleColumns) {
    const table = document.querySelector(".product-assignment-table table")
    if (!table) return

    const thead = table.querySelector("thead tr")
    const tbody = table.querySelector("tbody")

    // Rebuild header
    thead.innerHTML = '<th role="columnheader">Product</th>'
    visibleColumns.forEach((col) => {
      const th = document.createElement("th")
      th.setAttribute("role", "columnheader")
      th.innerHTML = `
      <div class="editable-column-name" data-column="${col}">
        <span class="column-display-name">${this.settings.columnNames[col]}</span>
        <button class="btn btn-sm btn-outline-light edit-column-name" aria-label="Edit ${this.settings.columnNames[col]} column name">
          <i class="bi bi-pencil"></i>
        </button>
      </div>
    `
      thead.appendChild(th)
    })

    // Rebuild rows
    tbody.innerHTML = ""
    this.settings.productOrder.forEach((productName) => {
      if (!this.productData[productName]) return

      const row = document.createElement("tr")
      row.className = "product-row"
      row.setAttribute("draggable", "true")

      // Create product cell
      const productCell = document.createElement("td")
      productCell.className = "product-cell"
      productCell.innerHTML = `
      <div title="${this.sanitize(this.productData[productName].description || "")}">
        <i class="bi bi-grip-vertical product-handle"></i> ${this.sanitize(productName)}
      </div>
      <div class="product-price editable-price" data-product="${this.sanitize(productName)}">$${this.productData[productName].price.toFixed(2)}</div>
    `
      row.appendChild(productCell)

      // Create column cells with checkboxes
      visibleColumns.forEach((col) => {
        const td = document.createElement("td")
        // Check if this product is assigned to this column using the saved settings
        const isChecked =
          this.settings.productAssignments[col] && this.settings.productAssignments[col].includes(productName)

        td.innerHTML = `
        <div class="form-check form-switch">
          <input class="form-check-input" type="checkbox" ${isChecked ? "checked" : ""}>
        </div>
      `
        row.appendChild(td)
      })

      tbody.appendChild(row)
      this.setupDragAndDrop(row)
    })

    // Bind event listeners to new elements
    this.bindColumnNameEditButtons()
    this.bindEditablePrices()
  }

  // Bind column name edit buttons
  bindColumnNameEditButtons() {
    document.querySelectorAll(".edit-column-name").forEach((button) => {
      button.addEventListener("click", (e) => {
        const columnNameContainer = e.target.closest(".editable-column-name")
        const columnType = columnNameContainer.getAttribute("data-column")
        this.openColumnNameModal(columnType)
      })
    })
  }

  // Bind editable prices
  bindEditablePrices() {
    document.querySelectorAll(".editable-price").forEach((priceElement) => {
      priceElement.addEventListener("click", (e) => {
        if (e.target.classList.contains("editing")) return

        const productName = e.target.getAttribute("data-product")
        const currentPrice = this.productData[productName].price

        e.target.classList.add("editing")
        const currentText = e.target.textContent
        e.target.textContent = ""

        const input = document.createElement("input")
        input.type = "number"
        input.step = "0.01"
        input.min = "0"
        input.value = currentPrice
        e.target.appendChild(input)
        input.focus()

        const handleBlur = () => {
          const newPrice = Number.parseFloat(input.value)
          if (!isNaN(newPrice) && newPrice >= 0) {
            this.productData[productName].price = newPrice
            e.target.textContent = `$${newPrice.toFixed(2)}`
            this.updateProductPriceDisplays(productName, newPrice)
            this.autoSaveSettings()
          } else {
            e.target.textContent = currentText
          }
          e.target.classList.remove("editing")
        }

        input.addEventListener("blur", handleBlur)

        input.addEventListener("keydown", (event) => {
          if (event.key === "Enter") {
            input.blur()
          } else if (event.key === "Escape") {
            e.target.textContent = currentText
            e.target.classList.remove("editing")
          }
        })
      })
    })
  }

  // Update product price displays
  updateProductPriceDisplays(productName, newPrice) {
    // Update in product cards
    document.querySelectorAll(".product-card").forEach((card) => {
      const cardName = card.querySelector("h4")
      if (cardName && cardName.textContent === productName) {
        card.querySelector(".product-price-display").textContent = `$${newPrice.toFixed(2)}`
      }
    })

    // Update in product assignment table
    document.querySelectorAll(`.editable-price[data-product="${productName}"]`).forEach((price) => {
      price.textContent = `$${newPrice.toFixed(2)}`
    })
  }

  // Bind product actions
bindProductActions() {
  // Edit product buttons
  document.querySelectorAll(".edit-product").forEach((button) => {
    button.addEventListener("click", (e) => {
      const productCard = e.target.closest(".product-card");
      const productName = productCard.querySelector("h4").textContent;
      const product = this.productData[productName];

      this.editNameInput.value = productName;
      this.editNameInput.setAttribute("data-original-name", productName);
      this.editPriceInput.value = product.price;
      this.editDescInput.value = product.description || "";

      // Set text color to white
      this.editNameInput.style.color = "white";
      this.editPriceInput.style.color = "white";
      this.editDescInput.style.color = "white";

      // Optional: also make background dark for contrast
this.editNameInput.style.backgroundColor = "rgba(30, 41, 59, 0.85)";
this.editPriceInput.style.backgroundColor = "rgba(30, 41, 59, 0.85)";
this.editDescInput.style.backgroundColor = "rgba(30, 41, 59, 0.85)";


      this.bootstrapModal.show();
    });
  });

    // Delete product buttons
    document.querySelectorAll(".delete-product").forEach((button) => {
      button.addEventListener("click", (e) => {
        const productCard = e.target.closest(".product-card")
        const productName = productCard.querySelector("h4").textContent

        if (confirm(`Are you sure you want to delete ${productName}?`)) {
          // Remove from product data
          delete this.productData[productName]

          // Remove from DOM
          productCard.remove()

          // Remove from product assignment table
          document.querySelectorAll(".product-cell").forEach((cell) => {
            const cellProductName = cell.querySelector("div:first-child")
            if (cellProductName && cellProductName.textContent.trim() === productName) {
              const row = cell.closest("tr")
              if (row) row.remove()
            }
          })

          // Remove from product order
          this.settings.productOrder = this.settings.productOrder.filter((name) => name !== productName)

          // Remove from product assignments
          Object.keys(this.settings.productAssignments).forEach((col) => {
            this.settings.productAssignments[col] = this.settings.productAssignments[col].filter(
              (name) => name !== productName,
            )
          })

          this.autoSaveSettings()
          this.showToast(`${productName} has been deleted`)
        }
      })
    })
  }

  // Save edited product
  saveEditedProduct() {
    const originalName = this.editNameInput.getAttribute("data-original-name")
    const newName = this.editNameInput.value.trim()
    const newPrice = Number.parseFloat(this.editPriceInput.value)
    const newDesc = this.editDescInput.value

    if (!newName) {
      this.showToast("Product name cannot be empty", "error")
      return
    }

    if (isNaN(newPrice) || newPrice < 0) {
      this.showToast("Please enter a valid price", "error")
      return
    }

    // If name changed and new name already exists
    if (originalName !== newName && this.productData[newName]) {
      this.showToast("A product with this name already exists", "error")
      return
    }

    // Update product data
    this.productData[newName] = {
      price: newPrice,
      description: newDesc,
      terms: this.productData[originalName]?.terms || "Standard terms apply.",
    }

    // If name changed, update references and delete old entry
    if (originalName !== newName) {
      // Update product order
      this.settings.productOrder = this.settings.productOrder.map((name) => (name === originalName ? newName : name))

      // Update product assignments
      Object.keys(this.settings.productAssignments).forEach((col) => {
        this.settings.productAssignments[col] = this.settings.productAssignments[col].map((name) =>
          name === originalName ? newName : name,
        )
      })

      // Delete old entry
      delete this.productData[originalName]
    }

    // Update product cards
    document.querySelectorAll(".product-card").forEach((card) => {
      const nameElement = card.querySelector("h4")
      if (nameElement && nameElement.textContent === originalName) {
        nameElement.textContent = newName
        nameElement.title = newDesc
        card.querySelector(".product-price-display").textContent = `$${newPrice.toFixed(2)}`
      }
    })

    // Update product assignment table
    document.querySelectorAll(".product-cell").forEach((cell) => {
      const productNameEl = cell.querySelector("div:first-child")
      if (productNameEl && productNameEl.textContent.trim() === originalName) {
        productNameEl.innerHTML = `<i class="bi bi-grip-vertical product-handle"></i> ${this.sanitize(newName)}`
        productNameEl.title = newDesc
        const priceElement = cell.querySelector(".product-price")
        if (priceElement) {
          priceElement.textContent = `$${newPrice.toFixed(2)}`
          priceElement.setAttribute("data-product", newName)
        }
      }
    })

    this.bootstrapModal.hide()
    this.autoSaveSettings()
    this.showToast("Product updated successfully")
  }

  // Add new product
  addProduct() {
    const name = this.newProductName.value.trim()
    const price = Number.parseFloat(this.newProductPrice.value)
    const desc = this.newProductDesc.value

    if (!name) {
      this.showToast("Product name cannot be empty", "error")
      return
    }

    if (isNaN(price) || price < 0) {
      this.showToast("Please enter a valid price", "error")
      return
    }

    if (this.productData[name]) {
      this.showToast("A product with this name already exists", "error")
      return
    }

    // Add to product data
    this.productData[name] = {
      price: price,
      description: desc,
      terms: "Standard terms apply. See dealer for complete details.",
    }

    // Add to product order
    this.settings.productOrder.push(name)

    // Create product card
    const newCard = document.createElement("div")
    newCard.className = "product-card"
    newCard.setAttribute("data-id", `product-${Date.now()}`)
    newCard.innerHTML = `
      <div class="product-card-header">
        <h4 title="${this.sanitize(desc)}">${this.sanitize(name)}</h4>
        <div class="product-actions">
          <button class="btn btn-sm btn-outline-light edit-product" aria-label="Edit ${this.sanitize(name)}">
            <i class="bi bi-pencil"></i>
          </button>
          <button class="btn btn-sm btn-outline-danger delete-product" aria-label="Delete ${this.sanitize(name)}">
            <i class="bi bi-trash"></i>
          </button>
        </div>
      </div>
      <div class="product-price-display">$${price.toFixed(2)}</div>
    `
    this.productsGrid.appendChild(newCard)

    // Add to product assignment table
    const visibleColumns = this.columnOrder.filter((col) => this.settings.columnVisibility[col])

    const newRow = document.createElement("tr")
    newRow.className = "product-row"
    newRow.setAttribute("draggable", "true")

    // Create product cell
    const productCell = document.createElement("td")
    productCell.className = "product-cell"
    productCell.innerHTML = `
      <div title="${this.sanitize(desc)}"><i class="bi bi-grip-vertical product-handle"></i> ${this.sanitize(name)}</div>
      <div class="product-price editable-price" data-product="${this.sanitize(name)}">$${price.toFixed(2)}</div>
    `
    newRow.appendChild(productCell)

    // Create column cells with checkboxes
    visibleColumns.forEach((col) => {
      const td = document.createElement("td")
      td.innerHTML = `
        <div class="form-check form-switch">
          <input class="form-check-input" type="checkbox">
        </div>
      `
      newRow.appendChild(td)
    })

    this.productTable.appendChild(newRow)

    // Bind event listeners to new elements
    this.bindProductActions()
    this.bindEditablePrices()
    this.setupDragAndDrop(newRow)

    // Clear form
    this.newProductName.value = ""
    this.newProductPrice.value = ""
    this.newProductDesc.value = ""

    this.autoSaveSettings()
    this.showToast(`${name} added successfully`)
  }

  // Get product assignments from the table
  getProductAssignments() {
    const assignments = {
      platinum: [],
      gold: [],
      silver: [],
      bronze: [],
      iron: [],
    }

    // Get visible columns in the current order they appear in the table
    const headerCells = document.querySelectorAll(".product-assignment-table th .editable-column-name")
    const visibleColumns = Array.from(headerCells).map((cell) => cell.getAttribute("data-column"))

    // For each row, check which columns are checked
    const rows = this.productTable.querySelectorAll("tr")
    rows.forEach((row) => {
      const productNameEl = row.querySelector(".product-cell div:first-child")
      if (!productNameEl) return

      // Extract product name, removing the handle icon text
      const fullText = productNameEl.textContent.trim()
      const productName = fullText.replace(
        /^\s*[\u200B\u200C\u200D\u2060\uFEFF\u00A0]?[\s\u200B\u200C\u200D\u2060\uFEFF\u00A0]*/,
        "",
      )

      if (!productName) return

      const checkboxes = row.querySelectorAll(".form-check-input")
      visibleColumns.forEach((col, index) => {
        if (index < checkboxes.length && checkboxes[index]?.checked) {
          assignments[col].push(productName)
        }
      })
    })

    return assignments
  }

  // Save settings
  saveSettings() {
    // Get the current product assignments from the table
    const currentAssignments = this.getProductAssignments()

    // Update the settings with the current assignments
    this.settings.productAssignments = currentAssignments

    // Update product order from the table
    this.settings.productOrder = Array.from(this.productTable.querySelectorAll("tr"))
      .map((row) => {
        const productNameEl = row.querySelector(".product-cell div:first-child")
        if (!productNameEl) return null

        // Extract product name, removing the handle icon text
        const fullText = productNameEl.textContent.trim()
        return fullText.replace(
          /^\s*[\u200B\u200C\u200D\u2060\uFEFF\u00A0]?[\s\u200B\u200C\u200D\u2060\uFEFF\u00A0]*/,
          "",
        )
      })
      .filter(Boolean)

    // Update product data
    this.settings.productData = this.productData

    // Save to localStorage
    localStorage.setItem("menuSettings", JSON.stringify(this.settings))
    this.broadcastSettingsChange()
    return this.settings
  }

  // Auto-save settings
  autoSaveSettings() {
    this.saveSettings()
    this.showToast("Settings saved automatically")
  }

  // Apply settings
  applySettings() {
    // Apply column names
    document.getElementById("platinum-name").value = this.settings.columnNames.platinum
    document.getElementById("gold-name").value = this.settings.columnNames.gold
    document.getElementById("silver-name").value = this.settings.columnNames.silver
    document.getElementById("bronze-name").value = this.settings.columnNames.bronze
    document.getElementById("iron-name").value = this.settings.columnNames.iron

    // Apply column visibility
    document.getElementById("platinum-visible").checked = this.settings.columnVisibility.platinum
    document.getElementById("gold-visible").checked = this.settings.columnVisibility.gold
    document.getElementById("silver-visible").checked = this.settings.columnVisibility.silver
    document.getElementById("bronze-visible").checked = this.settings.columnVisibility.bronze
    document.getElementById("iron-visible").checked = this.settings.columnVisibility.iron

    // Apply platinum first setting
    this.platinumFirstToggle.checked = this.settings.platinumFirst

    // Update column names in product assignment table
    document.querySelectorAll(".editable-column-name").forEach((column) => {
      const columnType = column.getAttribute("data-column")
      if (columnType && this.settings.columnNames[columnType]) {
        column.querySelector(".column-display-name").textContent = this.settings.columnNames[columnType]
      }
    })

    // Update column order
    this.updateColumnOrder()
  }

  // Show toast notification
  showToast(message, type = "success") {
    const toast = document.createElement("div")
    toast.className = `toast toast-${type}`
    toast.textContent = message
    toast.setAttribute("role", "alert")
    toast.setAttribute("aria-live", "assertive")

    this.toastContainer.appendChild(toast)

    // Animate in
    setTimeout(() => {
      toast.classList.add("show")
    }, 10)

    // Remove after delay
    setTimeout(() => {
      toast.classList.remove("show")
      setTimeout(() => toast.remove(), 300)
    }, 3000)
  }

  // Save settings and redirect
  saveAndRedirect(url) {
    this.saveSettings()
    this.showToast("Settings saved successfully! Redirecting...")
    setTimeout(() => {
      window.location.href = url
    }, 1000)
  }

  // Sanitize input to prevent XSS
  sanitize(input) {
    const div = document.createElement("div")
    div.textContent = input
    return div.innerHTML
  }

  // Setup drag and drop for a row
  setupDragAndDrop(row) {
    row.addEventListener("dragstart", () => {
      row.classList.add("dragging")
    })

    row.addEventListener("dragover", (e) => {
      e.preventDefault()
    })

    row.addEventListener("dragenter", () => {
      row.classList.add("drag-over")
    })

    row.addEventListener("dragleave", () => {
      row.classList.remove("drag-over")
    })

    row.addEventListener("drop", (e) => {
      e.preventDefault()
      const draggingRow = document.querySelector(".dragging")
      if (!draggingRow) return

      const tbody = row.parentNode
      const rows = Array.from(tbody.querySelectorAll("tr"))
      const draggedIndex = rows.indexOf(draggingRow)
      const targetIndex = rows.indexOf(row)

      if (draggedIndex < targetIndex) {
        tbody.insertBefore(draggingRow, row.nextSibling)
      } else {
        tbody.insertBefore(draggingRow, row)
      }

      row.classList.remove("drag-over")
      this.autoSaveSettings()
    })

    row.addEventListener("dragend", () => {
      row.classList.remove("dragging")
      document.querySelectorAll(".drag-over").forEach((el) => {
        el.classList.remove("drag-over")
      })
    })
  }

  // Initialize product reordering
  initProductReordering() {
    document.querySelectorAll(".product-cell").forEach((cell) => {
      const firstDiv = cell.querySelector("div:first-child")
      if (firstDiv) {
        const text = firstDiv.textContent.trim()
        firstDiv.innerHTML = `<i class="bi bi-grip-vertical product-handle"></i> ${text}`
      }
    })

    this.productTable.querySelectorAll("tr").forEach((row) => {
      row.classList.add("product-row")
      row.setAttribute("draggable", "true")
      this.setupDragAndDrop(row)
    })
  }
}

// Initialize the application when the DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  new FIMenuSettings()
})
