interface ProgressBarProps {
  currentIndex: number;
  totalSteps: number;
  stepLabels: string[];
}

export default function ProgressBar({
  currentIndex,
  totalSteps,
  stepLabels,
}: ProgressBarProps) {
  const percent = totalSteps > 1 ? (currentIndex / (totalSteps - 1)) * 100 : 0;

  return (
    <div className="w-full" role="group" aria-label="Assessment progress">
      <div className="flex items-center justify-between text-xs font-medium text-ink-600">
        <span>
          Step {currentIndex + 1} of {totalSteps}
        </span>
        <span>{stepLabels[currentIndex]}</span>
      </div>
      <div
        className="mt-2 h-2 w-full overflow-hidden rounded-full bg-forest-100"
        role="progressbar"
        aria-valuenow={Math.round(percent)}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="h-full rounded-full bg-forest-700 transition-[width] duration-300 ease-out motion-reduce:transition-none"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
