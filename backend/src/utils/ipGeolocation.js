/**
 * IP Geolocation Utility
 * Uses ip-api.com (free, 45 requests/minute)
 */

const detectLocationFromIP = async (ipAddress) => {
    try {
        // Use ip-api.com for IP geolocation (free, 45 req/min)
        const url = `http://ip-api.com/json/${ipAddress}?fields=status,message,country,countryCode,region,regionName,city,lat,lon`;
        
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`IP API request failed with status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.status === 'fail') {
            throw new Error(data.message || 'Failed to detect location from IP');
        }
        
        return {
            success: true,
            country: data.country,
            countryCode: data.countryCode,
            state: data.regionName,
            stateCode: data.region,
            city: data.city,
            latitude: data.lat,
            longitude: data.lon
        };
        
    } catch (error) {
        return {
            success: false,
            error: error.message || 'Failed to detect location'
        };
    }
};

export default detectLocationFromIP;
