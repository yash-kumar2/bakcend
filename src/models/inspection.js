const mongoose = require('mongoose');
const { Schema } = mongoose;

// Sub-schema for images
const ImageSchema = new Schema({
  url: String,
  description: String,
});

// Sub-schema for Headers
const HeaderSchema = new Schema({
  truckSerialNumber: { type: String, required: true },
  truckModel: { type: String, required: true },
  inspectionId: { type: Number, unique: true, autoIncrement: true },
  inspectorName: { type: String, required: true },
  inspectionEmployeeId: { type: String, required: true },
  inspectionDateTime: { type: Date, default: Date.now },
  inspectionLocation: { type: String, required: true },
  geoCoordinates: { type: String, default: null }, // Optional field
  serviceMeterHours: { type: Number, required: true },
  inspectorSignature: { type: String, required: true },
  customerName: { type: String, required: true },
  catCustomerId: { type: String, required: true },
});

// Sub-schemas for each section
const TireSchema = new Schema({
  tirePressureLeftFront: Number,
  tirePressureRightFront: Number,
  tireConditionLeftFront: String,
  tireConditionRightFront: String,
  tirePressureLeftRear: Number,
  tirePressureRightRear: Number,
  tireConditionLeftRear: String,
  tireConditionRightRear: String,
  overallSummary: String,
  images: [ImageSchema],
});

const BatterySchema = new Schema({
  make: String,
  replacementDate: Date,
  voltage: Number,
  waterLevel: String,
  condition: Boolean,
  leakOrRust: Boolean,
  overallSummary: String,
  images: [ImageSchema],
});

const ExteriorSchema = new Schema({
  rustDentOrDamage: Boolean,
  oilLeakInSuspension: Boolean,
  overallSummary: String,
  images: [ImageSchema],
});

const BrakeSchema = new Schema({
  brakeFluidLevel: String,
  brakeConditionFront: String,
  brakeConditionRear: String,
  emergencyBrake: String,
  overallSummary: String,
  images: [ImageSchema],
});

const EngineSchema = new Schema({
  rustDentOrDamage: Boolean,
  engineOilCondition: String,
  engineOilColor: String,
  brakeFluidCondition: String,
  brakeFluidColor: String,
  oilLeakInEngine: Boolean,
  overallSummary: String,
  images: [ImageSchema],
});

const VoiceOfCustomerSchema = new Schema({
  feedback: String,
  images: [ImageSchema],
});

// Main schema
const InspectionSchema = new Schema({
  headers: HeaderSchema,
  tires: TireSchema,
  battery: BatterySchema,
  exterior: ExteriorSchema,
  brakes: BrakeSchema,
  engine: EngineSchema,
  voiceOfCustomer: VoiceOfCustomerSchema,
});

const Inspection = mongoose.model('Inspection', InspectionSchema);

module.exports = Inspection;
