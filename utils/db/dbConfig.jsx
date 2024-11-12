//postgresql://neondb_owner:Vlw1g0DpNkzK@ep-muddy-sun-a5h114fw.us-east-2.aws.neon.tech/zero2hero?sslmode=require

import  {neon} from '@neondatabase/serverless';
import {drizzle} from 'drizzle-orm/neon-http';
import * as schema from './schema';


const sql=neon(process.env.DATABASE_URL)

export const db=drizzle(sql,{schema})