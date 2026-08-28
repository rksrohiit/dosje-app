/**
 * Photo EXIF Metadata & Geofence Fraud Verification Service
 */

function distanceInMeters(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // Earth radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

function verifyPhotoEXIF(fileData = {}, targetLocation = { lat: 28.6139, lng: 77.2090 }) {
  // Simulated EXIF Extraction from uploaded image binary
  const photoLat = fileData.lat || (targetLocation.lat + (Math.random() - 0.5) * 0.002);
  const photoLng = fileData.lng || (targetLocation.lng + (Math.random() - 0.5) * 0.002);
  const photoTimestamp = fileData.timestamp || new Date().toISOString();

  const distanceMeters = distanceInMeters(photoLat, photoLng, targetLocation.lat, targetLocation.lng);
  const isWithinGeofence = distanceMeters <= 500; // 500 meter geofence threshold
  const isOriginalCapture = !fileData.isDownloaded;

  let verdict = 'VERIFIED_GENUINE';
  let riskFlags = [];

  if (!isWithinGeofence) {
    verdict = 'FRAUD_LOCATION_MISMATCH';
    riskFlags.push(`Location Mismatch: Photo taken ${distanceMeters} meters away from registered NGO address.`);
  }

  if (!isOriginalCapture) {
    verdict = 'FRAUD_WEB_DOWNLOAD';
    riskFlags.push('EXIF Metadata missing or modified: Photo appears to be downloaded from internet.');
  }

  return {
    filename: fileData.name || 'field_photo_01.jpg',
    exif: {
      make: fileData.make || 'Samsung Galaxy S23',
      dateTimeOriginal: photoTimestamp,
      gpsLatitude: `${photoLat.toFixed(4)}°N`,
      gpsLongitude: `${photoLng.toFixed(4)}°E`,
      geofenceDistanceMeters: distanceMeters,
    },
    isWithinGeofence,
    verdict,
    riskFlags,
    isGenuine: verdict === 'VERIFIED_GENUINE',
  };
}

module.exports = { verifyPhotoEXIF };
