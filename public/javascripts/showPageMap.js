mapboxgl.accessToken = mapToken;
const map = new mapboxgl.Map({
    //container must match the id of the map in show.ejs
    container: 'map',
    style: 'mapbox://styles/mapbox/light-v10', // stylesheet location
    center: campground.geometry.coordinates, // starting position [longitude, latitude]
    zoom: 10 // starting zoom
});
//the marker shown on the map
new mapboxgl.Marker()
    .setLngLat(campground.geometry.coordinates)
    .setPopup(
        new mapboxgl.Popup({ offset: 25 })
            .setHTML(
                `<h3>${campground.title}</h3><p>${campground.location}</p>`
            )
    )
    .addTo(map)
