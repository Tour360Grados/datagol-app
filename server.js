const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.static(__dirname));

const API_FOOTBALL_KEY = 'ea02cef455d6cb6bb7af16c1017493e9';

function normalizarTexto(texto) {
    if (!texto) return '';
    return texto
        .toString()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toUpperCase()
        .trim();
}

// Función auxiliar para realizar peticiones a la API-Football
async function consultarApiFootball(endpoint) {
    const url = `https://v3.football.api-sports.io/${endpoint}`;
    const respuesta = await fetch(url, {
        method: 'GET',
        headers: { 'x-apisports-key': API_FOOTBALL_KEY }
    });
    return await respuesta.json();
}

app.get('/api/buscar-equipo', async (req, res) => {
    const localQuery = req.query.local || req.query.nombre || '';
    const visitanteQuery = req.query.visitante || '';
    
    if (!localQuery) {
        return res.status(400).json({ error: 'Falta el parámetro del equipo' });
    }

    try {
        // 1. Buscamos los posibles IDs para el equipo local
        const dataLocal = await consultarApiFootball(`teams?search=${encodeURIComponent(localQuery)}`);
        if (!dataLocal.response || dataLocal.response.length === 0) {
            return res.json({ response: [] });
        }

        let equiposLocales = dataLocal.response;

        // Si el usuario también mandó el equipo visitante, hacemos el cruce de calendario (Fixtures)
        if (visitanteQuery) {
            const dataVisitante = await consultarApiFootball(`teams?search=${encodeURIComponent(visitanteQuery)}`);
            
            if (dataVisitante.response && dataVisitante.response.length > 0) {
                let equiposVisitantes = dataVisitante.response;

                // Buscamos en los próximos partidos si alguno de los locales juega contra alguno de los visitantes
                let partidoEncontrado = null;
                let idLocalFinal = null;

                for (let loc of equiposLocales) {
                    // Consultamos partidos próximos del equipo local (por ejemplo, los siguientes 15 días)
                    const fixturesData = await consultarApiFootball(`fixtures?team=${loc.team.id}&next=10`);
                    
                    if (fixturesData.response) {
                        for (let fixture of fixturesData.response) {
                            const idRival = fixture.teams.home.id === loc.team.id ? fixture.teams.away.id : fixture.teams.home.id;
                            
                            // Verificamos si el rival de la API coincide con alguno de los candidatos visitantes
                            const matchVisitante = equiposVisitantes.find(vis => vis.team.id === idRival);
                            
                            if (matchVisitante) {
                                // ¡Encontramos el partido exacto en la agenda real!
                                idLocalFinal = loc;
                                break;
                            }
                        }
                    }
                    if (idLocalFinal) break;
                }

                // Si el cruce de calendario confirmó el partido, devolvemos ese equipo con máxima prioridad
                if (idLocalFinal) {
                    return res.json({
                        response: [{ team: idLocalFinal.team, venue: idLocalFinal.venue }]
                    });
                }
            }
        }

        // 2. Si no hay visitante o no se encontró cruce por calendario, usamos el mejor match por similitud de texto
        let mejorCoincidencia = equiposLocales.find(item => 
            normalizarTexto(item.team.name) === normalizarTexto(localQuery)
        ) || equiposLocales[0];

        return res.json({
            response: [{ team: mejorCoincidencia.team, venue: mejorCoincidencia.venue }]
        });

    } catch (error) {
        console.error("Error en API-Football:", error);
        res.status(500).json({ error: 'Error interno al consultar la API externa' });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor DataGol ejecutándose en puerto ${PORT}`);
});
