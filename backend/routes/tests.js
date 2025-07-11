const router = require('express').Router()
const auth   = require('../middleware/authMiddleware')
const role   = require('../middleware/roleMiddleware')
const {
  listTestDefsByCat,
  getTestDefinitionById,
  createTestDefinition,
  createTest,
  importQuestionsToTest
} = require('../controllers/testController')

router.get(
  '/definitions/list/:catId',
  auth,
  listTestDefsByCat
)

router.get(
  '/definitions/:defId',
  auth,
  getTestDefinitionById
)

router.post(
  '/definitions/:catId',
  auth,
  role(['profesor','administrador']),
  createTestDefinition
)

router.post(
  '/definitions/:defId/import-questions',
  auth,
  role(['profesor','administrador']),
  importQuestionsToTest
)

router.post(
  '/random',
  auth,
  createTest
)

module.exports = router
