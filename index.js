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
        weight: 2
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
    let url = "https://pxdata.stat.fi/PxWeb/api/v1/fi/StatFin/muutl/statfin_muutl_pxt_11a2.px";
    const response = await fetch(url)
    const migrationJSON = await response.json();

    
}


fetchGeo();