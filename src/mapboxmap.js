import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

import icon from './11868246.png';

const MapboxMap = () => {
  const mapContainerRef = useRef(null);

  useEffect(() => {
    mapboxgl.accessToken = 'pk.eyJ1IjoidGhpbmhucTE5MTEiLCJhIjoiY2x3YXp1bGZ6MGpkNTJwcHB3MDhjZ2ZtMyJ9.-Ec-NjeeRMoRy-LLU2FHwQ';

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/streets-v9',
      center: [-122.39581105302317, 37.794331003246846],
      zoom: 13
    });

    map.on('load', () => {
      fetch('https://data.sfgov.org/resource/rqzj-sfat.json')
        .then(response => response.json())
        .then(data => {
          data.forEach(truck => {
            const markerElement = document.createElement('div');
            markerElement.className = 'marker';
            markerElement.style.backgroundImage = `url(${icon})`;
            markerElement.style.backgroundSize = 'cover';
            markerElement.style.width = '30px';
            markerElement.style.height = '30px';

            new mapboxgl.Marker(markerElement)
              .setLngLat([truck.longitude, truck.latitude])
              .setPopup(new mapboxgl.Popup().setHTML(`<h3>${truck.applicant}</h3>`))
              .addTo(map);
          });
        });
    });

    return () => map.remove();
  }, []);

  return <div ref={mapContainerRef} style={{ width: '100%', height: '800px' }} />;
};

export default MapboxMap;