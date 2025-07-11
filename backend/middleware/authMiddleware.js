const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'cambiame_por_un_secreto_seguro';

module.exports = async (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No autorizado' });
  }
  const token = auth.split(' ')[1];
  try {
    const data = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(data.id);
    if (!user) return res.status(401).json({ message: 'Usuario no existe' });
    req.user = { id: user._id, role: user.role, name: user.name };
    next();
  } catch {
    res.status(401).json({ message: 'Token inválido' });
  }
};
