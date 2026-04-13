const jsonServer = require('json-server')
const auth = require('json-server-auth')
const path = require('path')

const app = jsonServer.create()
const router = jsonServer.router(path.join(__dirname, 'db.json'))
const middlewares = jsonServer.defaults()

// Bind the router db to the app
app.db = router.db

// Default middlewares (cors, static, etc.)
app.use(middlewares)
app.use(jsonServer.bodyParser)

// Auth guard rules: all routes need auth except /auth/*
const rules = auth.rewriter({
  '/auth/register': '/register',
  '/auth/login': '/login',
  '/projects*': '/660/projects$1',
  '/tasks*': '/660/tasks$1',
})
app.use(rules)
app.use(auth)

// Custom route: GET /projects/:id/tasks?status=&assignee=
app.get('/projects/:id/tasks', (req, res) => {
  const db = router.db
  let tasks = db.get('tasks').filter({ project_id: req.params.id }).value()

  if (req.query.status) {
    tasks = tasks.filter((t) => t.status === req.query.status)
  }
  if (req.query.assignee) {
    tasks = tasks.filter((t) => t.assignee_id === req.query.assignee)
  }

  res.json({ tasks })
})

// GET /projects/:id — include tasks in response
app.get('/projects/:id', (req, res) => {
  const db = router.db
  const project = db.get('projects').find({ id: req.params.id }).value()
  if (!project) return res.status(404).json({ error: 'not found' })
  const tasks = db.get('tasks').filter({ project_id: req.params.id }).value()
  res.json({ ...project, tasks })
})

// GET /projects — return { projects: [] }
app.get('/projects', (req, res) => {
  const db = router.db
  const projects = db.get('projects').value()
  res.json({ projects })
})

app.use(router)

const PORT = 4000
app.listen(PORT, () => {
  console.log(`TaskFlow API running at http://localhost:${PORT}`)
  console.log('  Seed credentials: lalitapandey030@gmail.com / password123')
})
