const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.static(__dirname));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'analizador_quiniela.html'));
});

const API_FOOTBALL_KEY = 'ea02cef455d6cb6bb7af16c1017493e9';

// Función para limpiar nombres y asegurar el match exacto en la API
function normalizarTexto(texto) {
    if (!texto) return '';
    return texto.toString()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .toUpperCase()
        .replace(/\b(FC|CF|CLUB|AC|SAD|THE)\b/g, '') // Elimina sufijos comunes para mejor coincidencia
        .trim();
}

// Endpoint inteligente para buscar equipos con tolerancia a variantes de nombres
app.get('/api/buscar-equipo', async (req, res) => {
    const nombreQueryCrudo = req.query.local || req.query.nombre || '';
    const queryLimpia = normalizarTexto(nombreQueryCrudo);
    
    if (!queryLimpia) {
        return res.status(400).json({ error: 'Falta el parámetro del equipo' });
    }

    try {
        const urlBusqueda = `https://v3.football.api-sports.io/teams?search=${encodeURIComponent(nombreQueryCrudo)}`;
        const respuestaApi = await fetch(urlBusqueda, {
            method: 'GET',
            headers: { 'x-apisports-key': API_FOOTBALL_KEY }
        });

        const data = await respuestaApi.json();

        if (data.response && data.response.length > 0) {
            let listaEquipos = data.response;
            
            // 1. Buscar coincidencia exacta del nombre limpio
            let mejorCoincidencia = listaEquipos.find(item => 
                normalizarTexto(item.team.name) === queryLimpia ||
                normalizarTexto(item.team.code) === queryLimpia
            );

            // 2. Si no es exacta, buscar coincidencia parcial (que incluya la palabra)
            if (!mejorCoincidencia) {
                mejorCoincidencia = listaEquipos.find(item => {
                    const nAPI = normalizarTexto(item.team.name);
                    return nAPI.includes(queryLimpia) || queryLimpia.includes(nAPI);
                });
            }

            const equipoSeleccionado = mejorCoincidencia || listaEquipos[0];

            return res.json({ 
                response: [{ team: equipoSeleccionado.team, venue: equipoSeleccionado.venue }] 
            });
        }

        res.json({ response: [] });
    } catch (error) {
        console.error("Error al consultar API-Football:", error);
        res.status(500).json({ error: 'Error interno al consultar la API externa' });
    }
});

app.listen(PORT, () => console.log(`Servidor DataGol Pro ejecutándose en puerto ${PORT}`));
