document.getElementById('analysisForm').addEventListener('submit', handleFormSubmit);

async function handleFormSubmit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const button = document.getElementById('analyzeButton');
    const spinner = document.getElementById('loadingSpinner');
    const resultContainer = document.getElementById('resultContainer');

    try {
        // Show loading state
        button.disabled = true;
        spinner.classList.remove('hidden');

        // Get form data
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        // Send request
        const response = await fetch('/predict', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) throw new Error('Analysis failed');
        
        const result = await response.json();
        displayResult(result);

    } catch (error) {
        showError(error.message);
    } finally {
        button.disabled = false;
        spinner.classList.add('hidden');
    }
}

function displayResult(result) {
    const resultContainer = document.getElementById('resultContainer');
    resultContainer.classList.remove('hidden');
    
    resultContainer.innerHTML = `
        <div class="bg-white rounded-lg shadow-md p-6 ${result.prediction === 'Fraudulent' ? 'border-l-4 border-red-500' : 'border-l-4 border-green-500'}">
            <div class="flex items-center justify-between mb-4">
                <h3 class="text-xl font-bold">Analysis Result</h3>
                <span class="px-3 py-1 rounded-full text-sm ${result.prediction === 'Fraudulent' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}">
                    ${result.prediction}
                </span>
            </div>
            
            <div class="space-y-3">
                <div class="flex justify-between">
                    <span>Confidence:</span>
                    <span class="font-medium">${result.probability}%</span>
                </div>
                <div class="flex justify-between">
                    <span>Amount:</span>
                    <span class="font-medium">$${result.amount}</span>
                </div>
                <div class="flex justify-between">
                    <span>Type:</span>
                    <span class="font-medium">${result.type}</span>
                </div>
            </div>
            
            <button onclick="resetForm()" 
                    class="mt-6 w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200 transition-colors">
                New Analysis
            </button>
        </div>
    `;
}

function resetForm() {
    document.getElementById('analysisForm').reset();
    document.getElementById('resultContainer').classList.add('hidden');
}

function showError(message) {
    const resultContainer = document.getElementById('resultContainer');
    resultContainer.classList.remove('hidden');
    resultContainer.innerHTML = `
        <div class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4">
            <p class="font-medium">Error:</p>
            <p>${message}</p>
        </div>
    `;
}
// static/js/app.js
function displayResult(result) {
    const resultContainer = document.getElementById('resultContainer');
    const template = `
        <div class="bg-white rounded-lg shadow-md p-6 ${result.prediction === 'Fraudulent' ? 'border-l-4 border-red-500' : 'border-l-4 border-green-500'}">
            <!-- Use the same structure as _result.html -->
            <!-- ... rest of the result template ... -->
        </div>
    `;
    
    resultContainer.classList.remove('hidden');
    resultContainer.innerHTML = template;
}
// Only run form-related code if on analysis page
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('analysisForm');
    const resultContainer = document.getElementById('resultContainer');

    if (form && resultContainer) {
        form.addEventListener('submit', handleFormSubmit);
        
        const handleFormSubmit = async (event) => {
            event.preventDefault();
            const button = document.getElementById('analyzeButton');
            const spinner = document.getElementById('loadingSpinner');

            try {
                button.disabled = true;
                spinner.classList.remove('hidden');

                // ... existing submission logic ...

                // Always check element exists before manipulation
                if (resultContainer) {
                    resultContainer.classList.remove('hidden');
                    // ... display results ...
                }
            } catch (error) {
                if (resultContainer) {
                    showError(error.message, resultContainer);
                }
            } finally {
                button.disabled = false;
                spinner.classList.add('hidden');
            }
        };
    }
});

// Modified showError to accept container parameter
function showError(message, container) {
    container.classList.remove('hidden');
    container.innerHTML = `
        <div class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4">
            <p class="font-medium">Error:</p>
            <p>${message}</p>
        </div>
    `;
}