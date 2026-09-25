import { createResource, createSignal, Show } from "solid-js";
import { Button } from "../components/Button/Button";
import { Dialog } from "../components/Dialog/Dialog";
import { SmartForm } from "../components/SmartForm/SmartForm";
import {
  ApiError,
  completeSubmission,
  createSubmission,
  getSubmission,
  patchSubmission,
  type PatchPayload,
} from "../lib/api";
import { pruneAnswers, steps, type Answer } from "../lib/schema";

const DEBOUNCE_MS = 1000;

export const DashboardPage = () => {
  const [started, setStarted] = createSignal(false);
  const [formDialogIsOpen, setFormDialogIsOpen] = createSignal(false);

  const [submission, { mutate }] = createResource(started, async () => {
    const existingId = new URLSearchParams(location.search).get("id");
    if (existingId) {
      try {
        return await getSubmission(existingId);
      } catch (e) {
        if (!(e instanceof ApiError && e.isNotFound)) throw e;
      }
    }

    const { id } = await createSubmission();
    history.replaceState({}, "", `?id=${id}`);
    return getSubmission(id);
  });

  const completed = () => submission()?.completed ?? false;

  let timer: number;
  const handleChange = (payload: PatchPayload, immediate = false) => {
    clearTimeout(timer);
    if (immediate) {
      patchSubmission(payload);
    } else {
      timer = setTimeout(() => patchSubmission(payload), DEBOUNCE_MS);
    }
  };

  const handleSubmit = async (answers: Answer) => {
    clearTimeout(timer);
    const pruned = pruneAnswers(steps, answers);
    const updated = await completeSubmission(submission()!.id, pruned);
    mutate(updated);
  };

  return (
    <div class="page">
      <h2>Some questions for you.</h2>
      <div
        style={{
          display: "flex",
          gap: "1rem",
          "flex-direction": "column",
          "margin-bottom": "3rem",
        }}
      >
        <span>
          In order to tailor a treatment for you, we need to understand what you
          are looking for first.
        </span>
        <span>
          You can pause at any time and come back later to complete the form.
        </span>
      </div>
      <div style={{ display: "flex", "justify-content": "center" }}>
        <Button
          onClick={() => {
            setStarted(true);
            setFormDialogIsOpen(true);
          }}
        >
          Start
        </Button>
      </div>
      <Dialog
        open={formDialogIsOpen()}
        onClose={() => setFormDialogIsOpen(false)}
        title={completed() ? "Thank you!" : "Some questions for you"}
      >
        {completed() ? (
          <p>Thank you for completing the form!</p>
        ) : (
          <Show when={submission()}>
            {(s) => (
              <SmartForm
                formValues={steps}
                onChange={handleChange}
                onSubmit={handleSubmit}
                submission={s()}
              />
            )}
          </Show>
        )}
      </Dialog>
    </div>
  );
};
