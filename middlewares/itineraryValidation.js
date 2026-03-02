const Joi = require('joi');

const activitySchema = Joi.object({
  id: Joi.any().optional(), 
  task: Joi.string().required(),
  time: Joi.string().required(),
  cost: Joi.number().min(0).required(),
});

const daySchema = Joi.object({
  id: Joi.any().optional(),
  activities: Joi.array().items(activitySchema).min(1).required()
});

//  Itinerary schema 
const itinerarySchema = Joi.object({
  destination: Joi.string().min(3).required(),
  userEmail: Joi.string().email().required(), 
  basePrice: Joi.number().min(0).optional(),   
  totalCost: Joi.number().min(0).optional(),   
  userEmail: Joi.string().email().optional(),  
  days: Joi.array().items(daySchema).min(1).required(),
  status: Joi.string().valid('saved', 'draft').default('saved')
}).unknown(true); 

// Middleware
const validateItinerary = (req, res, next) => {
  const { error, value } = itinerarySchema.validate(req.body, { 
    abortEarly: false,
    stripUnknown: false 
  });

  if (error) {
    return res.status(400).send({
      success: false,
      message: error.details[0].message
    });
  }
  
  req.body = value;
  next();
};

module.exports = validateItinerary;