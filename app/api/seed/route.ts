import { seedDatabase } from "@/lib/seed";

export async function POST() {
    try{
        await seedDatabase();
        return new Response(JSON.stringify({ success: true }), { status: 200 });
    }
    catch(err) {
        console.error('❌ Internal Error at POST request of seeding database:', err); // Add this
        return new Response(JSON.stringify({ error: 'Failed to seed Database', details: (err as any).message }), { status: 500 });
    }
}
