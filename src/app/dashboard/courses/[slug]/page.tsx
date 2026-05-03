import { notFound } from "next/navigation";
import CoursePlayer from "@/components/app/CoursePlayer";
import { courses, getCourseBySlug } from "@/lib/memberData";

export function generateStaticParams() {
  return courses.map((c) => ({ slug: c.slug }));
}

export default async function CoursePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const course = getCourseBySlug(slug);
  if (!course) notFound();
  return <CoursePlayer course={course} />;
}
