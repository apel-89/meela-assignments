import { AiFillCloseCircle } from "solid-icons/ai";
import { createEffect, type JSX } from "solid-js";
import { Button } from "../Button/Button";
import "./Dialog.css";

interface DialogProps {
  open: boolean;
  onClose: VoidFunction;
  children?: JSX.Element;
  title?: string;
}

export const Dialog = (props: DialogProps) => {
  let ref!: HTMLDialogElement;

  createEffect(() => {
    if (props.open) ref.showModal();
    else ref.close();
  });

  return (
    <dialog
      class="dialog"
      ref={ref}
      onClose={() => props.onClose()}
      aria-labelledby="dialog-title"
      onClick={(e) => {
        if (e.target === ref) props.onClose();
      }}
    >
      <div class="dialog-content">
        <div class="dialog-header">
          <h2 id="dialog-title">{props.title}</h2>
          <Button
            aria-label="Close"
            variant="ghost"
            onClick={props.onClose}
            Icon={AiFillCloseCircle}
          />
        </div>
        <div class="dialog-body">{props.children}</div>
      </div>
    </dialog>
  );
};
