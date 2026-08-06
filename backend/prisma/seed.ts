import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const WARDS = ["Medical Ward", "Surgical Ward", "ICU", "Emergency"];

async function main() {
  console.log("Seeding database...");

  const passwordHash = await bcrypt.hash("password123", 10);

  // --- HR Manager ---
  const hr = await prisma.user.upsert({
    where: { email: "victoria.mensah@hospital.com" },
    update: {},
    create: {
      name: "Victoria Mensah",
      email: "victoria.mensah@hospital.com",
      passwordHash,
      role: "HR",
      department: "Human Resources",
      phone: "+1 234 567 999",
      avatar: "https://i.pravatar.cc/300?img=32",
    },
  });

  // --- Nurses (matches the app's mock staff directory) ---
  const nurseSeeds = [
    { name: "Sarah Johnson", email: "sarah.johnson@hospital.com", ward: "Medical Ward", avatar: 47 },
    { name: "Abena Owusu", email: "abena.owusu@hospital.com", ward: "Medical Ward", avatar: 44 },
    { name: "Grace Asante", email: "grace.asante@hospital.com", ward: "Surgical Ward", avatar: 45 },
    { name: "Linda Addo", email: "linda.addo@hospital.com", ward: "ICU", avatar: 48 },
    { name: "Patricia Boateng", email: "patricia.boateng@hospital.com", ward: "Medical Ward", avatar: 49 },
    { name: "Kwame Mensah", email: "kwame.mensah@hospital.com", ward: "ICU", avatar: 12 },
    { name: "Efua Danso", email: "efua.danso@hospital.com", ward: "Surgical Ward", avatar: 25 },
    { name: "Kojo Antwi", email: "kojo.antwi@hospital.com", ward: "Emergency", avatar: 14 },
  ];

  const nurses: any[] = [];
  for (const n of nurseSeeds) {
    const nurse = await prisma.user.upsert({
      where: { email: n.email },
      update: {},
      create: {
        name: n.name,
        email: n.email,
        passwordHash,
        role: "NURSE",
        ward: n.ward,
        phone: "+1 234 567 " + Math.floor(800 + Math.random() * 199),
        avatar: `https://i.pravatar.cc/300?img=${n.avatar}`,
      },
    });
    nurses.push(nurse);
  }

  // --- Shifts for the current week ---
  await prisma.shift.deleteMany({});
  const monday = new Date();
  monday.setHours(0, 0, 0, 0);
  monday.setDate(monday.getDate() - monday.getDay() + 1);

  const shiftTypes: Array<{ type: "MORNING" | "EVENING" | "NIGHT"; start: string; end: string }> = [
    { type: "MORNING", start: "7:00 AM", end: "3:00 PM" },
    { type: "EVENING", start: "3:00 PM", end: "11:00 PM" },
    { type: "NIGHT", start: "11:00 PM", end: "7:00 AM" },
  ];

  for (let day = 0; day < 6; day++) {
    const date = new Date(monday);
    date.setDate(date.getDate() + day);
    for (const nurse of nurses) {
      // Skip Saturday for some nurses, and vary shift type by nurse index, to
      // mirror the varied mock schedule instead of a uniform grid.
      if (day === 5 && nurses.indexOf(nurse) % 2 === 0) continue;
      const shiftType = shiftTypes[(day + nurses.indexOf(nurse)) % 3];
      await prisma.shift.create({
        data: {
          nurseId: nurse.id,
          date,
          type: shiftType.type,
          ward: nurse.ward ?? "Medical Ward",
          startTime: shiftType.start,
          endTime: shiftType.end,
        },
      });
    }
  }

  // --- Leave requests (matches the app's mock HR leave list) ---
  await prisma.leaveRequest.deleteMany({});
  const byEmail = (email: string) => nurses.find((n) => n.email === email)!;

  await prisma.leaveRequest.create({
    data: {
      nurseId: byEmail("abena.owusu@hospital.com").id,
      type: "ANNUAL",
      startDate: new Date("2025-05-20"),
      endDate: new Date("2025-05-22"),
      status: "PENDING",
    },
  });
  await prisma.leaveRequest.create({
    data: {
      nurseId: byEmail("grace.asante@hospital.com").id,
      type: "PERSONAL",
      startDate: new Date("2025-05-23"),
      endDate: new Date("2025-05-23"),
      status: "PENDING",
    },
  });
  await prisma.leaveRequest.create({
    data: {
      nurseId: byEmail("linda.addo@hospital.com").id,
      type: "SICK",
      startDate: new Date("2025-05-26"),
      endDate: new Date("2025-05-28"),
      status: "PENDING",
    },
  });
  await prisma.leaveRequest.create({
    data: {
      nurseId: byEmail("patricia.boateng@hospital.com").id,
      type: "PERSONAL",
      startDate: new Date("2025-05-30"),
      endDate: new Date("2025-05-30"),
      status: "PENDING",
    },
  });
  await prisma.leaveRequest.create({
    data: {
      nurseId: byEmail("sarah.johnson@hospital.com").id,
      type: "ANNUAL",
      startDate: new Date("2025-05-24"),
      endDate: new Date("2025-05-26"),
      status: "APPROVED",
    },
  });
  await prisma.leaveRequest.create({
    data: {
      nurseId: byEmail("efua.danso@hospital.com").id,
      type: "SICK",
      startDate: new Date("2025-04-05"),
      endDate: new Date("2025-04-06"),
      status: "REJECTED",
    },
  });

  // --- Sample availability for the demo nurse login ---
  await prisma.availability.upsert({
    where: { nurseId: byEmail("sarah.johnson@hospital.com").id },
    update: {},
    create: {
      nurseId: byEmail("sarah.johnson@hospital.com").id,
      data: {
        Mon: { morning: true, evening: true, night: false },
        Tue: { morning: false, evening: true, night: false },
        Wed: { morning: true, evening: false, night: false },
        Thu: { morning: false, evening: false, night: false },
        Fri: { morning: true, evening: true, night: true },
        Sat: { morning: false, evening: false, night: false },
        Sun: { morning: false, evening: false, night: false },
      },
    },
  });

  console.log("Seed complete.");
  console.log("HR login:    victoria.mensah@hospital.com / password123");
  console.log("Nurse login: sarah.johnson@hospital.com / password123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
