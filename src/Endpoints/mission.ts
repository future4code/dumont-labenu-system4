import express, { Router, Request, Response } from "express";
import { getUsersByMission, insertMission, insertUser } from "../Data/querys";
import { mission, user } from "../Types";

const router: Router = express.Router()

router.post('/', async (req: Request, res: Response)=>{
     try {
         const {name, start, end} = req.body;
         if(!name || !start || !end){
             res.statusCode = 400
             throw new Error("you must send a 'name', 'start' and a 'end' on the request body!")
         }
         const [day, month, year] = start.split('/')
         const [e_day, e_month, e_year] = end.split('/')
         const start_date: string = `${year}-${month}-${day}` 
         const end_date: string = `${e_year}-${e_month}-${e_day}` 
         const mission: mission = {
             name,
             start_date,
             end_date
         }
         await insertMission(mission);
         res.send('Mission created')

     } catch (error) {
         res.send(error.sqlMessage || error.message)
     }
 })

 router.get('/students/:id', async (req: Request, res: Response)=>{
    try {
        const id  = req.params.id
        if(isNaN(Number(id))){
            throw new Error('please send a number as id parameter')
        }
       const students = await getUsersByMission('students', Number(id))

        res.send({students})

    } catch (error) {
        res.send(error.sqlMessage || error.message)
    }
})

router.get('/teacher/:id', async (req: Request, res: Response)=>{
    try {
        const id  = req.params.id
        if(isNaN(Number(id))){
            throw new Error('please send a number as id parameter')
        }
       const teacher = await getUsersByMission('teachers', Number(id))

        res.send({teacher})

    } catch (error) {
        res.send(error.sqlMessage || error.message)
    }
})
 
 export default router