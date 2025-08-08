document.addEventListener('DOMContentLoaded', () => {
    const textInput = document.getElementById('textInput');
    const speakBtn = document.getElementById('speakBtn');
    const audioPlayer = document.getElementById('audioPlayer');
    const loadingIndicator = document.getElementById('loadingIndicator');
    const errorMessage = document.getElementById('errorMessage');

    speakBtn.addEventListener('click', async () => {
        const text = textInput.value.trim();

        if (text.length === 0) {
            errorMessage.textContent = 'Indtast venligst noget tekst.';
            errorMessage.classList.remove('hidden');
            return;
        }

        loadingIndicator.classList.remove('hidden');
        errorMessage.classList.add('hidden');
        speakBtn.disabled = true;

        try {
            const response = await fetch('/api/speak', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ text }),
            });

            if (!response.ok) {
                throw new Error('Kunne ikke omdanne tekst til tale. Prøv igen senere.');
            }

            const data = await response.json();
            
            if (data.audioContent) {
                const audioUrl = 'data:audio/mp3;base64,' + data.audioContent;
                audioPlayer.src = audioUrl;
                audioPlayer.classList.remove('hidden');
                audioPlayer.play();
            } else {
                throw new Error('Ingen lydfil modtaget.');
            }
        } catch (error) {
            console.error('Fejl:', error);
            errorMessage.textContent = error.message;
            errorMessage.classList.remove('hidden');
        } finally {
            loadingIndicator.classList.add('hidden');
            speakBtn.disabled = false;
        }
    });
});
