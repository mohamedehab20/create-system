import { PRIORITIES, PROGRESS_STEPS, TASK_STATUSES } from "@/domain/catalog";
import type { Department, Member, Task } from "@/domain/types";
import { ActionForm, SubmitButton } from "./form";
import { fieldClass, labelClass } from "./ui";
import type { FormState } from "@/domain/types";

export function TaskForm({
  action,
  projects,
  departments,
  members,
  task,
  projectId,
}: {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  projects?: { id: string; name: string }[];
  departments: Department[];
  members: Member[];
  task?: Task;
  projectId?: string;
}) {
  return (
    <ActionForm action={action} className="grid gap-3 rounded-[28px] bg-white p-5 ring-1 ring-[#e7e9ef] md:grid-cols-2">
      {task ? <input type="hidden" name="taskId" value={task.id} /> : null}
      {projectId ? <input type="hidden" name="projectId" value={projectId} /> : null}
      {projects ? (
        <label className={`${labelClass} md:col-span-2`}>
          المشروع
          <select className={fieldClass} name="projectId" defaultValue={task?.projectId} required>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
        </label>
      ) : null}
      <label className={`${labelClass} md:col-span-2`}>
        العنوان
        <input className={fieldClass} name="title" defaultValue={task?.title} required />
      </label>
      <label className={`${labelClass} md:col-span-2`}>
        الوصف
        <textarea className={fieldClass} name="description" rows={3} defaultValue={task?.description} />
      </label>
      <label className={labelClass}>
        القسم
        <select className={fieldClass} name="departmentId" defaultValue={task?.departmentId ?? ""}>
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
        <select className={fieldClass} name="assigneeId" defaultValue={task?.assigneeId ?? ""}>
          <option value="">بدون تعيين</option>
          {members.map((member) => (
            <option key={member.userId} value={member.userId}>
              {member.name}
            </option>
          ))}
        </select>
      </label>
      <label className={labelClass}>
        الأولوية
        <select className={fieldClass} name="priority" defaultValue={task?.priority ?? "medium"}>
          {PRIORITIES.map((item) => (
            <option key={item.id} value={item.id}>
              {item.label}
            </option>
          ))}
        </select>
      </label>
      <label className={labelClass}>
        الحالة
        <select className={fieldClass} name="status" defaultValue={task?.status ?? "new"}>
          {TASK_STATUSES.map((item) => (
            <option key={item.id} value={item.id}>
              {item.label}
            </option>
          ))}
        </select>
      </label>
      <label className={labelClass}>
        التقدم
        <select className={fieldClass} name="progress" defaultValue={String(task?.progress ?? 0)}>
          {PROGRESS_STEPS.map((step) => (
            <option key={step} value={step}>
              {step}%
            </option>
          ))}
        </select>
      </label>
      <label className={labelClass}>
        البداية
        <input className={fieldClass} type="date" name="startDate" defaultValue={task?.startDate ?? ""} />
      </label>
      <label className={labelClass}>
        الاستحقاق
        <input className={fieldClass} type="date" name="dueDate" defaultValue={task?.dueDate ?? ""} />
      </label>
      <div className="md:col-span-2">
        <SubmitButton>{task ? "حفظ المهمة" : "إنشاء المهمة"}</SubmitButton>
      </div>
    </ActionForm>
  );
}
