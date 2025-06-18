// Add this JavaScript to your HTML page

// Contact form submission handler
async function handleContactForm(event) {
    event.preventDefault();
    
    // Get form elements
    const form = event.target;
    const submitButton = form.querySelector('button[type="submit"]');
    const originalButtonText = submitButton.textContent;
    
    // Get form data
    const formData = {
        name: form.querySelector('input[name="name"]').value.trim(),
        email: form.querySelector('input[name="email"]').value.trim(),
        subject: form.querySelector('input[name="subject"]').value.trim(),
        message: form.querySelector('textarea[name="message"]').value.trim()
    };
    
    // Basic validation
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
        showMessage('Please fill in all fields', 'error');
        return;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
        showMessage('Please enter a valid email address', 'error');
        return;
    }
    
    try {
        // Show loading state
        submitButton.disabled = true;
        submitButton.textContent = 'Sending...';
        
        // Send data to backend
        const response = await fetch('https://kasturis-portfolio.onrender.com/api/contact', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });
        
        const result = await response.json();
        
        if (result.success) {
            showMessage('Message sent successfully!', 'success');
            form.reset(); // Clear the form
        } else {
            showMessage(result.message || 'Failed to send message', 'error');
        }
        
    } catch (error) {
        console.error('Error sending message:', error);
        showMessage('Network error. Please check your connection and try again.', 'error');
    } finally {
        // Reset button state
        submitButton.disabled = false;
        submitButton.textContent = originalButtonText;
    }
}

// Function to show success/error messages
function showMessage(message, type) {
    // Remove existing message if any
    const existingMessage = document.querySelector('.form-message');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    // Create message element
    const messageDiv = document.createElement('div');
    messageDiv.className = `form-message alert ${type === 'success' ? 'alert-success' : 'alert-danger'}`;
    messageDiv.style.marginTop = '15px';
    messageDiv.textContent = message;
    
    // Insert message after the form
    const form = document.querySelector('#contact-form');
    form.parentNode.insertBefore(messageDiv, form.nextSibling);
    
    // Auto-remove message after 5 seconds
    setTimeout(() => {
        if (messageDiv.parentNode) {
            messageDiv.remove();
        }
    }, 5000);
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.querySelector('#contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', handleContactForm);
    }
});

// Alternative: If you want to attach to existing form without changing HTML
// Make sure your form has id="contact-form" and proper name attributes
function initializeContactForm() {
    const form = document.querySelector('form'); // or use specific selector
    if (form) {
        form.id = 'contact-form';
        
        // Ensure form fields have proper names
        const nameInput = form.querySelector('input[placeholder*="Name"]');
        const emailInput = form.querySelector('input[placeholder*="Email"]');
        const subjectInput = form.querySelector('input[placeholder*="Subject"]');
        const messageTextarea = form.querySelector('textarea');
        
        if (nameInput) nameInput.name = 'name';
        if (emailInput) emailInput.name = 'email';
        if (subjectInput) subjectInput.name = 'subject';
        if (messageTextarea) messageTextarea.name = 'message';
        
        form.addEventListener('submit', handleContactForm);
    }
}

// Call this function if your form doesn't have proper attributes
// initializeContactForm();