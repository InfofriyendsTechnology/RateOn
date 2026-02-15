import { Country } from 'country-state-city';
import responseHandler from '../../utils/responseHandler.js';

export default {
    handler: async (req, res) => {
        try {
            const countries = Country.getAllCountries();
            
            // Transform to a simpler format
            const formattedCountries = countries.map(country => ({
                isoCode: country.isoCode,
                name: country.name,
                phonecode: country.phonecode,
                flag: country.flag,
                currency: country.currency,
                latitude: country.latitude,
                longitude: country.longitude
            }));

            return responseHandler.success(
                res,
                'Countries retrieved successfully',
                formattedCountries
            );

        } catch (error) {
            return responseHandler.error(
                res,
                error?.message || 'Failed to retrieve countries'
            );
        }
    }
};
