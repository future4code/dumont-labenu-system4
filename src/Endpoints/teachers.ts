import express, { Router, Request, Response } from "express";
import {connection} from '../Data/Connection'
import { getMissionByUserId, insertSpeciality, insertUser, search_where_like, selectAll,updateMission_user } from "../Data/querys";
import { user } from "../Types";

const router: Router = express.Router()

 router.post('/', async (req: Request, res: Response)=>{
    try {
        const {name, email, birth_day} = req.body;
        if(!name || !email || !birth_day){
            res.statusCode = 400
            throw new Error("you must send a 'name', 'email' and a 'birth_day' on the request body!")
        }
        const [day, month, year] = birth_day.split('/')
        const birthday: string = `${year}-${month}-${day}` 
        const teacher: user = {
            name,
            email,
            birthday
        }
        await insertUser('teachers', teacher);
        res.send('teacher added!')

    } catch (error) {
        res.send(error.sqlMessage || error.message)
    }
})

router.get('/all', async (req: Request, res: Response)=>{
    try {
        const result = await selectAll('teachers')
        result.forEach(teacher=>{
            teacher.birthday = new Date(teacher.birthday)
            .toLocaleDateString('en-GB', {
                month: '2-digit',
                day: '2-digit',
                year: 'numeric'
            })
        })
        res.send({teachers : result})
    } catch (error) {
        res.send(error.sqlMessage || error.message)
    }
})

router.get('/info/:id', async (req: Request, res: Response)=>{
    try {
        const id  = req.params.id
        if(isNaN(Number(id))){
            throw new Error('please send a number as id parameter')
        }
       const userResult = await connection('teachers')
       .where({id})
       if(!userResult.length){
        throw new Error('user not found') 
       }
       const userId = userResult[0].id
       userResult[0].birthday = new Date(userResult[0].birthday)
       .toLocaleDateString('en-GB', {
           month: '2-digit',
           day: '2-digit',
           year: 'numeric'
       })

       const specialitys = await connection('teachers')
       .join('teacher_speciality', 'teachers.id', 'teacher_speciality.teachers_id')
       .join('speciality', 'speciality.id', 'teacher_speciality.speciality_id')
       .select('speciality.name')
       .where({teachers_id : userId})

       if(userResult[0].mission_id){

           const mission = await getMissionByUserId('teachers')
           userResult[0].mission = mission
       }


        res.send({student : {... userResult, specialitys}})
    } catch (error) {
        res.send(error.sqlMessage || error.message)
    }
})

router.put('/:id/add_speciality', async (req: Request, res: Response)=>{
    try {
        const  speciality: string  = req.body.speciality as string
        const id = req.params.id
        if(!speciality || !id ){
            res.statusCode = 400
            throw new Error("missing id parameter or speciality on the body request")
        }
        if(isNaN(Number(id))){
            res.statusCode = 400
            throw new Error("you must send a number as 'id' parameter!")
        }

        const result = await search_where_like('speciality', speciality);

        if(!result.length){
            res.statusCode = 404
            throw new Error("speciality not found, to add a speciality go to: /speciality method: POST") 
        }

        await connection('teacher_speciality')
        .insert({teachers_id: id, speciality_id: result[0].id})
       
        res.send('speciality added to teacher!')

    } catch (error) {
        res.send(error.sqlMessage || error.message)
    }
})

router.post('/speciality', async (req: Request, res: Response)=>{
    try {
        const  speciality: string  = req.body.speciality as string
        if(!speciality){
            res.statusCode = 400
            throw new Error("missing speciality on the body request")
        }
        await insertSpeciality(speciality)
        res.send('speciality created')
    } catch (error) {
        res.send(error.sqlMessage || error.message)
    }
})

router.get('/speciality/all', async (req: Request, res: Response)=>{
    try {
        const result = await selectAll('speciality')
        res.send({speciality : result})
    } catch (error) {
        res.send(error.sqlMessage || error.message)
    }
})

router.put('/:id/add/mission', async (req: Request, res: Response)=>{
    try {
        const  mission: string  = req.body.mission as string
        const id = req.params.id
        if(!mission || !id ){
            res.statusCode = 400
            throw new Error("missing id parameter or mission on the body request")
        }
        if(isNaN(Number(id))){
            res.statusCode = 400
            throw new Error("you must send a number as 'id' parameter!")
        }

        const result: any = await search_where_like('mission', mission);

        if(!result.length){
            res.statusCode = 404
            throw new Error("mission not found") 
        }

        await updateMission_user('teachers', Number(id) ,result[0].id)
       
        res.send('Mission added to teacher!')

    } catch (error) {
        res.send(error.sqlMessage || error.message)
    }
})

 export default router