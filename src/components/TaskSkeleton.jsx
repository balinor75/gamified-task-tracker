/**
 * TaskSkeleton — Shimmer loading placeholder for the task list.
 * Shows 3 pulsing rectangles that mimic TaskItem layout.
 */
export default function TaskSkeleton() {
  return (
    <div className="space-y-3" aria-label="Caricamento task in corso">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="shimmer rounded-2xl p-4 flex items-center gap-4"
          style={{ animationDelay: `${i * 0.15}s` }}
        >
          {/* Checkbox placeholder */}
          <div className="shrink-0 w-6 h-6 rounded-full bg-white/5" />
          {/* Text lines placeholder */}
          <div className="flex-1 space-y-2">
            <div
              className="h-4 bg-white/5 rounded-lg"
              style={{ width: `${70 - i * 10}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
