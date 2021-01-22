import express, { Router, Request, Response } from "express";
import { connection } from '../Data/Connection'
import { search_where_like, insertUser, insertHobby, updateMission_user, selectAll, getMissionByUserId } from "../Data/querys";
import { user } from "../Types";

const router: Router = express.Router()

 router.post('/', async (req: Request, res: Response)=>{
     try {
         const {name, email, birth_day} = req.body;
         if(!name || !email || !birth_day){
             res.statusCode = 400
             throw new Error("you must send a 'name', 'email', 'hobby' and a 'birth_day' on the request body!")
         }
         const [day, month, year] = birth_day.split('/')
         const birthday: string = `${year}-${month}-${day}` 
         const student: user = {
             name,
             email,
             birthday
         }
         await insertUser('students', student);

         res.send('student added!')

     } catch (error) {
         res.send(error.sqlMessage || error.message)
     }
 })

 router.get('/all', async (req: Request, res: Response)=>{
    try {
        const result = await selectAll('students')
        result.forEach(student=>{
            student.birthday = new Date(student.birthday)
            .toLocaleDateString('en-GB', {
                month: '2-digit',
                day: '2-digit',
                year: 'numeric'
            })
        })
        res.send({students : result})
    } catch (error) {
        res.send(error.sqlMessage || error.message)
    }
})

router.get('/birthday/:id', async (req: Request, res: Response)=>{
    try {
        const id  = req.params.id
        if(isNaN(Number(id))){
            throw new Error('please send a number as id parameter')
        }
       const userResult = await connection('students')
       .where({id})
       if(!userResult.length){
        throw new Error('user not found') 
       }
    
       const birth = new Date(userResult[0].birthday)
       .toLocaleDateString('en-GB', {
           month: '2-digit',
           day: '2-digit',
           year: 'numeric'
       })
       const dateNow = new Date()
       .toLocaleDateString('en-GB', {
           month: '2-digit',
           day: '2-digit',
           year: 'numeric'
       })

       const birthday = birth.split('/')
       const date = dateNow.split('/')
      
       const age:number = Number(date[2]) - Number(birthday[2]) 

        res.send({age})
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
       const userResult = await connection('students')
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

       const hobbys = await connection('students')
       .join('student_hobby', 'students.id', 'student_hobby.student_id')
       .join('hobby', 'hobby.id', 'student_hobby.hobby_id')
       .select('hobby.name')
       .where({student_id : userId})
       if(userResult[0].mission_id){

           const mission = await getMissionByUserId('students')
           userResult[0].mission = mission
       }


        res.send({student : {... userResult, hobbys}})
    } catch (error) {
        res.send(error.sqlMessage || error.message)
    }
})

 router.put('/:id/add/hobby', async (req: Request, res: Response)=>{
    try {
        const  hobby: string  = req.body.hobby as string
        const id = req.params.id
        if(!hobby || !id ){
            res.statusCode = 400
            throw new Error("missing id parameter or hobby on the body request")
        }
        if(isNaN(Number(id))){
            res.statusCode = 400
            throw new Error("you must send a number as 'id' parameter!")
        }

        const result = await search_where_like('hobby', hobby);

        if(!result.length){
            res.statusCode = 404
            throw new Error("hobby not found, to add a hobby go to: /hobby method: POST") 
        }

        await connection('student_hobby')
        .insert({student_id: id, hobby_id: result[0].id})
       
        res.send('hobby added to student!')

    } catch (error) {
        res.send(error.sqlMessage || error.message)
    }
})

router.post('/hobby', async (req: Request, res: Response)=>{
    try {
        const  hobby: string  = req.body.hobby as string
        if(!hobby){
            res.statusCode = 400
            throw new Error("missing hobby on the body request")
        }
        await insertHobby(hobby)
        res.send('hobby created')
    } catch (error) {
        res.send(error.sqlMessage || error.message)
    }
})

router.get('/hobby/all', async (req: Request, res: Response)=>{
    try {
        const result = await selectAll('hobby')
        res.send({hobbys : result})
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

        await updateMission_user('students', Number(id) ,result[0].id)
       
        res.send('Mission added to student!')

    } catch (error) {
        res.send(error.sqlMessage || error.message)
    }
})

 
 export default router
