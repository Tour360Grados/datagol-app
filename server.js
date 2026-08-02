const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.static(__dirname));

const API_FOOTBALL_KEY = 'ea02cef455d6cb6b7af16c1017493e9';

// Diccionario ampliado de IDs oficiales para API-Football (México, Sudamérica, Europa, UEFA, etc.)
const IDsOficialesFijos = {
    // Liga MX / CONCACAF
    "AMERICA": 2281, "CLUB AMERICA": 2281, "AMÉRICA": 2281,
    "PACHUCA": 2284,
    "TIGRES": 2285, "TIGRES UANL": 2285,
    "MONTERREY": 2277, "RAYADOS": 2277,
    "GUADALAJARA": 2278, "CHIVAS": 2278,
    "CRUZ AZUL": 2279,
    "PUMAS": 2289, "UNAM PUMAS": 2289,
    "ATLAS": 2272,
    "LEON": 2282, "LEÓN": 2282,
    "SANTOS LAGUNA": 2291, "SANTOS": 2291,
    "TOLUCA": 2286,
    "JUAREZ": 2293, "FC JUAREZ": 2293, "JUÁREZ": 2293,
    "TIJUANA": 2292, "XOLOS": 2292,
    "QUERETARO": 2290, "QUERÉTARO": 2290,
    "SAN LUIS": 4443, "ATLETICO SAN LUIS": 4443, "ATLÉTICO SAN LUIS": 4443,
    "NECAXA": 2283,
    "MAZATLAN": 2985, "MAZATLÁN": 2985,
    "PUEBLA": 2288,
    "CINCINNATI": 1608, "FC CINCINNATI": 1608,
    "COLUMBUS": 1616, "COLUMBUS CREW": 1616,
    "CHARLOTTE": 1640,
    "ORLANDO": 1614, "ORLANDO CITY": 1614,
    "SALT LAKE": 1729, "REAL SALT LAKE": 1729,

    // Argentina (Liga Profesional)
    "RIVER PLATE": 435, "RIVER": 435,
    "BOCA JUNIORS": 451, "BOCA": 451,
    "INDEPENDIENTE": 437,
    "RACING CLUB": 439, "RACING": 439,
    "SAN LORENZO": 436,
    "ESTUDIANTES": 440, "ESTUDIANTES LP": 440,
    "VELEZ SARSFIELD": 455, "VÉLEZ": 455,
    "TALLERES": 442, "TALLERES CORDOBA": 442,

    // Brasil (Brasileirão)
    "FLAMENGO": 127,
    "PALMEIRAS": 121,
    "SAO PAULO": 126, "SÃO PAULO": 126,
    "CORINTHIANS": 131,
    "FLUMINENSE": 128,
    "ATLETICO MINEIRO": 103, "ATLÉTICO MINEIRO": 103,
    "INTERNACIONAL": 119,
    "GREMIO": 130, "GRÊMIO": 130,
    "BOTAFOGO": 120,

    // Colombia (Categoría Primera A)
    "MILLONARIOS": 1045,
    "NACIONAL": 1049, "ATLETICO NACIONAL": 1049, "ATLÉTICO NACIONAL": 1049,
    "AMERICA DE CALI": 1051, "AMÉRICA DE CALI": 1051,
    "INDEPENDIENTE MEDELLIN": 1048, "MEDELLIN": 1048,
    "JUNIOR": 1059, "JUNIOR BARRANQUILLA": 1059,
    "SANTA FE": 1046, "INDEPENDIENTE SANTA FE": 1046,

    // Europa - España (La Liga)
    "REAL MADRID": 541,
    "BARCELONA": 529, "FC BARCELONA": 529,
    "ATLETICO MADRID": 530, "ATLÉTICO DE MADRID": 530,
    "VALENCIA": 532,
    "SEVILLA": 536,
    "REAL SOCIEDAD": 548,
    "VILLARREAL": 533,
    "BETIS": 543, "REAL BETIS": 543,

    // Europa - Inglaterra (Premier League)
    "MANCHESTER CITY": 50,
    "MANCHESTER UNITED": 33,
    "LIVERPOOL": 40,
    "ARSENAL": 42,
    "CHELSEA": 49,
    "TOTTENHAM": 47, "TOTTENHAM HOTSPUR": 47,
    "NEWCASTLE": 34, "NEWCASTLE UNITED": 34,

    // Europa - Italia (Serie A)
    "INTER": 505, "INTER MILAN": 505,
    "AC MILAN": 489, "MILAN": 489,
    "JUVENTUS": 496,
    "NAPOLI": 492,
    "ROMA": 497,
    "LAZIO": 487,
    "ATALANTA": 499,

    // Europa - Selecciones / UEFA
    "MEXICO": 2119, "MÉXICO": 2119,
    "ESTADOS UNIDOS": 2381, "USA": 2381,
    "BRASIL": 6, "BRAZIL": 6,
    "ARGENTINA": 9,
    "ESPAÑA": 9, "SPAIN": 9,
    "FRANCIA": 2, "FRANCE": 2,
    "ALEMANIA": 25, "GERMANY": 25,
    "ITALIA": 7, "ITALY": 7,
    "INGLATERRA": 10, "ENGLAND": 10,
    "PORTUGAL": 27,
    "URUGUAY": 790
};

app.get('/api/buscar-equipo', async (req, res) => {
    const nombreQuery = req.query.nombre ? req.query.nombre.trim().toUpperCase() : '';
    
    if (!nombreQuery) {
        return res.status(400).json({ error: 'Falta el parámetro nombre' });
    }

    // 1. Revisar si está en el diccionario rápido fijo
    if (IDsOficialesFijos[nombreQuery]) {
        return res.json({
            response: [{ team: { id: IDsOficialesFijos[nombreQuery], name: nombreQuery } }]
        });
    }

    // 2. Si no está, buscar mediante fetch a la API externa de manera inteligente
    try {
        const respuestaApi = await fetch(`https://v3.football.api-sports.io/teams?search=${encodeURIComponent(nombreQuery)}`, {
            method: 'GET',
            headers: {
                'x-apisports-key': API_FOOTBALL_KEY
            }
        });

        const data = await respuestaApi.json();
        res.json(data);
    } catch (error) {
        console.error("Error al consultar API-Football:", error);
        res.status(500).json({ error: 'Error interno al consultar la API externa' });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor DataGol ejecutándose en puerto ${PORT}`);
});
