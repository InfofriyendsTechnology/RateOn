import detectLocationFromIP from '../../utils/ipGeolocation.js';
import responseHandler from '../../utils/responseHandler.js';

export default {
    handler: async (req, res) => {
        try {
            // Get IP from request - check X-Forwarded-For header first (for proxy/load balancer)
            let ipAddress = req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
                           req.headers['x-real-ip'] ||
                           req.connection?.remoteAddress ||
                           req.socket?.remoteAddress ||
                           req.ip;

            // Clean up IPv6 localhost to IPv4
            if (ipAddress === '::1' || ipAddress === '::ffff:127.0.0.1') {
                // For localhost testing, use a default IP (can be overridden via body)
                ipAddress = req.body?.ipAddress || '8.8.8.8'; // Google DNS for testing
            }

            // Allow override from request body (useful for testing)
            if (req.body?.ipAddress) {
                ipAddress = req.body.ipAddress;
            }

            const locationData = await detectLocationFromIP(ipAddress);

            if (!locationData.success) {
                return responseHandler.error(
                    res,
                    locationData.error || 'Failed to detect location from IP'
                );
            }

            return responseHandler.success(
                res,
                'Location detected successfully',
                {
                    ip: ipAddress,
                    ...locationData
                }
            );

        } catch (error) {
            return responseHandler.error(
                res,
                error?.message || 'Failed to detect location'
            );
        }
    }
};
