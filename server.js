const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

const API_FOOTBALL_KEY = 'ea02cef455d6cb6bb7af16c1017493e9';

function normalizarTexto(texto) {
    if (!texto) return '';
    return texto.toString().normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase().trim();
}

app.get('/api/buscar-equipo', async (req, res) => {
    // Tomamos el nombre del equipo local
    const nombreQueryCrudo = req.query.local || req.query.nombre || '';
    const nombreQuery = normalizarTexto(nombreQueryCrudo);
    
    if (!nombreQuery) {
        return res.status(400).json({ error: 'Falta el parámetro del equipo' });
    }

    try {
        // Consultamos TODA la data directo a la API-Football
        const urlBusqueda = `https://v3.football.api-sports.io/teams?search=${encodeURIComponent(nombreQueryCrudo)}`;
        const respuestaApi = await fetch(urlBusqueda, {
            method: 'GET',
            headers: { 'x-apisports-key': API_FOOTBALL_KEY }
        });

        const data = await respuestaApi.json();

        if (data.response && data.response.length > 0) {
            let listaEquipos = data.response;
            
            // Match inteligente para asegurar que agarre el equipo correcto
            let mejorCoincidencia = listaEquipos.find(item => 
                normalizarTexto(item.team.name) === nombreQuery ||
                normalizarTexto(item.team.code) === nombreQuery
            );

            if (!mejorCoincidencia) {
                mejorCoincidencia = listaEquipos.find(item => 
                    normalizarTexto(item.team.name).includes(nombreQuery) ||
                    nombreQuery.includes(normalizarTexto(item.team.name))
                );
            }

            const equipoSeleccionado = mejorCoincidencia || listaEquipos[0];

            return res.json({ 
                response: [{ team: equipoSeleccionado.team, venue: equipoSeleccionado.venue }] 
            });
        }

        // Si la API no tiene el equipo, devuelve vacío
        res.json({ response: [] });
    } catch (error) {
        console.error("Error al consultar API-Football:", error);
        res.status(500).json({ error: 'Error interno al consultar la API externa' });
    }
});

app.listen(PORT, () => console.log(`Servidor DataGol ejecutándose en puerto ${PORT}`));
