import responseHandler from "../utils/responseHandler.js";

const validator = schemas => (req, res, next) => {
    const types = { body: req.body, params: req.params, query: req.query };

    for (const type in schemas) {
        if (!schemas[type]) continue;
        const { error, value } = schemas[type].validate(types[type], {
            allowUnknown: true,
            stripUnknown: true
        });
        if (error) {
            return responseHandler.error(res, error.details[0].message);
        }
        // Only update body and params, query is readonly in some Express setups
        if (type === 'body' || type === 'params') {
            req[type] = value;
        }
    }
    next();
};

export default validator;
