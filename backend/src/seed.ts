import { prisma } from "./db/prisma";

prisma.admin.create({
    data:{
        name: "Ankit",
        email: "ankit@gmail.com",
        password: "12345678",
        phone: "1234567890"
    }
}).then((Data)=> {
    console.log(Data);
    
})