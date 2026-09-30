"use client";

import { useCallback, useRef } from "react";
import { track } from "./track";
import type { FieldName, FieldState, FormId } from "./events";

/**
 * Field-level funnel instrumentation for a form: which question was reached, and which one was left without an
 * answer. This is the whole point of the exercise — "where do people give up" is a per-field question, and
 * step-level events cannot answer it.
 *
 * **It reads whether a field has a value, never the value.** The handler is given the event, takes
 * `target.value.trim().length > 0` as a boolean, and throws the string away. Nothing else here touches input.
 *
 * `onFirstInteraction` fires once per form, for the `*_started` event that opens the funnel.
 */
export function useFieldTracking(form: FormId, order: FieldName[], onFirstInteraction?: () => void) {
  const started = useRef(false);
  const focusedWithValue = useRef<Record<string, boolean>>({});

  const begin = useCallback(() => {
    if (started.current) return;
    started.current = true;
    onFirstInteraction?.();
  }, [onFirstInteraction]);

  const onFocus = useCallback(
    (field: FieldName) => (e: React.FocusEvent<HTMLElement>) => {
      begin();
      const el = e.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
      // Remember only whether it already had something in it, so "left empty" can tell arrival from deletion.
      focusedWithValue.current[field] = hasValue(el);
      track({ name: "form_field_focused", form, field, index: order.indexOf(field) });
    },
    [begin, form, order],
  );

  const onBlur = useCallback(
    (field: FieldName) => (e: React.FocusEvent<HTMLElement>) => {
      const el = e.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
      const invalid = el.getAttribute("aria-invalid") === "true";
      const state: FieldState = invalid ? "invalid" : hasValue(el) ? "filled" : "empty";
      track({ name: "form_field_left", form, field, index: order.indexOf(field), state });
    },
    [form, order],
  );

  return { onFocus, onBlur, begin };
}

/** A boolean, taken and discarded. The value never leaves this function. */
function hasValue(el: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement): boolean {
  if (el instanceof HTMLInputElement && (el.type === "checkbox" || el.type === "radio")) return el.checked;
  return typeof el.value === "string" && el.value.trim().length > 0;
}
