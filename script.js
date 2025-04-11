document.addEventListener("DOMContentLoaded", () => {


  let settings = JSON.parse(localStorage.getItem("menuSettings")) || {
    productData: {
      "Extended Warranty": {
        price: 613.16,
        description: "Comprehensive coverage that extends the manufacturer's warranty, protecting your vehicle against mechanical and electrical failures beyond the original warranty period.",
        terms: "Coverage varies by plan level. Deductibles may apply. Valid at any authorized service center. Transferable if vehicle is sold. Exclusions apply for wear and tear items and routine maintenance."
      },
      "Rust Proofing": {
        price: 617.94,
        description: "Advanced protection that helps prevent rust and corrosion on your vehicle's body and undercarriage, extending its lifespan and maintaining its value.",
        terms: "Annual inspections required to maintain coverage. Covers perforation due to rust from the inside out. Does not cover surface rust from external damage. 5-year warranty included."
      },
      "Paint Protection": {
        price: 608.39,
        description: "Premium sealant that creates a protective barrier over your vehicle's paint, guarding against environmental damage, UV rays, and minor scratches.",
        terms: "Requires proper maintenance and care. Not a substitute for regular washing. Does not cover damage from accidents or improper care. Reapplication recommended every 2 years."
      },
      "Fabric/Leather Protection": {
        price: 261.84,
        description: "Specialized treatment that repels stains and spills on your vehicle's interior surfaces, making cleanup easier and preserving the appearance of seats and carpets.",
        terms: "Spills must be cleaned promptly. Does not prevent damage from sharp objects or burns. Reapplication may be necessary after deep cleaning. 3-year protection plan included."
      },
      "Key Fob Replacement": {
        price: 871.21,
        description: "Coverage for the repair or replacement of your vehicle's key fob in case of loss, theft, or damage, saving you from expensive dealer replacement costs.",
        terms: "Limited to 2 replacements per contract period. $50 deductible per claim. Programming fees included. Must provide proof of loss or damage. 24-hour assistance available."
      },
      "GAP": {
        price: 990.27,
        description: "Guaranteed Asset Protection covers the difference between what you owe on your vehicle and its actual cash value if it's totaled or stolen.",
        terms: "Must be purchased within 30 days of vehicle financing. Maximum benefit of $50,000. Primary insurance deductible coverage up to $1,000. Not available for leased vehicles in some states."
      },
      "Scratch/Dent Repair": {
        price: 1095.96,
        description: "Convenient repair service for minor scratches, dents, and dings on your vehicle's exterior, maintaining its appearance and value without affecting your insurance.",
        terms: "Repairs limited to dents smaller than 4 inches in diameter. Paint touch-up for scratches less than 6 inches. Unlimited number of repairs during contract period. $0 deductible per claim."
      }
    },
    productAssignments: {
      platinum: ["Extended Warranty", "Rust Proofing", "Paint Protection", "Fabric/Leather Protection", "Key Fob Replacement", "GAP", "Scratch/Dent Repair"],
      gold: ["Extended Warranty", "Rust Proofing", "Paint Protection", "Fabric/Leather Protection", "Key Fob Replacement", "GAP"],
      silver: ["Extended Warranty", "Rust Proofing", "Paint Protection", "Key Fob Replacement", "GAP"],
      bronze: ["Extended Warranty", "Key Fob Replacement", "GAP"],
      iron: ["Extended Warranty", "Key Fob Replacement"]
    }
  };

  let productData = settings.productData;
  let productAssignments = settings.productAssignments;

  // Derive productExplanations from productData
  // (This block is removed as `productExplanations` is already declared later in the code)





  // Add event listeners to all remove product buttons
  const setupRemoveProductListeners = () => {
    document.querySelectorAll(".remove-product-btn").forEach((button) => {
      button.addEventListener("click", function (e) {
        e.stopPropagation(); // Prevent event bubbling
        const productItem = this.closest(".feature-item");
        if (productItem) {
          productItem.remove();
        }
      });
    });
  };

  // Call the function to set up listeners when the page loads
  setupRemoveProductListeners();

  // Sidebar toggle functionality
  const sidebar = document.getElementById("sidebar");
  const mainContent = document.getElementById("main-content");
  const sidebarToggle = document.getElementById("sidebar-toggle");
  const mobileToggle = document.getElementById("mobile-toggle");

  // Set the sidebar to collapsed by default
  sidebar.classList.add("collapsed");
  mainContent.classList.add("expanded");

  // Toggle sidebar on desktop
  sidebarToggle.addEventListener("click", () => {
    sidebar.classList.toggle("collapsed");
    mainContent.classList.toggle("expanded");
  });

  // Toggle sidebar on mobile
  mobileToggle.addEventListener("click", () => {
    sidebar.classList.toggle("mobile-open");
  });

  // Close sidebar when clicking outside on mobile
  document.addEventListener("click", (e) => {
    if (window.innerWidth <= 768) {
      if (
        !sidebar.contains(e.target) &&
        e.target !== mobileToggle &&
        sidebar.classList.contains("mobile-open")
      ) {
        sidebar.classList.remove("mobile-open");
      }
    }
  });

  // Resize handler
  window.addEventListener("resize", () => {
    if (window.innerWidth > 768) {
      sidebar.classList.remove("mobile-open");
    }
  });

  // Get all draggable items
  const draggableItems = document.querySelectorAll(".feature-item");

  // Get all dropzones
  const dropzones = document.querySelectorAll(".kanban-dropzone");

  // Get all "Choose" buttons
  const chooseButtons = document.querySelectorAll(".choose-button");

  // Get all month selectors
  const monthSelectors = document.querySelectorAll(".month-selector .dropdown-item");

  // Fix for dropdown toggle buttons - ensure they work properly
  const dropdownToggles = document.querySelectorAll(".dropdown-toggle");
  dropdownToggles.forEach((toggle) => {
    toggle.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();

      // Close all other dropdowns
      dropdownToggles.forEach((otherToggle) => {
        if (
          otherToggle !== toggle &&
          otherToggle.getAttribute("aria-expanded") === "true"
        ) {
          otherToggle.setAttribute("aria-expanded", "false");
          const menu = otherToggle.nextElementSibling;
          if (menu && menu.classList.contains("dropdown-menu")) {
            menu.style.display = "none";
          }
        }
      });

      // Toggle current dropdown
      const isExpanded = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", !isExpanded);

      const menu = toggle.nextElementSibling;
      if (menu && menu.classList.contains("dropdown-menu")) {
        menu.style.display = isExpanded ? "none" : "block";
      }
    });
  });

  // Close dropdowns when clicking outside
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".dropdown")) {
      dropdownToggles.forEach((toggle) => {
        toggle.setAttribute("aria-expanded", "false");
        const menu = toggle.nextElementSibling;
        if (menu && menu.classList.contains("dropdown-menu")) {
          menu.style.display = "none";
        }
      });
    }
  });

  // Variable to store the currently dragged item
  let draggedItem = null;
  let originalPlan = null;

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
  };

  // Product explanations data
  const productExplanations = Object.fromEntries(
    Object.entries(productData).map(([name, data]) => [name, data.description])
  );
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
  };

  // Add event listeners to all draggable items
  draggableItems.forEach((item) => {
    item.addEventListener("dragstart", function (e) {
      console.log("Drag started for item:", this);
      draggedItem = this;
      originalPlan = this.getAttribute("data-plan");
      console.log("Dragged item:", draggedItem, "Original plan:", originalPlan);
      setTimeout(() => {
        this.classList.add("dragging");
      }, 0);
      e.dataTransfer.setData("text/plain", this.getAttribute("data-id"));
    });

    item.addEventListener("dragend", function () {
      console.log("Drag ended for item:", this);
      this.classList.remove("dragging");
      draggedItem = null;
      originalPlan = null;
    });
  });

  // Add event listeners to all dropzones
  dropzones.forEach((zone) => {
    zone.addEventListener("dragover", function (e) {
      e.preventDefault();
      console.log("Dragover on zone:", this);
      this.classList.add("highlight");
    });

    zone.addEventListener("dragleave", function () {
      console.log("Dragleave on zone:", this);
      this.classList.remove("highlight");
    });

    zone.addEventListener("drop", function (e) {
      e.preventDefault();
      this.classList.remove("highlight");
      console.log("Drop event triggered on zone:", this);
      console.log("Dragged item:", draggedItem);

      if (draggedItem) {
        const targetPlan = this.getAttribute("data-plan");
        console.log("Target plan:", targetPlan, "Original plan:", originalPlan);

        if (originalPlan !== targetPlan) {
          const productName = draggedItem.querySelector(".product-name").textContent;
          console.log("Product name:", productName);

          // Check for duplicates
          const targetItems = this.querySelectorAll(".feature-item");
          let isDuplicate = false;

          targetItems.forEach((item) => {
            const existingProductName = item.querySelector(".product-name").textContent;
            console.log("Checking against:", existingProductName);
            if (existingProductName.toLowerCase() === productName.toLowerCase()) {
              isDuplicate = true;
            }
          });

          console.log("Is duplicate:", isDuplicate);

          if (isDuplicate) {
            console.log(`Duplicate found: "${productName}" already exists in ${targetPlan} plan.`);
            alert(`The product "${productName}" already exists in the ${targetPlan} plan.`);
            return;
          }

          console.log("No duplicate found, proceeding with move...");
          const clonedItem = draggedItem.cloneNode(true);
          console.log("Cloned item:", clonedItem);

          // Ensure the cloned item is draggable
          clonedItem.setAttribute("draggable", "true");
          clonedItem.setAttribute("data-plan", targetPlan);

          // Update the checkmark color
          const checkmark = clonedItem.querySelector(".feature-check");
          if (checkmark) {
            checkmark.className = `feature-check ${targetPlan}-check`;
          }

          // Add the item to the new dropzone
          this.appendChild(clonedItem);
          console.log("Cloned item appended to target zone:", this);

          // Remove the original item
          draggedItem.remove();
          console.log("Original item removed");

          // Add event listeners to the cloned item
          setupDragListeners(clonedItem);
          setupProductExplanationListener(clonedItem);
          setupRemoveButtonListener(clonedItem.querySelector(".remove-product-btn"));
          console.log("Event listeners set up on cloned item");
        } else {
          console.log("Same plan, no move needed");
        }
      } else {
        console.log("No dragged item available");
      }
    });
  });

  // Function to set up drag listeners for a new item
  function setupDragListeners(item) {
    item.addEventListener("dragstart", function (e) {
      console.log("Setting up dragstart for cloned item:", this);
      draggedItem = this;
      originalPlan = this.getAttribute("data-plan");
      setTimeout(() => {
        this.classList.add("dragging");
      }, 0);
      e.dataTransfer.setData("text/plain", this.getAttribute("data-id"));
    });

    item.addEventListener("dragend", function () {
      console.log("Drag ended for cloned item:", this);
      this.classList.remove("dragging");
      draggedItem = null;
      originalPlan = null;
    });
  }

  // Function to set up product explanation click event
  function setupProductExplanationListener(item) {
    const productNameElement = item.querySelector(".product-name");
    if (productNameElement) {
      productNameElement.addEventListener("click", function (e) {
        e.stopPropagation(); // Prevent drag events from interfering
        const productName = this.textContent;
        showProductExplanation(productName);
      });
    }
  }

  // Function to set up remove button event listener
  function setupRemoveButtonListener(button) {
    if (button) {
      button.addEventListener("click", function (e) {
        e.stopPropagation(); // Prevent event bubbling
        const productItem = this.closest(".feature-item");
        if (productItem) {
          productItem.remove();
        }
      });
    }
  }

  // Add click event listeners to all "Choose" buttons
  chooseButtons.forEach((button) => {
    button.addEventListener("click", function () {
      let planType = "";
      if (this.classList.contains("platinum")) planType = "Platinum";
      else if (this.classList.contains("gold")) planType = "Gold";
      else if (this.classList.contains("silver")) planType = "Silver";
      else if (this.classList.contains("bronze")) planType = "Bronze";
      else if (this.classList.contains("iron")) planType = "Iron";

      alert(`You've selected the ${planType} plan.`);
    });
  });

  // Add click event listeners to month selector dropdown items
  monthSelectors.forEach((item) => {
    item.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();

      const months = Number.parseInt(this.getAttribute("data-months"));
      const plan = this.getAttribute("data-plan");

      const termElement = document.querySelector(`.${plan}-term`);
      if (termElement) {
        termElement.textContent = `for ${months} months`;
      }

      const monthlyElement = document.querySelector(`.${plan}-monthly`);
      if (monthlyElement && paymentData[plan] && paymentData[plan][months]) {
        monthlyElement.classList.add("updating");
        setTimeout(() => {
          monthlyElement.textContent = `$${paymentData[plan][months].monthly.toFixed(2)} Monthly`;
          monthlyElement.classList.remove("updating");
        }, 300);
      }

      const dropdownItems = this.parentElement.parentElement.querySelectorAll(".dropdown-item");
      dropdownItems.forEach((dropItem) => {
        dropItem.classList.remove("active");
      });
      this.classList.add("active");

      const dropdown = this.closest(".dropdown");
      if (dropdown) {
        const toggle = dropdown.querySelector(".dropdown-toggle");
        if (toggle) {
          toggle.setAttribute("aria-expanded", "false");
          const menu = toggle.nextElementSibling;
          if (menu && menu.classList.contains("dropdown-menu")) {
            menu.style.display = "none";
          }
        }
      }
    });
  });

  // Add click event listeners to product names for showing explanations
  document.querySelectorAll(".product-name").forEach((productElement) => {
    productElement.addEventListener("click", function (e) {
      e.stopPropagation(); // Prevent drag events from interfering
      const productName = this.textContent;
      showProductExplanation(productName);
    });
  });

  // Function to show product explanation in modal
  function showProductExplanation(productName) {
    const explanation = productExplanations[productName];
    if (explanation) {
      const modalContent = document.getElementById("productExplanationContent");
      const modalTitle = document.getElementById("productExplanationModalLabel");

      modalTitle.textContent = productName;
      modalContent.innerHTML = `<p>${explanation}</p>`;

      const productModalElement = document.getElementById("productExplanationModal");
      const productModal = new bootstrap.Modal(productModalElement);
      productModal.show();
    } else {
      alert(`No explanation available for "${productName}".`);
    }
  }

  // Add click event listeners to "View Full Terms & Conditions" links
  document.querySelectorAll(".view-terms-link").forEach((link) => {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      const plan = this.getAttribute("data-plan");
      showTermsAndConditions(plan);
    });
  });

  // Function to show terms and conditions in modal
  function showTermsAndConditions(plan) {
    const termsData = termsAndConditions[plan];
    if (termsData) {
      const modalContent = document.getElementById("termsModalContent");
      const modalTitle = document.getElementById("termsModalLabel");

      modalTitle.textContent = termsData.title;
      modalContent.innerHTML = termsData.content;

      const termsModalElement = document.getElementById("termsModal");
      const termsModal = new bootstrap.Modal(termsModalElement);
      termsModal.show();
    }
  }

  // Additional remove button animation
  document.querySelectorAll(".remove-product-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const productItem = btn.closest(".feature-item");
      if (productItem) {
        productItem.classList.add("fade-out");
        setTimeout(() => {
          productItem.remove();
        }, 300);
      }
    });
  });

  // Load settings if they exist
  const loadSettings = () => {
    const savedSettings = localStorage.getItem("menuSettings");
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);

      // Apply column names
      if (settings.columnNames) {
        document.querySelectorAll("th").forEach((th) => {
          if (th.classList.contains("platinum-bg")) th.textContent = settings.columnNames.platinum;
          else if (th.classList.contains("gold-bg")) th.textContent = settings.columnNames.gold;
          else if (th.classList.contains("silver-bg")) th.textContent = settings.columnNames.silver;
          else if (th.classList.contains("bronze-bg")) th.textContent = settings.columnNames.bronze;
          else if (th.classList.contains("iron-bg")) th.textContent = settings.columnNames.iron;
        });
      }

      // Apply column visibility
      if (settings.columnVisibility) {
        const table = document.querySelector(".menu-table");
        if (table) {
          const rows = table.querySelectorAll("tr");
          rows.forEach((row) => {
            const cells = row.querySelectorAll("th, td");
            cells.forEach((cell, index) => {
              if (index === 0 && !settings.columnVisibility.platinum) cell.style.display = "none";
              else if (index === 1 && !settings.columnVisibility.gold) cell.style.display = "none";
              else if (index === 2 && !settings.columnVisibility.silver) cell.style.display = "none";
              else if (index === 3 && !settings.columnVisibility.bronze) cell.style.display = "none";
              else if (index === 4 && !settings.columnVisibility.iron) cell.style.display = "none";
            });
          });
        }
      }
    }
  };

  // Load settings when page loads
  loadSettings();

  // Add Product Functionality
// Add Product Functionality
const addProductButtons = document.querySelectorAll(".add-product-btn");
const addPlanProductModalElement = document.getElementById("addPlanProductModal");
const addPlanProductModal = new bootstrap.Modal(addPlanProductModalElement);
const addPlanProductForm = document.getElementById("addPlanProductForm");
const productSelect = document.getElementById("planProductSelect");
const targetPlanInput = document.getElementById("targetPlan");
const addPlanProductBtn = document.getElementById("addPlanProductBtn");

// List of all available products (from productExplanations)
const availableProducts = Object.keys(productExplanations);

// Function to populate the product dropdown, excluding products already in the target plan
function populateProductDropdown(plan) {
  productSelect.innerHTML = '<option value="" disabled selected>Choose a product</option>';

  // Get products currently in the target plan's column
  const targetDropzone = document.querySelector(`.kanban-dropzone[data-plan="${plan}"]`);
  const existingItems = targetDropzone.querySelectorAll(".feature-item");
  const existingProducts = Array.from(existingItems).map(
    (item) => item.querySelector(".product-name").textContent
  );

  // Filter available products to exclude those already in the column
  const productsToShow = availableProducts.filter(
    (product) => !existingProducts.includes(product)
  );

  // Optional: Restrict to products allowed by termsAndConditions
  // Uncomment the following block if you want to limit products to those specified in termsAndConditions
  /*
  const allowedProducts = termsAndConditions[plan]?.content
    .match(/<li>([^<]+)<\/li>/g)
    ?.map((li) => li.replace(/<li>|<\/li>/g, "").split(" with")[0].trim()) || [];
  const productsToShow = availableProducts.filter(
    (product) => allowedProducts.includes(product) && !existingProducts.includes(product)
  );
  */

  // Populate dropdown
  productsToShow.forEach((product) => {
    const option = document.createElement("option");
    option.value = product;
    option.textContent = product;
    productSelect.appendChild(option);
  });

  // If no products are available, disable the select and show a message
  if (productsToShow.length === 0) {
    productSelect.disabled = true;
    productSelect.innerHTML = '<option value="" disabled selected>No available products</option>';
  } else {
    productSelect.disabled = false;
  }
}

// Open the modal when clicking the "Add Product" button
addProductButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const plan = button.getAttribute("data-plan");
    targetPlanInput.value = plan;
    populateProductDropdown(plan);
    addPlanProductModal.show();
  });
});

// Handle form submission to add the selected product
addPlanProductBtn.addEventListener("click", () => {
  const productName = productSelect.value;
  const targetPlan = targetPlanInput.value;

  if (!productName) {
    alert("Please select a product.");
    return;
  }

  // Check for duplicates in the target plan (redundant due to dropdown filtering, but kept for safety)
  const targetDropzone = document.querySelector(`.kanban-dropzone[data-plan="${targetPlan}"]`);
  const existingItems = targetDropzone.querySelectorAll(".feature-item");
  let isDuplicate = false;

  existingItems.forEach((item) => {
    const existingProductName = item.querySelector(".product-name").textContent;
    if (existingProductName.toLowerCase() === productName.toLowerCase()) {
      isDuplicate = true;
    }
  });

  if (isDuplicate) {
    alert(`The product "${productName}" already exists in the ${targetPlan} plan.`);
    return;
  }

  // Create a new feature item
  const newItem = document.createElement("li");
  newItem.classList.add("feature-item");
  newItem.setAttribute("draggable", "true");
  newItem.setAttribute("data-id", `p${Date.now()}`); // Unique ID using timestamp
  newItem.setAttribute("data-plan", targetPlan);

  newItem.innerHTML = `
    <div class="feature-content">
      <span class="feature-check ${targetPlan}-check">✓</span>
      <span class="product-name">${productName}</span>
      <button class="remove-product-btn" title="Remove product"></button>
    </div>
  `;

  // Append the new item to the target dropzone
  targetDropzone.appendChild(newItem);

  // Add event listeners to the new item
  setupDragListeners(newItem);
  setupProductExplanationListener(newItem);
  setupRemoveButtonListener(newItem.querySelector(".remove-product-btn"));

  // Reset the form and close the modal
  addPlanProductForm.reset();
  addPlanProductModal.hide();
});

// Reset the form when the modal is closed
addPlanProductModalElement.addEventListener("hidden.bs.modal", () => {
  addPlanProductForm.reset();
});
});