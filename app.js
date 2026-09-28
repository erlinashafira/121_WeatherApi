const express = require("express");
const axios = require("axios");
const path = require("path");

const app = express();
const PORT = 3000;

app.use(express.static(path.join(__dirname, "public")));

app.get("/api/lokasi", async (req, res) => {
    const kota = req.query.lokasi;

    if (!kota) { 
        return res.status(400).json({ 
            message: "Lokasi belum diisi" 
        }); 
    }

    const apiKey = "cRkl5t2DsNBOxmBtMgNL";


    try {
        const url = `https://api.maptiler.com/geocoding/${kota}.json?key=${apiKey}`;

        const response = await axios.get(url);

        const data = response.data;

        const feature = data.features[0];

        console.log("HASIL FEATURE:");
        console.log(feature);

        console.log("CONTEXT:");
        console.log(feature.context);

        const koordinat = feature.geometry.coordinates; 
        const longitude = koordinat[0]; 
        const latitude = koordinat[1];

       let negara = "-"; 
       let provinsi = "-"; 
       let kecamatan = "-";

       if (feature.context) { 
        feature.context.forEach((item) => { 
            
            if (
                item.id.startsWith("country")) { 
                negara = item.text; } 
                
            if (
                item.id.startsWith("region")) { 
                provinsi = item.text; } 
                
            if (
        item.id.startsWith("county") ||
        item.id.startsWith("municipality") ||
        item.id.startsWith("locality") ||
        item.id.startsWith("district") ||
        item.id.startsWith("suburb")
    ) {
        kecamatan = item.text;
    }
        }); 
    } 
    const lokasi = feature.text || feature.matching_text || kota; 
    
    const weatherUrl = 
        `https://api.open-meteo.com/v1/forecast` + 
        `?latitude=${latitude}` + `&longitude=${longitude}` + 
        `&current=temperature_2m` + 
        `&timezone=auto`; 
    
    const weatherResponse = await axios.get(weatherUrl); 
    const suhu = weatherResponse.data.current.temperature_2m; 
    
    res.json({ kota: lokasi, negara: negara, provinsi: provinsi, kecamatan: kecamatan, suhu: suhu, longitude: longitude, latitude: latitude });

    }catch (error) {
        console.error(error.message);

        res.status(500).json({
            message: "gagal mengambil data dari MapTiler" 
        });

    }
});

app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
});