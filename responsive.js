// JavaScript to handle sidebar functionality and responsive behavior
document.addEventListener("DOMContentLoaded", () => {
    // Elements
    const sidebar = document.querySelector(".sidebar")
    const mainContent = document.querySelector(".main-content")
    const sidebarToggle = document.querySelector(".sidebar-toggle")
    const mobileToggle = document.querySelector(".mobile-toggle")
    const body = document.body
  
    // Create overlay for mobile
    const overlay = document.createElement("div")
    overlay.className = "sidebar-overlay"
    body.appendChild(overlay)

    
  
    // Toggle sidebar on desktop
    if (sidebarToggle) {
      sidebarToggle.addEventListener("click", () => {
        sidebar.classList.toggle("collapsed")
        mainContent.classList.toggle("expanded")
      })
    }
  
    // Toggle sidebar on mobile
    if (mobileToggle) {
      mobileToggle.addEventListener("click", () => {
        sidebar.classList.toggle("mobile-open")
        overlay.classList.toggle("active")
        body.classList.toggle("sidebar-open")
      })
    }
  
    // Close sidebar when clicking overlay
    overlay.addEventListener("click", () => {
      sidebar.classList.remove("mobile-open")
      overlay.classList.remove("active")
      body.classList.remove("sidebar-open")
    })
  
    // Close sidebar on window resize if in mobile view
    window.addEventListener("resize", () => {
      if (window.innerWidth > 768) {
        sidebar.classList.remove("mobile-open")
        overlay.classList.remove("active")
        body.classList.remove("sidebar-open")
      }
    })
  })