interface StepperProps {
  step: number;
  totalSteps: number;
}

export const Stepper = (props: StepperProps) => {
  return (
    <div class="stepper">
      <div class="step">
        {props.step + 1} / {props.totalSteps}
      </div>
    </div>
  );
};
