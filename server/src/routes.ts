import express from 'express';
import PointsController from './controllers/PointsController';
import ItemsController from './controllers/ItemsController';
import { celebrate,Joi } from 'celebrate'

import multer from 'multer';
import multerConfig from './config/multer';

const routes = express.Router();
const upload = multer(multerConfig);

const pointsController = new PointsController();
const itemsController = new ItemsController();

routes.get('/',(request,response) => {
    return response.json({message:'Coleta App 1.0'})
})

routes.get('/items',itemsController.index)
routes.get('/points/:id',pointsController.show)
routes.get('/points',pointsController.index)
routes.get('/points-list',pointsController.list)
routes.post(
    '/points',
    upload.single( 'image' ), 
    celebrate({
        body:Joi.object().keys({
            name:Joi.string().required(),
            email:Joi.string().required(),
            whatsapp: Joi.number().required(),
            latitude: Joi.number().required(),
            longitude: Joi.number().required(),
            city:Joi.string().required(),
            uf:Joi.string().required(),
            items:Joi.string().required()
        })
    },{
        abortEarly:false
    }),
    pointsController.create)

export default routes;