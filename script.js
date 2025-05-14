document.addEventListener("DOMContentLoaded", () => {
  // Check for Bootstrap availability
  if (typeof bootstrap === "undefined") {
    console.error("Bootstrap JavaScript not loaded.");
    alert("The application requires Bootstrap to function correctly. Please check your setup.");
    return;
  }

  try {
    // Remove lingering modal backdrops and reset body styles
    document.querySelectorAll(".modal-backdrop").forEach(backdrop => backdrop.remove());
    document.body.classList.remove("modal-open");
    document.body.style.overflow = "";
    document.body.style.paddingRight = "";

    // Default settings with version
    const defaultSettings = {
      version: "1.0",
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
      },
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

    // Validate and parse localStorage
    let settings;
    try {
      const savedSettings = localStorage.getItem("menuSettings");
      if (!savedSettings) {
        console.warn("No menuSettings found in localStorage, initializing with default");
        settings = defaultSettings;
        localStorage.setItem("menuSettings", JSON.stringify(settings));
      } else {
        settings = JSON.parse(savedSettings);
        if (settings.version !== "1.0" || !settings.productData || !settings.productAssignments) {
          console.warn("Invalid menuSettings version or structure, resetting to default");
          settings = defaultSettings;
          localStorage.setItem("menuSettings", JSON.stringify(settings));
        } else {
          if (typeof settings.productData !== "object" || Object.keys(settings.productData).length === 0) {
            console.warn("Invalid or missing productData in localStorage, using default");
            settings.productData = defaultSettings.productData;
          }
          if (typeof settings.productAssignments !== "object" || Object.keys(settings.productAssignments).length === 0) {
            console.warn("Invalid or missing productAssignments in localStorage, using default");
            settings.productAssignments = defaultSettings.productAssignments;
          }
          if (typeof settings.columnVisibility !== "object") {
            console.warn("Invalid or missing columnVisibility in localStorage, using default");
            settings.columnVisibility = defaultSettings.columnVisibility;
          }
          if (typeof settings.columnNames !== "object") {
            console.warn("Invalid or missing columnNames in localStorage, using default");
            settings.columnNames = defaultSettings.columnNames;
          }
          localStorage.setItem("menuSettings", JSON.stringify(settings));
        }
      }
    } catch (e) {
      console.error("Error parsing menuSettings from localStorage:", e);
      settings = defaultSettings;
      localStorage.setItem("menuSettings", JSON.stringify(settings));
    }

    let productData = settings.productData;
    let productAssignments = settings.productAssignments;

    // Base Protected Payment
    const basePaymentTotal = 227.06 * 60;
    let currentTerm = 60;

    let priceSettings = JSON.parse(localStorage.getItem("priceSettings")) || {
      platinum: { position: "top", type: "cash" },
      gold: { position: "top", type: "cash" },
      silver: { position: "top", type: "cash" },
      bronze: { position: "top", type: "cash" },
      iron: { position: "top", type: "cash" }
    };

    let currentPlan = null;
    let currentProduct = null;

    // Synchronize localStorage across tabs
    window.addEventListener("storage", (e) => {
      if (e.key === "menuSettings" || e.key === "priceSettings") {
        console.log("Local storage updated in another tab, reloading settings...");
        loadSettings();
        applyPriceSettings();
        adjustTableLayout();
        initializeDragAndDrop();
        populateAllAddProductDropdowns();
      }
    });

    // Calculate total price for a plan using settings.productAssignments
    const calculatePlanPrice = (plan) => {
      if (!settings.productAssignments[plan]) {
        console.warn(`No product assignments for plan ${plan}`);
        return 0;
      }
      return settings.productAssignments[plan].reduce((total, productName) => {
        const product = settings.productData[productName];
        if (!product) {
          console.warn(`Product "${productName}" not found in productData for plan ${plan}`);
          return total;
        }
        return total + product.price;
      }, 0);
    };

    // Apply price settings to each column
    const applyPriceSettings = () => {
      ["platinum", "gold", "silver", "bronze", "iron"].forEach(plan => {
        const td = document.querySelector(`td[data-plan="${plan}"]`);
        if (td) {
          td.classList.remove("price-top", "price-bottom");
          td.classList.add(`price-${priceSettings[plan].position}`);
          updatePlanPrice(plan);
        }
      });
    };

    // Update plan prices in the UI
    const updatePlanPrice = (plan) => {
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
    };

    // Apply settings on load with delay
    setTimeout(() => {
      applyPriceSettings();
    }, 100);

    // Product explanations data
    const productExplanations = productData
      ? Object.fromEntries(
          Object.entries(productData).map(([name, data]) => [name, data.description])
        )
      : {};

    // List of all available products
    const availableProducts = productData ? Object.keys(productData) : [];

    // Update Base Protected Payment display
    const updateBasePayment = () => {
      const monthlyBasePayment = basePaymentTotal / currentTerm;
      const basePaymentAmountElement = document.querySelector(".base-payment-amount");
      if (basePaymentAmountElement) {
        basePaymentAmountElement.innerHTML = `$${monthlyBasePayment.toFixed(2)} <span class="base-payment-term">for ${currentTerm} months</span>`;
      }
    };

    // Initial update of base payment
    updateBasePayment();

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

    // Debounce utility
    const debounce = (func, wait) => {
      let timeout;
      return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
      };
    };

    window.addEventListener("resize", debounce(() => {
      if (window.innerWidth > 768 && sidebar) {
        sidebar.classList.remove("mobile-open");
      }
      adjustTableLayout();
    }, 100));

    // Variable to store the currently dragged item
    let draggedItem = null;
    let originalPlan = null;
    const trashZone = document.getElementById("trashZone");

    // Payment data by plan and term
    const paymentData = {
      platinum: {
        36: { monthly: 620.15 },
        48: { monthly: 485.25 },
        60: { monthly: 407.05 },
        63: { monthly: 390.45 },
        72: { monthly: 350.75 },
        75: { monthly: 340.15 },
        84: { monthly: 310.25 }
      },
      gold: {
        36: { monthly: 535.75 },
        48: { monthly: 420.5 },
        60: { monthly: 352.25 },
        63: { monthly: 338.15 },
        72: { monthly: 303.25 },
        75: { monthly: 294.15 },
        84: { monthly: 268.35 }
      },
      silver: {
        36: { monthly: 487.25 },
        48: { monthly: 382.35 },
        60: { monthly: 320.17 },
        63: { monthly: 307.45 },
        72: { monthly: 275.65 },
        75: { monthly: 267.35 },
        84: { monthly: 244.1 }
      },
      bronze: {
        36: { monthly: 446.5 },
        48: { monthly: 350.25 },
        60: { monthly: 293.5 },
        63: { monthly: 281.75 },
        72: { monthly: 252.45 },
        75: { monthly: 245.1 },
        84: { monthly: 223.65 }
      },
      iron: {
        36: { monthly: 417.75 },
        48: { monthly: 327.85 },
        60: { monthly: 274.5 },
        63: { monthly: 263.45 },
        72: { monthly: 236.15 },
        75: { monthly: 229.25 },
        84: { monthly: 209.1 }
      }
    };

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
        `
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
        `
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
        `
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
        `
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
        `
      }
    };

    // Modal cleanup with ARIA attributes
    const priceSettingsModalElement = document.getElementById("priceSettingsModal");
    if (priceSettingsModalElement) {
      priceSettingsModalElement.setAttribute("aria-modal", "true");
      priceSettingsModalElement.setAttribute("role", "dialog");
      priceSettingsModalElement.addEventListener("hidden.bs.modal", () => {
        document.querySelectorAll(".modal-backdrop").forEach(backdrop => backdrop.remove());
        document.body.classList.remove("modal-open");
        document.body.style.overflow = "";
        document.body.style.paddingRight = "";
        if (currentPlan) {
          const priceDisplay = document.querySelector(`td[data-plan="${currentPlan}"] .price-display`);
          if (priceDisplay) {
            priceDisplay.focus();
          }
        }
      }, { once: false });
    }

    const productExplanationModalElement = document.getElementById("productExplanationModal");
    if (productExplanationModalElement) {
      productExplanationModalElement.setAttribute("aria-modal", "true");
      productExplanationModalElement.setAttribute("role", "dialog");
      productExplanationModalElement.addEventListener("hidden.bs.modal", () => {
        document.querySelectorAll(".modal-backdrop").forEach(backdrop => backdrop.remove());
        document.body.classList.remove("modal-open");
        document.body.style.overflow = "";
        document.body.style.paddingRight = "";
        const productName = document.querySelector(".remove-product-btn-modal")?.getAttribute("data-product");
        if (productName) {
          const triggerElement = document.querySelector(`.product-name:not(.remove-product-btn-modal)`);
          if (triggerElement) {
            triggerElement.focus();
          }
        }
      }, { once: false });
    }

    const termsModalElement = document.getElementById("termsModal");
    if (termsModalElement) {
      termsModalElement.setAttribute("aria-modal", "true");
      termsModalElement.setAttribute("role", "dialog");
      termsModalElement.addEventListener("hidden.bs.modal", () => {
        document.querySelectorAll(".modal-backdrop").forEach(backdrop => backdrop.remove());
        document.body.classList.remove("modal-open");
        document.body.style.overflow = "";
        document.body.style.paddingRight = "";
        const plan = document.querySelector(".view-terms-link")?.getAttribute("data-plan");
        if (plan) {
          const triggerElement = document.querySelector(`.view-terms-link[data-plan="${plan}"]`);
          if (triggerElement) {
            triggerElement.focus();
          }
        }
      }, { once: false });
    }

    // Export Plan as PDF
    const exportPdfBtn = document.getElementById("export-pdf-btn");
    if (exportPdfBtn) {
      exportPdfBtn.addEventListener("click", () => {
        const modal = document.createElement("div");
        modal.className = "modal fade";
        modal.setAttribute("aria-modal", "true");
        modal.setAttribute("role", "dialog");
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

        modal.addEventListener("hidden.bs.modal", () => {
          document.querySelectorAll(".modal-backdrop").forEach(backdrop => backdrop.remove());
          document.body.classList.remove("modal-open");
          document.body.style.overflow = "";
          document.body.style.paddingRight = "";
          modal.remove();
          exportPdfBtn.focus();
        }, { once: true });

        const exportConfirmBtn = document.getElementById("exportConfirmBtn");
        if (exportConfirmBtn) {
          exportConfirmBtn.addEventListener("click", () => {
            const plan = document.getElementById("planSelect").value;
            generatePlanPDF(plan);
            bsModal.hide();
          });
        }
      });
    }

    // Generate PDF for a plan
    const generatePlanPDF = (plan) => {
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
    };

    // Initialize drag-and-drop with event delegation
    const initializeDragAndDrop = () => {
      const menuTable = document.querySelector(".menu-table");
      if (!menuTable) {
        console.warn("Menu table not found for drag-and-drop initialization");
        return;
      }

      // Remove old listeners to prevent duplicates
      menuTable.removeEventListener("dragstart", handleDragStart);
      menuTable.removeEventListener("dragend", handleDragEnd);
      menuTable.removeEventListener("dragover", handleDragOver);
      menuTable.removeEventListener("dragenter", handleDragEnter);
      menuTable.removeEventListener("dragleave", handleDragLeave);
      menuTable.removeEventListener("drop", handleDrop);
      menuTable.removeEventListener("click", handleClick);

      // Add delegated listeners
      menuTable.addEventListener("dragstart", handleDragStart);
      menuTable.addEventListener("dragend", handleDragEnd);
      menuTable.addEventListener("dragover", handleDragOver);
      menuTable.addEventListener("dragenter", handleDragEnter);
      menuTable.addEventListener("dragleave", handleDragLeave);
      menuTable.addEventListener("drop", handleDrop);
      menuTable.addEventListener("click", handleClick);

      // Trash zone listeners
      if (trashZone) {
        trashZone.removeEventListener("dragover", handleDragOver);
        trashZone.removeEventListener("dragenter", handleTrashEnter);
        trashZone.removeEventListener("dragleave", handleTrashLeave);
        trashZone.removeEventListener("drop", handleTrashDrop);

        trashZone.addEventListener("dragover", handleDragOver);
        trashZone.addEventListener("dragenter", handleTrashEnter);
        trashZone.addEventListener("dragleave", handleTrashLeave);
        trashZone.addEventListener("drop", handleTrashDrop);
      }
    };

    const handleDragStart = (e) => {
      const item = e.target.closest(".feature-item");
      if (!item) return;
      draggedItem = item;
      originalPlan = item.getAttribute("data-plan");
      item.classList.add("dragging");
      e.dataTransfer.setData("text/plain", item.getAttribute("data-product") || item.querySelector(".product-name").textContent);
      setTimeout(() => {
        item.style.display = "none";
      }, 0);
      if (trashZone) {
        trashZone.style.display = "flex";
      }
    };

    const handleDragEnd = (e) => {
      if (!draggedItem) return;
      draggedItem.classList.remove("dragging");
      draggedItem.style.display = "";
      document.querySelectorAll(".kanban-dropzone").forEach(zone => {
        zone.classList.remove("highlight");
      });
      if (trashZone) {
        trashZone.style.display = "none";
        trashZone.classList.remove("active");
      }
      draggedItem = null;
      originalPlan = null;
    };

    const handleDragOver = (e) => {
      if (e.target.closest(".kanban-dropzone") || e.target.closest("#trashZone")) {
        e.preventDefault();
      }
    };

    const handleDragEnter = (e) => {
      const zone = e.target.closest(".kanban-dropzone");
      if (zone) {
        e.preventDefault();
        zone.classList.add("highlight");
      }
    };

    const handleDragLeave = (e) => {
      const zone = e.target.closest(".kanban-dropzone");
      if (zone) {
        zone.classList.remove("highlight");
      }
    };

    const handleTrashEnter = (e) => {
      e.preventDefault();
      trashZone.classList.add("active");
    };

    const handleTrashLeave = () => {
      trashZone.classList.remove("active");
    };

    const handleDrop = (e) => {
      e.preventDefault();
      const dropzone = e.target.closest(".kanban-dropzone");
      if (!dropzone || !draggedItem) return;

      const targetPlan = dropzone.getAttribute("data-plan");
      const productName = draggedItem.querySelector(".product-name").textContent;

      dropzone.classList.remove("highlight");

      if (targetPlan === originalPlan) {
        return; // No action if dropped in the same column
      }

      // Remove product from original plan
      settings.productAssignments[originalPlan] = settings.productAssignments[originalPlan].filter(
        p => p !== productName
      );

      // Check if product exists in target plan
      const existingProduct = Array.from(dropzone.querySelectorAll(".feature-item")).find(
        item => item.querySelector(".product-name").textContent === productName
      );

      if (existingProduct) {
        // Product exists: animate it and remove dragged item
        existingProduct.classList.add("highlight-existing");
        setTimeout(() => existingProduct.classList.remove("highlight-existing"), 600);
        draggedItem.remove();
      } else {
        // Product doesn't exist: move it to target plan
        settings.productAssignments[targetPlan].push(productName);
        const addProductWrapper = dropzone.querySelector(".add-product-wrapper");
        if (addProductWrapper) {
          dropzone.insertBefore(draggedItem, addProductWrapper);
        } else {
          dropzone.appendChild(draggedItem);
        }
        draggedItem.setAttribute("data-plan", targetPlan);
        const checkmark = draggedItem.querySelector(".feature-check");
        if (checkmark) {
          checkmark.className = `feature-check ${targetPlan}-check`;
        }
      }

      // Update localStorage and prices
      localStorage.setItem("menuSettings", JSON.stringify(settings));
      updatePlanPrice(originalPlan);
      updatePlanPrice(targetPlan);
      populateAllAddProductDropdowns(); // Refresh dropdowns
    };

    const handleTrashDrop = (e) => {
      e.preventDefault();
      if (!draggedItem) return;

      const productName = draggedItem.querySelector(".product-name").textContent;
      const plan = draggedItem.getAttribute("data-plan");

      // Remove product from its plan
      settings.productAssignments[plan] = settings.productAssignments[plan].filter(
        p => p !== productName
      );
      draggedItem.remove();

      // Update localStorage and prices
      localStorage.setItem("menuSettings", JSON.stringify(settings));
      updatePlanPrice(plan);
      populateAllAddProductDropdowns(); // Refresh dropdowns
      trashZone.classList.remove("active");
    };

    const handleClick = (e) => {
      if (e.target.closest(".product-name") && !e.target.closest(".remove-product-btn-modal")) {
        const productElement = e.target.closest(".product-name");
        e.stopPropagation();
        const productName = productElement.textContent;
        const plan = productElement.closest(".feature-item").getAttribute("data-plan");
        showProductExplanation(productName, plan, productElement);
      } else if (e.target.closest(".choose-button")) {
        const button = e.target.closest(".choose-button");
        let planType = "";
        if (button.classList.contains("platinum")) planType = "Platinum";
        else if (button.classList.contains("gold")) planType = "Gold";
        else if (button.classList.contains("silver")) planType = "Silver";
        else if (button.classList.contains("bronze")) planType = "Bronze";
        else if (button.classList.contains("iron")) planType = "Iron";
        alert(`You've selected the ${planType} plan.`);
      } else if (e.target.closest(".price-display")) {
        const priceElement = e.target.closest(".price-display");
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
      } else if (e.target.closest(".remove-product-btn")) {
        const button = e.target.closest(".remove-product-btn");
        e.stopPropagation();
        const productItem = button.closest(".feature-item");
        if (productItem) {
          const plan = productItem.getAttribute("data-plan");
          const productName = productItem.querySelector(".product-name").textContent;
          productItem.classList.add("fade-out");
          setTimeout(() => {
            productItem.remove();
            settings.productAssignments[plan] = settings.productAssignments[plan].filter(
              p => p !== productName
            );
            localStorage.setItem("menuSettings", JSON.stringify(settings));
            updatePlanPrice(plan);
            populateAllAddProductDropdowns();
          }, 300);
        }
      } else if (e.target.closest(".view-terms-link")) {
        const link = e.target.closest(".view-terms-link");
        e.preventDefault();
        const plan = link.getAttribute("data-plan");
        showTermsAndConditions(plan, link);
      }
    };

    // Initialize static event listeners once
    const initializeStaticListeners = () => {
      document.querySelectorAll(".month-selector .dropdown-item").forEach((item) => {
        item.addEventListener("click", handleMonthSelectorClick);
      });

      // Attach delegated listener for add product dropdown items
      document.querySelector(".menu-table").addEventListener("click", (e) => {
        const dropdownItem = e.target.closest(".add-product-selector .dropdown-item");
        if (dropdownItem) {
          handleAddProductClick(e);
        }
      });

      // Add event listener for save price button
      const savePriceBtn = document.getElementById("saveProductPrice");
      if (savePriceBtn) {
        savePriceBtn.addEventListener("click", handleSaveProductPrice);
      }
    };

    // Handle saving product price
    const handleSaveProductPrice = () => {
      if (!currentProduct) return;
      
      const priceInput = document.getElementById("productPriceInput");
      if (!priceInput) return;
      
      const newPrice = parseFloat(priceInput.value);
      if (isNaN(newPrice) || newPrice <= 0) {
        alert("Please enter a valid price");
        return;
      }
      
      // Update the product price in settings
      if (settings.productData[currentProduct]) {
        settings.productData[currentProduct].price = newPrice;
        localStorage.setItem("menuSettings", JSON.stringify(settings));
        
        // Update all plan prices that contain this product
        ["platinum", "gold", "silver", "bronze", "iron"].forEach(plan => {
          if (settings.productAssignments[plan].includes(currentProduct)) {
            updatePlanPrice(plan);
          }
        });
        
        // Close the modal
        const productModal = bootstrap.Modal.getInstance(document.getElementById("productExplanationModal"));
        if (productModal) {
          productModal.hide();
        }
      }
    };

    const handleMonthSelectorClick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      const months = Number.parseInt(e.target.getAttribute("data-months"));
      const selectedPlan = e.target.getAttribute("data-plan");
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

      const dropdown = e.target.closest(".dropdown");
      if (dropdown) {
        const toggle = dropdown.querySelector(".dropdown-toggle");
        if (toggle) {
          toggle.click();
        }
      }
    };

    // Populate add product dropdown for a specific plan
    const populateAddProductDropdown = (plan) => {
      console.log(`Populating dropdown for plan: ${plan}`);
      const selector = document.querySelector(`.add-product-selector.${plan}`);
      if (!selector) {
        console.warn(`Add product selector not found for plan ${plan}`);
        return;
      }

      const dropdownMenu = selector.querySelector(".dropdown-menu");
      if (!dropdownMenu) {
        console.warn(`Dropdown menu not found for plan ${plan}`);
        return;
      }

      dropdownMenu.innerHTML = '';

      const targetDropzone = document.querySelector(`.kanban-dropzone[data-plan="${plan}"]`);
      const existingItems = targetDropzone ? targetDropzone.querySelectorAll(".feature-item") : [];
      const existingProducts = Array.from(existingItems).map(
        (item) => item.querySelector(".product-name").textContent
      );

      const productsToShow = availableProducts.filter(
        (product) => !existingProducts.includes(product)
      );

      console.log(`Available products for ${plan}:`, productsToShow);

      if (productsToShow.length === 0) {
        const li = document.createElement("li");
        li.innerHTML = '<span class="dropdown-item disabled">No available products</span>';
        dropdownMenu.appendChild(li);
      } else {
        productsToShow.forEach((product) => {
          const li = document.createElement("li");
          li.innerHTML = `<a class="dropdown-item" href="#" data-plan="${plan}" data-product="${product}">${product}</a>`;
          dropdownMenu.appendChild(li);
        });
      }
    };

    // Populate all add product dropdowns
    const populateAllAddProductDropdowns = () => {
      const plans = ["platinum", "gold", "silver", "bronze", "iron"];
      plans.forEach(plan => {
        if (settings.columnVisibility[plan]) {
          populateAddProductDropdown(plan);
        }
      });
    };

    // Handle add product click from dropdown
    const handleAddProductClick = (e) => {
      e.preventDefault();
      e.stopPropagation();

      const productName = e.target.getAttribute("data-product");
      const targetPlan = e.target.getAttribute("data-plan");

      console.log(`Adding product "${productName}" to plan "${targetPlan}"`);

      if (!productName || !targetPlan) {
        console.error("Missing productName or targetPlan");
        alert("Please select a valid product and plan.");
        return;
      }

      const targetDropzone = document.querySelector(`.kanban-dropzone[data-plan="${targetPlan}"]`);
      if (!targetDropzone) {
        console.error(`Dropzone not found for plan ${targetPlan}`);
        return;
      }

      const addProductWrapper = targetDropzone.querySelector(".add-product-wrapper");
      const existingItems = targetDropzone.querySelectorAll(".feature-item");
      let isDuplicate = false;

      existingItems.forEach((item) => {
        const existingProductName = item.querySelector(".product-name").textContent;
        if (existingProductName.toLowerCase() === productName.toLowerCase()) {
          isDuplicate = true;
        }
      });

      if (isDuplicate) {
        console.warn(`Product "${productName}" already exists in ${targetPlan} plan`);
        alert(`The product "${productName}" already exists in the ${targetPlan} plan.`);
        return;
      }

      const newItem = document.createElement("li");
      newItem.classList.add("feature-item");
      newItem.setAttribute("draggable", "true");
      newItem.setAttribute("data-id", `p${Date.now()}`);
      newItem.setAttribute("data-plan", targetPlan);
      newItem.setAttribute("data-product", productName);

      newItem.innerHTML = `
        <div class="feature-content">
          <span class="feature-check ${targetPlan}-check">✓</span>
          <span class="product-name">${productName}</span>
        </div>
      `;

      if (addProductWrapper) {
        targetDropzone.insertBefore(newItem, addProductWrapper);
      } else {
        targetDropzone.appendChild(newItem);
      }

      // Update productAssignments
      settings.productAssignments[targetPlan].push(productName);
      localStorage.setItem("menuSettings", JSON.stringify(settings));

      console.log(`Updated productAssignments for ${targetPlan}:`, settings.productAssignments[targetPlan]);

      setupProductExplanationListener(newItem);

      updatePlanPrice(targetPlan);
      populateAllAddProductDropdowns(); // Refresh all dropdowns after adding

      const dropdown = e.target.closest(".dropdown");
      if (dropdown) {
        const toggle = dropdown.querySelector(".dropdown-toggle");
        if (toggle) {
          toggle.click(); // Close the dropdown after selection
        }
      }
    };

    // Save price settings
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
    };

    // Show product explanation in modal
    const showProductExplanation = (productName, plan, triggerElement) => {
      const productData = settings.productData[productName];
      if (productData) {
        const modalContent = document.getElementById("productExplanationContent");
        const modalTitle = document.getElementById("productExplanationModalLabel");
        const removeProductBtn = document.querySelector(".remove-product-btn-modal");

        if (modalContent && modalTitle && removeProductBtn) {
          // Store current product for price editing
          currentProduct = productName;
          
          modalTitle.textContent = productName;
          
          // Add price editing functionality
          const currentPrice = productData.price;
          modalContent.innerHTML = `
            <div class="mb-3">
              <p>${productData.description}</p>
              <div class="mt-4">
                <label for="productPriceInput" class="form-label">Product Price ($)</label>
                <div class="input-group">
                  <span class="input-group-text">$</span>
                  <input type="number" class="form-control" id="productPriceInput" value="${currentPrice.toFixed(2)}" step="0.01" min="0">
                </div>
              </div>
            </div>
          `;
          
          // Add save price button if it doesn't exist
          let saveBtn = document.getElementById("saveProductPrice");
          if (!saveBtn) {
            saveBtn = document.createElement("button");
            saveBtn.id = "saveProductPrice";
            saveBtn.className = "btn btn-primary";
            saveBtn.textContent = "Save Price";
            saveBtn.addEventListener("click", handleSaveProductPrice);
            
            // Insert before the close button
            const closeBtn = document.querySelector("#productExplanationModal .modal-footer .btn-secondary");
            if (closeBtn) {
              closeBtn.parentNode.insertBefore(saveBtn, closeBtn);
            }
          }
          
          removeProductBtn.setAttribute("data-product", productName);
          removeProductBtn.setAttribute("data-plan", plan);
          removeProductBtn.textContent = `Remove ${productName}`;
          removeProductBtn.style.display = "inline-block"; // Ensure button is visible

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
    };

    // Remove product from modal
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
            // Update productAssignments
            settings.productAssignments[plan] = settings.productAssignments[plan].filter(
              p => p !== productName
            );
            localStorage.setItem("menuSettings", JSON.stringify(settings));
            updatePlanPrice(plan);
            populateAllAddProductDropdowns(); // Refresh dropdowns after removal
          }, 300);

          const productModalElement = document.getElementById("productExplanationModal");
          const productModal = bootstrap.Modal.getInstance(productModalElement);
          if (productModal) {
            productModal.hide();
          }
        }
      });
    }

    // Show terms and conditions in modal
    const showTermsAndConditions = (plan, triggerElement) => {
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
    };

    // Setup drag listeners for a new item
    const setupDragListeners = (item) => {
      if (item) {
        const productName = item.querySelector(".product-name")?.textContent;
        if (productName) {
          item.setAttribute("data-product", productName);
        }
      }
    };

    // Setup product explanation click event
    const setupProductExplanationListener = (item) => {
      const productNameElement = item.querySelector(".product-name");
      if (productNameElement) {
        productNameElement.addEventListener("click", function (e) {
          e.stopPropagation();
          const productName = this.textContent;
          const plan = item.getAttribute("data-plan");
          showProductExplanation(productName, plan, this);
        });
      }
    };

    // Setup remove button event listener
    const setupRemoveButtonListener = (button) => {
      if (button) {
        button.addEventListener("click", function (e) {
          e.stopPropagation();
          const productItem = this.closest(".feature-item");
          if (productItem) {
            const plan = productItem.getAttribute("data-plan");
            const productName = productItem.querySelector(".product-name").textContent;
            productItem.classList.add("fade-out");
            setTimeout(() => {
              productItem.remove();
              settings.productAssignments[plan] = settings.productAssignments[plan].filter(
                p => p !== productName
              );
              localStorage.setItem("menuSettings", JSON.stringify(settings));
              updatePlanPrice(plan);
              populateAllAddProductDropdowns();
            }, 300);
          }
        });
      }
    };

    // Adjust table layout for iPad devices
    let originalTableContent = null;
    const adjustTableLayout = () => {
      const table = document.querySelector(".menu-table");
      if (!table) return;

      const isIpad = window.innerWidth <= 1024;

      if (isIpad) {
        const mobileHeader = document.querySelector(".mobile-toggle-container");
        if (mobileHeader) mobileHeader.remove();

        const basePayment = document.querySelector(".top-base-payment-wrapper");
        if (basePayment) {
          basePayment.classList.add("base-payment-top-left");
          basePayment.classList.remove("top-base-payment-wrapper");
        }
      } else {
        const basePayment = document.querySelector(".base-payment-top-left");
        if (basePayment) {
          basePayment.classList.add("top-base-payment-wrapper");
          basePayment.classList.remove("base-payment-top-left");
        }
      }

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

      initializeDragAndDrop();
      populateAllAddProductDropdowns(); // Ensure dropdowns are populated after layout adjustment
    };

    // Load settings and rebuild dropzones
    const loadSettings = () => {
      let savedSettings = localStorage.getItem("menuSettings");
      let localSettings;

      if (!savedSettings) {
        console.warn("No menuSettings in loadSettings, initializing with default");
        localSettings = defaultSettings;
        localStorage.setItem("menuSettings", JSON.stringify(localSettings));
      } else {
        try {
          localSettings = JSON.parse(savedSettings);
          if (localSettings.version !== "1.0" || !localSettings.productData || !localSettings.productAssignments) {
            console.warn("Invalid menuSettings version or structure in loadSettings, resetting to default");
            localSettings = defaultSettings;
            localStorage.setItem("menuSettings", JSON.stringify(localSettings));
          } else {
            if (typeof localSettings.productData !== "object" || Object.keys(localSettings.productData).length === 0) {
              console.warn("Invalid or missing productData in loadSettings, using default");
              localSettings.productData = defaultSettings.productData;
            }
            if (typeof localSettings.productAssignments !== "object" || Object.keys(localSettings.productAssignments).length === 0) {
              console.warn("Invalid or missing productAssignments in loadSettings, using default");
              localSettings.productAssignments = defaultSettings.productAssignments;
            }
            if (typeof localSettings.columnVisibility !== "object") {
              console.warn("Invalid or missing columnVisibility in loadSettings, using default");
              localSettings.columnVisibility = defaultSettings.columnVisibility;
            }
            if (typeof localSettings.columnNames !== "object") {
              console.warn("Invalid or missing columnNames in loadSettings, using default");
              localSettings.columnNames = defaultSettings.columnNames;
            }
            localStorage.setItem("menuSettings", JSON.stringify(localSettings));
          }
        } catch (e) {
          console.error("Error parsing menuSettings in loadSettings:", e);
          localSettings = defaultSettings;
          localStorage.setItem("menuSettings", JSON.stringify(localSettings));
        }
      }

      // Update global settings
      settings = localSettings;
      productData = settings.productData;
      productAssignments = settings.productAssignments;

      // Update column visibility
      if (localSettings.columnVisibility) {
        const table = document.querySelector(".menu-table");
        if (table) {
          const rows = table.querySelectorAll("tr");
          rows.forEach((row) => {
            const cells = row.querySelectorAll("th, td");
            cells.forEach((cell, index) => {
              if (index === 0 && !localSettings.columnVisibility.iron) cell.style.display = "none";
              else if (index === 1 && !localSettings.columnVisibility.bronze) cell.style.display = "none";
              else if (index === 2 && !localSettings.columnVisibility.silver) cell.style.display = "none";
              else if (index === 3 && !localSettings.columnVisibility.gold) cell.style.display = "none";
              else if (index === 4 && !localSettings.columnVisibility.platinum) cell.style.display = "none";
              else cell.style.display = "";
            });
          });
        }
      }

      // Update column names
      if (localSettings.columnNames) {
        document.querySelectorAll(".menu-table th").forEach((th, index) => {
          if (index === 0) th.textContent = localSettings.columnNames.iron;
          else if (index === 1) th.textContent = localSettings.columnNames.bronze;
          else if (index === 2) th.textContent = localSettings.columnNames.silver;
          else if (index === 3) th.textContent = localSettings.columnNames.gold;
          else if (index === 4) th.textContent = localSettings.columnNames.platinum;
        });
      }

      // Rebuild dropzones based on productAssignments
      const plans = ["platinum", "gold", "silver", "bronze", "iron"];
      plans.forEach(plan => {
        const dropzone = document.querySelector(`.kanban-dropzone[data-plan="${plan}"]`);
        if (!dropzone) {
          console.warn(`Dropzone not found for plan ${plan}`);
          return;
        }

        // Remove existing feature items (except add-product-wrapper)
        const featureItems = dropzone.querySelectorAll(".feature-item");
        featureItems.forEach(item => item.remove());

        // Get products for this plan
        const products = localSettings.productAssignments[plan] || [];
        const addProductWrapper = dropzone.querySelector(".add-product-wrapper");

        // Add valid products
        products.forEach(productName => {
          if (!productData[productName]) {
            console.warn(`Product "${productName}" not found in productData for plan ${plan}`);
            return;
          }

          const newItem = document.createElement("li");
          newItem.classList.add("feature-item");
          newItem.setAttribute("draggable", "true");
          newItem.setAttribute("data-id", `p${Date.now() + Math.random()}`);
          newItem.setAttribute("data-plan", plan);
          newItem.setAttribute("data-product", productName);
          newItem.innerHTML = `
            <div class="feature-content">
              <span class="feature-check ${plan}-check">✓</span>
              <span class="product-name">${productName}</span>
            </div>
          `;

          if (addProductWrapper) {
            dropzone.insertBefore(newItem, addProductWrapper);
          } else {
            dropzone.appendChild(newItem);
          }

          setupProductExplanationListener(newItem);
        });

        updatePlanPrice(plan);
      });

      populateAllAddProductDropdowns(); // Populate dropdowns after loading settings
    };

    // Add CSS for animations
    const addAnimationStyles = () => {
      const styleElement = document.createElement('style');
      styleElement.textContent = `
        .highlight-existing {
          animation: pulse 1.5s ease-in-out;
        }
        
        @keyframes pulse {
          0% { transform: scale(1); box-shadow: 0 0 0 rgba(0,0,0,0); }
          25% { transform: scale(1.05); box-shadow: 0 0 10px rgba(0,123,255,0.5); }
          50% { transform: scale(1); box-shadow: 0 0 15px rgba(0,123,255,0.7); }
          75% { transform: scale(1.05); box-shadow: 0 0 10px rgba(0,123,255,0.5); }
          100% { transform: scale(1); box-shadow: 0 0 0 rgba(0,0,0,0); }
        }
        
        .fade-out {
          animation: fadeOut 0.3s ease-out forwards;
        }
        
        @keyframes fadeOut {
          0% { opacity: 1; transform: scale(1); }
          100% { opacity: 0; transform: scale(0.9); }
        }
      `;
      document.head.appendChild(styleElement);
    };

    // Initialize
    addAnimationStyles();
    initializeStaticListeners();
    loadSettings();
    initializeDragAndDrop();
    adjustTableLayout();
  } catch (e) {
    console.error("Error in DOMContentLoaded handler:", e);
    alert("An error occurred while loading the application. Please refresh the page.");
  }
});
