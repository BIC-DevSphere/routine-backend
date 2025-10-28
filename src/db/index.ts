import { PrismaClient } from "@prisma/client";
import errorHandlingExtension from "@/middleware/prisma";

const prisma = new PrismaClient().$extends(errorHandlingExtension);
export default prisma;
