import Service from '../models/service.js';


// GET ALL SERVICES
// GET /services/
export const service_index = async (req, res) => {
  try {
    const services = await Service.find().sort({ createdAt: -1 });
    console.log(`📋 Retrieved ${services.length} services`);
    res.status(200).json(services);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


//CREATE SERVICE
// POST /services
export const service_create = async (req, res) => {
  try {
    const { type, price, base_price, is_active, barber, duration } = req.body;

    // Basic validation
    if (!type || !price) {
      return res.status(400).json({ message: "Type and price are required" });
    }

    const newService = new Service({
      type,
      price,
      base_price,
      is_active,
      barber: barber && barber.trim() ? barber : undefined,
      duration,
    });

    const savedService = await newService.save();

    res.status(201).json(savedService);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// UPDATE SERVICE
// PATCH /services/:id
export const service_update = async (req, res) => {
  try {
    const id = req.params.id;

    // Clean up barber field if empty
    const updateData = { ...req.body };
    if (updateData.barber && !updateData.barber.trim()) {
      updateData.barber = undefined;
    }

    const updatedService = await Service.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedService) {
      return res.status(404).json({ message: "Service not found" });
    }

    res.status(200).json(updatedService);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};



// DELETE SERVICE
// DELETE /services/:id
export const service_delete = async (req, res) => {
  try {
    const id = req.params.id;

    const deletedService = await Service.findByIdAndDelete(id);

    if (!deletedService) {
      return res.status(404).json({ message: "Service not found" });
    }

    res.status(200).json({ message: "Service deleted successfully" });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};



// 📌 GET SINGLE SERVICE
// GET /services/:id
export const service_details = async (req, res) => {
  try {
    const id = req.params.id;

    const service = await Service.findById(id);

    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    res.status(200).json(service);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};