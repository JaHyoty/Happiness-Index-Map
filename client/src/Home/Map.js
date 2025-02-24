import React, { useRef } from "react";
import { MapContainer, TileLayer, GeoJSON, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import chroma from "chroma-js";

// Color scale function using chroma.js
const getColor = (value) => {
  const scale = chroma.scale(["#FF0000", "#05f500"]).domain([55, 65]);
  return scale(value).hex();
};

// Style function for GeoJSON lines
const defaultStyle = (feature) => {
  const color = getColor(feature.properties.totalHappinessScore);
  return { color: color };
};

// Function to bind popups to each feature
const onEachFeature = (feature, layer, selectedLayerRef, featureClickedRef, setSelectedZip, fetchSidebarData) => {
  if (feature.properties && feature.properties.zipcode) {
    // Round the happiness score to 2 decimal places 
    const happinessScore = feature.properties.totalHappinessScore;
    const roundedHappinessScore = (typeof happinessScore === 'number') ? happinessScore.toFixed(2) : 'N/A';

    // Display tooltip on ZipArea
    layer.bindTooltip(`
      <div>
        <strong>Zip Code:</strong> ${feature.properties.zipcode}<br>
        <strong>Happiness Score:</strong> ${roundedHappinessScore}
      </div>`, {
        permanent: false,
        direction: "top",
        className: "zip-label",
      });

    // Add click event to change style
    layer.on({
      click: (e) => {
        featureClickedRef.current = true; // Set flag that a feature was clicked
        setSelectedZip(feature.properties.zipcode); // Set the selected zip code
        fetchSidebarData(feature.properties.zipcode); // Fetch additional data

        // Reset the previously selected layer to default style
        if (selectedLayerRef.current) {
          const prevElement = selectedLayerRef.current.getElement();
          if (prevElement) {
            prevElement.classList.add("hidden-border");
          }
        }

        // Ensure the element exists before applying classes
        const element = layer.getElement();
        if (element) {
          element.classList.remove("hidden-border");
        }

        // Update the selected layer state
        selectedLayerRef.current = layer;
      },
    });
  }
};

// Add a click event listener to the map to reset styles
const MapClickHandler = ({ selectedLayerRef, featureClickedRef, setSelectedZip, setSidebarData }) => {
  useMapEvents({
    click: (e) => {
      if (!featureClickedRef.current) { // Only reset if no feature was clicked
        if (selectedLayerRef.current) {
          const prevElement = selectedLayerRef.current.getElement();
          if (prevElement) {
            prevElement.classList.add("hidden-border");
          }
          selectedLayerRef.current = null;
        }
        setSelectedZip(null); // Reset the selected zip code
        setSidebarData({}); // Clear the sidebar data
      }
      featureClickedRef.current = false; // Reset the flag after the click event
    }
  });
  return null;
};

const MapComponent = ({ geoData, setSelectedZip, setSidebarData, fetchSidebarData }) => {
  const geoJsonLayerRef = useRef(null);
  const selectedLayerRef = useRef(null);
  const featureClickedRef = useRef(false); // Use ref instead of state

  return (
    <MapContainer
      center={[41.881832, -87.623177]}
      zoom={12}
      style={{ height: "600px", width: "100%" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      <GeoJSON
        data={geoData}
        style={defaultStyle}
        onEachFeature={(feature, layer) => onEachFeature(feature, layer, selectedLayerRef, featureClickedRef, setSelectedZip, fetchSidebarData)}
        ref={geoJsonLayerRef}
        className="hidden-border"
      />
      <MapClickHandler selectedLayerRef={selectedLayerRef} featureClickedRef={featureClickedRef} setSelectedZip={setSelectedZip} setSidebarData={setSidebarData} />
    </MapContainer>
  );
};

export default MapComponent;
