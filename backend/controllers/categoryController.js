const Category = require('../models/Category');

// Listar todas
exports.listCategories = async (req, res) => {
  const cats = await Category.find().sort({ name: 1 });
  res.json(cats);
};

// Crear nueva
exports.createCategory = async (req, res) => {
  const { name, description } = req.body;
  if (!name) {
    return res.status(400).json({ message: 'El nombre es obligatorio' });
  }
  try {
    const cat = new Category({ name, description });
    await cat.save();
    res.status(201).json(cat);
  } catch (err) {
    res.status(400).json({ message: 'Ya existe esa categoría' });
  }
};

// Borrar categoría
exports.deleteCategory = async (req, res) => {
  const { id } = req.params;
  await Category.findByIdAndDelete(id);
  res.json({ message: 'Categoría eliminada' });
};

// Editar categoría
exports.updateCategory = async (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;
  const cat = await Category.findByIdAndUpdate(
    id,
    { name, description },
    { new: true, runValidators: true }
  );
  res.json(cat);
};

exports.getCategoryById = async (req, res) => {
  const { id } = req.params;
  const cat = await Category.findById(id);
  if (!cat) return res.status(404).json({ message: 'Categoría no encontrada' });
  res.json(cat);
};
