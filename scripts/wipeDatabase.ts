import prisma from "@/db";

async function wipeDatabase() {
	try {
		console.log("🗑️  Starting database wipe...");

		// Delete in order to respect foreign key constraints
		console.log("Deleting RoutineGroup...");
		await prisma.routineGroup.deleteMany();

		console.log("Deleting Routine...");
		await prisma.routine.deleteMany();

		// console.log("Deleting User...");
		// await prisma.user.deleteMany();

		// console.log("Deleting Group...");
		// await prisma.group.deleteMany();

		console.log("Deleting Teacher...");
		await prisma.teacher.deleteMany();

		console.log("Deleting Module...");
		await prisma.module.deleteMany();

		console.log("Deleting Room...");
		await prisma.room.deleteMany();

		console.log("Deleting Batch...");
		await prisma.batch.deleteMany();

		console.log("Deleting Course...");
		await prisma.course.deleteMany();

		console.log("✅ Database wiped successfully!");

		// Get counts to verify
		const counts = {
			users: await prisma.user.count(),
			groups: await prisma.group.count(),
			courses: await prisma.course.count(),
			batches: await prisma.batch.count(),
			routines: await prisma.routine.count(),
			rooms: await prisma.room.count(),
			modules: await prisma.module.count(),
			teachers: await prisma.teacher.count(),
			routineGroups: await prisma.routineGroup.count(),
		};

		console.log("📊 Final counts:", counts);
	} catch (error) {
		console.error("❌ Error wiping database:", error);
	} finally {
		await prisma.$disconnect();
	}
}

wipeDatabase();
