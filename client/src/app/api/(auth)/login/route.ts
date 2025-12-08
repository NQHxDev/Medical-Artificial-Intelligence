import { NextResponse } from 'next/server';
import { loginUser } from '@/lib/users';

export async function POST(req: Request) {
   const body = await req.json();
   const { username, password } = body;

   const user = loginUser(username, password);

   if (!user) {
      return NextResponse.json({ error: 'Sai tài khoản hoặc mật khẩu' }, { status: 401 });
   }

   return NextResponse.json({ success: true, role: user.role });
}
