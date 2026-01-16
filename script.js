document.addEventListener('DOMContentLoaded', function() {
    const namesInput = document.getElementById('namesInput');
    const pickButton = document.getElementById('pickButton');
    const selectedName = document.getElementById('selectedName');
    const resultSection = document.getElementById('resultSection');

    // Load saved names from localStorage
    loadSavedNames();

    pickButton.addEventListener('click', pickRandomName);
    
    // Save names to localStorage when input changes
    namesInput.addEventListener('input', saveNames);

    function pickRandomName() {
        const namesText = namesInput.value.trim();
        
        if (!namesText) {
            showError('Please enter at least one name.');
            return;
        }

        const names = namesText.split('\n')
            .map(name => name.trim())
            .filter(name => name.length > 0);

        if (names.length === 0) {
            showError('Please enter at least one valid name.');
            return;
        }

        // Remove any existing error messages
        removeErrorMessages();

        // Pick a random name
        const randomIndex = Math.floor(Math.random() * names.length);
        const chosenName = names[randomIndex];

        // Display the result with green background
        selectedName.textContent = chosenName;
        selectedName.classList.add('picked');

        // Remove the highlight after 3 seconds
        setTimeout(() => {
            selectedName.classList.remove('picked');
        }, 3000);
    }

    function saveNames() {
        const namesText = namesInput.value;
        localStorage.setItem('savedNames', namesText);
    }

    function loadSavedNames() {
        const savedNames = localStorage.getItem('savedNames');
        if (savedNames) {
            namesInput.value = savedNames;
        }
    }

    function showError(message) {
        removeErrorMessages();
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        
        pickButton.parentNode.insertBefore(errorDiv, pickButton.nextSibling);
        
        // Remove error message after 3 seconds
        setTimeout(() => {
            errorDiv.remove();
        }, 3000);
    }

    function removeErrorMessages() {
        const errorMessages = document.querySelectorAll('.error-message');
        errorMessages.forEach(msg => msg.remove());
    }
});
