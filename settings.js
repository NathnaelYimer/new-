document.addEventListener("DOMContentLoaded", () => {
    // Sidebar toggle functionality
    const sidebar = document.getElementById("sidebar")
    const mainContent = document.getElementById("main-content")
    const sidebarToggle = document.getElementById("sidebar-toggle")
    const mobileToggle = document.getElementById("mobile-toggle")
    const closeSettings = document.getElementById("close-settings")
  
    // Toggle sidebar on desktop
    sidebarToggle.addEventListener("click", () => {
      sidebar.classList.toggle("collapsed")
      mainContent.classList.toggle("expanded")
    })
  
    // Toggle sidebar on mobile
    mobileToggle.addEventListener("click", () => {
      sidebar.classList.toggle("mobile-open")
    })
  
    // Close sidebar when clicking outside on mobile
    document.addEventListener("click", (e) => {
      if (window.innerWidth <= 768) {
        if (!sidebar.contains(e.target) && e.target !== mobileToggle && sidebar.classList.contains("mobile-open")) {
          sidebar.classList.remove("mobile-open")
        }
      }
    })
  
    // Resize handler
    window.addEventListener("resize", () => {
      if (window.innerWidth > 768) {
        sidebar.classList.remove("mobile-open")
      }
    })
  
    // Close settings and go back to menu
      if (closeSettings) {
    closeSettings.addEventListener("click", () => {
      // Save settings before redirecting
      const settings = {
        columnNames: {
          platinum: document.getElementById("platinum-name").value,
          gold: document.getElementById("gold-name").value,
          silver: document.getElementById("silver-name").value,
          bronze: document.getElementById("bronze-name").value,
          iron: document.getElementById("iron-name").value,
        },
        columnVisibility: {
          platinum: document.getElementById("platinum-visible").checked,
          gold: document.getElementById("gold-visible").checked,
          silver: document.getElementById("silver-visible").checked,
          bronze: document.getElementById("bronze-visible").checked,
          iron: document.getElementById("iron-visible").checked,
        },
        productData: productData,
      };

      // Save settings to localStorage
      localStorage.setItem("menuSettings", JSON.stringify(settings));

      // Redirect to the menu (index.html) after a short delay
      setTimeout(() => {
        window.location.href = "index.html";
      }, 500);
    });
  }
  
    // Tab switching functionality
    const tabButtons = document.querySelectorAll(".tab-button")
    const tabContents = document.querySelectorAll(".tab-content")
  
    tabButtons.forEach((button) => {
      button.addEventListener("click", () => {
        // Remove active class from all buttons and contents
        tabButtons.forEach((btn) => btn.classList.remove("active"))
        tabContents.forEach((content) => content.classList.remove("active"))
  
        // Add active class to clicked button and corresponding content
        button.classList.add("active")
        const tabId = button.getAttribute("data-tab")
        document.getElementById(tabId).classList.add("active")
      })
    })
  
    // Product data with descriptions
    const productData = {
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
  
    // Create column name edit modal
    const createColumnNameModal = () => {
      const modal = document.createElement("div")
      modal.className = "column-name-modal"
      modal.id = "columnNameModal"
      modal.innerHTML = `
          <div class="column-name-modal-content">
            <div class="column-name-modal-header">
              <h3 class="column-name-modal-title">Edit Column Name</h3>
              <button class="column-name-modal-close">&times;</button>
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
  
      // Close modal when clicking the close button
      modal.querySelector(".column-name-modal-close").addEventListener("click", () => {
        modal.style.display = "none"
      })
  
      // Close modal when clicking cancel
      modal.querySelector(".cancel-column-name").addEventListener("click", () => {
        modal.style.display = "none"
      })
  
      // Close modal when clicking outside the content
      modal.addEventListener("click", (e) => {
        if (e.target === modal) {
          modal.style.display = "none"
        }
      })
  
      return modal
    }
  
    // Create the column name modal
    const columnNameModal = createColumnNameModal()
  
    // Add event listeners to column name edit buttons
    document.querySelectorAll(".edit-column-name").forEach((button) => {
      button.addEventListener("click", () => {
        const columnNameContainer = button.closest(".editable-column-name")
        const columnType = columnNameContainer.getAttribute("data-column")
        const currentName = columnNameContainer.querySelector(".column-display-name").textContent
  
        // Populate the modal
        document.getElementById("column-name-input").value = currentName
        document.getElementById("column-type").value = columnType
  
        // Show the modal
        columnNameModal.style.display = "flex"
      })
    })
  
    // Save column name changes
    document.querySelector(".save-column-name").addEventListener("click", () => {
      const newName = document.getElementById("column-name-input").value
      const columnType = document.getElementById("column-type").value
  
      if (newName.trim() === "") {
        alert("Column name cannot be empty")
        return
      }
  
      // Update all instances of this column name
  
      // 1. Update in the product assignment table
      document
        .querySelectorAll(`.editable-column-name[data-column="${columnType}"] .column-display-name`)
        .forEach((el) => {
          el.textContent = newName
        })
  
      // 2. Update in the column names tab
      const columnNameInput = document.getElementById(`${columnType}-name`)
      if (columnNameInput) {
        columnNameInput.value = newName
      }
  
      // 3. Update in the column visibility section
      const columnVisibilityLabel = document.querySelector(`label[for="${columnType}-visible"]`)
      if (columnVisibilityLabel) {
        columnVisibilityLabel.textContent = newName
      }
  
      // Close the modal
      columnNameModal.style.display = "none"
    })
  
    // Make product prices editable
    document.querySelectorAll(".editable-price").forEach((priceElement) => {
      priceElement.addEventListener("click", function () {
        // Don't do anything if already editing
        if (this.classList.contains("editing")) return
  
        const productName = this.getAttribute("data-product")
        const currentPrice = productData[productName].price
  
        // Create input element
        this.classList.add("editing")
        const currentText = this.textContent
        this.textContent = ""
  
        const input = document.createElement("input")
        input.type = "number"
        input.step = "0.01"
        input.min = "0"
        input.value = currentPrice
        this.appendChild(input)
        input.focus()
  
        // Handle input blur (save changes)
        input.addEventListener("blur", () => {
          const newPrice = Number.parseFloat(input.value)
          if (!isNaN(newPrice) && newPrice >= 0) {
            // Update product data
            productData[productName].price = newPrice
  
            // Update display
            this.textContent = `$${newPrice.toFixed(2)}`
  
            // Update all other instances of this product price
            updateProductPriceDisplays(productName, newPrice)
          } else {
            // Revert to original if invalid
            this.textContent = currentText
          }
          this.classList.remove("editing")
        })
  
        // Handle enter key
        input.addEventListener("keydown", (e) => {
          if (e.key === "Enter") {
            input.blur()
          } else if (e.key === "Escape") {
            this.textContent = currentText
            this.classList.remove("editing")
          }
        })
      })
    })
  
    // Function to update all price displays for a product
    function updateProductPriceDisplays(productName, newPrice) {
      // Update in product cards
      document.querySelectorAll(".product-card").forEach((card) => {
        const cardName = card.querySelector("h4")
        if (cardName && cardName.textContent === productName) {
          card.querySelector(".product-price-display").textContent = `$${newPrice.toFixed(2)}`
        }
      })
  
      // Update in product assignment table
      document.querySelectorAll(".editable-price").forEach((price) => {
        if (price.getAttribute("data-product") === productName) {
          price.textContent = `$${newPrice.toFixed(2)}`
        }
      })
    }
  
    // Initialize Bootstrap's Modal component
    const bootstrap = window.bootstrap
  
    // Edit product functionality
    const editButtons = document.querySelectorAll(".edit-product")
    const editProductModalElement = document.getElementById("editProductModal")
    const editModal = new bootstrap.Modal(editProductModalElement)
    const editNameInput = document.getElementById("edit-product-name")
    const editPriceInput = document.getElementById("edit-product-price")
    const editDescInput = document.getElementById("edit-product-description")
    const saveEditBtn = document.querySelector(".save-edit-btn")
  
    // Initialize Bootstrap's Modal component
    // const bootstrap = window.bootstrap;
  
    editButtons.forEach((button) => {
      button.addEventListener("click", () => {
        // Get product data from the card
        const productCard = button.closest(".product-card")
        const productName = productCard.querySelector("h4").textContent
        const productPrice = productCard.querySelector(".product-price-display").textContent.replace("$", "")
        const product = productData[productName] || {}
  
        // Populate the modal
        editNameInput.value = productName
        editNameInput.setAttribute("data-original-name", productName)
        editPriceInput.value = productPrice
        editDescInput.value = product.description || ""
  
        // Show the modal
        editModal.show()
  
        // Store reference to the edited card
        saveEditBtn.setAttribute("data-edit-card", productCard.getAttribute("data-id") || "")
      })
    })
  
    // Save edited product
    saveEditBtn.addEventListener("click", () => {
      const cardId = saveEditBtn.getAttribute("data-edit-card")
      const originalName = editNameInput.getAttribute("data-original-name")
      const newName = editNameInput.value
      const newPrice = Number.parseFloat(editPriceInput.value).toFixed(2)
      const newDesc = editDescInput.value
  
      // Update product data
      if (originalName && productData[originalName]) {
        // Create new entry with updated info
        productData[newName] = {
          price: Number.parseFloat(newPrice),
          description: newDesc,
          terms: productData[originalName].terms,
        }
  
        // Delete old entry if name changed
        if (originalName !== newName) {
          delete productData[originalName]
        }
      }
  
      // Find all instances of this product and update them
      document.querySelectorAll(".product-card").forEach((card) => {
        if (card.getAttribute("data-id") === cardId || cardId === "") {
          const nameElement = card.querySelector("h4")
          if (nameElement && nameElement.textContent === originalName) {
            nameElement.textContent = newName
            card.querySelector(".product-price-display").textContent = `$${newPrice}`
          }
        }
      })
  
      // Also update product assignment table
      document.querySelectorAll(".product-cell").forEach((cell) => {
        const productName = cell.querySelector("div:first-child")
        if (productName && productName.textContent === originalName) {
          productName.textContent = newName
          const priceElement = cell.querySelector(".product-price")
          if (priceElement) {
            priceElement.textContent = `$${newPrice}`
            if (priceElement.classList.contains("editable-price")) {
              priceElement.setAttribute("data-product", newName)
            }
          }
        }
      })
  
      // Close the modal
      editModal.hide()
    })
  
    // Delete product functionality
    const deleteButtons = document.querySelectorAll(".delete-product")
  
    deleteButtons.forEach((button) => {
      button.addEventListener("click", () => {
        if (confirm("Are you sure you want to delete this product?")) {
          const productCard = button.closest(".product-card")
          const productName = productCard.querySelector("h4").textContent
  
          // Remove from product data
          if (productData[productName]) {
            delete productData[productName]
          }
  
          productCard.remove()
  
          // Also remove from product assignment table
          document.querySelectorAll(".product-cell").forEach((cell) => {
            const cellProductName = cell.querySelector("div:first-child")
            if (cellProductName && cellProductName.textContent === productName) {
              const row = cell.closest("tr")
              if (row) {
                row.remove()
              }
            }
          })
        }
      })
    })
  
    // Add new product functionality
    const addProductBtn = document.querySelector(".add-product-btn")
    const newProductName = document.getElementById("new-product-name")
    const newProductPrice = document.getElementById("new-product-price")
    const newProductDesc = document.getElementById("new-product-description")
  
    addProductBtn.addEventListener("click", () => {
      if (!newProductName.value || !newProductPrice.value) {
        alert("Please enter both a product name and price")
        return
      }
  
      const name = newProductName.value
      const price = Number.parseFloat(newProductPrice.value).toFixed(2)
      const desc = newProductDesc.value
  
      // Add to product data
      productData[name] = {
        price: Number.parseFloat(price),
        description: desc,
        terms: "Standard terms apply. See dealer for complete details.",
      }
  
      // Create new product card
      const productsGrid = document.querySelector(".products-grid")
      const newCard = document.createElement("div")
      newCard.className = "product-card"
      newCard.innerHTML = `
          <div class="product-card-header">
            <h4>${name}</h4>
            <div class="product-actions">
              <button class="btn btn-sm btn-outline-light edit-product"><i class="bi bi-pencil"></i></button>
              <button class="btn btn-sm btn-outline-danger delete-product"><i class="bi bi-trash"></i></button>
            </div>
          </div>
          <div class="product-price-display">$${price}</div>
        `
  
      productsGrid.appendChild(newCard)
  
      // Add event listeners to new buttons
      const newEditBtn = newCard.querySelector(".edit-product")
      const newDeleteBtn = newCard.querySelector(".delete-product")
  
      newEditBtn.addEventListener("click", () => {
        editNameInput.value = name
        editNameInput.setAttribute("data-original-name", name)
        editPriceInput.value = price
        editDescInput.value = desc
        editModal.show()
      })
  
      newDeleteBtn.addEventListener("click", () => {
        if (confirm("Are you sure you want to delete this product?")) {
          // Remove from product data
          if (productData[name]) {
            delete productData[name]
          }
          newCard.remove()
        }
      })
  
      // Add to product assignment table
      const productTable = document.querySelector(".product-assignment-table tbody")
      if (productTable) {
        const newRow = document.createElement("tr")
        newRow.className = "product-row"
        newRow.setAttribute("draggable", "true")
        newRow.innerHTML = `
            <td class="product-cell">
              <div><i class="bi bi-grip-vertical product-handle"></i> ${name}</div>
              <div class="product-price editable-price" data-product="${name}">$${price}</div>
            </td>
            <td>
              <div class="form-check form-switch">
                <input class="form-check-input" type="checkbox">
              </div>
            </td>
            <td>
              <div class="form-check form-switch">
                <input class="form-check-input" type="checkbox">
              </div>
            </td>
            <td>
              <div class="form-check form-switch">
                <input class="form-check-input" type="checkbox">
              </div>
            </td>
            <td>
              <div class="form-check form-switch">
                <input class="form-check-input" type="checkbox">
              </div>
            </td>
            <td>
              <div class="form-check form-switch">
                <input class="form-check-input" type="checkbox">
              </div>
            </td>
          `
        productTable.appendChild(newRow)
  
        // Add click event to the new editable price
        const newPriceElement = newRow.querySelector(".editable-price")
        if (newPriceElement) {
          newPriceElement.addEventListener("click", function () {
            if (this.classList.contains("editing")) return
  
            const productName = this.getAttribute("data-product")
            const currentPrice = productData[productName].price
  
            this.classList.add("editing")
            const currentText = this.textContent
            this.textContent = ""
  
            const input = document.createElement("input")
            input.type = "number"
            input.step = "0.01"
            input.min = "0"
            input.value = currentPrice
            this.appendChild(input)
            input.focus()
  
            input.addEventListener("blur", () => {
              const newPrice = Number.parseFloat(input.value)
              if (!isNaN(newPrice) && newPrice >= 0) {
                productData[productName].price = newPrice
                this.textContent = `$${newPrice.toFixed(2)}`
                updateProductPriceDisplays(productName, newPrice)
              } else {
                this.textContent = currentText
              }
              this.classList.remove("editing")
            })
  
            input.addEventListener("keydown", (e) => {
              if (e.key === "Enter") {
                input.blur()
              } else if (e.key === "Escape") {
                this.textContent = currentText
                this.classList.remove("editing")
              }
            })
          })
        }
  
        // Add drag and drop functionality to the new row
        setupDragAndDrop(newRow)
      }
  
      // Clear form
      newProductName.value = ""
      newProductPrice.value = ""
      newProductDesc.value = ""
    })
  
    // Save settings functionality
    const saveSettingsBtn = document.querySelector(".save-settings-btn");

    saveSettingsBtn.addEventListener("click", () => {
      // Collect all settings data
      const settings = {
        columnNames: {
          platinum: document.getElementById("platinum-name").value,
          gold: document.getElementById("gold-name").value,
          silver: document.getElementById("silver-name").value,
          bronze: document.getElementById("bronze-name").value,
          iron: document.getElementById("iron-name").value,
        },
        columnVisibility: {
          platinum: document.getElementById("platinum-visible").checked,
          gold: document.getElementById("gold-visible").checked,
          silver: document.getElementById("silver-visible").checked,
          bronze: document.getElementById("bronze-visible").checked,
          iron: document.getElementById("iron-visible").checked,
        },
        // Product assignments would be collected here in a real app
        productData: productData,
      };
    
      // Save to localStorage
      localStorage.setItem("menuSettings", JSON.stringify(settings));
    
      // Redirect to index.html after a short delay (500ms)
      setTimeout(() => {
        window.location.href = "index.html";
      }, 500);
    });
    
  
    // Load saved settings if they exist
    const loadSavedSettings = () => {
      let savedSettings = localStorage.getItem("menuSettings");
      let settings;
    
      // If no saved settings exist, initialize with defaults (Iron hidden)
      if (!savedSettings) {
        settings = {
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
            iron: false // Default to hidden
          },
          productData: productData,
        };
        localStorage.setItem("menuSettings", JSON.stringify(settings));
      } else {
        settings = JSON.parse(savedSettings);
      }
    
      // Apply column names
      if (settings.columnNames) {
        document.getElementById("platinum-name").value = settings.columnNames.platinum;
        document.getElementById("gold-name").value = settings.columnNames.gold;
        document.getElementById("silver-name").value = settings.columnNames.silver;
        document.getElementById("bronze-name").value = settings.columnNames.bronze;
        document.getElementById("iron-name").value = settings.columnNames.iron;
    
        // Update column names in the product assignment table
        document.querySelectorAll(".editable-column-name").forEach((column) => {
          const columnType = column.getAttribute("data-column");
          if (settings.columnNames[columnType]) {
            column.querySelector(".column-display-name").textContent = settings.columnNames[columnType];
          }
        });
    
        // Update column visibility labels
        document.querySelectorAll(".column-visibility .form-check-label").forEach((label) => {
          const columnType = label.getAttribute("for").replace("-visible", "");
          if (settings.columnNames[columnType]) {
            label.textContent = settings.columnNames[columnType];
          }
        });
      }
    
      // Apply column visibility
      if (settings.columnVisibility) {
        document.getElementById("platinum-visible").checked = settings.columnVisibility.platinum;
        document.getElementById("gold-visible").checked = settings.columnVisibility.gold;
        document.getElementById("silver-visible").checked = settings.columnVisibility.silver;
        document.getElementById("bronze-visible").checked = settings.columnVisibility.bronze;
        document.getElementById("iron-visible").checked = settings.columnVisibility.iron;
      }
    
      // Load product data
      if (settings.productData) {
        Object.assign(productData, settings.productData);
        for (const [productName, data] of Object.entries(settings.productData)) {
          updateProductPriceDisplays(productName, data.price);
        }
      }
    };
    
    // Load settings when page loads
    loadSavedSettings();
  
    // Add drag and drop functionality for product reordering
    function setupDragAndDrop(row) {
      row.addEventListener("dragstart", handleDragStart)
      row.addEventListener("dragover", handleDragOver)
      row.addEventListener("dragenter", handleDragEnter)
      row.addEventListener("dragleave", handleDragLeave)
      row.addEventListener("drop", handleDrop)
      row.addEventListener("dragend", handleDragEnd)
    }
  
    // Initialize drag and drop for existing product rows
    function initProductReordering() {
      // Add drag handles to product rows
      document.querySelectorAll(".product-cell").forEach((cell) => {
        const firstDiv = cell.querySelector("div:first-child")
        if (firstDiv) {
            const text = firstDiv.textContent.trim();
          firstDiv.innerHTML = `<i class="bi bi-grip-vertical product-handle"></i> ${text}`;        
        }
      })
  
      // Make rows draggable
      const productRows = document.querySelectorAll(".product-assignment-table tbody tr")
      productRows.forEach((row) => {
        row.classList.add("product-row")
        row.setAttribute("draggable", "true")
        setupDragAndDrop(row)
      })
    }
  
    // Drag and drop event handlers
    let draggedItem = null
  
    function handleDragStart(e) {
      this.classList.add("dragging")
      draggedItem = this
      e.dataTransfer.effectAllowed = "move"
      e.dataTransfer.setData("text/html", this.innerHTML)
    }
  
    function handleDragOver(e) {
      if (e.preventDefault) {
        e.preventDefault()
      }
      e.dataTransfer.dropEffect = "move"
      return false
    }
  
    function handleDragEnter(e) {
      this.classList.add("drag-over")
    }
  
    function handleDragLeave(e) {
      this.classList.remove("drag-over")
    }
  
    function handleDrop(e) {
      if (e.stopPropagation) {
        e.stopPropagation()
      }
  
      if (draggedItem !== this) {
        const tbody = this.parentNode
        const rows = Array.from(tbody.querySelectorAll("tr"))
        const draggedIndex = rows.indexOf(draggedItem)
        const targetIndex = rows.indexOf(this)
  
        if (draggedIndex < targetIndex) {
          tbody.insertBefore(draggedItem, this.nextSibling)
        } else {
          tbody.insertBefore(draggedItem, this)
        }
      }
  
      this.classList.remove("drag-over")
      return false
    }
  
    function handleDragEnd(e) {
      this.classList.remove("dragging")
      document.querySelectorAll(".drag-over").forEach((item) => {
        item.classList.remove("drag-over")
      })
    }
  
    // Initialize product reordering
    initProductReordering()
  })
  
  