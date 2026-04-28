import { NextRequest, NextResponse } from "next/server";
import { updateTask, deleteTask } from "@/lib/taskStorage";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json();
  const task = updateTask(params.id, body);
  if (!task) return NextResponse.json({ error: "Task not found" }, { status: 404 });
  return NextResponse.json({ task });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const deleted = deleteTask(params.id);
  if (!deleted) return NextResponse.json({ error: "Task not found" }, { status: 404 });
  return NextResponse.json({ success: true });
}
