import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/db";
import { User } from "@/models/User";
import { Problem } from "@/models/Problem";

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user || (session.user as any).role !== 'admin') {
    redirect("/dashboard");
  }

  await dbConnect();
  
  const totalUsers = await User.countDocuments();
  const totalProblems = await Problem.countDocuments();

  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl">
      <h1 className="text-3xl font-bold mb-6">Admin Panel</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="p-6 border rounded-lg bg-card text-card-foreground shadow-sm">
          <h2 className="text-lg font-medium text-muted-foreground mb-2">Total Users</h2>
          <div className="text-4xl font-bold text-primary">{totalUsers}</div>
        </div>

        <div className="p-6 border rounded-lg bg-card text-card-foreground shadow-sm">
          <h2 className="text-lg font-medium text-muted-foreground mb-2">Total Problems</h2>
          <div className="text-4xl font-bold text-primary">{totalProblems}</div>
        </div>
      </div>

      <div className="p-6 border rounded-lg bg-card text-card-foreground shadow-sm">
        <h2 className="text-xl font-bold mb-4">Export Data</h2>
        <p className="text-muted-foreground mb-4">
          You can download a full backup of the database collections here.
        </p>
        <button className="bg-secondary text-secondary-foreground px-4 py-2 rounded font-medium opacity-50 cursor-not-allowed">
          Export JSON (Coming Soon)
        </button>
      </div>
    </div>
  );
}
