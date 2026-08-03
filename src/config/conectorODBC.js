const { DBFFile } = require('dbffile');

async function leerInterLeg(limit = 100) {
    try {
        const dbf = await DBFFile.open("Z:\\inter_leg.dbf", {
            encoding: "latin1"
        });
        const camposValidos = dbf.fields.filter(f => f.type !== "G").map(f => f.name);
        const records = await dbf.readRecords(limit);
        const datos = records.map(r => {
            let nuevo = {};
            camposValidos.forEach(c => {
                let valor = r[c];
                if (valor === undefined || valor === null) {
                    valor = "";
                }
                nuevo[c] = valor;
            });
            return nuevo;
        });
        return datos;
    } catch (error) {
        console.error("Error leyendo DBF:", error);
        throw error;
    }
}

module.exports = {
    leerInterLeg
};



