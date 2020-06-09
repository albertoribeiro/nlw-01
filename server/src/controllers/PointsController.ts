import {Request,Response }  from 'express';
import knex from '../database/connection';

class PointsController{
    async create(request:Request,response: Response){
        const  {
            name,
            email,
            whatsapp,
            latitude,
            longitude,
            city,
            uf,
            items
        } = request.body;
       
        const trx = await knex.transaction();
        const ids = await trx('points').insert({
            image : request.file.filename,
            name,
            email,
            whatsapp,
            latitude,
            longitude,
            city,
            uf 
        });
    
        const pointItems = items
                    .split(',')
                    .map((item:string)=> Number(item.trim()))
                    .map((item_id: number) => {
                        return {
                            item_id,
                            point_id : ids[0]
                        }
                    })

        await trx('points_items').insert(pointItems);

        trx.commit();
        return response.json({message:'succes'})
        
    }

    async index(request:Request,response: Response){
        const {city,uf,items} = request.query;
        const parsedItems = String(items).split(',').map(t=> Number(t.trim()))

        const points = await knex('points')
            .join('points_items','points.id','=','points_items.point_id')
            .whereIn('points_items.item_id',parsedItems)
            .where('city',String(city))
            .where('uf',String(uf))
            .distinct()
            .select('points.*');

        const serializedPoints = points.map(point => {
            return {
                ...point,
                image_url:`http://192.168.15.68:3333/uploads/${point.image}`
            }
        })
        return response.json(serializedPoints)
    }

    async list(request:Request,response: Response){
         
        const points = await knex('points')
            .join('points_items','points.id','=','points_items.point_id')
            .distinct()
            .select('points.*');
        return response.json(points)
    }

    async show(request:Request,response: Response){
        const {id} = request.params;


        const point = await  knex('points').where({id}).first();

        if(!point){
            return response.status(400).json({message:'Point not found'})
        }

        const items = await knex('items').select('items.title')
                .join('points_items','items.id','=','points_items.item_id')
                .where('points_items.point_id',id)
        point.items = items

        const serializedPoint  =   {
                ...point,
                image_url:`http://192.168.15.68:3333/uploads/${point.image}`
            }


        return response.json(serializedPoint)
    }
}

export default PointsController;