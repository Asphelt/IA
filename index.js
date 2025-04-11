const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors());

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Csnu88334',
    database: 'Prueba2'
});

app.get('/api/escenarios', (req, res) => {
    const query = `
        SELECT e.id, e.nombre, e.descripcion,
       d.opcion, d.accion, d.resultado,
       s.nombre AS skill_nombre, s.puntos AS skill_puntos
FROM escenas e
LEFT JOIN decisiones d ON e.id = d.escena_id
CROSS JOIN skills s
ORDER BY e.id, d.opcion, s.nombre;

    `;

    db.query(query, (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Error al consultar la base de datos' });
        }

        // Agrupar decisiones por escenario
        const escenarios = {};
        results.forEach(row => {
            if (!escenarios[row.id]) {
                escenarios[row.id] = {
                    id: row.id,
                    nombre: row.nombre,
                    descripcion: row.descripcion,
                    decisiones: []
                };
            }

            if (row.opcion && row.accion && row.resultado !== null) {
                escenarios[row.id].decisiones.push({
                    opcion: row.opcion,
                    accion: row.accion,
                    resultado: row.resultado
                });
            }
        });

        res.json(Object.values(escenarios));
    });
});

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`API corriendo en http://localhost:${PORT}`);
});
