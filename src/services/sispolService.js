const axios = require("axios");
const RUTA_FOTOS = "http://localhost:5000/Sispenal/fotos/";

async function buscarASP(q) {
    const URL_ASP = "http://10.0.0.10/sispoljson.asp";
    const response = await axios.get(URL_ASP, {
        params: { q: q }
    });

    const datos = response.data || [];
    console.log(response.data[0]);
    return datos.map(p => ({
        ...p,
        fotoUrl: p.archfoto 
            ? RUTA_FOTOS + p.archfoto 
            : null
    }));
}
module.exports = { buscarASP };
