import responseHandler from '../../utils/responseHandler.js';

export default {
    handler: async (req, res) => {
        try {
            if (!req.session || !req.session.conflictData) {
                return responseHandler.error(res, 'No conflict data found');
            }

            const conflictData = req.session.conflictData;
            
            return responseHandler.success(res, 'Conflict data retrieved', conflictData);

        } catch (error) {
            return responseHandler.error(res, error?.message || 'Failed to get conflict data');
        }
    }
};


