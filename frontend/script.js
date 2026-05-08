const form = document.getElementById('shorten-form');
const urlInput = document.getElementById('long-url');
const submitBtn = document.getElementById('submit-btn');
const btnText = document.querySelector('.btn-text');
const loader = document.getElementById('loader');
const errorMessage = document.getElementById('error-message');
const resultContainer = document.getElementById('result-container');
const shortUrlEl = document.getElementById('short-url');
const originalUrlDisplay = document.getElementById('original-url-display');
const copyBtn = document.getElementById('copy-btn');

const API_BASE_URL = '/api';

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const url = urlInput.value.trim();
    if (!url) return;

    // Reset UI
    errorMessage.style.display = 'none';
    resultContainer.style.display = 'none';
    setLoading(true);

    try {
        const response = await fetch(`${API_BASE_URL}/shorten`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ url }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.detail || 'Failed to shorten URL. Please check your input.');
        }

        // Show result
        const finalShortUrl = `${window.location.origin}/${data.short_code}`;
        shortUrlEl.href = finalShortUrl;
        shortUrlEl.textContent = finalShortUrl;
        originalUrlDisplay.textContent = data.original_url;
        resultContainer.style.display = 'block';
        
    } catch (error) {
        errorMessage.textContent = error.message;
        errorMessage.style.display = 'block';
    } finally {
        setLoading(false);
    }
});

copyBtn.addEventListener('click', async () => {
    const urlToCopy = shortUrlEl.textContent;
    if (!urlToCopy) return;

    try {
        await navigator.clipboard.writeText(urlToCopy);
        
        // Visual feedback
        const originalHTML = copyBtn.innerHTML;
        copyBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>';
        
        setTimeout(() => {
            copyBtn.innerHTML = originalHTML;
        }, 2000);
    } catch (err) {
        console.error('Failed to copy text: ', err);
    }
});

function setLoading(isLoading) {
    if (isLoading) {
        btnText.style.display = 'none';
        loader.style.display = 'block';
        submitBtn.disabled = true;
    } else {
        btnText.style.display = 'block';
        loader.style.display = 'none';
        submitBtn.disabled = false;
    }
}
