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
        image: null,
      },
      "Rust Proofing": {
        price: 617.94,
        description:
          "Advanced protection that helps prevent rust and corrosion on your vehicle's body and undercarriage, extending its lifespan and maintaining its value.",
        terms:
          "Annual inspections required to maintain coverage. Covers perforation due to rust from the inside out. Does not cover surface rust from external damage. 5-year warranty included.",
        image: null,
      },
      "Paint Protection": {
        price: 608.39,
        description:
          "Premium sealant that creates a protective barrier over your vehicle's paint, guarding against environmental damage, UV rays, and minor scratches.",
        terms:
          "Requires proper maintenance and care. Not a substitute for regular washing. Does not cover damage from accidents or improper care. Reapplication recommended every 2 years.",
        image: null,
      },
      "Fabric/Leather Protection": {
        price: 261.84,
        description:
          "Specialized treatment that repels stains and spills on your vehicle's interior surfaces, making cleanup easier and preserving the appearance of seats and carpets.",
        terms:
          "Spills must be cleaned promptly. Does not prevent damage from sharp objects or burns. Reapplication may be necessary after deep cleaning. 3-year protection plan included.",
        image: null,
      },
      "Key Fob Replacement": {
        price: 871.21,
        description:
          "Coverage for the repair or replacement of your vehicle's key fob in case of loss, theft, or damage, saving you from expensive dealer replacement costs.",
        terms:
          "Limited to 2 replacements per contract period. $50 deductible per claim. Programming fees included. Must provide proof of loss or damage. 24-hour assistance available.",
        image: null,
      },
      GAP: {
        price: 990.27,
        description:
          "Guaranteed Asset Protection covers the difference between what you owe on your vehicle and its actual cash value if it's totaled or stolen.",
        terms:
          "Must be purchased within 30 days of vehicle financing. Maximum benefit of $50,000. Primary insurance deductible coverage up to $1,000. Not available for leased vehicles in some states.",
        image: null,
      },
      "Scratch/Dent Repair": {
        price: 1095.96,
        description:
          "Convenient repair service for minor scratches, dents, and dings on your vehicle's exterior, maintaining its appearance and value without affecting your insurance.",
        terms:
          "Repairs limited to dents smaller than 4 inches in diameter. Paint touch-up for scratches less than 6 inches. Unlimited number of repairs during contract period. $0 deductible per claim.",
        image: null,
      },
    }
  }

  // Cache DOM elements
  cacheDOM() {
    // Basic elements
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

    // Modal elements
    this.editModal = document.getElementById("editProductModal")

    if (this.editModal) {
      this.editNameInput = document.getElementById("edit-product-name")
      this.editPriceInput = document.getElementById("edit-product-price")
      this.editDescInput = document.getElementById("edit-product-description")
      this.editImageInput = document.getElementById("edit-product-image")
      this.editImagePreview = document.getElementById("edit-image-preview")
      this.removeImageBtn = document.getElementById("remove-product-image")
      this.saveEditBtn = document.getElementById("save-edit-btn")

      // Initialize Bootstrap modal
      if (window.bootstrap && window.bootstrap.Modal) {
        this.bootstrapModal = new window.bootstrap.Modal(this.editModal)
      } else {
        console.warn("Bootstrap Modal not available, using fallback")
      }
    } else {
      console.error("Edit product modal not found in the DOM")
    }

    // Add product elements
    this.addProductBtn = document.querySelector(".add-product-btn")
    this.newProductName = document.getElementById("new-product-name")
    this.newProductPrice = document.getElementById("new-product-price")
    this.newProductDesc = document.getElementById("new-product-description")
    this.newProductImage = document.getElementById("new-product-image")
    this.imagePreview = document.getElementById("image-preview")
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

    try {
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
    } catch (error) {
      console.error("Error parsing saved settings:", error)
      // Return default settings if there's an error
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
          platinum: Object.keys(this.productData),
          gold: Object.keys(this.productData),
          silver: Object.keys(this.productData),
          bronze: Object.keys(this.productData),
          iron: [],
        },
        productOrder: Object.keys(this.productData),
      }
    }
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

  handleImageUpload(event) {
    const file = event.target.files[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      this.showToast("Please upload a valid image file", "error")
      event.target.value = ""
      return
    }

    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      this.showToast("Image size must be less than 5MB", "error")
      event.target.value = ""
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      if (this.newProductImage) {
        this.newProductImage.dataset.image = reader.result
      }
      if (this.imagePreview) {
        this.imagePreview.src = reader.result
        this.imagePreview.style.display = "block"
      }
      this.showToast("Image uploaded successfully")
    }
    reader.onerror = () => {
      this.showToast("Error reading image file", "error")
    }
    reader.readAsDataURL(file)
  }

  // Fix the removeEditImage function to properly handle the image removal
  removeEditImage() {
    // Store the original name to update the product data
    const originalName = this.editNameInput ? this.editNameInput.getAttribute("data-original-name") : null

    if (originalName && this.productData[originalName]) {
      // Set the image to null in the product data
      this.productData[originalName].image = null
    }

    if (this.editImageInput) {
      this.editImageInput.dataset.image = ""
      this.editImageInput.value = ""
    }

    if (this.editImagePreview) {
      this.editImagePreview.src = ""
      this.editImagePreview.style.display = "none"
    }

    if (this.removeImageBtn) {
      this.removeImageBtn.style.display = "none"
    }

    // Save the changes immediately
    this.autoSaveSettings()
    this.showToast("Image removed")
  }

  handleEditImageUpload(event) {
    const file = event.target.files[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      this.showToast("Please upload a valid image file", "error")
      event.target.value = ""
      return
    }

    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      this.showToast("Image size must be less than 5MB", "error")
      event.target.value = ""
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      if (this.editImageInput) {
        this.editImageInput.dataset.image = reader.result
      }
      if (this.editImagePreview) {
        this.editImagePreview.src = reader.result
        this.editImagePreview.style.display = "block"
      }
      if (this.removeImageBtn) {
        this.removeImageBtn.style.display = "inline-block"
      }
      this.showToast("Image updated successfully")
    }
    reader.onerror = () => {
      this.showToast("Error reading image file", "error")
    }
    reader.readAsDataURL(file)
  }

  // Fix the binding for the remove image button
  bindEvents() {
    // Image upload for new product
    if (this.newProductImage) {
      this.newProductImage.addEventListener("change", (e) => this.handleImageUpload(e))
    }

    // Image upload for editing product
    if (this.editImageInput) {
      this.editImageInput.addEventListener("change", (e) => this.handleEditImageUpload(e))
    }

    // Remove image button - Fix this binding
    if (this.removeImageBtn) {
      this.removeImageBtn.addEventListener("click", (e) => {
        e.preventDefault()
        this.removeEditImage()
      })
    }

    // Sidebar toggles
    if (this.sidebarToggle) {
      this.sidebarToggle.addEventListener("click", () => this.toggleSidebar("desktop"))
    }
    if (this.mobileToggle) {
      this.mobileToggle.addEventListener("click", () => this.toggleSidebar("mobile"))
    }
    document.addEventListener("click", (e) => this.handleOutsideClick(e))
    window.addEventListener("resize", () => this.handleResize())

    // Close settings
    if (this.closeSettings) {
      this.closeSettings.addEventListener("click", () => this.saveAndRedirect("index.html"))
    }
    if (this.saveSettingsBtn) {
      this.saveSettingsBtn.addEventListener("click", () => this.saveAndRedirect("index.html"))
    }

    // Tab switching
    this.tabButtons.forEach((btn) => btn.addEventListener("click", () => this.switchTab(btn.getAttribute("data-tab"))))

    // Platinum first and visibility toggles
    if (this.platinumFirstToggle) {
      this.platinumFirstToggle.addEventListener("change", () => this.updateColumnOrder())
    }
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
    if (this.addProductBtn) {
      this.addProductBtn.addEventListener("click", () => this.addProduct())
    }

    // Add preventDefault to the save edit button
    if (this.saveEditBtn) {
      this.saveEditBtn.addEventListener("click", (e) => {
        e.preventDefault()
        this.saveEditedProduct()
      })
    }

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
    if (activeButton) {
      activeButton.classList.add("active")
      activeButton.setAttribute("aria-selected", "true")
    }

    const activeContent = document.getElementById(tabId)
    if (activeContent) {
      activeContent.classList.add("active")
    }

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
    if (!this.platinumFirstToggle) return

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
    if (!this.columnNamesGrid) return

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
    if (!table) {
      console.error("Product assignment table not found")
      return
    }

    const thead = table.querySelector("thead tr")
    const tbody = table.querySelector("tbody")

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

    tbody.innerHTML = ""
    this.settings.productOrder.forEach((productName) => {
      if (!this.productData[productName]) return

      const row = document.createElement("tr")
      row.className = "product-row"
      row.setAttribute("draggable", "true")

      const productCell = document.createElement("td")
      productCell.className = "product-cell"
      productCell.innerHTML = `
        <div title="${this.sanitize(this.productData[productName].description || "")}">
          <i class="bi bi-grip-vertical product-handle"></i> ${this.sanitize(productName)}
        </div>
        <div class="product-price editable-price" data-product="${this.sanitize(productName)}">$${this.productData[productName].price.toFixed(2)}</div>
        ${this.productData[productName].image ? `<img src="${this.productData[productName].image}" alt="${this.sanitize(productName)}" class="table-product-image">` : ""}
      `
      row.appendChild(productCell)

      visibleColumns.forEach((col) => {
        const td = document.createElement("td")
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

    this.bindColumnNameEditButtons()
    this.bindEditablePrices()
  }

  // Bind column name edit buttons
  bindColumnNameEditButtons() {
    document.querySelectorAll(".edit-column-name").forEach((button) => {
      button.addEventListener("click", (e) => {
        const columnNameContainer = e.target.closest(".editable-column-name")
        if (columnNameContainer) {
          const columnType = columnNameContainer.getAttribute("data-column")
          this.openColumnNameModal(columnType)
        }
      })
    })
  }

  // Bind editable prices
  bindEditablePrices() {
    document.querySelectorAll(".editable-price").forEach((priceElement) => {
      priceElement.addEventListener("click", (e) => {
        if (e.target.classList.contains("editing")) return

        const productName = e.target.getAttribute("data-product")
        if (!productName || !this.productData[productName]) return

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
        const priceElement = card.querySelector(".product-price-display")
        if (priceElement) {
          priceElement.textContent = `$${newPrice.toFixed(2)}`
        }
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
        e.preventDefault()
        e.stopPropagation()

        const productCard = e.target.closest(".product-card")
        if (!productCard) {
          this.showToast("Error: Product card not found", "error")
          return
        }

        const productName = productCard.querySelector("h4")?.textContent
        if (!productName || !this.productData[productName]) {
          this.showToast("Error: Product not found", "error")
          return
        }

        const product = this.productData[productName]

        // Check if modal elements exist
        if (!this.editModal) {
          this.showToast("Error: Edit modal not found", "error")
          return
        }

        // Set form values
        if (this.editNameInput) {
          this.editNameInput.value = productName
          this.editNameInput.setAttribute("data-original-name", productName)
        }

        if (this.editPriceInput) {
          this.editPriceInput.value = product.price
        }

        if (this.editDescInput) {
          this.editDescInput.value = product.description || ""
        }

        // Handle image preview
        if (this.editImageInput && this.editImagePreview && this.removeImageBtn) {
          this.editImageInput.dataset.image = product.image || ""
          this.editImagePreview.src = product.image || ""
          this.editImagePreview.style.display = product.image ? "block" : "none"
          this.removeImageBtn.style.display = product.image ? "inline-block" : "none"
        }

        // Show modal
        this.showModal()
      })
    })

    // Delete product buttons
    document.querySelectorAll(".delete-product").forEach((button) => {
      button.addEventListener("click", (e) => {
        const productCard = e.target.closest(".product-card")
        const productName = productCard.querySelector("h4")?.textContent

        if (!productName) return

        if (confirm(`Are you sure you want to delete ${productName}?`)) {
          delete this.productData[productName]
          productCard.remove()

          // Remove from product table
          document.querySelectorAll(".product-cell").forEach((cell) => {
            const cellProductName = cell.querySelector("div:first-child")
            if (cellProductName && cellProductName.textContent.includes(productName)) {
              const row = cell.closest("tr")
              if (row) row.remove()
            }
          })

          // Update settings
          this.settings.productOrder = this.settings.productOrder.filter((name) => name !== productName)
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

  // Show modal with fallback
  showModal() {
    try {
      if (this.bootstrapModal) {
        this.bootstrapModal.show()
      } else {
        // Manual fallback
        this.editModal.classList.add("show")
        this.editModal.style.display = "block"
        document.body.classList.add("modal-open")

        // Create backdrop
        const backdrop = document.createElement("div")
        backdrop.className = "modal-backdrop fade show"
        document.body.appendChild(backdrop)
      }
    } catch (error) {
      console.error("Error showing modal:", error)
      this.showToast("Error opening edit modal", "error")
    }
  }

  // Hide modal with fallback
  hideModal() {
    try {
      if (this.bootstrapModal) {
        this.bootstrapModal.hide()
      } else {
        // Manual fallback
        this.editModal.classList.remove("show")
        this.editModal.style.display = "none"
        document.body.classList.remove("modal-open")

        // Remove backdrop
        const backdrop = document.querySelector(".modal-backdrop")
        if (backdrop) {
          backdrop.remove()
        }
      }
    } catch (error) {
      console.error("Error hiding modal:", error)
      this.showToast("Error closing modal", "error")
    }
  }

  // Save edited product
  saveEditedProduct() {
    if (!this.editNameInput || !this.editPriceInput) {
      this.showToast("Error: Form inputs not found", "error")
      return
    }

    const originalName = this.editNameInput.getAttribute("data-original-name")
    const newName = this.editNameInput.value.trim()
    const newPrice = Number.parseFloat(this.editPriceInput.value)
    const newDesc = this.editDescInput ? this.editDescInput.value : ""

    // Get the image from the dataset or keep the existing one
    let newImage = null
    if (this.editImageInput && this.editImageInput.dataset.image) {
      newImage = this.editImageInput.dataset.image
    } else if (originalName && this.productData[originalName]) {
      newImage = this.productData[originalName].image
    }

    if (!newName) {
      this.showToast("Product name cannot be empty", "error")
      return
    }

    if (isNaN(newPrice) || newPrice < 0) {
      this.showToast("Please enter a valid price", "error")
      return
    }

    if (originalName !== newName && this.productData[newName]) {
      this.showToast("A product with this name already exists", "error")
      return
    }

    try {
      // Update product data
      this.productData[newName] = {
        price: newPrice,
        description: newDesc,
        terms: this.productData[originalName]?.terms || "Standard terms apply.",
        image: newImage,
      }

      // Handle name change
      if (originalName !== newName) {
        this.settings.productOrder = this.settings.productOrder.map((name) => (name === originalName ? newName : name))

        Object.keys(this.settings.productAssignments).forEach((col) => {
          this.settings.productAssignments[col] = this.settings.productAssignments[col].map((name) =>
            name === originalName ? newName : name,
          )
        })

        delete this.productData[originalName]
      }

      // Update product cards
      document.querySelectorAll(".product-card").forEach((card) => {
        const nameElement = card.querySelector("h4")
        if (nameElement && nameElement.textContent === originalName) {
          nameElement.textContent = newName
          nameElement.title = this.sanitize(newDesc)

          const priceElement = card.querySelector(".product-price-display")
          if (priceElement) {
            priceElement.textContent = `$${newPrice.toFixed(2)}`
          }

          // Update image if present
          const imageElement = card.querySelector(".product-image")
          if (newImage && imageElement) {
            imageElement.src = newImage
          } else if (newImage && !imageElement) {
            const img = document.createElement("img")
            img.src = newImage
            img.alt = newName
            img.className = "product-image"
            card.insertBefore(img, priceElement)
          } else if (!newImage && imageElement) {
            imageElement.remove()
          }
        }
      })

      // Update product assignment table
      const visibleColumns = this.columnOrder.filter((col) => this.settings.columnVisibility[col])
      this.updateProductAssignmentTable(visibleColumns)

      // Reset form
      if (this.editNameInput) this.editNameInput.value = ""
      if (this.editPriceInput) this.editPriceInput.value = ""
      if (this.editDescInput) this.editDescInput.value = ""
      if (this.editImageInput) {
        this.editImageInput.value = ""
        this.editImageInput.dataset.image = ""
      }
      if (this.editImagePreview) {
        this.editImagePreview.src = ""
        this.editImagePreview.style.display = "none"
      }
      if (this.removeImageBtn) {
        this.removeImageBtn.style.display = "none"
      }

      // Hide modal
      this.hideModal()

      // Save settings
      this.autoSaveSettings()
      this.showToast("Product updated successfully")
    } catch (error) {
      console.error("Error saving product:", error)
      this.showToast("Error saving product", "error")
    }
  }

  // Add new product
  addProduct() {
    if (!this.newProductName || !this.newProductPrice) {
      this.showToast("Error: Form inputs not found", "error")
      return
    }

    const name = this.newProductName.value.trim()
    const price = Number.parseFloat(this.newProductPrice.value)
    const desc = this.newProductDesc ? this.newProductDesc.value : ""
    const image = this.newProductImage && this.newProductImage.dataset.image ? this.newProductImage.dataset.image : null

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
      image: image,
    }

    // Add to product order
    this.settings.productOrder.push(name)

    // Add to product assignments for each column
    Object.keys(this.settings.productAssignments).forEach((col) => {
      if (this.settings.columnVisibility[col]) {
        if (!this.settings.productAssignments[col]) {
          this.settings.productAssignments[col] = []
        }
        this.settings.productAssignments[col].push(name)
      }
    })

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
      ${image ? `<img src="${image}" alt="${this.sanitize(name)}" class="product-image">` : ""}
      <div class="product-price-display">$${price.toFixed(2)}</div>
    `

    if (this.productsGrid) {
      this.productsGrid.appendChild(newCard)
    }

    // Add to product assignment table
    const visibleColumns = this.columnOrder.filter((col) => this.settings.columnVisibility[col])
    const newRow = document.createElement("tr")
    newRow.className = "product-row"
    newRow.setAttribute("draggable", "true")

    const productCell = document.createElement("td")
    productCell.className = "product-cell"
    productCell.innerHTML = `
      <div title="${this.sanitize(desc)}"><i class="bi bi-grip-vertical product-handle"></i> ${this.sanitize(name)}</div>
      <div class="product-price editable-price" data-product="${this.sanitize(name)}">$${price.toFixed(2)}</div>
      ${image ? `<img src="${image}" alt="${this.sanitize(name)}" class="table-product-image">` : ""}
    `
    newRow.appendChild(productCell)

    visibleColumns.forEach((col) => {
      const td = document.createElement("td")
      td.innerHTML = `
        <div class="form-check form-switch">
          <input class="form-check-input" type="checkbox" checked>
        </div>
      `
      newRow.appendChild(td)
    })

    if (this.productTable) {
      this.productTable.appendChild(newRow)
    }

    // Bind event listeners
    this.bindProductActions()
    this.bindEditablePrices()
    this.setupDragAndDrop(newRow)

    // Clear form
    this.newProductName.value = ""
    this.newProductPrice.value = ""
    if (this.newProductDesc) this.newProductDesc.value = ""
    if (this.newProductImage) {
      this.newProductImage.value = ""
      this.newProductImage.dataset.image = ""
    }
    if (this.imagePreview) {
      this.imagePreview.src = ""
      this.imagePreview.style.display = "none"
    }

    // Save settings immediately
    this.saveSettings()
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

    if (!this.productTable) return assignments

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
    try {
      // Get the current product assignments from the table
      const currentAssignments = this.getProductAssignments()

      // Update the settings with the current assignments
      this.settings.productAssignments = currentAssignments

      // Update product order from the table
      if (this.productTable) {
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
      }

      // Update product data
      this.settings.productData = this.productData

      // Save to localStorage
      localStorage.setItem("menuSettings", JSON.stringify(this.settings))
      this.broadcastSettingsChange()

      console.log("Settings saved:", this.settings)
      return this.settings
    } catch (error) {
      console.error("Error saving settings:", error)
      this.showToast("Error saving settings", "error")
      return this.settings
    }
  }

  // Auto-save settings
  autoSaveSettings() {
    this.saveSettings()
    this.showToast("Settings saved automatically")
  }

  // Apply settings
  applySettings() {
    try {
      // Apply column names
      const platinumNameInput = document.getElementById("platinum-name")
      if (platinumNameInput) platinumNameInput.value = this.settings.columnNames.platinum

      const goldNameInput = document.getElementById("gold-name")
      if (goldNameInput) goldNameInput.value = this.settings.columnNames.gold

      const silverNameInput = document.getElementById("silver-name")
      if (silverNameInput) silverNameInput.value = this.settings.columnNames.silver

      const bronzeNameInput = document.getElementById("bronze-name")
      if (bronzeNameInput) bronzeNameInput.value = this.settings.columnNames.bronze

      const ironNameInput = document.getElementById("iron-name")
      if (ironNameInput) ironNameInput.value = this.settings.columnNames.iron

      // Apply column visibility
      const platinumVisibleInput = document.getElementById("platinum-visible")
      if (platinumVisibleInput) platinumVisibleInput.checked = this.settings.columnVisibility.platinum

      const goldVisibleInput = document.getElementById("gold-visible")
      if (goldVisibleInput) goldVisibleInput.checked = this.settings.columnVisibility.gold

      const silverVisibleInput = document.getElementById("silver-visible")
      if (silverVisibleInput) silverVisibleInput.checked = this.settings.columnVisibility.silver

      const bronzeVisibleInput = document.getElementById("bronze-visible")
      if (bronzeVisibleInput) bronzeVisibleInput.checked = this.settings.columnVisibility.bronze

      const ironVisibleInput = document.getElementById("iron-visible")
      if (ironVisibleInput) ironVisibleInput.checked = this.settings.columnVisibility.iron

      // Apply platinum first setting
      if (this.platinumFirstToggle) {
        this.platinumFirstToggle.checked = this.settings.platinumFirst
      }

      // Update column names in product assignment table
      document.querySelectorAll(".editable-column-name").forEach((column) => {
        const columnType = column.getAttribute("data-column")
        if (columnType && this.settings.columnNames[columnType]) {
          const displayNameEl = column.querySelector(".column-display-name")
          if (displayNameEl) {
            displayNameEl.textContent = this.settings.columnNames[columnType]
          }
        }
      })

      // Render product cards
      this.renderProductCards()

      // Update column order
      this.updateColumnOrder()
    } catch (error) {
      console.error("Error applying settings:", error)
      this.showToast("Error applying settings", "error")
    }
  }

  // Render product cards
  renderProductCards() {
    if (!this.productsGrid) return

    // Clear existing cards
    this.productsGrid.innerHTML = ""

    // Create cards for each product
    Object.keys(this.productData).forEach((productName) => {
      const product = this.productData[productName]

      const card = document.createElement("div")
      card.className = "product-card"
      card.setAttribute("data-id", `product-${Date.now()}`)
      card.innerHTML = `
        <div class="product-card-header">
          <h4 title="${this.sanitize(product.description || "")}">${this.sanitize(productName)}</h4>
          <div class="product-actions">
            <button class="btn btn-sm btn-outline-light edit-product" aria-label="Edit ${this.sanitize(productName)}">
              <i class="bi bi-pencil"></i>
            </button>
            <button class="btn btn-sm btn-outline-danger delete-product" aria-label="Delete ${this.sanitize(productName)}">
              <i class="bi bi-trash"></i>
            </button>
          </div>
        </div>
        ${product.image ? `<img src="${product.image}" alt="${this.sanitize(productName)}" class="product-image">` : ""}
        <div class="product-price-display">$${product.price.toFixed(2)}</div>
      `

      this.productsGrid.appendChild(card)
    })

    // Bind product actions
    this.bindProductActions()
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

    if (this.productTable) {
      this.productTable.querySelectorAll("tr").forEach((row) => {
        row.classList.add("product-row")
        row.setAttribute("draggable", "true")
        this.setupDragAndDrop(row)
      })
    }
  }
}

// Initialize the application when the DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  new FIMenuSettings()
})
