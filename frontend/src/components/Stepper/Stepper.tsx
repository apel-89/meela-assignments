interface StepperProps {
  step: number;
  totalSteps: number;
}

export const Stepper = (props: StepperProps) => {
  return (
    <div class="stepper">
      <div class="step">
        Step {props.step + 1} of {props.totalSteps}
      </div>
    </div>
  );
};
