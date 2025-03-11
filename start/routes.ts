/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
import { createReadStream } from 'node:fs'
import { join } from 'node:path'
import { cwd } from 'node:process'

import AlinhamentosController from '../app/controllers/alinhamentos_controller.js'
import CategoriasController from '../app/controllers/categorias_controller.js'
import DesenvolvedoresController from '../app/controllers/desenvolvedores_controller.js'
import LinguagensController from '../app/controllers/linguaguems_controller.js'
import TiposController from '../app/controllers/tipos_controller.js'
import StatusesController from '../app/controllers/statuses_controller.js'
import ResponsaveisController from '../app/controllers/responsavels_controller.js'
import PrioridadesController from '../app/controllers/prioridades_controller.js'
import ProprietariosController from '../app/controllers/proprietarios_controller.js'
import DemandasController from '../app/controllers/demandas_controller.js'
import HistoricoDemandasController from '../app/controllers/historico_demandas_controller.js'
import SolucoesController from '../app/controllers/solucaos_controller.js'
import HistoricoSolucoesController from '../app/controllers/historico_solucaos_controller.js'

router.get('/', async () => {
  return {
    hello: 'ministério publico',
  }
})

router.get('/alinhamentos', [AlinhamentosController, 'index'])
router.post('/alinhamentos', [AlinhamentosController, 'store'])
router.get('/alinhamentos/:id', [AlinhamentosController, 'show'])
router.put('/alinhamentos/:id', [AlinhamentosController, 'update'])
router.delete('/alinhamentos/:id', [AlinhamentosController, 'destroy'])
router.get('/proprietarios/:proprietarioId/alinhamentos', [AlinhamentosController, 'indexByProprietario'])

router.get('/desenvolvedores', [DesenvolvedoresController, 'index'])
router.post('/desenvolvedores', [DesenvolvedoresController, 'store'])
router.get('/desenvolvedores/:id', [DesenvolvedoresController, 'show'])
router.put('/desenvolvedores/:id', [DesenvolvedoresController, 'update'])
router.delete('/desenvolvedores/:id', [DesenvolvedoresController, 'destroy'])
router.get('/proprietarios/:proprietarioId/desenvolvedores', [DesenvolvedoresController, 'indexByProprietario'])

router.get('/categorias', [CategoriasController, 'index'])
router.post('/categorias', [CategoriasController, 'store'])
router.get('/categorias/:id', [CategoriasController, 'show'])
router.put('/categorias/:id', [CategoriasController, 'update'])
router.delete('/categorias/:id', [CategoriasController, 'destroy'])
router.get('/proprietarios/:proprietarioId/categorias', [CategoriasController, 'indexByProprietario'])

router.get('/linguagens', [LinguagensController, 'index'])
router.post('/linguagens', [LinguagensController, 'store'])
router.get('/linguagens/:id', [LinguagensController, 'show'])
router.put('/linguagens/:id', [LinguagensController, 'update'])
router.delete('/linguagens/:id', [LinguagensController, 'destroy'])
router.get('/proprietarios/:proprietarioId/linguagens', [LinguagensController, 'indexByProprietario'])

router.get('/tipos', [TiposController, 'index'])
router.post('/tipos', [TiposController, 'store'])
router.get('/tipos/:id', [TiposController, 'show'])
router.put('/tipos/:id', [TiposController, 'update'])
router.delete('/tipos/:id', [TiposController, 'destroy'])
router.get('/proprietarios/:proprietarioId/tipos', [TiposController, 'indexByProprietario'])

router.get('/status', [StatusesController, 'index'])
router.post('/status', [StatusesController, 'store'])
router.get('/status/:id', [StatusesController, 'show'])
router.put('/status/:id', [StatusesController, 'update'])
router.delete('/status/:id', [StatusesController, 'destroy'])
router.get('/proprietarios/:proprietarioId/status', [StatusesController, 'indexByProprietario'])
router.get('/responsaveis', [ResponsaveisController, 'index'])
router.post('/responsaveis', [ResponsaveisController, 'store'])
router.get('/responsaveis/:id', [ResponsaveisController, 'show'])
router.put('/responsaveis/:id', [ResponsaveisController, 'update'])
router.delete('/responsaveis/:id', [ResponsaveisController, 'destroy'])
router.get('/proprietarios/:proprietarioId/responsaveis', [ResponsaveisController, 'indexByProprietario'])  

router.get('/prioridades', [PrioridadesController, 'index'])
router.post('/prioridades', [PrioridadesController, 'store'])
router.get('/prioridades/:id', [PrioridadesController, 'show'])
router.put('/prioridades/:id', [PrioridadesController, 'update'])
router.delete('/prioridades/:id', [PrioridadesController, 'destroy'])
router.get('/proprietarios/:proprietarioId/prioridades', [PrioridadesController, 'indexByProprietario'])

router.get('/proprietarios', [ProprietariosController, 'index'])
router.post('/proprietarios', [ProprietariosController, 'store'])
router.get('/proprietarios/:id', [ProprietariosController, 'show'])
router.put('/proprietarios/:id', [ProprietariosController, 'update'])
router.delete('/proprietarios/:id', [ProprietariosController, 'destroy'])
router.post('/proprietarios/:id/clone', [ProprietariosController, 'clone'])

router.get('/demandas/all', [DemandasController, 'all'])

router.get('/demandas', [DemandasController, 'index'])
router.post('/demandas', [DemandasController, 'store'])
router.get('/demandas/:id', [DemandasController, 'show'])
router.put('/demandas/:id', [DemandasController, 'update'])
router.delete('/demandas/:id', [DemandasController, 'destroy'])
router.get('/proprietarios/:proprietarioId/demandas', [DemandasController, 'indexByProprietario'])

router.get('/solucoes', [SolucoesController, 'index'])
router.post('/solucoes', [SolucoesController, 'store'])
router.get('/solucoes/:id', [SolucoesController, 'show'])
router.put('/solucoes/:id', [SolucoesController, 'update'])
router.delete('/solucoes/:id', [SolucoesController, 'destroy'])
router.get('/proprietarios/:proprietarioId/solucoes', [SolucoesController, 'indexByProprietario'])

router.get('/historico_demandas/:id', [HistoricoDemandasController, 'show'])
router.get('/proprietarios/:proprietarioId/historico_demandas', [HistoricoDemandasController, 'indexByProprietario'])
router.get('/historico_demandas', [HistoricoDemandasController, 'index'])
router.get('/historico_solucoes/:id', [HistoricoSolucoesController, 'show'])
router.get('/historico_solucoes', [HistoricoSolucoesController, 'index'])

// rotas sem paginação para o dashboard
router.get('/proprietarios/:proprietarioId/dashboard/solucoes', [SolucoesController, 'getAllByProprietario'])
router.get('/proprietarios/:proprietarioId/dashboard/demandas', [DemandasController, 'getAllByProprietario'])



// Serve logo images
router.get('/tmp/upload/logo/:filename', async ({ params, response }) => {
  try {
    const filePath = join(cwd(), 'tmp', 'upload', 'logo', params.filename)
    return response.stream(createReadStream(filePath))
  } catch (error) {
    return response.notFound('Image not found')
  }
})
