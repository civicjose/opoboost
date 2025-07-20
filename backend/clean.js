// backend/cleanup.js
const mongoose = require('mongoose');
const Attempt = require('./models/Attempt');
const TestDefinition = require('./models/TestDefinition');
require('dotenv').config(); // Carga las variables de entorno

// Usamos la variable de entorno para la conexión
const DB_CONNECTION_STRING = process.env.DB_CONNECTION_STRING || 'mongodb://127.0.0.1/plataforma';

const cleanupOrphanedAttempts = async () => {
    console.log('Iniciando la limpieza de intentos huérfanos en la base de datos de PRODUCCIÓN...');

    if (!process.env.DB_CONNECTION_STRING) {
        console.error('ERROR: La variable de entorno DB_CONNECTION_STRING no está definida en tu .env. Abortando por seguridad.');
        return;
    }

    try {
        await mongoose.connect(DB_CONNECTION_STRING, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('✅ Conexión a la base de datos de producción exitosa.');

        const existingTestDefIds = await TestDefinition.find().select('_id').lean();
        const validTestIds = new Set(existingTestDefIds.map(td => td._id.toString()));
        console.log(`🔎 Encontrados ${validTestIds.size} tests válidos.`);

        const allAttempts = await Attempt.find().select('testDef').lean();
        console.log(`🧐 Revisando ${allAttempts.length} intentos en total.`);

        const orphanedAttemptIds = allAttempts
            .filter(attempt => !attempt.testDef || !validTestIds.has(attempt.testDef.toString()))
            .map(attempt => attempt._id);
            
        if (orphanedAttemptIds.length === 0) {
            console.log('🎉 ¡Perfecto! No se encontraron intentos huérfanos.');
            await mongoose.disconnect();
            return;
        }

        console.log(`🗑️ Se encontraron ${orphanedAttemptIds.length} intentos huérfanos. Procediendo a eliminarlos...`);

        const deleteResult = await Attempt.deleteMany({
            _id: { $in: orphanedAttemptIds }
        });

        console.log(`✅ Limpieza completada. Se eliminaron ${deleteResult.deletedCount} intentos.`);

    } catch (error) {
        console.error('❌ Ocurrió un error durante la limpieza:', error);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Desconectado de la base de datos.');
    }
};

cleanupOrphanedAttempts();