import type { IconTypes } from "solid-icons";
import type { JSX } from "solid-js/jsx-runtime";
import "./Button.css";

interface ButtonProps extends JSX.HTMLAttributes<HTMLButtonElement> {
  onClick?: VoidFunction;
  variant?: "default" | "ghost";
  Icon?: IconTypes;
  disabled?: boolean;
}

export const Button = (props: ButtonProps) => {
  const Icon = props.Icon ?? null;

  return (
    <button
      class={`button ${props.variant ?? "default"}`}
      onClick={props.onClick}
      disabled={props.disabled}
    >
      {Icon && <Icon class="button-icon" />}
      {props.children}
    </button>
  );
};
