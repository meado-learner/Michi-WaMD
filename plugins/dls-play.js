const express = require('express');
const fetch = require('node-fetch');
const { apiKeyAuth } = require('../middleware/auth.js');

const router = express.Router();

const headers = {
    "accept": "*/*",
    "accept-language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
    "sec-ch-ua": "\"Not A(Brand\";v=\"8\", \"Chromium\";v=\"132\"",
    "sec-ch-ua-mobile": "?1",
    "sec-ch-ua-platform": "\"Android\"",
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "cross-site",
    "Referer": "https://id.ytmp3.mobi/",
    "Referrer-Policy": "strict-origin-when-cross-origin"
};

// Función genérica para descargar
async function ytmp(url, format = 'mp3') {
    const initial = await fetch(`https://d.ymcdn.org/api/v1/init?p=y&23=1llum1n471&_=${Math.random()}`, { headers });
    const init = await initial.json();

    const id = url.match(/(?:youtu\.be\/|youtube\.com\/(?:.*v=|.*\/|.*embed\/))([^&?/]+)/)?.[1];
    if (!id) throw new Error("No se pudo obtener el ID del video.");

    const convertURL = `${init.convertURL}&v=${id}&f=${format}&_=${Math.random()}`;

    const converts = await fetch(convertURL, { headers });
    const convert = await converts.json();

    let info = {};
    for (let i = 0; i < 3; i++) {
        const j = await fetch(convert.progressURL, { headers });
        info = await j.json();
        if (info.progress === 3) break;
    }

    return {
        url: convert.downloadURL,
        title: info.title || "Sin título"
    };
}


// Endpoint MP4
router.get('/download/ytmp4', apiKeyAuth, async (req, res) => {
    const { url } = req.query;

    if (!url) {
        return res.status(400).json({
            status: "error",
            success: false,
            error: "Falta ?url="
        });
    }

    try {
        const results = await ytmp(url, 'mp4');
        res.status(200).json({
            status: true,
            data: {
                url: results.url,
                title: results.title
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            status: false,
            error: err.message || "Error desconocido al procesar el video."
        });
    }
});

module.exports = router;
