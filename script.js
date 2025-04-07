document.addEventListener("DOMContentLoaded", () => {
  // Add event listeners to all remove product buttons
  const setupRemoveProductListeners = () => {
    document.querySelectorAll(".remove-product-btn").forEach((button) => {
      button.addEventListener("click", function (e) {
        e.stopPropagation() // Prevent event bubbling

        // Get the product item and remove only this specific instance
        const productItem = this.closest(".feature-item")
        if (productItem) {
          productItem.remove()
        }
      })
    })
  }

  // Call the function to set up listeners when the page loads
  setupRemoveProductListeners()

  // Original code below
  // Sidebar toggle functionality
  const sidebar = document.getElementById("sidebar")
  const mainContent = document.getElementById("main-content")
  const sidebarToggle = document.getElementById("sidebar-toggle")
  const mobileToggle = document.getElementById("mobile-toggle")

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

  // Get all draggable items
  const draggableItems = document.querySelectorAll(".feature-item")

  // Get all dropzones
  const dropzones = document.querySelectorAll(".kanban-dropzone")

  // Get all "Choose" buttons
  const chooseButtons = document.querySelectorAll(".choose-button")

  // Get all month selectors
  const monthSelectors = document.querySelectorAll(".month-selector .dropdown-item")

  // Fix for dropdown toggle buttons - ensure they work properly
  const dropdownToggles = document.querySelectorAll(".dropdown-toggle")
  dropdownToggles.forEach((toggle) => {
    toggle.addEventListener("click", (e) => {
      e.preventDefault()
      e.stopPropagation()

      // Close all other dropdowns
      dropdownToggles.forEach((otherToggle) => {
        if (otherToggle !== toggle && otherToggle.getAttribute("aria-expanded") === "true") {
          otherToggle.setAttribute("aria-expanded", "false")
          const menu = otherToggle.nextElementSibling
          if (menu && menu.classList.contains("dropdown-menu")) {
            menu.style.display = "none"
          }
        }
      })

      // Toggle current dropdown
      const isExpanded = toggle.getAttribute("aria-expanded") === "true"
      toggle.setAttribute("aria-expanded", !isExpanded)

      const menu = toggle.nextElementSibling
      if (menu && menu.classList.contains("dropdown-menu")) {
        menu.style.display = isExpanded ? "none" : "block"
      }
    })
  })

  // Close dropdowns when clicking outside
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".dropdown")) {
      dropdownToggles.forEach((toggle) => {
        toggle.setAttribute("aria-expanded", "false")
        const menu = toggle.nextElementSibling
        if (menu && menu.classList.contains("dropdown-menu")) {
          menu.style.display = "none"
        }
      })
    }
  })

  // Variable to store the currently dragged item
  let draggedItem = null
  let originalPlan = null

  // Payment data by plan and term
  const paymentData = {
    platinum: {
      36: { monthly: 620.15 },
      48: { monthly: 485.25 },
      60: { monthly: 407.05 },
      63: { monthly: 390.45 },
      72: { monthly: 350.75 },
      75: { monthly: 340.15 },
      84: { monthly: 310.25 },
    },
    gold: {
      36: { monthly: 535.75 },
      48: { monthly: 420.5 },
      60: { monthly: 352.25 },
      63: { monthly: 338.15 },
      72: { monthly: 303.25 },
      75: { monthly: 294.15 },
      84: { monthly: 268.35 },
    },
    silver: {
      36: { monthly: 487.25 },
      48: { monthly: 382.35 },
      60: { monthly: 320.17 },
      63: { monthly: 307.45 },
      72: { monthly: 275.65 },
      75: { monthly: 267.35 },
      84: { monthly: 244.1 },
    },
    bronze: {
      36: { monthly: 446.5 },
      48: { monthly: 350.25 },
      60: { monthly: 293.5 },
      63: { monthly: 281.75 },
      72: { monthly: 252.45 },
      75: { monthly: 245.1 },
      84: { monthly: 223.65 },
    },
    iron: {
      36: { monthly: 417.75 },
      48: { monthly: 327.85 },
      60: { monthly: 274.5 },
      63: { monthly: 263.45 },
      72: { monthly: 236.15 },
      75: { monthly: 229.25 },
      84: { monthly: 209.1 },
    },
  }

  // Product explanations data
  const productExplanations = {
    "Extended Warranty":
      "Extends the manufacturer's warranty beyond the standard coverage period. This protects you from expensive repair costs for mechanical and electrical failures after the original warranty expires. Coverage typically includes engine, transmission, drive axle, and electrical components.",
    "Rust Proofing":
      "A protective coating applied to the vehicle's undercarriage and other vulnerable areas to prevent rust and corrosion. This treatment extends the life of your vehicle, especially in areas with harsh winters where road salt is used.",
    "Paint Protection":
      "A clear, durable film or chemical coating applied to your vehicle's paint to protect against scratches, chips, UV damage, and environmental contaminants. Helps maintain your vehicle's appearance and resale value.",
    "Fabric/Leather Protection":
      "A special treatment that creates a barrier against stains, spills, and UV damage on your vehicle's interior surfaces. Makes cleanup easier and extends the life of your upholstery.",
    "Key Fob Replacement":
      "Coverage for the replacement of your vehicle's electronic key fob if it's lost, damaged, or stolen. Modern key fobs can cost hundreds of dollars to replace and program.",
    GAP: "Guaranteed Asset Protection (GAP) covers the difference between what you owe on your vehicle and what your insurance pays if your vehicle is totaled or stolen. This prevents you from making payments on a vehicle you no longer have.",
    "Scratch/Dent Repair":
      "Coverage for minor cosmetic repairs to your vehicle's exterior, including small dents, dings, and scratches. Helps maintain your vehicle's appearance and value without filing insurance claims.",
  }

  // Terms and conditions data for each plan
  const termsAndConditions = {
    platinum: {
      title: "Platinum Plan - Terms & Conditions",
      content: `
        <div class="full-terms-section">
          <h4 class="full-terms-section-title">Coverage Period</h4>
          <p>The Platinum Plan provides comprehensive coverage for 7 years or 100,000 miles, whichever comes first, from the date of purchase.</p>
        </div>
        <div class="full-terms-section">
          <h4 class="full-terms-section-title">What's Covered</h4>
          <p>This premium plan includes coverage for all manufacturer-installed mechanical and electrical components except those specifically listed as not covered. Key benefits include:</p>
          <ul>
            <li>Extended Warranty with $0 deductible</li>
            <li>Lifetime Rust Proofing with annual inspections</li>
            <li>Premium Paint Protection with 7-year guarantee</li>
            <li>Comprehensive Fabric/Leather Protection</li>
            <li>Unlimited Key Fob Replacements</li>
            <li>GAP Coverage up to 150% of vehicle value</li>
            <li>Unlimited Scratch/Dent Repairs</li>
          </ul>
        </div>
        <div class="full-terms-section">
          <h4 class="full-terms-section-title">Exclusions</h4>
          <p>The following items are not covered under this plan:</p>
          <ul>
            <li>Damage resulting from accidents, misuse, or negligence</li>
            <li>Regular maintenance items (oil changes, filters, etc.)</li>
            <li>Normal wear and tear items (brake pads, wiper blades, etc.)</li>
            <li>Cosmetic damage not affecting functionality</li>
            <li>Modifications or non-factory installed components</li>
          </ul>
        </div>
        <div class="full-terms-section">
          <h4 class="full-terms-section-title">Cancellation Policy</h4>
          <p>You may cancel this plan within 30 days for a full refund. After 30 days, a prorated refund will be issued based on time and mileage.</p>
        </div>
      `,
    },
    gold: {
      title: "Gold Plan - Terms & Conditions",
      content: `
        <div class="full-terms-section">
          <h4 class="full-terms-section-title">Coverage Period</h4>
          <p>The Gold Plan provides comprehensive coverage for 6 years or 85,000 miles, whichever comes first, from the date of purchase.</p>
        </div>
        <div class="full-terms-section">
          <h4 class="full-terms-section-title">What's Covered</h4>
          <p>This premium plan includes coverage for most manufacturer-installed mechanical and electrical components. Key benefits include:</p>
          <ul>
            <li>Extended Warranty with $50 deductible</li>
            <li>Rust Proofing with bi-annual inspections</li>
            <li>Paint Protection with 5-year guarantee</li>
            <li>Comprehensive Fabric/Leather Protection</li>
            <li>Up to 3 Key Fob Replacements</li>
            <li>GAP Coverage up to 125% of vehicle value</li>
          </ul>
        </div>
        <div class="full-terms-section">
          <h4 class="full-terms-section-title">Exclusions</h4>
          <p>The following items are not covered under this plan:</p>
          <ul>
            <li>Damage resulting from accidents, misuse, or negligence</li>
            <li>Regular maintenance items (oil changes, filters, etc.)</li>
            <li>Normal wear and tear items (brake pads, wiper blades, etc.)</li>
            <li>Cosmetic damage not affecting functionality</li>
            <li>Modifications or non-factory installed components</li>
          </ul>
        </div>
        <div class="full-terms-section">
          <h4 class="full-terms-section-title">Cancellation Policy</h4>
          <p>You may cancel this plan within 30 days for a full refund. After 30 days, a prorated refund will be issued based on time and mileage.</p>
        </div>
      `,
    },
    silver: {
      title: "Silver Plan - Terms & Conditions",
      content: `
        <div class="full-terms-section">
          <h4 class="full-terms-section-title">Coverage Period</h4>
          <p>The Silver Plan provides coverage for 5 years or 75,000 miles, whichever comes first, from the date of purchase.</p>
        </div>
        <div class="full-terms-section">
          <h4 class="full-terms-section-title">What's Covered</h4>
          <p>This plan includes coverage for many manufacturer-installed mechanical and electrical components. Key benefits include:</p>
          <ul>
            <li>Extended Warranty with $100 deductible</li>
            <li>Rust Proofing with annual inspections</li>
            <li>Paint Protection with 3-year guarantee</li>
            <li>Up to 2 Key Fob Replacements</li>
            <li>GAP Coverage up to 100% of vehicle value</li>
          </ul>
        </div>
        <div class="full-terms-section">
          <h4 class="full-terms-section-title">Exclusions</h4>
          <p>The following items are not covered under this plan:</p>
          <ul>
            <li>Damage resulting from accidents, misuse, or negligence</li>
            <li>Regular maintenance items (oil changes, filters, etc.)</li>
            <li>Normal wear and tear items (brake pads, wiper blades, etc.)</li>
            <li>Cosmetic damage not affecting functionality</li>
            <li>Modifications or non-factory installed components</li>
          </ul>
        </div>
        <div class="full-terms-section">
          <h4 class="full-terms-section-title">Cancellation Policy</h4>
          <p>You may cancel this plan within 30 days for a full refund. After 30 days, a prorated refund will be issued based on time and mileage.</p>
        </div>
      `,
    },
    bronze: {
      title: "Bronze Plan - Terms & Conditions",
      content: `
        <div class="full-terms-section">
          <h4 class="full-terms-section-title">Coverage Period</h4>
          <p>The Bronze Plan provides coverage for 4 years or 60,000 miles, whichever comes first, from the date of purchase.</p>
        </div>
        <div class="full-terms-section">
          <h4 class="full-terms-section-title">What's Covered</h4>
          <p>This plan includes coverage for essential manufacturer-installed mechanical and electrical components. Key benefits include:</p>
          <ul>
            <li>Extended Warranty with $150 deductible</li>
            <li>1 Key Fob Replacement</li>
            <li>GAP Coverage up to 75% of vehicle value</li>
          </ul>
        </div>
        <div class="full-terms-section">
          <h4 class="full-terms-section-title">Exclusions</h4>
          <p>The following items are not covered under this plan:</p>
          <ul>
            <li>Damage resulting from accidents, misuse, or negligence</li>
            <li>Regular maintenance items (oil changes, filters, etc.)</li>
            <li>Normal wear and tear items (brake pads, wiper blades, etc.)</li>
            <li>Cosmetic damage not affecting functionality</li>
            <li>Modifications or non-factory installed components</li>
          </ul>
        </div>
        <div class="full-terms-section">
          <h4 class="full-terms-section-title">Cancellation Policy</h4>
          <p>You may cancel this plan within 30 days for a full refund. After 30 days, a prorated refund will be issued based on time and mileage.</p>
        </div>
      `,
    },
    iron: {
      title: "Iron Plan - Terms & Conditions",
      content: `
        <div class="full-terms-section">
          <h4 class="full-terms-section-title">Coverage Period</h4>
          <p>The Iron Plan provides coverage for 3 years or 45,000 miles, whichever comes first, from the date of purchase.</p>
        </div>
        <div class="full-terms-section">
          <h4 class="full-terms-section-title">What's Covered</h4>
          <p>This basic plan includes coverage for select manufacturer-installed mechanical and electrical components. Key benefits include:</p>
          <ul>
            <li>Extended Warranty with $200 deductible</li>
            <li>1 Key Fob Replacement</li>
          </ul>
        </div>
        <div class="full-terms-section">
          <h4 class="full-terms-section-title">Exclusions</h4>
          <p>The following items are not covered under this plan:</p>
          <ul>
            <li>Damage resulting from accidents, misuse, or negligence</li>
            <li>Regular maintenance items (oil changes, filters, etc.)</li>
            <li>Normal wear and tear items (brake pads, wiper blades, etc.)</li>
            <li>Cosmetic damage not affecting functionality</li>
            <li>Modifications or non-factory installed components</li>
          </ul>
        </div>
        <div class="full-terms-section">
          <h4 class="full-terms-section-title">Cancellation Policy</h4>
          <p>You may cancel this plan within 30 days for a full refund. After 30 days, a prorated refund will be issued based on time and mileage.</p>
        </div>
      `,
    },
  }

  // Add event listeners to all draggable items
  draggableItems.forEach((item) => {
    // Drag start event
    item.addEventListener("dragstart", function (e) {
      draggedItem = this
      originalPlan = this.getAttribute("data-plan")

      // Add dragging class for visual feedback
      setTimeout(() => {
        this.classList.add("dragging")
      }, 0)

      // Set data transfer
      e.dataTransfer.setData("text/plain", this.getAttribute("data-id"))
    })

    // Drag end event
    item.addEventListener("dragend", function () {
      // Remove dragging class
      this.classList.remove("dragging")
      draggedItem = null
      originalPlan = null
    })
  })

  // Add event listeners to all dropzones
  dropzones.forEach((zone) => {
    // Dragover event
    zone.addEventListener("dragover", function (e) {
      e.preventDefault()
      this.classList.add("highlight")
    })

    // Dragleave event
    zone.addEventListener("dragleave", function () {
      this.classList.remove("highlight")
    })

    // Drop event
    zone.addEventListener("drop", function (e) {
      e.preventDefault()
      this.classList.remove("highlight")

      if (draggedItem) {
        const targetPlan = this.getAttribute("data-plan")

        // Only move if dropping to a different plan
        if (originalPlan !== targetPlan) {
          // Clone the item to keep its event listeners
          const clonedItem = draggedItem.cloneNode(true)

          // Update the plan attribute
          clonedItem.setAttribute("data-plan", targetPlan)

          // Update the checkmark color
          const checkmark = clonedItem.querySelector(".feature-check")
          checkmark.className = `feature-check ${targetPlan}-check`

          // Add the item to the new dropzone
          this.appendChild(clonedItem)

          // Remove the original item
          draggedItem.remove()

          // Add event listeners to the cloned item
          setupDragListeners(clonedItem)

          // Add product explanation click event to the cloned item
          setupProductExplanationListener(clonedItem)

          // Add remove button event listener to the cloned item
          setupRemoveButtonListener(clonedItem.querySelector(".remove-product-btn"))
        }
      }
    })
  })

  // Function to set up drag listeners for a new item
  function setupDragListeners(item) {
    item.addEventListener("dragstart", function (e) {
      draggedItem = this
      originalPlan = this.getAttribute("data-plan")

      setTimeout(() => {
        this.classList.add("dragging")
      }, 0)

      e.dataTransfer.setData("text/plain", this.getAttribute("data-id"))
    })

    item.addEventListener("dragend", function () {
      this.classList.remove("dragging")
      draggedItem = null
      originalPlan = null
    })
  }

  // Function to set up product explanation click event
  function setupProductExplanationListener(item) {
    const productNameElement = item.querySelector(".product-name")
    if (productNameElement) {
      productNameElement.addEventListener("click", function () {
        const productName = this.textContent
        showProductExplanation(productName)
      })
    }
  }

  // Function to set up remove button event listener
  function setupRemoveButtonListener(button) {
    if (button) {
      button.addEventListener("click", function (e) {
        e.stopPropagation() // Prevent event bubbling

        // Get the product item and remove only this specific instance
        const productItem = this.closest(".feature-item")
        if (productItem) {
          productItem.remove()
        }
      })
    }
  }

  // Add click event listeners to all "Choose" buttons
  chooseButtons.forEach((button) => {
    button.addEventListener("click", function () {
      // Get the plan type based on button class
      let planType = ""
      if (this.classList.contains("platinum")) planType = "Platinum"
      else if (this.classList.contains("gold")) planType = "Gold"
      else if (this.classList.contains("silver")) planType = "Silver"
      else if (this.classList.contains("bronze")) planType = "Bronze"
      else if (this.classList.contains("iron")) planType = "Iron"

      // Alert for demonstration
      alert(`You've selected the ${planType} plan.`)
    })
  })

  // Add click event listeners to month selector dropdown items
  monthSelectors.forEach((item) => {
    item.addEventListener("click", function (e) {
      e.preventDefault()
      e.stopPropagation() // Prevent event bubbling

      const months = Number.parseInt(this.getAttribute("data-months"))
      const plan = this.getAttribute("data-plan")

      // Update the term text
      const termElement = document.querySelector(`.${plan}-term`)
      if (termElement) {
        termElement.textContent = `for ${months} months`
      }

      // Update the monthly payment
      const monthlyElement = document.querySelector(`.${plan}-monthly`)
      if (monthlyElement && paymentData[plan] && paymentData[plan][months]) {
        // Add updating animation class
        monthlyElement.classList.add("updating")

        // Update the text after a short delay for animation effect
        setTimeout(() => {
          monthlyElement.textContent = `$${paymentData[plan][months].monthly.toFixed(2)} Monthly`
          monthlyElement.classList.remove("updating")
        }, 300)
      }

      // Mark the selected item as active
      const dropdownItems = this.parentElement.parentElement.querySelectorAll(".dropdown-item")
      dropdownItems.forEach((dropItem) => {
        dropItem.classList.remove("active")
      })
      this.classList.add("active")

      // Close the dropdown after selection
      const dropdown = this.closest(".dropdown")
      if (dropdown) {
        const toggle = dropdown.querySelector(".dropdown-toggle")
        if (toggle) {
          toggle.setAttribute("aria-expanded", "false")
          const menu = toggle.nextElementSibling
          if (menu && menu.classList.contains("dropdown-menu")) {
            menu.style.display = "none"
          }
        }
      }
    })
  })

  // Add click event listeners to product names for showing explanations
  document.querySelectorAll(".product-name").forEach((productElement) => {
    productElement.addEventListener("click", function () {
      const productName = this.textContent
      showProductExplanation(productName)
    })
  })

  // Function to show product explanation in modal
  function showProductExplanation(productName) {
    const explanation = productExplanations[productName]
    if (explanation) {
      const modalContent = document.getElementById("productExplanationContent")
      const modalTitle = document.getElementById("productExplanationModalLabel")

      modalTitle.textContent = productName
      modalContent.innerHTML = `<p>${explanation}</p>`

      // Declare bootstrap variable
      const productModalElement = document.getElementById("productExplanationModal")
      const productModal = new bootstrap.Modal(productModalElement)
      productModal.show()
    }
  }

  // Add click event listeners to "View Full Terms & Conditions" links
  document.querySelectorAll(".view-terms-link").forEach((link) => {
    link.addEventListener("click", function (e) {
      e.preventDefault()
      const plan = this.getAttribute("data-plan")
      showTermsAndConditions(plan)
    })
  })

  // Function to show terms and conditions in modal
  function showTermsAndConditions(plan) {
    const termsData = termsAndConditions[plan]
    if (termsData) {
      const modalContent = document.getElementById("termsModalContent")
      const modalTitle = document.getElementById("termsModalLabel")

      modalTitle.textContent = termsData.title
      modalContent.innerHTML = termsData.content

      // Declare bootstrap variable
      const termsModalElement = document.getElementById("termsModal")
      const termsModal = new bootstrap.Modal(termsModalElement)
      termsModal.show()
    }
  }

  document.querySelectorAll('.remove-product-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      btn.closest('.product-item')?.classList.add('fade-out');
      setTimeout(() => {
        btn.closest('.product-item')?.remove();
      }, 300);
    });
  });
  

  // Load settings if they exist
  const loadSettings = () => {
    const savedSettings = localStorage.getItem("menuSettings")
    if (savedSettings) {
      const settings = JSON.parse(savedSettings)

      // Apply column names
      if (settings.columnNames) {
        document.querySelectorAll("th").forEach((th) => {
          if (th.classList.contains("platinum-bg")) th.textContent = settings.columnNames.platinum
          else if (th.classList.contains("gold-bg")) th.textContent = settings.columnNames.gold
          else if (th.classList.contains("silver-bg")) th.textContent = settings.columnNames.silver
          else if (th.classList.contains("bronze-bg")) th.textContent = settings.columnNames.bronze
          else if (th.classList.contains("iron-bg")) th.textContent = settings.columnNames.iron
        })
      }

      // Apply column visibility
      if (settings.columnVisibility) {
        const table = document.querySelector(".menu-table")
        if (table) {
          const rows = table.querySelectorAll("tr")
          rows.forEach((row) => {
            const cells = row.querySelectorAll("th, td")
            cells.forEach((cell, index) => {
              if (index === 0 && !settings.columnVisibility.platinum) cell.style.display = "none"
              else if (index === 1 && !settings.columnVisibility.gold) cell.style.display = "none"
              else if (index === 2 && !settings.columnVisibility.silver) cell.style.display = "none"
              else if (index === 3 && !settings.columnVisibility.bronze) cell.style.display = "none"
              else if (index === 4 && !settings.columnVisibility.iron) cell.style.display = "none"
            })
          })
        }
      }
    }
  }

  // Load settings when page loads
  loadSettings()
})

