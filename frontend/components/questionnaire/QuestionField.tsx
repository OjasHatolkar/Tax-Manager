interface Option {
  value: string;
  label: string;
}

interface SingleSelectProps {
  name: string;
  label: string;
  helpText?: string;
  options: Option[];
  value: string | undefined;
  onChange: (value: string) => void;
}

/** Accessible radio-button group styled as cards, used for single-choice
 * questions throughout the questionnaire. */
export function SingleSelectQuestion({
  name,
  label,
  helpText,
  options,
  value,
  onChange,
}: SingleSelectProps) {
  return (
    <fieldset className="mt-8 first:mt-0">
      <legend className="text-base font-semibold text-ink-900">{label}</legend>
      {helpText && <p className="mt-1 text-sm text-ink-600">{helpText}</p>}
      <div className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        {options.map((option) => {
          const checked = value === option.value;
          return (
            <label
              key={option.value}
              className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-sm transition-colors duration-150 ${
                checked
                  ? "border-forest-700 bg-forest-50 text-forest-900"
                  : "border-forest-200 bg-white text-ink-800 hover:border-forest-400"
              }`}
            >
              <input
                type="radio"
                name={name}
                value={option.value}
                checked={checked}
                onChange={() => onChange(option.value)}
                className="h-4 w-4 accent-forest-700 focus-visible:ring-2 focus-visible:ring-forest-700"
              />
              {option.label}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

interface MultiSelectProps {
  name: string;
  label: string;
  helpText?: string;
  options: Option[];
  value: string[] | undefined;
  onChange: (value: string[]) => void;
}

export function toggleMultiSelectValue(value: string[], optionValue: string): string[] {
  if (optionValue === "none") return value.includes("none") ? [] : ["none"];
  if (value.includes(optionValue)) return value.filter((entry) => entry !== optionValue);
  return [...value.filter((entry) => entry !== "none"), optionValue];
}

/** Accessible checkbox group for "select all that apply" questions. */
export function MultiSelectQuestion({
  name,
  label,
  helpText,
  options,
  value = [],
  onChange,
}: MultiSelectProps) {
  function toggle(optionValue: string) {
    onChange(toggleMultiSelectValue(value, optionValue));
  }

  return (
    <fieldset className="mt-8 first:mt-0">
      <legend className="text-base font-semibold text-ink-900">{label}</legend>
      {helpText && <p className="mt-1 text-sm text-ink-600">{helpText}</p>}
      <div className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        {options.map((option) => {
          const checked = value.includes(option.value);
          return (
            <label
              key={option.value}
              className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-sm transition-colors duration-150 ${
                checked
                  ? "border-forest-700 bg-forest-50 text-forest-900"
                  : "border-forest-200 bg-white text-ink-800 hover:border-forest-400"
              }`}
            >
              <input
                type="checkbox"
                name={name}
                value={option.value}
                checked={checked}
                onChange={() => toggle(option.value)}
                className="h-4 w-4 accent-forest-700 focus-visible:ring-2 focus-visible:ring-forest-700"
              />
              {option.label}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
