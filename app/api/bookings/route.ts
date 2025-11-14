import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../auth/[...nextauth]/route"
import { db } from "@/app/_lib/prisma"

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return NextResponse.json({ error: "Usuário não autenticado" }, { status: 401 })
  }

  const body = await req.json()
  const { serviceId, date } = body

  if (!serviceId || !date) {
    return NextResponse.json({ error: "Campos obrigatórios faltando" }, { status: 400 })
  }

  // Cria o agendamento
  const booking = await db.booking.create({
    data: {
      userId: session.user.id,
      serviceId,
      date: new Date(date),
    },
    include: {
      service: true, // Inclui dados do serviço se precisar
    },
  })

  return NextResponse.json(booking)
}

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return NextResponse.json({ error: "Usuário não autenticado" }, { status: 401 })
  }

  const bookings = await db.booking.findMany({
    where: { userId: session.user.id },
    include: {
      service: true,
    },
    orderBy: { date: "asc" },
  })

  return NextResponse.json(bookings)
}
