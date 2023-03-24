const Joi = require('@hapi/joi')

function expressJoi (schemas) {
    return function(req, res, next) {
        ['body', 'params', 'query'].forEach(key => {
            if(!schemas[key]) return
            // 校验
            const schema = Joi.object(schemas[key])
            const {error} = schema.validate(req[key])
            if( error ) throw error
        })
        next()
    }
}

module.exports = {
    expressJoi
}