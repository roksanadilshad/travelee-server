const Joi = require('joi');

const activitySchema = Joi.object({
  id: Joi.number().optional(), 
  task: Joi.string().required(),
  time: Joi.string().required(),
  // startDate: Joi.string().required(),
  cost: Joi.number().min(0).required(),
});

const daySchema = Joi.object({
 id: Joi.number().optional(),
  activities: Joi.array().items(activitySchema).min(1).required()
});

// Itinerary schema
const itinerarySchema = Joi.object({
  destination: Joi.string().min(5).required(),
  days: Joi.array().items(daySchema).min(1).required(),
  status: Joi.string().valid('saved', 'draft').default('saved')
});

// Middleware
const validateItinerary = (req, res, next) => {
    // console.log("Validation running...");
  const { error, value } = itinerarySchema.validate(req.body, { abortEarly: false });

  if (error) {
    return res.status(400).send({
  success: false,
  message: error.details[0].message
});
  }
  // Replace req.body with validated value
  req.body = value;
  next();
};

module.exports = validateItinerary;