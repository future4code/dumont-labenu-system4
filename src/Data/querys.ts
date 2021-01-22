import { connection } from './Connection'
import  { user, mission } from '../Types'

export const selectAll = async (table: string)=>{
    const result = await connection(table).select('*')
    return result
}

export const getMissionByUserId = async (userTable:string)=>{
    const mission = await connection('mission')
           .join(userTable, 'mission.id', `${userTable}.mission_id`)
           .select('mission.id','mission.name', 'mission.start_date', 'mission.end_date', 'mission.module')
         
           
           mission[0].start_date = new Date(mission[0].start_date)
           .toLocaleDateString('en-GB', {
               month: '2-digit',
               day: '2-digit',
               year: 'numeric'
           })
    
           mission[0].end_date = new Date(mission[0].end_date)
           .toLocaleDateString('en-GB', {
               month: '2-digit',
               day: '2-digit',
               year: 'numeric'
           })
        return mission
}

export const getUsersByMission = async (userTable:string, missionId: number)=>{
    const users = await connection('mission')
           .join(userTable, 'mission.id', `${userTable}.mission_id`)
           .select(`${userTable}.id`, `${userTable}.name`)
           .where('mission.id', '=', missionId)
         
           
          
        return users
}


export const insertUser = async ( table: string , user: user)=>{
    const {name, email, birthday} = user
    await connection(table)
    .insert({name, email, birthday})

}

export const insertMission = async (mission: mission)=>{
    const {name, start_date, end_date} = mission
    await connection('mission')
    .insert({name, start_date, end_date})

}

export const insertHobby = async (hobby: string)=>{
    
    await connection('hobby')
    .insert({name: hobby})

}



export const insertSpeciality = async (sp: string)=>{
    
    await connection('speciality')
    .insert({name: sp})

}

export const search_where_like = async (table: string, condition: string) => {
    const result = await connection(table)
        .where('name', 'LIKE', condition)

    return result
}


export const updateMission_user = async (table: string, id: number, value: number)=>{

    await connection(table)
    .update({mission_id: value })
    .where({ id })
}



