import {Request,Response }  from 'express';
import knex from '../database/connection';

class ItemsController{
     
    async index(request:Request,response: Response){
        const items = await  knex('items');
        const serializedItems = items.map(item => {
        return {
            id:item.id,
            //image_url : `http://localhost:3333/uploads/${item.image}`,
            image_url : `http://192.168.15.68:3333/uploads/${item.image}`,
            title:item.title,
        }
    })
    return response.json(serializedItems)
    }
}

export default ItemsController;