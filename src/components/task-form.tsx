import { createTaskAction } from "@/lib/actions";
import { PRIORITIES, PROGRESS_STEPS, TASK_STATUSES } from "@/lib/labels";
import type { Department, Member, Project } from "@/lib/types";
import { ActionForm, SubmitButton } from "./form";
import { fieldClass, labelClass } from "./ui";

export function TaskForm({
  projects,
  departments,
  members,
  projectId,
}: {
  projects: Project[];
  departments: Department[];
  members: Member[];
  projectId?: string;
}) {
  return (
    <ActionForm action={createTaskAction} className="grid gap-3 rounded-3xl bg-white p-5 ring-1 ring-[#e7e9ef] md:grid-cols-2">
      <h2 className="text-lg font-extrabold md:col-span-2">مهمة جديدة</h2>
      <label className={labelClass}>
        العنوان
        <input name="title" required className={fieldClass} />
      </label>
      <label className={labelClass}>
        الوصف
        <input name="description" className={fieldClass} />
      </label>
      <label className={labelClass}>
        المشروع
        <select name="projectId" defaultValue={projectId} required className={fieldClass}>
          <option value="">اختر المشروع</option>
          {projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.name}
            </option>
          ))}
        </select>
      </label>
      <label className={labelClass}>
        القسم
        <select name="departmentId" className={fieldClass} defaultValue="">
          <option value="">بدون قسم</option>
          {departments.map((department) => (
            <option key={department.id} value={department.id}>
              {department.name}
            </option>
          ))}
        </select>
      </label>
      <label className={labelClass}>
        المسؤول
        <select name="assigneeId" className={fieldClass} defaultValue="">
          <option value="">غير معيّن</option>
          {members.map((member) => (
            <option key={member.userId} value={member.userId}>
              {member.name}
            </option>
          ))}
        </select>
      </label>
      <label className={labelClass}>
        الأولوية
        <select name="priority" className={fieldClass} defaultValue="medium">
          {PRIORITIES.map((item) => (
            <option key={item.id} value={item.id}>
              {item.label}
            </option>
          ))}
        </select>
      </label>
      <label className={labelClass}>
        الحالة
        <select name="status" className={fieldClass} defaultValue="new">
          {TASK_STATUSES.map((item) => (
            <option key={item.id} value={item.id}>
              {item.label}
            </option>
          ))}
        </select>
      </label>
      <label className={labelClass}>
        الإنجاز
        <select name="progress" className={fieldClass} defaultValue="0">
          {PROGRESS_STEPS.map((step) => (
            <option key={step} value={step}>
              {step}%
            </option>
          ))}
        </select>
      </label>
      <label className={labelClass}>
        البداية
        <input type="date" name="startDate" className={fieldClass} dir="ltr" />
      </label>
      <label className={labelClass}>
        النهاية
        <input type="date" name="dueDate" className={fieldClass} dir="ltr" />
      </label>
      <div className="md:col-span-2">
        <SubmitButton>إنشاء المهمة</SubmitButton>
      </div>
    </ActionForm>
  );
}
