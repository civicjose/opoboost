// backend/controllers/categoryController.js
const Category = require('../models/Category');
const TestDefinition = require('../models/TestDefinition');
const Question = require('../models/Question');
const User = require('../models/User');

exports.listCategories = async (req, res) => {
  try {
    if (req.user.role === 'administrador' || req.user.role === 'profesor') {
      const allCategories = await Category.find().sort({ name: 1 });
      return res.json(allCategories);
    }
    const userWithPermissions = await User.findById(req.user.id).select('accessibleCategories');
    if (!userWithPermissions) return res.status(404).json({ message: 'Usuario no encontrado' });
    
    const userPermissions = userWithPermissions.accessibleCategories || [];
    const accessibleCategories = await Category.find({ '_id': { $in: userPermissions } }).sort({ name: 1 });
    res.json(accessibleCategories);
  } catch (err) {
    console.error("Error al listar categorías:", err.message);
    res.status(500).json({ message: 'Error al listar las categorías' });
  }
};

exports.createCategory = async (req, res) => {
  const { name, description } = req.body;
  if (!name) return res.status(400).json({ message: 'El nombre es obligatorio' });
  try {
    const cat = new Category({ name, description });
    await cat.save();
    res.status(201).json(cat);
  } catch (err) {
    res.status(400).json({ message: 'Ya existe esa categoría' });
  }
};

exports.deleteCategory = async (req, res) => {
  const { id } = req.params;
  try {
    const testsToDelete = await TestDefinition.find({ category: id });
    if (testsToDelete.length > 0) {
      const questionIdsToCheck = new Set();
      testsToDelete.forEach(test => { test.questions.forEach(questionId => { questionIdsToCheck.add(questionId.toString()); }); });
      await TestDefinition.deleteMany({ category: id });
      for (const questionId of questionIdsToCheck) {
        const otherTestsUsingQuestion = await TestDefinition.findOne({ questions: questionId });
        if (!otherTestsUsingQuestion) {
          await Question.findByIdAndDelete(questionId);
        }
      }
    }
    await Category.findByIdAndDelete(id);
    res.json({ message: 'Categoría y todo su contenido asociado eliminados correctamente.' });
  } catch (err) {
    console.error('Error en el borrado en cascada de la categoría:', err.message);
    res.status(500).json({ message: 'Error al eliminar la categoría.' });
  }
};

exports.updateCategory = async (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;
  const cat = await Category.findByIdAndUpdate(id, { name, description }, { new: true, runValidators: true });
  res.json(cat);
};

exports.getCategoryById = async (req, res) => {
  const { id } = req.params;
  const cat = await Category.findById(id);
  if (!cat) return res.status(404).json({ message: 'Categoría no encontrada' });
  res.json(cat);
};