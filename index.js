let migrationData = []

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
    const response = await fetch(url);
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
        style: getStyle
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

fetchGeo();

 const getMigrations = async() => {
    let populationURL = "https://pxdata.stat.fi/PxWeb/api/v1/fi/StatFin/muutl/statfin_muutl_pxt_11a2.px";
    const populationBody = await(await fetch("migration_data_query.json")).json();
    const migrationJSON = await fetchStatData(populationURL, populationBody);
    //console.log(migrationJSON)

    const municipalities = migrationJSON.dimension.Alue.category.label
    console.log(municipalities)
    const values = migrationJSON.value
    //console.log("Values: " + values)

    //my friend helped me figure out the following lines
    const keys = Object.keys(municipalities)
    //console.log(keys)

    for (let i = 0; i < keys.length; i++) {
        let immigration = values[2 * i]
        let emigration = values[2 * i + 1]

        let netMigration = immigration - emigration

        migrationData = addToMigrationData({
            id: municipalities[keys],
            name: municipalities[keys[i]],
            immigration: immigration,
            emigration: emigration,
            netMigration: netMigration
        });
        //console.log(migrationJSON[keys[i]])
    }
}

const addToMigrationData = (object) => {
    migrationData.push(object)
    return migrationData
}

const findValues = (feature) => {
    console.log(migrationData)
        return migrationData[feature.properties.id]
    }

const getFeature = (feature, layer) => {
    if (!feature.properties.id) return;
    const id = feature.properties.id
    //console.log(feature.properties)
    //console.log("ID: " + id)
    console.log(findValues(feature))

    layer.bindPopup(
        `<p>${feature.properties.name}</p>
            <p>Positive: ${findValues(feature)}</p>
            <p>Negative: ${findValues(feature)}</p>
            <p>Negative: ${findValues(feature)}</p>`
    )
    layer.bindTooltip(
        `<p>${feature.properties.name}</p>`
    )
}


const getStyle = (feature) => {
    if (!feature.properties.id) return;
    return {
        color: `hsl(${Math.pow((findValues(feature) / findValues(feature)), 3) * 60}, 75%, 50%)`
    }
}

getMigrations();