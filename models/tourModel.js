const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');

// const User = require('./userModel');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
      trim: true,
      maxlength: [40, 'A tour name must have less or equal then 40 characters'],
      minlength: [10, 'A tour name must have more or equal then 10 characters'],
      // validate: [validator.isAlpha, 'Tour name must only contain characters']
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a group size'],
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'A tour rating must be above 1.0'],
      max: [5, 'A tour rating must be below 5.0'],
      // round returns an integer, hence the hack of multiplication and division by 10
      set: (val) => Math.round(val * 10) / 10,
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price'],
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (value) {
          // THIS ONLY POINTS TO CURRENT DOC ON NEW DOCUMENT CREATION
          return value < this.price;
        },
        message: 'Discount price ({VALUE}) should be below regular price',
      },
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'A tour must have a description'],
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty is either: easy, medium, difficult',
      },
    },
    secretTour: {
      type: Boolean,
      default: false,
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a cover image'],
    },
    createdAt: {
      type: Date,
      default: Date.now(),
      // removed createdAt from the response object
      select: false,
    },
    images: [String],
    startDates: [Date],
    startLocation: {
      // GeoJSON representation
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      // Longitude first and Latitude second
      coordinates: [Number],
      address: String,
      description: String,
    },
    locations: [
      {
        // GeoJSON representation
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        // Longitude first and Latitude second
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    // Embedded document style
    // guides: Array

    // Child referencing document style
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// THIS IS TO IMPROVE READ PERFORMANCE
// Ascending order of single field indexing
// tourSchema.index({ price: 1 });
// Ascending and descending order of compound field indexing
tourSchema.index({ price: 1, ratingsAverage: -1 });
tourSchema.index({ slug: 1 });
tourSchema.index({ startLocation: '2dsphere' });

tourSchema.virtual('durationInWeeks').get(function () {
  return this.duration / 7;
});

// Virtual are mean't to be on the parent model
tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id',
});

// DOCUMENT MIDDLEWARE: runs before .save() and .create() methods
tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });

  next();
});

// QUERY MIDDLEWARE: runs on find hooks
// tourSchema.pre('find', function (next) {
tourSchema.pre(/^find/, function (next) {
  // the this keyword here is a query object
  this.find({ secretTour: { $ne: true } });

  next();
});

/* 
  populate('guides') fetch the child reference document<RELATIONSHIP> from the user's collection
  NOTE: Populate have a hit on performance, should be use sparingly in a big application, because it will
  create another extra query to fetch data from the reference child collection
  */
tourSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangedAt',
  });

  next();
});

// AGGREGATION MIDDLEWARE
// tourSchema.pre('aggregate', function (next) {
//   // Add this query to the aggregation pipeline stages for all
//   this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });

//   next();
// });

// Embedded document pre save hook
// tourSchema.pre('save', async function (next) {
//   const guidesPromises = this.guides.map(async (id) => await User.findById(id));
//   this.guides = await Promise.all(guidesPromises);
// });

tourSchema.post('save', function (doc, next) {
  // the this keyword is available here,
  // all that is available is the saved document and the next function to pass the execution to the next hook
  next();
});

tourSchema.post(/^find/, function (docs, next) {
  next();
});

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
