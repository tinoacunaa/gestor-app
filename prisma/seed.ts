import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = "marcos@example.com";
  const password = await bcrypt.hash("cambia-esta-clave", 10);

  await prisma.usuario.upsert({
    where: { email },
    update: {},
    create: { email, password, nombre: "Marcos" },
  });

  console.log(`Usuario creado: ${email} / cambia-esta-clave (cambia la clave luego de entrar)`);

  // Super admin: gestiona empresas y sus admins, no pertenece a ninguna empresa.
  const emailSuper = "superadmin@example.com";
  const passwordSuper = await bcrypt.hash("cambia-esta-clave", 10);

  await prisma.usuario.upsert({
    where: { email: emailSuper },
    update: {},
    create: { email: emailSuper, password: passwordSuper, nombre: "Super Admin", rol: "SUPER_ADMIN" },
  });

  console.log(`Super admin creado: ${emailSuper} / cambia-esta-clave (cambia la clave luego de entrar)`);
}

main().finally(() => prisma.$disconnect());
