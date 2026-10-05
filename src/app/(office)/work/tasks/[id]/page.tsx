import { notFound } from "next/navigation";
import { commentAction, deleteTaskAction, updateProgressAction, updateTaskAction } from "@/application/actions";
import { requireCompany } from "@/application/guard";
import { ActionForm, ConfirmSubmit, SubmitButton } from "@/components/form";
import { TaskForm } from "@/components/task-form";
import { PageHeader, Progress, StatusPill, fieldClass, labelClass } from "@/components/ui";
import { getTask, listComments } from "@/data/store";
import { PROGRESS_STEPS, priorityLabel } from "@/domain/catalog";
import { formatWhen } from "@/domain/views";
import { actorOf, can } from "@/permissions/can";

export default async function TaskPage({ params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireCompany();
  const { id } = await params;
  const task = getTask(ctx.company.id, id);
  if (!task) notFound();
  const actor = actorOf(ctx.user.id, ctx.company.id, ctx.membership.role);
  const manage = can(actor, "delete", { type: "task", companyId: ctx.company.id });
  const update = can(actor, "update", { type: "task", companyId: ctx.company.id, assigneeId: task.assigneeId });
  const comments = listComments(ctx.company.id, task.id);
  return (
    <div>
      <PageHeader
        title={task.title}
        subtitle={`${task.projectName} · ${task.departmentName || "بدون قسم"} · ${priorityLabel(task.priority)}`}
        action={<StatusPill status={task.status} />}
      />
      <div className="mb-6 rounded-[28px] bg-white p-5 ring-1 ring-[#e7e9ef]">
        {task.description ? <p className="mb-4 text-sm leading-7 text-[#3c4451]">{task.description}</p> : null}
        <div className="mb-2 flex justify-between text-sm font-bold">
          <span>التقدم</span>
          <span>{task.progress}%</span>
        </div>
        <Progress value={task.progress} />
        <p className="mt-3 text-sm text-[#5c6573]">المسؤول: {task.assigneeName || "بدون تعيين"}</p>
        {task.dueDate ? <p className="text-sm text-[#5c6573]">الاستحقاق: {task.dueDate}</p> : null}
      </div>
      {update && !manage ? (
        <ActionForm action={updateProgressAction} className="mb-6 flex flex-wrap items-end gap-3 rounded-[28px] bg-white p-5 ring-1 ring-[#e7e9ef]">
          <input type="hidden" name="taskId" value={task.id} />
          <label className={labelClass}>
            تحديث تقدمي
            <select className={fieldClass} name="progress" defaultValue={String(task.progress)}>
              {PROGRESS_STEPS.map((step) => (
                <option key={step} value={step}>
                  {step}%
                </option>
              ))}
            </select>
          </label>
          <SubmitButton>حفظ التقدم</SubmitButton>
        </ActionForm>
      ) : null}
      {manage ? (
        <div className="mb-6 space-y-3">
          <TaskForm action={updateTaskAction} departments={ctx.departments} members={ctx.members} task={task} />
          <ConfirmSubmit action={deleteTaskAction} label="حذف المهمة" message="حذف هذه المهمة؟" hidden={{ taskId: task.id }} />
        </div>
      ) : null}
      <section className="rounded-[28px] bg-white p-5 ring-1 ring-[#e7e9ef]">
        <h2 className="font-extrabold">التعليقات</h2>
        <ul className="mt-3 space-y-3">
          {comments.map((comment) => (
            <li key={comment.id} className="text-sm">
              <p className="font-bold">
                {comment.author} <span className="font-normal text-[#8b93a1]">{formatWhen(comment.createdAt, ctx.company.country)}</span>
              </p>
              <p className="leading-7">{comment.body}</p>
            </li>
          ))}
        </ul>
        <ActionForm action={commentAction} className="mt-4 space-y-3">
          <input type="hidden" name="taskId" value={task.id} />
          <label className={labelClass}>
            أضف تعليقًا
            <textarea className={fieldClass} name="body" rows={3} required />
          </label>
          <SubmitButton>إرسال</SubmitButton>
        </ActionForm>
      </section>
    </div>
  );
}
