import Product from '../models/product.js';


// GET ALL PRODUCTS
// GET /products/
export const product_index = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });

    res.status(200).json(products);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};



// CREATE PRODUCT
export const product_create = async (req, res) => {
  try {
    const {
      name,
      type,
      stock_quantity,
      price,
      description,
      brand,
      low_stock_threshold,
      image_url,
      barcode
    } = req.body;

    // Basic validation
    if (!name || !type || price == null) {
      return res.status(400).json({
        message: "Name, type and price are required"
      });
    }

    const product = new Product({
      name,
      type,
      stock_quantity,
      price,
      description,
      brand,
      low_stock_threshold,
      image_url,
      barcode
    });

    const savedProduct = await product.save();

    res.status(201).json(savedProduct);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};



// UPDATE PRODUCT
// PATCH /products/:id
export const product_update = async (req, res) => {
  try {
    const id = req.params.id;

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json(updatedProduct);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};



// DELETE PRODUCT
// DELETE /products/:id
export const product_delete = async (req, res) => {
  try {
    const id = req.params.id;

    const deletedProduct = await Product.findByIdAndDelete(id);

    if (!deletedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({ message: "Product deleted successfully" });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};



// GET SINGLE PRODUCT
// GET /products/:id
export const product_details = async (req, res) => {
  try {
    const id = req.params.id;

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json(product);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};