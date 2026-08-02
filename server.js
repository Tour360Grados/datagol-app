const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.static(__dirname));

const API_FOOTBALL_KEY = 'ea02cef455d6cb6bb7af16c1017493e9';

// Catálogo ampliado y normalizado con variantes comunes de Progol
const IDsOficialesFijos = {
    "CINCINNATI": 1608,
    "FC CINCINNATI": 1608,
    "PACHUCA": 2284,
    "COLUMBUS": 1616,
    "COLUMBUS CREW": 1616,
    "ATLAS": 2272,
    "CHARLOTTE": 1640,
    "CHARLOTTE FC": 1640,
    "PUMAS": 2289,
    "UNAM PUMAS": 2289,
    "TIGRES": 2293,
    "TIGRES UANL": 2293,
    "SALT LAKE": 1619,
    "REAL SALT LAKE": 1619,
    "MONTERREY": 2281,
    "ORLANDO": 1635,
    "ORLANDO CITY": 1635,
    "LOS ANGELES": 1599,
    "LAFC": 1599,
    "GUADALAJARA": 2278,
    "CHIVAS": 2278,
    "CRUZ AZUL": 2277,
    "C. AZUL": 2277,
    "FILADELFIA": 1612,
    "PHILADELPHIA UNION": 1612,
    "AUSTIN": 1632,
    "AUSTIN FC": 1632,
    "TIJUANA": 2294,
    "XOLOS": 2294,
    "AMERICA": 2271,
    "AGUILAS": 2271,
    "CLUB AMERICA": 2271,
    "SAN DIEGO": 1645
};

app.get('/api/buscar-equipo', async (req, res) => {
    let nombreEquipo = req.query.nombre ? req.query.nombre.trim().toUpperCase() : '';
    
    if (!nombreEquipo) {
        return res.status(400).json({ error: 'Se requiere el parámetro nombre' });
    }

    // Limpieza de acentos y caracteres especiales para asegurar coincidencia
    nombreEquipo = nombreEquipo.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    console.log(`🔍 Buscando ID para: "${nombreEquipo}"`);

    if (IDsOficialesFijos[nombreEquipo]) {
        const idDirecto = IDsOficialesFijos[nombreEquipo];
        console.log(`⚡ Encontrado en catálogo fijo: ID ${idDirecto}`);
        return res.json({
            response: [{ team: { id: idDirecto, name: nombreEquipo } }]
        });
    }

    // Si no está en el diccionario fijo, intenta consulta directa a la API externa
    try {
        const targetUrl = `https://v3.football.api-sports.io/teams?search=${encodeURIComponent(nombreEquipo)}`;
        const apiResponse = await fetch(targetUrl, {
            method: 'GET',
            headers: { 'x-apisports-key': API_FOOTBALL_KEY }
        });
        const data = await apiResponse.json();
        res.json(data);
    } catch (error) {
        console.error('❌ Error de red en API:', error);
        res.status(500).json({ error: 'Error interno de red', detalle: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 DataGol en marcha en puerto ${PORT}`);
});
