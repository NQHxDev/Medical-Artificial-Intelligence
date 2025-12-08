export const users = [
   {
      id: 1,
      username: 'doctor1',
      password: '123456',
      role: 'doctor',
   },
   {
      id: 2,
      username: 'patient1',
      password: '123456',
      role: 'patient',
   },
];

export function loginUser(username: string, password: string) {
   return users.find((u) => u.username === username && u.password === password);
}
