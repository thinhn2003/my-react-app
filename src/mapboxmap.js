import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import * as geolib from 'geolib';
import icon from './11868246.png';

const MapboxMap = () => {
  const mapContainerRef = useRef(null);
  const [currentLocation, setCurrentLocation] = useState(null);

  useEffect(() => {
    mapboxgl.accessToken = 'pk.eyJ1IjoidGhpbmhucTE5MTEiLCJhIjoiY2x3YXp1bGZ6MGpkNTJwcHB3MDhjZ2ZtMyJ9.-Ec-NjeeRMoRy-LLU2FHwQ';

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/streets-v9',
      center: [-122.39581105302317, 37.794331003246846],
      zoom: 13
    });

    map.on('load', () => {
      if (currentLocation) {
        showNearbyApplicants(currentLocation, map);
      }
    });

    return () => map.remove();
  }, [currentLocation]);

  const showNearbyApplicants = (location, map) => {
    const { latitude, longitude } = location;
    const applicantsWithinRange = [];

    fetch('https://data.sfgov.org/resource/rqzj-sfat.json')
      .then(response => response.json())
      .then(data => {
        data.forEach(truck => {
          const truckLat = parseFloat(truck.latitude);
          const truckLng = parseFloat(truck.longitude);

          // Tính khoảng cách giữa vị trí hiện tại và truck
          const distance = geolib.getDistance(
            { latitude, longitude },
            { latitude: truckLat, longitude: truckLng }
          );

          // Kiểm tra xem truck có nằm trong phạm vi 2km hay không
          if (distance <= 2000) {
            applicantsWithinRange.push(truck);
          }
        });

        applicantsWithinRange.forEach(truck => {
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
  };

  const handleLocationSubmit = () => {
    const address = document.getElementById('address').value;

    if (address.trim() !== '') {
      fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?access_token=${mapboxgl.accessToken}`)
        .then(response => response.json())
        .then(data => {
          if (data.features && data.features.length > 0) {
            const [longitude, latitude] = data.features[0].center;
            setCurrentLocation({ latitude, longitude });
          } else {
            console.error('Invalid address');
          }
        })
        .catch(error => {
          console.error('Error geocoding address:', error);
        });
    } else {
      console.error('Invalid address');
    }
  };

  return (
    <div>
      <div>
        <label htmlFor="address">Address:</label>
        <input type="text" id="address" />
      </div>
      <button onClick={handleLocationSubmit}>Show Nearby Applicants</button>
      <div ref={mapContainerRef} style={{ width: '100%', height: '800px' }} />
    </div>
  );
};

export default MapboxMap;