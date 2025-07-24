// AdChain Pro JavaScript Functions

// Global variables
let currentUser = null
let isLoggedIn = false

// Initialize the application
document.addEventListener("DOMContentLoaded", () => {
  initializeApp()
  bindEventListeners()
  checkAuthStatus()
})

// Initialize application
function initializeApp() {
  console.log("AdChain Pro initialized")

  // Check for saved theme preference
  const savedTheme = localStorage.getItem("theme")
  if (savedTheme) {
    document.body.classList.add(savedTheme)
  }

  // Initialize tooltips
  initializeTooltips()

  // Initialize modals
  initializeModals()

  // Initialize form validation
  initializeFormValidation()

  // Initialize animations
  initializeAnimations()
}

// Bind event listeners
function bindEventListeners() {
  // Navigation menu toggle
  const menuToggle = document.querySelector(".menu-toggle")
  const navMenu = document.querySelector(".nav-menu")

  if (menuToggle && navMenu) {
    menuToggle.addEventListener("click", toggleMobileMenu)
  }

  // Search functionality
  const searchInputs = document.querySelectorAll(".search-input")
  searchInputs.forEach((input) => {
    input.addEventListener("input", handleSearch)
  })

  // FAQ toggle functionality
  const faqItems = document.querySelectorAll(".faq-item")
  faqItems.forEach((item) => {
    const summary = item.querySelector("summary")
    if (summary) {
      summary.addEventListener("click", handleFaqToggle)
    }
  })

  // Tab functionality
  const tabButtons = document.querySelectorAll(".tab-btn")
  tabButtons.forEach((button) => {
    button.addEventListener("click", handleTabClick)
  })

  // Form submissions
  const forms = document.querySelectorAll("form")
  forms.forEach((form) => {
    form.addEventListener("submit", handleFormSubmit)
  })

  // Cookie consent
  initializeCookieConsent()

  // Scroll to top button
  initializeScrollToTop()

  // Lazy loading for images
  initializeLazyLoading()

  // Smooth scrolling for anchor links
  initializeSmoothScrolling()
}

// Check authentication status
function checkAuthStatus() {
  const token = localStorage.getItem("authToken")
  const userData = localStorage.getItem("userData")

  if (token && userData) {
    try {
      currentUser = JSON.parse(userData)
      isLoggedIn = true
      updateUIForLoggedInUser()
    } catch (error) {
      console.error("Error parsing user data:", error)
      logout()
    }
  }
}

// Update UI for logged in user
function updateUIForLoggedInUser() {
  const loginButtons = document.querySelectorAll(".login-btn")
  const userMenus = document.querySelectorAll(".user-menu")

  loginButtons.forEach((btn) => (btn.style.display = "none"))
  userMenus.forEach((menu) => (menu.style.display = "block"))

  // Update user name displays
  const userNameElements = document.querySelectorAll(".user-name")
  userNameElements.forEach((element) => {
    element.textContent = currentUser.name || "User"
  })
}

// Mobile menu toggle
function toggleMobileMenu() {
  const navMenu = document.querySelector(".nav-menu")
  const menuToggle = document.querySelector(".menu-toggle")

  navMenu.classList.toggle("active")
  menuToggle.classList.toggle("active")

  // Prevent body scroll when menu is open
  document.body.classList.toggle("menu-open")
}

// Search functionality
function handleSearch(event) {
  const query = event.target.value.toLowerCase()
  const searchableElements = document.querySelectorAll("[data-searchable]")

  searchableElements.forEach((element) => {
    const text = element.textContent.toLowerCase()
    const isVisible = text.includes(query)

    element.style.display = isVisible ? "block" : "none"

    // Add highlight to matching text
    if (isVisible && query.length > 0) {
      highlightSearchTerm(element, query)
    } else {
      removeHighlight(element)
    }
  })

  // Show/hide no results message
  const visibleElements = Array.from(searchableElements).filter((el) => el.style.display !== "none")

  toggleNoResultsMessage(visibleElements.length === 0)
}

// Highlight search terms
function highlightSearchTerm(element, term) {
  const originalText = element.getAttribute("data-original-text") || element.innerHTML
  element.setAttribute("data-original-text", originalText)

  const regex = new RegExp(`(${term})`, "gi")
  const highlightedText = originalText.replace(regex, "<mark>$1</mark>")

  element.innerHTML = highlightedText
}

// Remove search highlights
function removeHighlight(element) {
  const originalText = element.getAttribute("data-original-text")
  if (originalText) {
    element.innerHTML = originalText
  }
}

// Toggle no results message
function toggleNoResultsMessage(show) {
  let noResultsMsg = document.querySelector(".no-results-message")

  if (show && !noResultsMsg) {
    noResultsMsg = document.createElement("div")
    noResultsMsg.className = "no-results-message"
    noResultsMsg.innerHTML = "<p>No results found. Try adjusting your search terms.</p>"

    const searchContainer =
      document.querySelector(".search-results") ||
      document.querySelector(".faq-content") ||
      document.querySelector(".main")

    if (searchContainer) {
      searchContainer.appendChild(noResultsMsg)
    }
  } else if (!show && noResultsMsg) {
    noResultsMsg.remove()
  }
}

// FAQ toggle handling
function handleFaqToggle(event) {
  const faqItem = event.target.closest(".faq-item")
  const isOpen = faqItem.hasAttribute("open")

  // Close other FAQ items (accordion behavior)
  const allFaqItems = document.querySelectorAll(".faq-item")
  allFaqItems.forEach((item) => {
    if (item !== faqItem) {
      item.removeAttribute("open")
    }
  })

  // Analytics tracking
  if (!isOpen) {
    trackEvent("FAQ", "Open", event.target.textContent)
  }
}

// Tab click handling
function handleTabClick(event) {
  const clickedTab = event.target
  const category = clickedTab.getAttribute("data-category")

  // Update active tab
  const allTabs = document.querySelectorAll(".tab-btn")
  allTabs.forEach((tab) => tab.classList.remove("active"))
  clickedTab.classList.add("active")

  // Show/hide content categories
  const allCategories = document.querySelectorAll(".faq-category")
  allCategories.forEach((cat) => {
    cat.style.display = cat.id === category ? "block" : "none"
  })

  // Track tab change
  trackEvent("Navigation", "Tab Change", category)
}

// Form submission handling
function handleFormSubmit(event) {
  event.preventDefault()

  const form = event.target
  const formData = new FormData(form)
  const formType = form.getAttribute("data-form-type") || "contact"

  // Show loading state
  showFormLoading(form, true)

  // Validate form
  if (!validateForm(form)) {
    showFormLoading(form, false)
    return
  }

  // Submit form based on type
  switch (formType) {
    case "contact":
      submitContactForm(formData)
      break
    case "partnership":
      submitPartnershipForm(formData)
      break
    case "newsletter":
      submitNewsletterForm(formData)
      break
    default:
      submitGenericForm(formData, formType)
  }
}

// Contact form submission
async function submitContactForm(formData) {
  try {
    const response = await fetch("/api/contact", {
      method: "POST",
      body: formData,
    })

    const result = await response.json()

    if (response.ok) {
      showFormSuccess("Thank you for your message! We'll get back to you within 24 hours.")
      trackEvent("Form", "Submit", "Contact")
    } else {
      throw new Error(result.message || "Failed to send message")
    }
  } catch (error) {
    console.error("Contact form error:", error)
    showFormError("Sorry, there was an error sending your message. Please try again.")
  } finally {
    showFormLoading(document.querySelector('[data-form-type="contact"]'), false)
  }
}

// Partnership form submission
async function submitPartnershipForm(formData) {
  try {
    const response = await fetch("/api/partnership", {
      method: "POST",
      body: formData,
    })

    const result = await response.json()

    if (response.ok) {
      showFormSuccess(
        "Thank you for your partnership inquiry! Our team will review your application and contact you within 2-3 business days.",
      )
      trackEvent("Form", "Submit", "Partnership")
    } else {
      throw new Error(result.message || "Failed to submit partnership application")
    }
  } catch (error) {
    console.error("Partnership form error:", error)
    showFormError("Sorry, there was an error submitting your application. Please try again.")
  } finally {
    showFormLoading(document.querySelector('[data-form-type="partnership"]'), false)
  }
}

// Newsletter form submission
async function submitNewsletterForm(formData) {
  try {
    const response = await fetch("/api/newsletter", {
      method: "POST",
      body: formData,
    })

    const result = await response.json()

    if (response.ok) {
      showFormSuccess("Successfully subscribed to our newsletter!")
      trackEvent("Form", "Submit", "Newsletter")
    } else {
      throw new Error(result.message || "Failed to subscribe")
    }
  } catch (error) {
    console.error("Newsletter form error:", error)
    showFormError("Sorry, there was an error subscribing. Please try again.")
  } finally {
    showFormLoading(document.querySelector('[data-form-type="newsletter"]'), false)
  }
}

// Generic form submission
async function submitGenericForm(formData, formType) {
  try {
    const response = await fetch(`/api/${formType}`, {
      method: "POST",
      body: formData,
    })

    const result = await response.json()

    if (response.ok) {
      showFormSuccess("Form submitted successfully!")
      trackEvent("Form", "Submit", formType)
    } else {
      throw new Error(result.message || "Failed to submit form")
    }
  } catch (error) {
    console.error(`${formType} form error:`, error)
    showFormError("Sorry, there was an error submitting the form. Please try again.")
  } finally {
    showFormLoading(document.querySelector(`[data-form-type="${formType}"]`), false)
  }
}

// Form validation
function validateForm(form) {
  const requiredFields = form.querySelectorAll("[required]")
  let isValid = true

  requiredFields.forEach((field) => {
    const value = field.value.trim()
    const fieldContainer = field.closest(".form-group")

    // Remove existing error states
    fieldContainer.classList.remove("error")
    const existingError = fieldContainer.querySelector(".error-message")
    if (existingError) {
      existingError.remove()
    }

    // Validate field
    if (!value) {
      showFieldError(fieldContainer, "This field is required")
      isValid = false
    } else if (field.type === "email" && !isValidEmail(value)) {
      showFieldError(fieldContainer, "Please enter a valid email address")
      isValid = false
    } else if (field.type === "tel" && !isValidPhone(value)) {
      showFieldError(fieldContainer, "Please enter a valid phone number")
      isValid = false
    } else if (field.type === "url" && !isValidUrl(value)) {
      showFieldError(fieldContainer, "Please enter a valid URL")
      isValid = false
    }
  })

  return isValid
}

// Show field error
function showFieldError(fieldContainer, message) {
  fieldContainer.classList.add("error")

  const errorElement = document.createElement("div")
  errorElement.className = "error-message"
  errorElement.textContent = message

  fieldContainer.appendChild(errorElement)
}

// Email validation
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Phone validation
function isValidPhone(phone) {
  const phoneRegex = /^[+]?[1-9][\d]{0,15}$/
  return phoneRegex.test(phone.replace(/[\s\-$$$$]/g, ""))
}

// URL validation
function isValidUrl(url) {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

// Show form loading state
function showFormLoading(form, isLoading) {
  const submitButton = form.querySelector('[type="submit"]')
  const originalText = submitButton.getAttribute("data-original-text") || submitButton.textContent

  if (isLoading) {
    submitButton.setAttribute("data-original-text", originalText)
    submitButton.textContent = "Submitting..."
    submitButton.disabled = true
    submitButton.classList.add("loading")
  } else {
    submitButton.textContent = originalText
    submitButton.disabled = false
    submitButton.classList.remove("loading")
  }
}

// Show form success message
function showFormSuccess(message) {
  showNotification(message, "success")
}

// Show form error message
function showFormError(message) {
  showNotification(message, "error")
}

// Show notification
function showNotification(message, type = "info") {
  const notification = document.createElement("div")
  notification.className = `notification notification-${type}`
  notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-message">${message}</span>
            <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
        </div>
    `

  // Add to page
  document.body.appendChild(notification)

  // Animate in
  setTimeout(() => notification.classList.add("show"), 100)

  // Auto remove after 5 seconds
  setTimeout(() => {
    notification.classList.remove("show")
    setTimeout(() => notification.remove(), 300)
  }, 5000)
}

// Initialize tooltips
function initializeTooltips() {
  const tooltipElements = document.querySelectorAll("[data-tooltip]")

  tooltipElements.forEach((element) => {
    element.addEventListener("mouseenter", showTooltip)
    element.addEventListener("mouseleave", hideTooltip)
  })
}

// Show tooltip
function showTooltip(event) {
  const element = event.target
  const tooltipText = element.getAttribute("data-tooltip")

  const tooltip = document.createElement("div")
  tooltip.className = "tooltip"
  tooltip.textContent = tooltipText

  document.body.appendChild(tooltip)

  // Position tooltip
  const rect = element.getBoundingClientRect()
  tooltip.style.left = rect.left + rect.width / 2 - tooltip.offsetWidth / 2 + "px"
  tooltip.style.top = rect.top - tooltip.offsetHeight - 10 + "px"

  // Show tooltip
  setTimeout(() => tooltip.classList.add("show"), 100)

  // Store reference for cleanup
  element._tooltip = tooltip
}

// Hide tooltip
function hideTooltip(event) {
  const element = event.target
  const tooltip = element._tooltip

  if (tooltip) {
    tooltip.classList.remove("show")
    setTimeout(() => tooltip.remove(), 200)
    delete element._tooltip
  }
}

// Initialize modals
function initializeModals() {
  const modalTriggers = document.querySelectorAll("[data-modal]")
  const modalCloses = document.querySelectorAll(".modal-close")

  modalTriggers.forEach((trigger) => {
    trigger.addEventListener("click", openModal)
  })

  modalCloses.forEach((close) => {
    close.addEventListener("click", closeModal)
  })

  // Close modal on backdrop click
  document.addEventListener("click", (event) => {
    if (event.target.classList.contains("modal-backdrop")) {
      closeModal()
    }
  })

  // Close modal on escape key
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeModal()
    }
  })
}

// Open modal
function openModal(event) {
  event.preventDefault()

  const trigger = event.target
  const modalId = trigger.getAttribute("data-modal")
  const modal = document.getElementById(modalId)

  if (modal) {
    modal.classList.add("active")
    document.body.classList.add("modal-open")

    // Focus first focusable element
    const focusableElement = modal.querySelector("input, button, textarea, select")
    if (focusableElement) {
      focusableElement.focus()
    }

    trackEvent("Modal", "Open", modalId)
  }
}

// Close modal
function closeModal() {
  const activeModal = document.querySelector(".modal.active")

  if (activeModal) {
    activeModal.classList.remove("active")
    document.body.classList.remove("modal-open")

    trackEvent("Modal", "Close", activeModal.id)
  }
}

// Initialize form validation
function initializeFormValidation() {
  const formInputs = document.querySelectorAll("input, textarea, select")

  formInputs.forEach((input) => {
    input.addEventListener("blur", validateField)
    input.addEventListener("input", clearFieldError)
  })
}

// Validate individual field
function validateField(event) {
  const field = event.target
  const fieldContainer = field.closest(".form-group")
  const value = field.value.trim()

  // Clear existing errors
  fieldContainer.classList.remove("error", "success")
  const existingError = fieldContainer.querySelector(".error-message")
  if (existingError) {
    existingError.remove()
  }

  // Skip validation if field is not required and empty
  if (!field.hasAttribute("required") && !value) {
    return
  }

  // Validate based on field type
  let isValid = true
  let errorMessage = ""

  if (field.hasAttribute("required") && !value) {
    isValid = false
    errorMessage = "This field is required"
  } else if (field.type === "email" && value && !isValidEmail(value)) {
    isValid = false
    errorMessage = "Please enter a valid email address"
  } else if (field.type === "tel" && value && !isValidPhone(value)) {
    isValid = false
    errorMessage = "Please enter a valid phone number"
  } else if (field.type === "url" && value && !isValidUrl(value)) {
    isValid = false
    errorMessage = "Please enter a valid URL"
  } else if (field.type === "password" && value && value.length < 8) {
    isValid = false
    errorMessage = "Password must be at least 8 characters long"
  }

  // Show error or success state
  if (!isValid) {
    showFieldError(fieldContainer, errorMessage)
  } else if (value) {
    fieldContainer.classList.add("success")
  }
}

// Clear field error on input
function clearFieldError(event) {
  const field = event.target
  const fieldContainer = field.closest(".form-group")

  fieldContainer.classList.remove("error")
  const errorMessage = fieldContainer.querySelector(".error-message")
  if (errorMessage) {
    errorMessage.remove()
  }
}

// Initialize animations
function initializeAnimations() {
  // Intersection Observer for scroll animations
  const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px",
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("animate-in")
      }
    })
  }, observerOptions)

  // Observe elements with animation classes
  const animatedElements = document.querySelectorAll(
    ".fade-in, .slide-in-left, .slide-in-right, .slide-in-up, .slide-in-down",
  )
  animatedElements.forEach((element) => {
    observer.observe(element)
  })
}

// Initialize cookie consent
function initializeCookieConsent() {
  const cookieConsent = localStorage.getItem("cookieConsent")

  if (!cookieConsent) {
    showCookieConsent()
  }
}

// Show cookie consent banner
function showCookieConsent() {
  const banner = document.createElement("div")
  banner.className = "cookie-consent"
  banner.innerHTML = `
        <div class="cookie-consent-content">
            <p>We use cookies to enhance your experience and analyze our traffic. By continuing to use our site, you consent to our use of cookies.</p>
            <div class="cookie-consent-actions">
                <button class="btn btn-outline" onclick="manageCookiePreferences()">Manage Preferences</button>
                <button class="btn btn-primary" onclick="acceptAllCookies()">Accept All</button>
            </div>
        </div>
    `

  document.body.appendChild(banner)

  // Show banner with animation
  setTimeout(() => banner.classList.add("show"), 100)
}

// Accept all cookies
function acceptAllCookies() {
  localStorage.setItem("cookieConsent", "all")
  hideCookieConsent()
  trackEvent("Cookie", "Accept", "All")
}

// Manage cookie preferences
function manageCookiePreferences() {
  // This would open a detailed cookie preferences modal
  // For now, we'll just accept essential cookies
  localStorage.setItem("cookieConsent", "essential")
  hideCookieConsent()
  trackEvent("Cookie", "Manage", "Preferences")
}

// Hide cookie consent banner
function hideCookieConsent() {
  const banner = document.querySelector(".cookie-consent")
  if (banner) {
    banner.classList.remove("show")
    setTimeout(() => banner.remove(), 300)
  }
}

// Open cookie preferences (for button in pages)
function openCookiePreferences() {
  // This would open a detailed modal for managing cookie preferences
  console.log("Opening cookie preferences...")
  trackEvent("Cookie", "Open", "Preferences")
}

// Initialize scroll to top button
function initializeScrollToTop() {
  const scrollButton = document.createElement("button")
  scrollButton.className = "scroll-to-top"
  scrollButton.innerHTML = "↑"
  scrollButton.setAttribute("aria-label", "Scroll to top")
  scrollButton.onclick = scrollToTop

  document.body.appendChild(scrollButton)

  // Show/hide button based on scroll position
  window.addEventListener("scroll", () => {
    if (window.pageYOffset > 300) {
      scrollButton.classList.add("show")
    } else {
      scrollButton.classList.remove("show")
    }
  })
}

// Scroll to top function
function scrollToTop() {
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  })

  trackEvent("Navigation", "Scroll", "To Top")
}

// Initialize lazy loading
function initializeLazyLoading() {
  const lazyImages = document.querySelectorAll("img[data-src]")

  if ("IntersectionObserver" in window) {
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target
          img.src = img.dataset.src
          img.classList.remove("lazy")
          imageObserver.unobserve(img)
        }
      })
    })

    lazyImages.forEach((img) => {
      imageObserver.observe(img)
    })
  } else {
    // Fallback for browsers without IntersectionObserver
    lazyImages.forEach((img) => {
      img.src = img.dataset.src
      img.classList.remove("lazy")
    })
  }
}

// Initialize smooth scrolling
function initializeSmoothScrolling() {
  const anchorLinks = document.querySelectorAll('a[href^="#"]')

  anchorLinks.forEach((link) => {
    link.addEventListener("click", function (event) {
      event.preventDefault()

      const targetId = this.getAttribute("href").substring(1)
      const targetElement = document.getElementById(targetId)

      if (targetElement) {
        targetElement.scrollIntoView({
          behavior: "smooth",
          block: "start",
        })

        trackEvent("Navigation", "Scroll", targetId)
      }
    })
  })
}

// Live chat functionality
function openLiveChat() {
  // This would integrate with a live chat service like Intercom, Zendesk, etc.
  console.log("Opening live chat...")

  // For demo purposes, show a notification
  showNotification("Live chat feature coming soon! Please use our contact form for now.", "info")

  trackEvent("Support", "Open", "Live Chat")
}

// Partnership form functions
function openPartnershipForm(type) {
  const partnershipTypeSelect = document.getElementById("partnershipType")
  if (partnershipTypeSelect) {
    partnershipTypeSelect.value = type
  }

  // Scroll to form
  const form = document.getElementById("partnershipForm")
  if (form) {
    form.scrollIntoView({ behavior: "smooth" })
  }

  trackEvent("Partnership", "Open Form", type)
}

// Theme toggle functionality
function toggleTheme() {
  const currentTheme = document.body.classList.contains("dark-theme") ? "dark" : "light"
  const newTheme = currentTheme === "dark" ? "light" : "dark"

  document.body.classList.remove("light-theme", "dark-theme")
  document.body.classList.add(`${newTheme}-theme`)

  localStorage.setItem("theme", `${newTheme}-theme`)

  trackEvent("UI", "Theme Toggle", newTheme)
}

// Print functionality
function printPage() {
  window.print()
  trackEvent("UI", "Print", window.location.pathname)
}

// Share functionality
function sharePage(platform) {
  const url = encodeURIComponent(window.location.href)
  const title = encodeURIComponent(document.title)
  const text = encodeURIComponent("Check out AdChain Pro - Premium Ad Viewing Platform")

  let shareUrl = ""

  switch (platform) {
    case "twitter":
      shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${text}`
      break
    case "facebook":
      shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`
      break
    case "linkedin":
      shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`
      break
    case "email":
      shareUrl = `mailto:?subject=${title}&body=${text}%20${url}`
      break
    case "copy":
      navigator.clipboard.writeText(window.location.href).then(() => {
        showNotification("Link copied to clipboard!", "success")
      })
      trackEvent("Share", "Copy Link", window.location.pathname)
      return
  }

  if (shareUrl) {
    window.open(shareUrl, "_blank", "width=600,height=400")
    trackEvent("Share", platform, window.location.pathname)
  }
}

// Analytics tracking
function trackEvent(category, action, label) {
  // Google Analytics 4
  const gtag = window.gtag // Declare gtag variable
  if (typeof gtag !== "undefined") {
    gtag("event", action, {
      event_category: category,
      event_label: label,
    })
  }

  // Alternative analytics services can be added here
  console.log(`Analytics: ${category} - ${action} - ${label}`)
}

// Error handling
window.addEventListener("error", (event) => {
  console.error("JavaScript error:", event.error)

  // Track errors (but don't send sensitive information)
  trackEvent("Error", "JavaScript", event.error.message)
})

// Unhandled promise rejection handling
window.addEventListener("unhandledrejection", (event) => {
  console.error("Unhandled promise rejection:", event.reason)

  trackEvent("Error", "Promise Rejection", "Unhandled")
})

// Performance monitoring
window.addEventListener("load", () => {
  // Track page load time
  const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart
  trackEvent("Performance", "Page Load", Math.round(loadTime))

  // Track largest contentful paint
  if ("PerformanceObserver" in window) {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      const lastEntry = entries[entries.length - 1]
      trackEvent("Performance", "LCP", Math.round(lastEntry.startTime))
    })

    observer.observe({ entryTypes: ["largest-contentful-paint"] })
  }
})

// Accessibility improvements
function improveAccessibility() {
  // Add skip links
  const skipLink = document.createElement("a")
  skipLink.href = "#main-content"
  skipLink.className = "skip-link"
  skipLink.textContent = "Skip to main content"
  document.body.insertBefore(skipLink, document.body.firstChild)

  // Improve focus management
  document.addEventListener("keydown", (event) => {
    // Trap focus in modals
    if (event.key === "Tab") {
      const activeModal = document.querySelector(".modal.active")
      if (activeModal) {
        trapFocus(event, activeModal)
      }
    }
  })

  // Add ARIA labels to interactive elements
  const interactiveElements = document.querySelectorAll("button, a, input, select, textarea")
  interactiveElements.forEach((element) => {
    if (!element.getAttribute("aria-label") && !element.textContent.trim()) {
      const placeholder = element.getAttribute("placeholder")
      const title = element.getAttribute("title")
      if (placeholder) {
        element.setAttribute("aria-label", placeholder)
      } else if (title) {
        element.setAttribute("aria-label", title)
      }
    }
  })
}

// Trap focus within modal
function trapFocus(event, modal) {
  const focusableElements = modal.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
  )

  const firstElement = focusableElements[0]
  const lastElement = focusableElements[focusableElements.length - 1]

  if (event.shiftKey) {
    if (document.activeElement === firstElement) {
      lastElement.focus()
      event.preventDefault()
    }
  } else {
    if (document.activeElement === lastElement) {
      firstElement.focus()
      event.preventDefault()
    }
  }
}

// Initialize accessibility improvements
document.addEventListener("DOMContentLoaded", improveAccessibility)

// Service Worker registration (for PWA functionality)
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => {
        console.log("ServiceWorker registration successful")
      })
      .catch((error) => {
        console.log("ServiceWorker registration failed")
      })
  })
}

// Utility functions
const utils = {
  // Debounce function
  debounce: (func, wait) => {
    let timeout
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout)
        func(...args)
      }
      clearTimeout(timeout)
      timeout = setTimeout(later, wait)
    }
  },

  // Throttle function
  throttle: (func, limit) => {
    let inThrottle
    return function () {
      const args = arguments
      
      if (!inThrottle) {
        func.apply(this, args)
        inThrottle = true
        setTimeout(() => (inThrottle = false), limit)
      }
    }
  },

  // Format currency
  formatCurrency: (amount, currency = "USD") =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    }).format(amount),

  // Format date
  formatDate: (date, options = {}) => {
    const defaultOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
    }

    return new Intl.DateTimeFormat("en-US", { ...defaultOptions, ...options }).format(new Date(date))
  },

  // Generate random ID
  generateId: (length = 8) =>
    Math.random()
      .toString(36)
      .substring(2, length + 2),

  // Check if element is in viewport
  isInViewport: (element) => {
    const rect = element.getBoundingClientRect()
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    )
  },

  // Get URL parameters
  getUrlParams: () => {
    const params = new URLSearchParams(window.location.search)
    const result = {}
    for (const [key, value] of params) {
      result[key] = value
    }
    return result
  },

  // Set URL parameter
  setUrlParam: (key, value) => {
    const url = new URL(window.location)
    url.searchParams.set(key, value)
    window.history.pushState({}, "", url)
  },

  // Remove URL parameter
  removeUrlParam: (key) => {
    const url = new URL(window.location)
    url.searchParams.delete(key)
    window.history.pushState({}, "", url)
  },

  // Local storage with expiration
  setStorageWithExpiry: (key, value, ttl) => {
    const now = new Date()
    const item = {
      value: value,
      expiry: now.getTime() + ttl,
    }
    localStorage.setItem(key, JSON.stringify(item))
  },

  getStorageWithExpiry: (key) => {
    const itemStr = localStorage.getItem(key)
    if (!itemStr) {
      return null
    }

    const item = JSON.parse(itemStr)
    const now = new Date()

    if (now.getTime() > item.expiry) {
      localStorage.removeItem(key)
      return null
    }

    return item.value
  },
}

// Export utils for use in other scripts
window.AdChainUtils = utils

// Initialize everything when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeApp)
} else {
  initializeApp()
}

// Logout function
function logout() {
  localStorage.removeItem("authToken")
  localStorage.removeItem("userData")
  sessionStorage.clear()

  currentUser = null
  isLoggedIn = false

  // Redirect to login page
  window.location.href = "/login.html"

  trackEvent("Auth", "Logout", "Success")
}

// Login function (placeholder)
function login(email, password) {
  // This would integrate with your authentication system
  console.log("Login attempt:", email)

  // For demo purposes
  showNotification("Login functionality will be integrated with your authentication system.", "info")

  trackEvent("Auth", "Login Attempt", email)
}

// Register function (placeholder)
function register(userData) {
  // This would integrate with your registration system
  console.log("Registration attempt:", userData)

  // For demo purposes
  showNotification("Registration functionality will be integrated with your user management system.", "info")

  trackEvent("Auth", "Register Attempt", userData.email)
}

// Password reset function (placeholder)
function resetPassword(email) {
  // This would integrate with your password reset system
  console.log("Password reset request:", email)

  // For demo purposes
  showNotification("Password reset link would be sent to your email address.", "info")

  trackEvent("Auth", "Password Reset", email)
}

// Console welcome message
console.log(`
🚀 AdChain Pro - Premium Ad Viewing Platform
📧 Contact: support@adchainpro.com
🌐 Website: https://adchainpro.com
💼 Partnerships: partnerships@adchainpro.com

Built with ❤️ for advertisers and users worldwide.
`)
