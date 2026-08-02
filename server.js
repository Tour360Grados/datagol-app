const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.static(__dirname));

const API_FOOTBALL_KEY = 'ea02cef455d6cb6bb7af16c1017493e9';

const IDsOficialesFijos = {
    "FC CINCINNATI": 1608, "CINCINNATI": 1608,
    "PACHUCA": 2284,
    "COLUMBUS CREW": 1616, "COLUMBUS": 1616,
    "ATLAS": 2272,
    "CHARLOTTE": 1640,
    "UNAM PUMAS": 2289, "PUMAS": 2289,
    "TIGRES": 2293, "TIGRES UANL": 2293,
    "REAL SALT LAKE": 1619, "SALT LAKE": 1619,
    "MONTERREY": 2281,
    "ORLANDO CITY": 1635, "ORLANDO": 1635,
    "LOS ANGELES": 1599, "LAFC": 1599,
    "GUADALAJARA": 2278, "CHIVAS": 2278,
    "CRUZ AZUL": 2277, "C. AZUL": 2277,
    "PHILADELPHIA UNION": 1612, "FILADELFIA": 1612,
    "AUSTIN": 1632,
    "TIJUANA": 2294,
    "CLUB AMERICA": 2271, "AMERICA": 2271, "AGUILAS": 2271,
    "SAN DIEGO": 1645
};

app.get('/api/buscar-equipo', async (req, res) => {
    const nombreEquipo = req.query.nombre ? req.query.nombre.trim().toUpperCase() : '';
    
    if (!nombreEquipo) {
        return res.status(400).json({ error: 'Se requiere el parámetro nombre' });
    }

    if (IDsOficialesFijos[nombreEquipo]) {
        const idDirecto = IDsOficialesFijos[nombreEquipo];
        return res.json({
            response: [{ team: { id: idDirecto, name: nombreEquipo } }]
        });
    }

    try {
        const targetUrl = `https://v3.football.api-sports.io/teams?search=${encodeURIComponent(nombreEquipo)}`;
        const apiResponse = await fetch(targetUrl, {
            method: 'GET',
            headers: { 'x-apisports-key': API_FOOTBALL_KEY }
        });
        const data = await apiResponse.json();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Error interno de red', detalle: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 DataGol en marcha en puerto ${PORT}`);
});