const express = require('express');
const router = express.Router();
const multer=require('multer')
const Inspection = require('../models/inspection');
/// Adjust the path as needed

// Route to create a new inspection
// Route to create a new inspection
const storage = multer.diskStorage({
    destination: './uploads/',
    filename: (req, file, cb) => {
      cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
  });
  function checkFileType(file, cb) {
    const filetypes = /jpeg|jpg|png|gif/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
  
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb('Error: Images Only!');
    }
  }
  
  // Initialize upload
  const upload = multer({
    storage: storage,
    limits: { fileSize: 1000000 }, // 1MB file size limit
    fileFilter: (req, file, cb) => {
      checkFileType(file, cb);
    }
  }).fields([
    { name: 'tireImages', maxCount: 8 },
    { name: 'batteryImages', maxCount: 5 },
    { name: 'exteriorImages', maxCount: 5 },
    { name: 'brakeImages', maxCount: 5 },
    { name: 'engineImages', maxCount: 5 },
    { name: 'customerImages', maxCount: 5 }
  ]);
  router.post('/inspection', (req, res) => {
    upload(req, res, (err) => {
        if (err) {
            return res.status(400).json({ success: false, message: err });
        }

        const newInspection = new Inspection({
            headers: req.body.headers,
            tires: {
                ...req.body.tires,
                images: req.files?.tireImages?.map(file => ({ url: file.path })) || []
            },
            battery: {
                ...req.body.battery,
                images: req.files?.batteryImages?.map(file => ({ url: file.path })) || []
            },
            exterior: {
                ...req.body.exterior,
                images: req.files?.exteriorImages?.map(file => ({ url: file.path })) || []
            },
            brakes: {
                ...req.body.brakes,
                images: req.files?.brakeImages?.map(file => ({ url: file.path })) || []
            },
            engine: {
                ...req.body.engine,
                images: req.files?.engineImages?.map(file => ({ url: file.path })) || []
            },
            voiceOfCustomer: {
                feedback: req.body.voiceOfCustomer.feedback,
                images: req.files?.customerImages?.map(file => ({ url: file.path })) || []
            }
        });

        newInspection.save()
            .then(inspection => res.json({ success: true, inspection }))
            .catch(error => res.status(400).json({ success: false, error }));
    });
});
// Route to edit an existing inspection by ID
router.put('/inspection/:id', (req, res) => {
    upload(req, res, async (err) => {
        if (err) {
            return res.status(400).json({ success: false, message: err });
        }

        try {
            const updateData = {
                headers: req.body.headers,
                tires: {
                    ...req.body.tires,
                    images: req.files?.tireImages?.map(file => ({ url: file.path })) || []
                },
                battery: {
                    ...req.body.battery,
                    images: req.files?.batteryImages?.map(file => ({ url: file.path })) || []
                },
                exterior: {
                    ...req.body.exterior,
                    images: req.files?.exteriorImages?.map(file => ({ url: file.path })) || []
                },
                brakes: {
                    ...req.body.brakes,
                    images: req.files?.brakeImages?.map(file => ({ url: file.path })) || []
                },
                engine: {
                    ...req.body.engine,
                    images: req.files?.engineImages?.map(file => ({ url: file.path })) || []
                },
                voiceOfCustomer: {
                    feedback: req.body.voiceOfCustomer.feedback,
                    images: req.files?.customerImages?.map(file => ({ url: file.path })) || []
                }
            };

            const updatedInspection = await Inspection.findByIdAndUpdate(req.params.id, updateData, { new: true });

            if (!updatedInspection) {
                return res.status(404).json({ success: false, message: 'Inspection not found' });
            }

            res.json({ success: true, inspection: updatedInspection });
        } catch (error) {
            res.status(400).json({ success: false, error });
        }
    });
});
router.patch('/inspection/:id', (req, res) => {
    upload(req, res, async (err) => {
        if (err) {
            return res.status(400).json({ success: false, message: err });
        }

        try {
            const updateData = {
                headers: req.body.headers,
                tires: {
                    ...req.body.tires,
                    images: req.files?.tireImages?.map(file => ({ url: file.path })) || []
                },
                battery: {
                    ...req.body.battery,
                    images: req.files?.batteryImages?.map(file => ({ url: file.path })) || []
                },
                exterior: {
                    ...req.body.exterior,
                    images: req.files?.exteriorImages?.map(file => ({ url: file.path })) || []
                },
                brakes: {
                    ...req.body.brakes,
                    images: req.files?.brakeImages?.map(file => ({ url: file.path })) || []
                },
                engine: {
                    ...req.body.engine,
                    images: req.files?.engineImages?.map(file => ({ url: file.path })) || []
                },
                voiceOfCustomer: {
                    feedback: req.body.voiceOfCustomer.feedback,
                    images: req.files?.customerImages?.map(file => ({ url: file.path })) || []
                }
            };

            const updatedInspection = await Inspection.findByIdAndUpdate(req.params.id, { $set: updateData }, { new: true });

            if (!updatedInspection) {
                return res.status(404).json({ success: false, message: 'Inspection not found' });
            }

            res.json({ success: true, inspection: updatedInspection });
        } catch (error) {
            res.status(400).json({ success: false, error });
        }
    });
});

module.exports = router;
