import { City } from 'country-state-city';
import responseHandler from '../../utils/responseHandler.js';

export default {
    handler: async (req, res) => {
        try {
            const { country, state } = req.query;

            if (!country || !state) {
                return responseHandler.error(
                    res,
                    'Country code and state code are required'
                );
            }

            const cities = City.getCitiesOfState(country, state);
            
            // Transform to a simpler format
            const formattedCities = cities.map(city => ({
                name: city.name,
                stateCode: city.stateCode,
                countryCode: city.countryCode,
                latitude: city.latitude,
                longitude: city.longitude
            }));

            return responseHandler.success(
                res,
                'Cities retrieved successfully',
                formattedCities
            );

        } catch (error) {
            return responseHandler.error(
                res,
                error?.message || 'Failed to retrieve cities'
            );
        }
    }
};
