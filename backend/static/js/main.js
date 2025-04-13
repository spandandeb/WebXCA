// Main JavaScript for AI Career Counselor

document.addEventListener('DOMContentLoaded', function() {
    // Initialize any global functionality
    initializeTooltips();
    setupApiIntegration();
});

// Initialize tooltips
function initializeTooltips() {
    const tooltips = document.querySelectorAll('[data-tooltip]');
    tooltips.forEach(tooltip => {
        tooltip.addEventListener('mouseenter', function() {
            const tooltipText = this.getAttribute('data-tooltip');
            const tooltipElement = document.createElement('div');
            tooltipElement.className = 'absolute bg-gray-800 text-white text-xs rounded py-1 px-2 -mt-8 -ml-2 z-10';
            tooltipElement.textContent = tooltipText;
            this.appendChild(tooltipElement);
        });
        
        tooltip.addEventListener('mouseleave', function() {
            const tooltipElement = this.querySelector('div');
            if (tooltipElement) {
                tooltipElement.remove();
            }
        });
    });
}

// Setup API integration for the frontend
function setupApiIntegration() {
    // Career resources API integration
    const resourceButtons = document.querySelectorAll('.resource-btn');
    resourceButtons.forEach(button => {
        button.addEventListener('click', function() {
            const career = this.getAttribute('data-career');
            const resultContainer = document.getElementById('resource-results');
            
            if (!career) return;
            
            // Show loading state
            if (resultContainer) {
                resultContainer.innerHTML = '<div class="flex justify-center py-4"><div class="loading-spinner"></div></div>';
            }
            
            // Fetch resources from API
            fetch('/api/get_resources', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ career: career })
            })
            .then(response => response.json())
            .then(data => {
                if (resultContainer) {
                    if (data.resources) {
                        resultContainer.innerHTML = `<div class="prose max-w-none">${data.resources}</div>`;
                    } else {
                        resultContainer.innerHTML = '<p class="text-red-500">Unable to load resources. Please try again.</p>';
                    }
                }
            })
            .catch(error => {
                console.error('Error fetching resources:', error);
                if (resultContainer) {
                    resultContainer.innerHTML = '<p class="text-red-500">An error occurred. Please try again later.</p>';
                }
            });
        });
    });
}

// Function to handle API assessment submission
function submitAssessmentApi(formData) {
    // Convert FormData to JSON
    const jsonData = {};
    for (const [key, value] of formData.entries()) {
        jsonData[key] = value;
    }
    
    // Show loading state
    const submitButton = document.querySelector('.submit-btn');
    if (submitButton) {
        submitButton.disabled = true;
        submitButton.innerHTML = '<div class="loading-spinner mr-2"></div> Processing...';
    }
    
    // Submit to API
    return fetch('/api/assessment', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(jsonData)
    })
    .then(response => response.json())
    .then(data => {
        if (submitButton) {
            submitButton.disabled = false;
            submitButton.textContent = 'Get Recommendations';
        }
        return data;
    })
    .catch(error => {
        console.error('Error submitting assessment:', error);
        if (submitButton) {
            submitButton.disabled = false;
            submitButton.textContent = 'Get Recommendations';
        }
        throw error;
    });
}
