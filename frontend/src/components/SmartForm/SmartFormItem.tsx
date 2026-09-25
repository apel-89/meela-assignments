import { For, Show } from "solid-js";
import type { Answer, Question } from "../../lib/schema";

interface SmartFormItemProps {
  question: Question;
  onChange: (payload: Answer) => void;
  value?: unknown;
}

const isString = (v: unknown) => (typeof v === "string" ? v : "");

export const SmartFormItem = (props: SmartFormItemProps) => {
  const inputId = () => `q-${props.question.id}`;
  const helpId = () => `${inputId()}-help`;
  const isGroup = () =>
    props.question.inputType === "single" ||
    props.question.inputType === "multi";
  const help = (
    <Show when={props.question.help}>
      <p id={helpId()} class="smart-form-item-help">
        {props.question.help}
      </p>
    </Show>
  );

  const renderInput = () => {
    switch (props.question.inputType) {
      case "single":
        return (
          <div class="options-grid" style={{ "--columns": 3 }}>
            {props.question?.options?.map((option) => (
              <label>
                <input
                  type="radio"
                  name={props.question.id}
                  value={option.value}
                  checked={props.value === option.value}
                  onChange={(e) =>
                    props.onChange({
                      [props.question.id]: e.currentTarget.value,
                    })
                  }
                />
                {option.label}
              </label>
            ))}
          </div>
        );
      case "multi": {
        const selected = () => (props.value as string[]) ?? [];
        return (
          <div class="options-grid">
            <For each={props.question.options}>
              {(option) => (
                <label>
                  <input
                    type="checkbox"
                    class="checkbox"
                    value={option.value}
                    checked={selected().includes(option.value)}
                    onChange={(e) => {
                      const next = e.currentTarget.checked
                        ? [...selected(), option.value]
                        : selected().filter((v) => v !== option.value);
                      props.onChange({ [props.question.id]: next });
                    }}
                  />
                  {option.label}
                </label>
              )}
            </For>
          </div>
        );
      }
      case "text":
        return (
          <input
            id={inputId()}
            aria-describedby={props.question.help ? helpId() : undefined}
            class="smart-form-item-input"
            type="text"
            value={isString(props.value)}
            onInput={(e) =>
              props.onChange({ [props.question.id]: e.currentTarget.value })
            }
          />
        );
      case "select":
        return (
          <select
            id={inputId()}
            aria-describedby={props.question.help ? helpId() : undefined}
            class="smart-form-item-input"
            name={props.question.id}
            value={isString(props.value)}
            onChange={(e) =>
              props.onChange({ [props.question.id]: e.currentTarget.value })
            }
          >
            <option value="" disabled>
              Choose a city
            </option>
            {props.question?.options?.map((option) => (
              <option value={option.value}>{option.label}</option>
            ))}
          </select>
        );
      default:
        return null;
    }
  };

  return isGroup() ? (
    <fieldset
      class="smart-form-item"
      aria-describedby={props.question.help ? helpId() : undefined}
    >
      <legend class="smart-form-item-question">{props.question.title}</legend>
      {help}
      {renderInput()}
    </fieldset>
  ) : (
    <div class="smart-form-item">
      <label class="smart-form-item-question" for={inputId()}>
        {props.question.title}
      </label>
      {help}
      {renderInput()}
    </div>
  );
};
