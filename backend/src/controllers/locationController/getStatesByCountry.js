import { State } from 'country-state-city';
import responseHandler from '../../utils/responseHandler.js';

export default {
    handler: async (req, res) => {
        try {
            const { country } = req.query;

            if (!country) {
                return responseHandler.error(
                    res,
                    'Country code is required'
                );
            }

            const states = State.getStatesOfCountry(country);
            
            // Transform to a simpler format
            const formattedStates = states.map(state => ({
                isoCode: state.isoCode,
                name: state.name,
                countryCode: state.countryCode,
                latitude: state.latitude,
                longitude: state.longitude
            }));

            return responseHandler.success(
                res,
                'States retrieved successfully',
                formattedStates
            );

        } catch (error) {
            return responseHandler.error(
                res,
                error?.message || 'Failed to retrieve states'
            );
        }
    }
};
