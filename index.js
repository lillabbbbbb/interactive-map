const fetchStatData = async (url, body) => {
    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
    });
    return await response.json()
}

const fetchGeo = async () => {
    const url = "https://geo.stat.fi/geoserver/wfs?service=WFS&version=2.0.0&request=GetFeature&typeName=tilastointialueet:kunta4500k&outputFormat=json&srsName=EPSG:4326";
    const response = await fetch(url)
    const dataJSON = await response.json();

    initMap(dataJSON)
}


const initMap = (data) => {
    let map = L.map('map', {
        minZoom: -3,
    })

    let geoSJON = L.geoJSON(data, {
        weight: 2,
        onEachFeature: getFeature,
        //style: getStyle
    }).addTo(map)

    let osm = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: "© OpenStreetMap"
    }).addTo(map);


    map.fitBounds(geoSJON.getBounds());


    //define basemaps
    let baseMaps = {
        "GEOJSON Map": geoSJON,
        "Open Street View": osm
    }

}

const fetchMigrations = async () => {
    
    let populationURL = "https://pxdata.stat.fi/PxWeb/api/v1/fi/StatFin/muutl/statfin_muutl_pxt_11a2.px";

    const populationBody = await (await fetch("migration_query.json")).json()

    const migrationJSON = fetchStatData(populationURL, populationBody)

    console.log(migrationJSON)

    const municipalities = migrationJSON.dimension.Alue.category.label
    //console.log(municipalities)
    const values = migrationJSON.value
    console.log("Values" + values)

    
}

const getFeature = (feature, layer) => {
    if(!feature.properties.id) return;
    const id = feature.properties.id
    //console.log(feature.properties)
    //console.log(id)

    layer.bindPopup(
        `<p>${feature.properties.name}</p>
        <p>Positive: ${id}</p>
        <p>Negative: ${id}</p>`
    )
    layer.bindTooltip(
        `<p>${feature.properties.name}</p>`
    )
}

const getStyle = (feature) => {
    if(!feature.properties.id) return;
    return {
        color: `hsl(${Math.pow((posMig / negMig),3) * 60}, 75%, 50%)`
    }
}


fetchGeo();
fetchMigrations();