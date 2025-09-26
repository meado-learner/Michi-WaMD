document.addEventListener('DOMContentLoaded', () => {
    const botCountSpan = document.getElementById('bot-count');
    const getCodeForm = document.getElementById('get-code-form');
    const phoneNumberInput = document.getElementById('phone-number');
    const codeDisplay = document.getElementById('code-display');
    const pairingCode = document.getElementById('pairing-code');
    const getCodeBtn = document.getElementById('get-code-btn');

    const setPrefixForm = document.getElementById('set-prefix-form');
    const prefixPhoneNumberInput = document.getElementById('prefix-phone-number');
    const newPrefixInput = document.getElementById('new-prefix');
    const prefixResult = document.getElementById('prefix-result');

    // Fetch and display bot status on page load and periodically
    const fetchBotStatus = async () => {
        try {
            const response = await fetch('/api/bots-status');
            const data = await response.json();
            botCountSpan.textContent = data.totalBots;
        } catch (error) {
            botCountSpan.textContent = 'Error';
            console.error('Error fetching bot status:', error);
        }
    };

    fetchBotStatus();
    setInterval(fetchBotStatus, 10000); // Refresh every 10 seconds

    // Handle pairing code request
    getCodeForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const phoneNumber = phoneNumberInput.value.trim();
        if (!phoneNumber) return;

        getCodeBtn.disabled = true;
        getCodeBtn.textContent = 'Generating...';
        pairingCode.textContent = '';
        codeDisplay.style.display = 'none';

        try {
            const response = await fetch('/api/get-code', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phoneNumber }),
            });

            if (response.ok) {
                const data = await response.json();
                pairingCode.textContent = data.code;
                codeDisplay.style.display = 'block';
            } else {
                const errorData = await response.json();
                alert(`Error: ${errorData.error}`);
            }
        } catch (error) {
            alert('An unexpected error occurred. Please check the console.');
            console.error('Error getting pairing code:', error);
        } finally {
            getCodeBtn.disabled = false;
            getCodeBtn.textContent = 'Get Code';
        }
    });

    // Handle prefix change request
    setPrefixForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const phoneNumber = prefixPhoneNumberInput.value.trim();
        const prefix = newPrefixInput.value.trim();
        if (!phoneNumber || !prefix) return;

        try {
            const response = await fetch('/api/set-prefix', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phoneNumber, prefix }),
            });

            const data = await response.json();
            prefixResult.textContent = data.message || 'Prefix set successfully!';
            prefixResult.style.display = 'block';

        } catch (error) {
            prefixResult.textContent = 'An error occurred.';
            prefixResult.style.display = 'block';
            console.error('Error setting prefix:', error);
        }
    });
});