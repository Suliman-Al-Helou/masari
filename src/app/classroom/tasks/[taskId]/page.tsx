import { ClassroomTaskDetails } from "@/components/classroom/ClassroomTaskDetails";

type ClassroomTaskPageProps = {
  params: Promise<{
    taskId: string;
  }>;
};

export default async function ClassroomTaskPage({
  params,
}: ClassroomTaskPageProps) {
  const { taskId } = await params;

  return (
    <ClassroomTaskDetails taskId={taskId} />
  );
}