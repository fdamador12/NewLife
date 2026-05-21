const fs = require('fs');
const path = require('path');

// Ruta base donde están los archivos (CAMBIA ESTO A TU RUTA REAL)
const levelsPath = path.join(__dirname, './frontend/mobile/src/modules/progress/screens/levels');

// Array de todos los niveles y módulos
const levels = Array.from({ length: 12 }, (_, i) => i + 1);
const modules = [1, 2, 3];

let filesProcessed = 0;
let filesModified = 0;

// Función para procesar cada archivo
function processFile(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        const originalContent = content;

        // Reemplazar navigation.goBack() con navigation.navigate('Path')
        // PERO SOLO dentro de la función handleBack y SOLO en la condición if (stepIndex === 0)
        content = content.replace(
            /if \(stepIndex === 0\)\s*\{\s*navigation\.goBack\(\);/,
            "if (stepIndex === 0) {\n            navigation.navigate('Path');"
        );

        filesProcessed++;

        // Si hubo cambio, escribir el archivo
        if (content !== originalContent) {
            fs.writeFileSync(filePath, content, 'utf8');
            filesModified++;
            console.log(`✅ MODIFICADO: ${path.basename(filePath)}`);
        } else {
            console.log(`⏭️  SIN CAMBIOS: ${path.basename(filePath)}`);
        }
    } catch (error) {
        console.error(`❌ ERROR en ${filePath}:`, error.message);
    }
}

// Recorrer todos los niveles y módulos
levels.forEach(nivel => {
    modules.forEach(modulo => {
        const fileName = `Nivel${nivel}Modulo${modulo}.tsx`;
        const filePath = path.join(levelsPath, `nivel${nivel}`, fileName);

        if (fs.existsSync(filePath)) {
            processFile(filePath);
        } else {
            console.log(`⚠️  NO ENCONTRADO: ${filePath}`);
        }
    });
});

console.log(`\n${'='.repeat(50)}`);
console.log(`📊 RESUMEN:`);
console.log(`   Archivos procesados: ${filesProcessed}`);
console.log(`   Archivos modificados: ${filesModified}`);
console.log(`${'='.repeat(50)}`);