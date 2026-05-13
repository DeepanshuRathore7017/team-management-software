'use server';
 
import { signIn } from '@/auth';
import { AuthError } from 'next-auth';
import postgres from 'postgres';
import { auth } from '@/auth';
import bcrypt from 'bcrypt';
import { Session } from 'inspector/promises';
import { signOut } from "@/auth";


if (!process.env.POSTGRES_URL) {
  throw new Error("POSTGRES_URL is not defined");
}

const sql = postgres(process.env.POSTGRES_URL, { ssl: "require" });

export async function authenticate(
  prevState: string | undefined,
  formData: FormData
) {
  try {
    await signIn('credentials', formData);
    // console.log(formData);
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return 'Invalid credentials.';
        default:
          return 'Something went wrong.';
      }
    }
    throw error;
  }
}

export async function logout() {
  await signOut({
    redirectTo: "/login",
  });
}


// export async function getUserData(){
//   try{
//     const session = await auth();
//     if (!session?.user?.email) return null;
//     const user = await sql`SELECT * FROM employees WHERE email = ${session.user.email}`;
//     return user[0];    
//   } catch(err) {
//     console.log(err);
//     return null;
//   }
// }