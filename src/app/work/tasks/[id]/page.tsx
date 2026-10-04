import Link from "next/link";
import { notFound } from "next/navigation";
import { ActionForm, ConfirmSubmit, SubmitButton } from "@/components/form";
import { Shell } from "@/components/shell";
import { PageHeader, Progress, StatusPill, fieldClass, labelClass } from "@/components/ui";
import { commentAction, deleteTaskAction, updateProgressAction, updateTaskAction } from "@/lib/actions";
import { formatWhen } from "@/lib/format";
import { requireCompany } from "@/lib/guard";
import { PRIORITIES, PROGRESS_STEPS, TASK_STATUSES, priorityLabel } from "@/lib/labels";
import { canManageWork } from "@/lib/permissions";
import { getTask, listComments, listProjects } from "@/lib/queries";

export const metadata = { title: "مهمة" };

export default async function TaskPage({ params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireCompany();
  const task = getTask(ctx.company.id, (await params).id);
  if (!task) notFound();
  const comments = listComments(task.id);
  const manage = canManageWork(ctx.membership.role);
  const assignee = task.assigneeId === ctx.user.id;
  const projects = listProjects(ctx.company.id);
  return (
    <Shell ctx={ctx}>
      <PageHeader title={task.title} subtitle="تفاصيل المهمة ومن يعمل عليها." action={<StatusPill status={task.status} />} />
      <p className="text-sm text-[#5c6573]">
        <Link href={`/work/projects/${task.projectId}`} className="font-bold text-[#2563eb]">
          {task.projectName}
        </Link>
        {" · "}
        {priorityLabel(task.priority)}
        {" · "}
        {task.progress}%
      </p>
      <p className="mt-1 text-sm font-semibold">
        {task.assigneeName || "غير معيّن"}
        {task.departmentName ? ` · ${task.departmentName}` : ""}
      </p>
      <div className="mt-3 max-w-md">
        <Progress value={task.progress} />
      </div>
      {task.description ? <p className="mt-4 max-w-2xl text-sm leading-7">{task.description}</p> : null}
      <p className="mt-2 text-xs text-[#8b93a1]">
        {task.startDate ? `البداية ${task.startDate}` : ""}
        {task.dueDate ? ` · النهاية ${task.dueDate}` : ""}
      </p>

      {assignee ? (
        <ActionForm action={updateProgressAction} className="mt-6 max-w-md rounded-3xl bg-white p-5 ring-1 ring-[#e7e9ef]">
          <h2 className="font-extrabold">تحديث تقدمي</h2>
          <input type="hidden" name="taskId" value={task.id} />
          <label className={`${labelClass} mt-3`}>
            الإنجاز
            <select name="progress" defaultValue={String(task.progress)} className={fieldClass}>
              {PROGRESS_STEPS.map((step) => (
                <option key={step} value={step}>
                  {step}%
                </option>
              ))}
            </select>
          </label>
          <div className="mt-3">
            <SubmitButton>حفظ التقدم</SubmitButton>
          </div>
        </ActionForm>
      ) : null}

      <section className="mt-6 rounded-3xl bg-white p-5 ring-1 ring-[#e7e9ef]">
        <h2 className="font-extrabold">التعليقات</h2>
        <ul className="mt-3 space-y-3">
          {comments.length ? (
            comments.map((comment) => (
              <li key={comment.id}>
                <p className="text-sm font-bold">
                  {comment.author}{" "}
                  <span className="font-medium text-[#8b93a1]">{formatWhen(comment.createdAt, ctx.company.country)}</span>
                </p>
                <p className="text-sm leading-7">{comment.body}</p>
              </li>
            ))
          ) : (
            <li className="text-sm text-[#5c6573]">لا تعليقات</li>
          )}
        </ul>
        <ActionForm action={commentAction} className="mt-4 grid gap-2">
          <input type="hidden" name="taskId" value={task.id} />
          <label className={labelClass}>
            أضف تعليقا
            <textarea name="body" required className={fieldClass} rows={3} />
          </label>
          <SubmitButton>إرسال</SubmitButton>
        </ActionForm>
      </section>

      {manage ? (
        <ActionForm action={updateTaskAction} className="mt-6 grid gap-3 rounded-3xl bg-white p-5 ring-1 ring-[#e7e9ef] md:grid-cols-2">
          <h2 className="font-extrabold md:col-span-2">تعديل المهمة</h2>
          <input type="hidden" name="taskId" value={task.id} />
          <label className={labelClass}>
            العنوان
            <input name="title" defaultValue={task.title} required className={fieldClass} />
          </label>
          <label className={labelClass}>
            الوصف
            <input name="description" defaultValue={task.description} className={fieldClass} />
          </label>
          <label className={labelClass}>
            المشروع
            <select name="projectId" defaultValue={task.projectId} className={fieldClass}>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </label>
          <label className={labelClass}>
            القسم
            <select name="departmentId" defaultValue={task.departmentId ?? ""} className={fieldClass}>
              <option value="">بدون قسم</option>
              {ctx.departments.map((department) => (
                <option key={department.id} value={department.id}>
                  {department.name}
                </option>
              ))}
            </select>
          </label>
          <label className={labelClass}>
            المسؤول
            <select name="assigneeId" defaultValue={task.assigneeId ?? ""} className={fieldClass}>
              <option value="">غير معيّن</option>
              {ctx.members.map((member) => (
                <option key={member.userId} value={member.userId}>
                  {member.name}
                </option>
              ))}
            </select>
          </label>
          <label className={labelClass}>
            الأولوية
            <select name="priority" defaultValue={task.priority} className={fieldClass}>
              {PRIORITIES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
          <label className={labelClass}>
            الحالة
            <select name="status" defaultValue={task.status} className={fieldClass}>
              {TASK_STATUSES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
          <label className={labelClass}>
            الإنجاز
            <select name="progress" defaultValue={String(task.progress)} className={fieldClass}>
              {PROGRESS_STEPS.map((step) => (
                <option key={step} value={step}>
                  {step}%
                </option>
              ))}
            </select>
          </label>
          <label className={labelClass}>
            البداية
            <input type="date" name="startDate" defaultValue={task.startDate ?? ""} className={fieldClass} dir="ltr" />
          </label>
          <label className={labelClass}>
            النهاية
            <input type="date" name="dueDate" defaultValue={task.dueDate ?? ""} className={fieldClass} dir="ltr" />
          </label>
          <div className="flex items-center gap-4 md:col-span-2">
            <SubmitButton>حفظ المهمة</SubmitButton>
          </div>
        </ActionForm>
      ) : null}
      {manage ? (
        <div className="mt-3">
          <ConfirmSubmit action={deleteTaskAction} label="حذف" message="حذف هذه المهمة؟" hidden={{ taskId: task.id }} />
        </div>
      ) : null}
    </Shell>
  );
}
