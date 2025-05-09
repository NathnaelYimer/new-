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

  // Base Protected Payment
  const basePaymentTotal = 227.06 * 60; // Total base payment (monthly * default 60 months)
  let currentTerm = 60; // Default term

  let priceSettings = JSON.parse(localStorage.getItem("priceSettings")) || {
    platinum: { position: "top", type: "cash" },
    gold: { position: "top", type: "cash" },
    silver: { position: "top", type: "cash" },
    bronze: { position: "top", type: "cash" },
    iron: { position: "top", type: "cash" }
  };

  let currentPlan = null; // Tracks the plan being edited

  // Function to calculate total price for a plan
  function calculatePlanPrice(plan) {
    const dropzone = document.querySelector(`.kanban-dropzone[data-plan="${plan}"]`);
    const items = dropzone ? dropzone.querySelectorAll(".feature-item") : [];
    let totalPrice = 0;

    items.forEach((item) => {
      const productName = item.querySelector(".product-name").textContent;
      if (productData[productName]) {
        totalPrice += productData[productName].price;
      }
    });

    return totalPrice;
  }

  // Function to apply price settings to each column
  function applyPriceSettings() {
    ["platinum", "gold", "silver", "bronze", "iron"].forEach(plan => {
      const td = document.querySelector(`td[data-plan="${plan}"]`);
      if (td) {
        td.classList.remove("price-top", "price-bottom");
        td.classList.add(`price-${priceSettings[plan].position}`);
        updatePlanPrice(plan);
      }
    });
  }

  // Function to update plan prices in the UI
  function updatePlanPrice(plan) {
    const totalPrice = calculatePlanPrice(plan);
    const termElement = document.querySelector(`.${plan}-term`);
    const months = termElement ? parseInt(termElement.textContent.match(/\d+/)[0]) : 60;
    const monthlyPrice = totalPrice / months;

    const priceMainElement = document.querySelector(`.${plan}-price`);
    if (priceMainElement) {
      priceMainElement.innerHTML = `$${Math.floor(totalPrice)}<span class="price-cents">.${(totalPrice % 1).toFixed(2).slice(2)}</span>`;
      priceMainElement.classList.add("updating");
      setTimeout(() => priceMainElement.classList.remove("updating"), 600);
    }

    const priceDisplayElement = document.querySelector(`td[data-plan="${plan}"] .price-display`);
    if (priceDisplayElement) {
      if (priceSettings[plan].type === "cash") {
        priceDisplayElement.innerHTML = `$${Math.floor(totalPrice)}<span class="price-cents">.${(totalPrice % 1).toFixed(2).slice(2)}</span>`;
      } else if (priceSettings[plan].type === "financed") {
        priceDisplayElement.innerHTML = `$${monthlyPrice.toFixed(2)} <span class="price-term">per month for ${months} months</span>`;
      }
      priceDisplayElement.classList.add("updating");
      setTimeout(() => priceDisplayElement.classList.remove("updating"), 600);
    }
  }

  // Apply settings on load
  applyPriceSettings();

  // Make price tappable to open settings modal
  document.querySelectorAll(".price-display").forEach((priceElement) => {
    priceElement.addEventListener("click", (e) => {
      e.stopPropagation();
      currentPlan = priceElement.closest("td").getAttribute("data-plan");
      const modalLabel = document.getElementById("priceSettingsModalLabel");
      const positionInput = document.querySelector(`input[name="pricePosition"][value="${priceSettings[currentPlan].position}"]`);
      const typeInput = document.querySelector(`input[name="priceType"][value="${priceSettings[currentPlan].type}"]`);
      if (modalLabel && positionInput && typeInput) {
        modalLabel.textContent = `Price Display Settings for ${currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1)} Plan`;
        positionInput.checked = true;
        typeInput.checked = true;
        const priceSettingsModal = new bootstrap.Modal(document.getElementById("priceSettingsModal"));
        priceSettingsModal.show();
      }
    });
  });

  // Save settings when the user clicks "Save Changes"
  const savePriceSettingsBtn = document.getElementById("savePriceSettings");
  if (savePriceSettingsBtn) {
    savePriceSettingsBtn.addEventListener("click", () => {
      if (currentPlan) {
        const position = document.querySelector("input[name='pricePosition']:checked")?.value;
        const type = document.querySelector("input[name='priceType']:checked")?.value;
        if (position && type) {
          priceSettings[currentPlan] = { position, type };
          localStorage.setItem("priceSettings", JSON.stringify(priceSettings));
          applyPriceSettings();
          const priceSettingsModal = bootstrap.Modal.getInstance(document.getElementById("priceSettingsModal"));
          if (priceSettingsModal) {
            priceSettingsModal.hide();
          }
        }
      }
    });
  }

  // Function to update the Base Protected Payment display
  function updateBasePayment() {
    const monthlyBasePayment = basePaymentTotal / currentTerm;
    const basePaymentAmountElement = document.querySelector(".base-payment-amount");
    if (basePaymentAmountElement) {
      basePaymentAmountElement.innerHTML = `$${monthlyBasePayment.toFixed(2)} <span class="base-payment-term">for ${currentTerm} months</span>`;
    }
  }

  // Initial update of base payment
  updateBasePayment();

  // Add event listeners to all remove product buttons
  const setupRemoveProductListeners = () => {
    document.querySelectorAll(".remove-product-btn").forEach((button) => {
      button.addEventListener("click", function (e) {
        e.stopPropagation();
        const productItem = this.closest(".feature-item");
        if (productItem) {
          const plan = productItem.getAttribute("data-plan");
          productItem.classList.add("fade-out");
          setTimeout(() => {
            productItem.remove();
            updatePlanPrice(plan); // Update price after removal
          }, 300);
        }
      });
    });
  };

  setupRemoveProductListeners();

  // Sidebar toggle functionality
  const sidebar = document.getElementById("sidebar");
  const mainContent = document.getElementById("main-content");
  const sidebarToggle = document.getElementById("sidebar-toggle");
  const mobileToggle = document.getElementById("mobile-toggle");

  if (sidebar && mainContent) {
    sidebar.classList.add("collapsed");
    mainContent.classList.add("expanded");
  }

  if (sidebarToggle) {
    sidebarToggle.addEventListener("click", () => {
      if (sidebar && mainContent) {
        sidebar.classList.toggle("collapsed");
        mainContent.classList.toggle("expanded");
      }
    });
  }

  if (mobileToggle) {
    mobileToggle.addEventListener("click", () => {
      if (sidebar) {
        sidebar.classList.toggle("mobile-open");
      }
    });
  }

  document.addEventListener("click", (e) => {
    if (window.innerWidth <= 768 && sidebar && mobileToggle) {
      if (
        !sidebar.contains(e.target) &&
        e.target !== mobileToggle &&
        sidebar.classList.contains("mobile-open")
      ) {
        sidebar.classList.remove("mobile-open");
      }
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 768 && sidebar) {
      sidebar.classList.remove("mobile-open");
    }
    adjustTableLayout(); // Call the layout adjustment on resize
  });

  // Get all draggable items
  const draggableItems = document.querySelectorAll(".feature-item");

  // Get all dropzones
  const dropzones = document.querySelectorAll(".kanban-dropzone");

  // Get all "Choose" buttons
  const chooseButtons = document.querySelectorAll(".choose-button");

  // Get all month selectors
  const monthSelectors = document.querySelectorAll(".month-selector .dropdown-item");

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

  // Export Plan as PDF
  const exportPdfBtn = document.getElementById("export-pdf-btn");
  if (exportPdfBtn) {
    exportPdfBtn.addEventListener("click", () => {
      const modal = document.createElement("div");
      modal.className = "modal fade";
      modal.innerHTML = `
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Select Plan to Export</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              <div class="mb-3">
                <label for="planSelect" class="form-label">Choose Plan</label>
                <select class="form-select" id="planSelect">
                  <option value="platinum">Platinum</option>
                  <option value="gold">Gold</option>
                  <option value="silver">Silver</option>
                  <option value="bronze">Bronze</option>
                  <option value="iron">Iron</option>
                </select>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
              <button type="button" class="btn btn-primary" id="exportConfirmBtn">Export PDF</button>
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(modal);

      const bsModal = new bootstrap.Modal(modal);
      bsModal.show();

      const exportConfirmBtn = document.getElementById("exportConfirmBtn");
      if (exportConfirmBtn) {
        exportConfirmBtn.addEventListener("click", () => {
          const plan = document.getElementById("planSelect").value;
          generatePlanPDF(plan);
          bsModal.hide();
          modal.remove();
        });
      }

      modal.addEventListener("hidden.bs.modal", () => {
        modal.remove();
      });
    });
  }

  // Function to generate PDF for a plan
  function generatePlanPDF(plan) {
    const { jsPDF } = window.jspdf;
    
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "pt",
      format: "a4"
    });

    doc.setProperties({
      title: `${plan.charAt(0).toUpperCase() + plan.slice(1)} Plan Details`,
      subject: "Dealer Gears F&I Plan",
      author: "Dealer Gears",
      creator: "Dealer Gears"
    });

    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.text(`${plan.charAt(0).toUpperCase() + plan.slice(1)} Plan`, 40, 40);

    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("Products Included:", 40, 80);

    let yPos = 100;
    const dropzone = document.querySelector(`.kanban-dropzone[data-plan="${plan}"]`);
    const items = dropzone ? dropzone.querySelectorAll(".feature-item") : [];

    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    items.forEach((item, index) => {
      const productName = item.querySelector(".product-name").textContent;
      const description = productData[productName]?.description || "No description available.";
      doc.text(`${index + 1}. ${productName}`, 40, yPos);
      yPos += 15;
      const splitDescription = doc.splitTextToSize(description, 500);
      doc.text(splitDescription, 50, yPos);
      yPos += splitDescription.length * 12 + 10;
    });

    const totalPrice = calculatePlanPrice(plan);
    const termElement = document.querySelector(`.${plan}-term`);
    const months = termElement ? parseInt(termElement.textContent.match(/\d+/)[0]) : 60;
    const monthlyPrice = paymentData[plan][months]?.monthly || (totalPrice / months);

    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("Pricing:", 40, yPos);
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    yPos += 20;
    doc.text(`Total Price: $${totalPrice.toFixed(2)}`, 40, yPos);
    yPos += 15;
    doc.text(`Monthly Payment (${months} Months): $${monthlyPrice.toFixed(2)}`, 40, yPos);

    yPos += 30;
    if (yPos > 700) {
      doc.addPage();
      yPos = 40;
    }
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("Terms & Conditions:", 40, yPos);
    yPos += 20;
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");

    const terms = termsAndConditions[plan]?.content || "No terms available.";
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = terms;
    const plainText = tempDiv.textContent || tempDiv.innerText || "";
    const splitTerms = doc.splitTextToSize(plainText, 500);
    doc.text(splitTerms, 40, yPos);
    yPos += splitTerms.length * 12;

    doc.save(`${plan}-plan.pdf`);
  }

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
      this.style.transform = "none";
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
            return;
          }

          console.log("No duplicate found, proceeding with move...");
          const clonedItem = draggedItem.cloneNode(true);
          console.log("Cloned item:", clonedItem);

          clonedItem.setAttribute("draggable", "true");
          clonedItem.setAttribute("data-plan", targetPlan);

          const checkmark = clonedItem.querySelector(".feature-check");
          if (checkmark) {
            checkmark.className = `feature-check ${targetPlan}-check`;
          }

          const addProductWrapper = this.querySelector('.add-product-wrapper');
          if (addProductWrapper) {
            this.insertBefore(clonedItem, addProductWrapper);
            console.log("Cloned item inserted before addProductWrapper");
          } else {
            this.appendChild(clonedItem);
            console.log("Add product wrapper not found, appended to end as fallback");
          }

          draggedItem.remove();
          console.log("Original item removed");

          setupDragListeners(clonedItem);
          setupProductExplanationListener(clonedItem);
          setupRemoveButtonListener(clonedItem.querySelector(".remove-product-btn"));
          console.log("Event listeners set up on cloned item");

          updatePlanPrice(originalPlan);
          updatePlanPrice(targetPlan);
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
    if (item) {
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
  }

  // Function to set up product explanation click event
  function setupProductExplanationListener(item) {
    const productNameElement = item.querySelector(".product-name");
    if (productNameElement) {
      productNameElement.addEventListener("click", function (e) {
        e.stopPropagation();
        const productName = this.textContent;
        const plan = item.getAttribute("data-plan");
        showProductExplanation(productName, plan);
      });
    }
  }

  // Function to set up remove button event listener
  function setupRemoveButtonListener(button) {
    if (button) {
      button.addEventListener("click", function (e) {
        e.stopPropagation();
        const productItem = this.closest(".feature-item");
        if (productItem) {
          const plan = productItem.getAttribute("data-plan");
          productItem.classList.add("fade-out");
          setTimeout(() => {
            productItem.remove();
            updatePlanPrice(plan);
          }, 300);
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


// Function to reattach event listeners to dynamically created elements
function reattachEventListeners() {
  // Reattach draggable item listeners
  const draggableItems = document.querySelectorAll(".feature-item");
  draggableItems.forEach((item) => {
    item.addEventListener("dragstart", function (e) {
      draggedItem = this;
      originalPlan = this.getAttribute("data-plan");
      setTimeout(() => {
        this.classList.add("dragging");
      }, 0);
      e.dataTransfer.setData("text/plain", this.getAttribute("data-id"));
    });

    item.addEventListener("dragend", function () {
      this.classList.remove("dragging");
      this.style.transform = "none";
      draggedItem = null;
      originalPlan = null;
    });
  });

  // Reattach dropzone listeners
  const dropzones = document.querySelectorAll(".kanban-dropzone");
  dropzones.forEach((zone) => {
    zone.addEventListener("dragover", function (e) {
      e.preventDefault();
      this.classList.add("highlight");
    });

    zone.addEventListener("dragleave", function () {
      this.classList.remove("highlight");
    });

    zone.addEventListener("drop", function (e) {
      e.preventDefault();
      this.classList.remove("highlight");

      if (draggedItem) {
        const targetPlan = this.getAttribute("data-plan");

        if (originalPlan !== targetPlan) {
          const productName = draggedItem.querySelector(".product-name").textContent;
          const targetItems = this.querySelectorAll(".feature-item");
          let isDuplicate = false;

          targetItems.forEach((item) => {
            const existingProductName = item.querySelector(".product-name").textContent;
            if (existingProductName.toLowerCase() === productName.toLowerCase()) {
              isDuplicate = true;
            }
          });

          if (isDuplicate) return;

          const clonedItem = draggedItem.cloneNode(true);
          clonedItem.setAttribute("draggable", "true");
          clonedItem.setAttribute("data-plan", targetPlan);

          const checkmark = clonedItem.querySelector(".feature-check");
          if (checkmark) {
            checkmark.className = `feature-check ${targetPlan}-check`;
          }

          const addProductWrapper = this.querySelector('.add-product-wrapper');
          if (addProductWrapper) {
            this.insertBefore(clonedItem, addProductWrapper);
          } else {
            this.appendChild(clonedItem);
          }

          draggedItem.remove();

          setupDragListeners(clonedItem);
          setupProductExplanationListener(clonedItem);
          setupRemoveButtonListener(clonedItem.querySelector(".remove-product-btn"));

          updatePlanPrice(originalPlan);
          updatePlanPrice(targetPlan);
        }
      }
    });
  });

  // Reattach choose button listeners
  const chooseButtons = document.querySelectorAll(".choose-button");
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

  // Reattach month selector listeners
  const monthSelectors = document.querySelectorAll(".month-selector .dropdown-item");
  monthSelectors.forEach((item) => {
    item.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();

      const months = Number.parseInt(this.getAttribute("data-months"));
      const selectedPlan = this.getAttribute("data-plan");
      const leaderColumn = settings.columnVisibility.iron ? "iron" : "bronze";

      if (selectedPlan === leaderColumn) {
        currentTerm = months;
        const allPlans = ["platinum", "gold", "silver", "bronze", "iron"];

        allPlans.forEach((plan) => {
          const termElement = document.querySelector(`.${plan}-term`);
          if (termElement) {
            termElement.textContent = `for ${months} months`;
          }

          const dropdownItems = document.querySelectorAll(`.dropdown-item[data-plan="${plan}"]`);
          dropdownItems.forEach((dropItem) => {
            const itemMonths = Number.parseInt(dropItem.getAttribute("data-months"));
            if (itemMonths === months) {
              dropItem.classList.add("active");
            } else {
              dropItem.classList.remove("active");
            }
          });

          updatePlanPrice(plan);
        });

        updateBasePayment();
      } else {
        const termElement = document.querySelector(`.${selectedPlan}-term`);
        if (termElement) {
          termElement.textContent = `for ${months} months`;
        }

        const dropdownItems = document.querySelectorAll(`.dropdown-item[data-plan="${selectedPlan}"]`);
        dropdownItems.forEach((dropItem) => {
          const itemMonths = Number.parseInt(dropItem.getAttribute("data-months"));
          if (itemMonths === months) {
            dropItem.classList.add("active");
          } else {
            dropItem.classList.remove("active");
          }
        });

        updatePlanPrice(selectedPlan);
      }

      const dropdown = this.closest(".dropdown");
      if (dropdown) {
        const toggle = dropdown.querySelector(".dropdown-toggle");
        if (toggle) {
          toggle.click();
        }
      }
    });
  });

  // Reattach product name listeners
  document.querySelectorAll(".product-name").forEach((productElement) => {
    productElement.addEventListener("click", function (e) {
      e.stopPropagation();
      const productName = this.textContent;
      const plan = this.closest(".feature-item").getAttribute("data-plan");
      showProductExplanation(productName, plan);
    });
  });

  // Reattach remove product button listeners
  setupRemoveProductListeners();

  // Reattach view terms link listeners
  document.querySelectorAll(".view-terms-link").forEach((link) => {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      const plan = this.getAttribute("data-plan");
      showTermsAndConditions(plan);
    });
  });

  // Reattach add product button listeners
  const addProductButtons = document.querySelectorAll(".add-product-btn");
  addProductButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const plan = button.getAttribute("data-plan");
      if (targetPlanInput && addPlanProductModal) {
        targetPlanInput.value = plan;
        populateProductDropdown(plan);
        addPlanProductModal.show();
      }
    });
  });

  // Reattach price display listeners
  document.querySelectorAll(".price-display").forEach((priceElement) => {
    priceElement.addEventListener("click", (e) => {
      e.stopPropagation();
      currentPlan = priceElement.closest("td").getAttribute("data-plan");
      const modalLabel = document.getElementById("priceSettingsModalLabel");
      const positionInput = document.querySelector(`input[name="pricePosition"][value="${priceSettings[currentPlan].position}"]`);
      const typeInput = document.querySelector(`input[name="priceType"][value="${priceSettings[currentPlan].type}"]`);
      if (modalLabel && positionInput && typeInput) {
        modalLabel.textContent = `Price Display Settings for ${currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1)} Plan`;
        positionInput.checked = true;
        typeInput.checked = true;
        const priceSettingsModal = new bootstrap.Modal(document.getElementById("priceSettingsModal"));
        priceSettingsModal.show();
      }
    });
  });
}
  // Function to adjust table layout for iPad devices
let originalTableContent = null;
function adjustTableLayout() {
  const table = document.querySelector(".menu-table");
  if (!table) return;

  const isIpad = window.innerWidth <= 1024;

  // Remove Mobile Header
  if (isIpad) {
    const mobileHeader = document.querySelector(".mobile-toggle-container");
    if (mobileHeader) mobileHeader.remove();

    // Move Base Protected Payment to top-left
    const basePayment = document.querySelector(".top-base-payment-wrapper");
    if (basePayment) {
      basePayment.classList.add("base-payment-top-left");
      basePayment.classList.remove("top-base-payment-wrapper");
    }
  } else {
    // Reset Base Payment position on desktop
    const basePayment = document.querySelector(".base-payment-top-left");
    if (basePayment) {
      basePayment.classList.add("top-base-payment-wrapper");
      basePayment.classList.remove("base-payment-top-left");
    }
  }

  // iPad Table Layout
  if (isIpad) {
    if (!originalTableContent) {
      originalTableContent = table.cloneNode(true);
    }
    table.innerHTML = '';

    const plans = [
      { thClass: "iron-bg", tdDataPlan: "iron" },
      { thClass: "bronze-bg", tdDataPlan: "bronze" },
      { thClass: "silver-bg", tdDataPlan: "silver" },
      { thClass: "gold-bg", tdDataPlan: "gold" },
      { thClass: "platinum-bg", tdDataPlan: "platinum" }
    ];

    const originalHeaders = originalTableContent.querySelectorAll("thead th");
    const originalCells = originalTableContent.querySelectorAll("tbody td");

    const container = document.createElement("div");
    container.className = "menu-table-pairs";

    plans.forEach((plan) => {
      const header = Array.from(originalHeaders).find(h => h.classList.contains(plan.thClass));
      const content = Array.from(originalCells).find(c => c.getAttribute("data-plan") === plan.tdDataPlan);

      if (!header || !content) return;

      const pair = document.createElement("div");
      pair.className = "menu-table-pair";
      pair.setAttribute("data-plan", plan.tdDataPlan);

      const clonedHeader = header.cloneNode(true);
      clonedHeader.classList.add("menu-table-header");
      pair.appendChild(clonedHeader);

      const clonedContent = content.cloneNode(true);
      clonedContent.classList.add("menu-table-content");
      pair.appendChild(clonedContent);

      container.appendChild(pair);
    });

    table.appendChild(container);
  } else {
    if (originalTableContent) {
      table.innerHTML = originalTableContent.innerHTML;
      originalTableContent = null;
    }
  }

  // Reattach event listeners after layout change
  reattachEventListeners();
}
  // Add click event listeners to month selector dropdown items
// Add click event listeners to month selector dropdown items
monthSelectors.forEach((item) => {
  item.addEventListener("click", function (e) {
    e.preventDefault();
    e.stopPropagation();

    const months = Number.parseInt(this.getAttribute("data-months"));
    const selectedPlan = this.getAttribute("data-plan"); // Get the plan of the selected dropdown
    const leaderColumn = settings.columnVisibility.iron ? "iron" : "bronze"; // Determine the leader column

    if (selectedPlan === leaderColumn) {
      // If the selected column is the leader column, update all columns
      currentTerm = months;
      const allPlans = ["platinum", "gold", "silver", "bronze", "iron"];

      allPlans.forEach((plan) => {
        const termElement = document.querySelector(`.${plan}-term`);
        if (termElement) {
          termElement.textContent = `for ${months} months`;
        }

        const dropdownItems = document.querySelectorAll(`.dropdown-item[data-plan="${plan}"]`);
        dropdownItems.forEach((dropItem) => {
          const itemMonths = Number.parseInt(dropItem.getAttribute("data-months"));
          if (itemMonths === months) {
            dropItem.classList.add("active");
          } else {
            dropItem.classList.remove("active");
          }
        });

        updatePlanPrice(plan);
      });

      updateBasePayment();
    } else {
      // If the selected column is not the leader column, update only the selected column
      const termElement = document.querySelector(`.${selectedPlan}-term`);
      if (termElement) {
        termElement.textContent = `for ${months} months`;
      }

      const dropdownItems = document.querySelectorAll(`.dropdown-item[data-plan="${selectedPlan}"]`);
      dropdownItems.forEach((dropItem) => {
        const itemMonths = Number.parseInt(dropItem.getAttribute("data-months"));
        if (itemMonths === months) {
          dropItem.classList.add("active");
        } else {
          dropItem.classList.remove("active");
        }
      });

      updatePlanPrice(selectedPlan);
    }

    const dropdown = this.closest(".dropdown");
    if (dropdown) {
      const toggle = dropdown.querySelector(".dropdown-toggle");
      if (toggle) {
        toggle.click();
      }
    }
  });
});

  // Add click event listeners to product names for showing explanations
  document.querySelectorAll(".product-name").forEach((productElement) => {
    productElement.addEventListener("click", function (e) {
      e.stopPropagation();
      const productName = this.textContent;
      const plan = this.closest(".feature-item").getAttribute("data-plan");
      showProductExplanation(productName, plan);
    });
  });

  // Function to show product explanation in modal
  function showProductExplanation(productName, plan) {
    const explanation = productExplanations[productName];
    if (explanation) {
      const modalContent = document.getElementById("productExplanationContent");
      const modalTitle = document.getElementById("productExplanationModalLabel");
      const removeProductBtn = document.querySelector(".remove-product-btn-modal");

      if (modalContent && modalTitle && removeProductBtn) {
        modalTitle.textContent = productName;
        modalContent.innerHTML = `<p>${explanation}</p>`;
        removeProductBtn.setAttribute("data-product", productName);
        removeProductBtn.setAttribute("data-plan", plan);
        removeProductBtn.textContent = `Remove ${productName}`;

        const productModalElement = document.getElementById("productExplanationModal");
        if (productModalElement) {
          const productModal = new bootstrap.Modal(productModalElement);
          productModal.show();
        }
      } else {
        alert(`No explanation available for "${productName}".`);
      }
    } else {
      alert(`No explanation available for "${productName}".`);
    }
  }

  // Add click event listener to the Remove Product button in the modal
  const removeProductBtn = document.querySelector(".remove-product-btn-modal");
  if (removeProductBtn) {
    removeProductBtn.addEventListener("click", function () {
      const productName = this.getAttribute("data-product");
      const plan = this.getAttribute("data-plan");

      const dropzone = document.querySelector(`.kanban-dropzone[data-plan="${plan}"]`);
      const featureItems = dropzone ? dropzone.querySelectorAll(".feature-item") : [];
      let productItem = null;

      featureItems.forEach((item) => {
        const itemProductName = item.querySelector(".product-name").textContent;
        if (itemProductName === productName) {
          productItem = item;
        }
      });

      if (productItem) {
        productItem.classList.add("fade-out");
        setTimeout(() => {
          productItem.remove();
          updatePlanPrice(plan);
        }, 300);

        const productModalElement = document.getElementById("productExplanationModal");
        const productModal = bootstrap.Modal.getInstance(productModalElement);
        if (productModal) {
          productModal.hide();
        }
      }
    });
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

      if (modalContent && modalTitle) {
        modalTitle.textContent = termsData.title;
        modalContent.innerHTML = termsData.content;

        const termsModalElement = document.getElementById("termsModal");
        if (termsModalElement) {
          const termsModal = new bootstrap.Modal(termsModalElement);
          termsModal.show();
        }
      }
    }
  }

  // Add Product Functionality
  const addProductButtons = document.querySelectorAll(".add-product-btn");
  const addPlanProductModalElement = document.getElementById("addPlanProductModal");
  const addPlanProductModal = addPlanProductModalElement ? new bootstrap.Modal(addPlanProductModalElement) : null;
  const addPlanProductForm = document.getElementById("addPlanProductForm");
  const productSelect = document.getElementById("planProductSelect");
  const targetPlanInput = document.getElementById("targetPlan");
  const addPlanProductBtn = document.getElementById("addPlanProductBtn");

  // List of all available products
  const availableProducts = Object.keys(productExplanations);

  // Function to populate the product dropdown
  function populateProductDropdown(plan) {
    if (productSelect) {
      productSelect.innerHTML = '<option value="" disabled selected>Choose a product</option>';

      const targetDropzone = document.querySelector(`.kanban-dropzone[data-plan="${plan}"]`);
      const existingItems = targetDropzone ? targetDropzone.querySelectorAll(".feature-item") : [];
      const existingProducts = Array.from(existingItems).map(
        (item) => item.querySelector(".product-name").textContent
      );

      const productsToShow = availableProducts.filter(
        (product) => !existingProducts.includes(product)
      );

      productsToShow.forEach((product) => {
        const option = document.createElement("option");
        option.value = product;
        option.textContent = product;
        productSelect.appendChild(option);
      });

      if (productsToShow.length === 0) {
        productSelect.disabled = true;
        productSelect.innerHTML = '<option value="" disabled selected>No available products</option>';
      } else {
        productSelect.disabled = false;
      }
    }
  }

  // Open the modal when clicking the "Add Product" button
  addProductButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const plan = button.getAttribute("data-plan");
      if (targetPlanInput && addPlanProductModal) {
        targetPlanInput.value = plan;
        populateProductDropdown(plan);
        addPlanProductModal.show();
      }
    });
  });

  // Handle form submission to add the selected product
  if (addPlanProductBtn) {
    addPlanProductBtn.addEventListener("click", () => {
      const productName = productSelect?.value;
      const targetPlan = targetPlanInput?.value;

      if (!productName) {
        alert("Please select a product.");
        return;
      }

      const targetDropzone = document.querySelector(`.kanban-dropzone[data-plan="${targetPlan}"]`);
      const addProductWrapper = targetDropzone?.querySelector(".add-product-wrapper");
      const existingItems = targetDropzone ? targetDropzone.querySelectorAll(".feature-item") : [];
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

      const newItem = document.createElement("li");
      newItem.classList.add("feature-item");
      newItem.setAttribute("draggable", "true");
      newItem.setAttribute("data-id", `p${Date.now()}`);
      newItem.setAttribute("data-plan", targetPlan);

      newItem.innerHTML = `
        <div class="feature-content">
          <span class="feature-check ${targetPlan}-check">✓</span>
          <span class="product-name">${productName}</span>
          <button class="remove-product-btn" title="Remove product"></button>
        </div>
      `;

      if (addProductWrapper) {
        targetDropzone.insertBefore(newItem, addProductWrapper);
      } else if (targetDropzone) {
        targetDropzone.appendChild(newItem);
      }

      setupDragListeners(newItem);
      setupProductExplanationListener(newItem);
      setupRemoveButtonListener(newItem.querySelector(".remove-product-btn"));

      updatePlanPrice(targetPlan);

      if (addPlanProductForm) {
        addPlanProductForm.reset();
      }
      if (addPlanProductModal) {
        addPlanProductModal.hide();
      }
    });
  }

  // Reset the form when the modal is closed
  if (addPlanProductModalElement) {
    addPlanProductModalElement.addEventListener("hidden.bs.modal", () => {
      if (addPlanProductForm) {
        addPlanProductForm.reset();
      }
    });
  }

  // Load settings if they exist
  const loadSettings = () => {
    let savedSettings = localStorage.getItem("menuSettings");
    let settings;

    if (!savedSettings) {
      settings = {
        columnVisibility: {
          platinum: true,
          gold: true,
          silver: true,
          bronze: true,
          iron: false
        },
        columnNames: {
          platinum: "Platinum",
          gold: "Gold",
          silver: "Silver",
          bronze: "Bronze",
          iron: "Iron"
        }
      };
      localStorage.setItem("menuSettings", JSON.stringify(settings));
    } else {
      settings = JSON.parse(savedSettings);
    }

    if (settings.columnVisibility) {
      const table = document.querySelector(".menu-table");
      if (table) {
        const rows = table.querySelectorAll("tr");
        rows.forEach((row) => {
          const cells = row.querySelectorAll("th, td");
          cells.forEach((cell, index) => {
            if (index === 0 && !settings.columnVisibility.iron) cell.style.display = "none";
            else if (index === 1 && !settings.columnVisibility.bronze) cell.style.display = "none";
            else if (index === 2 && !settings.columnVisibility.silver) cell.style.display = "none";
            else if (index === 3 && !settings.columnVisibility.gold) cell.style.display = "none";
            else if (index === 4 && !settings.columnVisibility.platinum) cell.style.display = "none";
            else cell.style.display = "";
          });
        });
      }
    }

    if (settings.columnNames) {
      document.querySelectorAll(".menu-table th").forEach((th, index) => {
        if (index === 0) th.textContent = settings.columnNames.iron;
        else if (index === 1) th.textContent = settings.columnNames.bronze;
        else if (index === 2) th.textContent = settings.columnNames.silver;
        else if (index === 3) th.textContent = settings.columnNames.gold;
        else if (index === 4) th.textContent = settings.columnNames.platinum;
      });
    }
  };

  // Call the function to apply settings on page load
  loadSettings();
  // Call the layout adjustment on page load
adjustTableLayout();
});