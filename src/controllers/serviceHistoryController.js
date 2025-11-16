const ServiceHistory = require("../models/ServiceHistory");

const createServiceRecord = async (req, res) => {
  
  try {
    const { warrantyId, serviceDate, description, cost } = req.body; 

    const documents = req.files ? req.files.map(f => f.path) : [];

    const serviceRecord = await ServiceHistory.create({
      warranty: warrantyId, 
      user: req.user.id,
      serviceDate,
      description,
      cost,
      documents,
    });

    res.status(201).json(serviceRecord.toObject());

  } catch (error) {
    console.error("Error creating service history:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const getAllServiceRecords = async (req, res)=> {
  try{
    const records = await ServiceHistory.find({user: req.user.id});
    res.status(200).json(records);
  }catch (error) {
    console.error("Error fetching service history records:", error);
    res.status(500).json({ message: "Server error" });
  }
}

const getServiceRecords = async (req, res) => {
  try {
    const { warrantyId } = req.params;
    const records = await ServiceHistory.find({ warranty: warrantyId }).sort({ serviceDate: -1 }).lean();
    res.status(200).json(records);
  } catch (error) {
    console.error("Error fetching service history:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const updateServiceRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const normalUpdates = { ...req.body }; 

    if (req.files && req.files.length > 0) {
    const newDocs = req.files.map(f => f.path);

    // Update with both normal fields and $push
    const record = await ServiceHistory.findByIdAndUpdate(
        id,
        {
        ...normalUpdates,
        $push: { documents: { $each: newDocs } }
        },
        { new: true, runValidators: true }
    );

    if (!record) return res.status(404).json({ message: "Service record not found" });
    return res.status(200).json(record);
    }

    // If no files uploaded, just update normally
    const record = await ServiceHistory.findByIdAndUpdate(
    id,
    normalUpdates,
    { new: true, runValidators: true }
    );

    if (!record) return res.status(404).json({ message: "Service record not found" });
    res.status(200).json(record);

  } catch (error) {
    console.error("Error updating service history:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const deleteServiceRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const record = await ServiceHistory.findByIdAndDelete(id);

    if (!record) return res.status(404).json({ message: "Service record not found" });

    res.status(200).json({ message: "Service record deleted" });
  } catch (error) {
    console.error("Error deleting service history:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  createServiceRecord,
  getServiceRecords,
  updateServiceRecord,
  deleteServiceRecord,
  getAllServiceRecords
};
