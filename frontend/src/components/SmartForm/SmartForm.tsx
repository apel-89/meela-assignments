import { createSignal, For } from "solid-js";
import { createStore } from "solid-js/store";
import type { PatchPayload, Submission } from "../../lib/api";
import { type Answer, type FormSchema } from "../../lib/schema";
import { Button } from "../Button/Button";
import { Stepper } from "../Stepper/Stepper";
import "./SmartForm.css";
import { SmartFormItem } from "./SmartFormItem";

interface SmartFormProps {
  submission: Submission;
  formValues: FormSchema;
  onSubmit: (answers: Answer) => void;
  onChange: (payload: PatchPayload, immediate?: boolean) => void;
}

export const SmartForm = (props: SmartFormProps) => {
  const [activeStep, setActiveStep] = createSignal(
    props.submission.current_step,
  );
  const [answers, setAnswers] = createStore<Answer>({
    ...props.submission.answers,
  });

  const visible = () =>
    props.formValues[activeStep()].filter(
      (q) => !q.showIf || q.showIf(answers),
    );

  const handleUpdateAnswer = (answer: Answer) => {
    setAnswers(answer);
    props.onChange({
      ...props.submission,
      currentStep: activeStep(),
      answers: { ...answers, ...answer },
    });
  };

  const handleNavigate = (steps: number) => {
    const newStep = activeStep() + steps;
    setActiveStep(newStep);
    props.onChange(
      {
        id: props.submission.id,
        currentStep: newStep,
        answers: { ...answers },
      },
      true,
    );
  };

  return (
    <div class="smart-form">
      <Stepper step={activeStep()} totalSteps={props.formValues.length} />
      <For each={visible()}>
        {(q) => (
          <SmartFormItem
            question={q}
            onChange={handleUpdateAnswer}
            value={answers[q.id]}
          />
        )}
      </For>
      <div class="smart-form-actions">
        <Button
          variant="ghost"
          onClick={() => handleNavigate(-1)}
          disabled={activeStep() === 0}
        >
          Previous
        </Button>
        {activeStep() === props.formValues.length - 1 ? (
          <Button onClick={() => props.onSubmit({ ...answers })}>Submit</Button>
        ) : (
          <Button
            onClick={() => handleNavigate(1)}
            disabled={activeStep() === props.formValues.length - 1}
          >
            Next
          </Button>
        )}
      </div>
    </div>
  );
};
