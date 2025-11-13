import { prisma } from "./prisma";
import dotenv from "dotenv";

dotenv.config();
prisma.admin.create({
    data:{
        name: "Ankit",
        email: "ankit@gmail.com",
        password: "12345678",
        phone: "1234567890"
    }
})  
    .then((data) => {
        console.log(data);
    })