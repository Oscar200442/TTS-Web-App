const textToSpeech = require('@google-cloud/text-to-speech');
const { readFileSync } = require('fs');
const { join } = require('path');
const { Writable } = require('stream');

// Konfigurer Vercel til at downloade Google Cloud-biblioteket
// Det sker ved at oprette vercel.json filen.

// Opret en stream der opsamler audio data
class WritableStream extends Writable {
  constructor(options) {
    super(options);
    this.buffer = Buffer.alloc(0);
  }
  _write(chunk, encoding, callback) {
    this.buffer = Buffer.concat([this.buffer, chunk]);
    callback();
  }
  getBuffer() {
    return this.buffer;
  }
}

module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Kun POST-anmodninger er tilladt.' });
    }

    try {
        const { text } = req.body;
        if (!text) {
            return res.status(400).json({ error: 'Tekst er påkrævet.' });
        }

        // Hent Google Cloud-nøglen fra miljøvariabel
        const credentialsBase64 = process.env.GOOGLE_CREDENTIALS_BASE64;
        if (!credentialsBase64) {
            throw new Error('Google-nøgle ikke konfigureret.');
        }

        const credentialsJSON = Buffer.from(credentialsBase64, 'base64').toString('utf-8');
        const credentials = JSON.parse(credentialsJSON);

        const client = new textToSpeech.TextToSpeechClient({ credentials });

        const request = {
            input: { text: text },
            voice: { languageCode: 'da-DK', ssmlGender: 'NEUTRAL' },
            audioConfig: { audioEncoding: 'MP3' },
        };

        const [response] = await client.synthesizeSpeech(request);
        const audioContent = response.audioContent.toString('base64');

        res.status(200).json({ audioContent });

    } catch (error) {
        console.error('Fejl ved Text-to-Speech API:', error);
        res.status(500).json({ error: 'Der opstod en intern serverfejl.' });
    }
};
