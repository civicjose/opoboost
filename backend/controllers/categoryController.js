const Category = require('../models/Category');
const TestDefinition = require('../models/TestDefinition');


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

  try {
    // 1. Borrar todos los TestDefinition que pertenecen a esta categoría
    await TestDefinition.deleteMany({ category: id });

    // 2. Borrar la categoría en sí
    await Category.findByIdAndDelete(id);

    res.json({ message: 'Categoría y todos sus tests asociados han sido eliminados.' });

  } catch (err) {
    console.error('Error en el borrado en cascada:', err.message);
    res.status(500).json({ message: 'Error al eliminar la categoría.' });
  }
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
