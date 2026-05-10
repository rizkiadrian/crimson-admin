"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2 } from "lucide-react";
import { FormInput } from "@app/components/ui/FormInput";
import { FormSelect } from "@app/components/ui/FormSelect";
import { Button } from "@app/components/ui/Button";
import { eventRegistryService } from "@services/marketing/event-registry";
import type { IEventRegistry } from "@services/marketing/event-registry";
import type {
  ITriggerRule,
  IMetadataCondition,
  TriggerType,
  MetadataOperator,
} from "@services/marketing/popup-promotions";

const TRIGGER_TYPE_OPTIONS = [
  { label: "Immediate", value: "immediate" },
  { label: "Delay", value: "delay" },
  { label: "Scroll Depth", value: "scroll_depth" },
  { label: "Exit Intent", value: "exit_intent" },
  { label: "Session Count", value: "session_count" },
  { label: "Inactivity", value: "inactivity" },
  { label: "Event", value: "event" },
];

const OPERATOR_OPTIONS = [
  { label: "Equals", value: "equals" },
  { label: "Not Equals", value: "not_equals" },
  { label: "In", value: "in" },
  { label: "Contains", value: "contains" },
  { label: "Exists", value: "exists" },
];

interface TriggerRulesBuilderProps {
  value: ITriggerRule[];
  onChange: (rules: ITriggerRule[]) => void;
}

export default function TriggerRulesBuilder({
  value,
  onChange,
}: TriggerRulesBuilderProps) {
  const [events, setEvents] = useState<IEventRegistry[]>([]);

  useEffect(() => {
    eventRegistryService
      .list({ per_page: 50 })
      .then((resp) => setEvents(resp.data))
      .catch(() => {});
  }, []);

  const eventOptions = events.map((e) => ({
    label: `${e.label} (${e.key})`,
    value: e.key,
  }));

  const addRule = () => {
    onChange([...value, { type: "immediate" }]);
  };

  const updateRule = (index: number, updates: Partial<ITriggerRule>) => {
    onChange(value.map((r, i) => (i === index ? { ...r, ...updates } : r)));
  };

  const removeRule = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const addCondition = (ruleIndex: number) => {
    const rule = value[ruleIndex];
    const conditions = [
      ...(rule.metadata_conditions || []),
      { field: "", operator: "equals" as MetadataOperator, value: "" },
    ];
    updateRule(ruleIndex, { metadata_conditions: conditions });
  };

  const updateCondition = (
    ruleIndex: number,
    condIndex: number,
    updates: Partial<IMetadataCondition>
  ) => {
    const rule = value[ruleIndex];
    const conditions = (rule.metadata_conditions || []).map((c, i) =>
      i === condIndex ? { ...c, ...updates } : c
    );
    updateRule(ruleIndex, { metadata_conditions: conditions });
  };

  const removeCondition = (ruleIndex: number, condIndex: number) => {
    const rule = value[ruleIndex];
    const conditions = (rule.metadata_conditions || []).filter(
      (_, i) => i !== condIndex
    );
    updateRule(ruleIndex, { metadata_conditions: conditions });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-neutral-700">
          Trigger Rules
        </label>
        <Button
          type="button"
          variant="secondary"
          className="text-xs gap-1"
          onClick={addRule}
        >
          <Plus size={12} /> Add Rule
        </Button>
      </div>

      {value.length === 0 && (
        <p className="text-sm text-neutral-400 italic">
          No trigger rules. Popup will show immediately.
        </p>
      )}

      {value.map((rule, ruleIdx) => (
        <div
          key={ruleIdx}
          className="border border-neutral-200 rounded-xl p-4 space-y-3 bg-neutral-50/50"
        >
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <FormSelect
                id={`trigger-type-${ruleIdx}`}
                label="Type"
                value={rule.type}
                onChange={(e) =>
                  updateRule(ruleIdx, { type: e.target.value as TriggerType })
                }
                options={TRIGGER_TYPE_OPTIONS}
              />
            </div>
            <button
              type="button"
              onClick={() => removeRule(ruleIdx)}
              className="mt-5 p-2 text-error-500 hover:bg-error-50 rounded-lg transition-colors"
            >
              <Trash2 size={14} />
            </button>
          </div>

          {/* Type-specific fields */}
          {rule.type === "delay" && (
            <FormInput
              id={`delay-${ruleIdx}`}
              label="Delay (seconds)"
              type="number"
              value={String(rule.delay_seconds || 0)}
              onChange={(e) =>
                updateRule(ruleIdx, { delay_seconds: Number(e.target.value) })
              }
            />
          )}
          {rule.type === "scroll_depth" && (
            <FormInput
              id={`scroll-${ruleIdx}`}
              label="Scroll (%)"
              type="number"
              value={String(rule.scroll_percent || 50)}
              onChange={(e) =>
                updateRule(ruleIdx, { scroll_percent: Number(e.target.value) })
              }
            />
          )}
          {rule.type === "session_count" && (
            <FormInput
              id={`sessions-${ruleIdx}`}
              label="Min Sessions"
              type="number"
              value={String(rule.min_sessions || 1)}
              onChange={(e) =>
                updateRule(ruleIdx, { min_sessions: Number(e.target.value) })
              }
            />
          )}
          {rule.type === "inactivity" && (
            <FormInput
              id={`idle-${ruleIdx}`}
              label="Idle (seconds)"
              type="number"
              value={String(rule.idle_seconds || 30)}
              onChange={(e) =>
                updateRule(ruleIdx, { idle_seconds: Number(e.target.value) })
              }
            />
          )}

          {/* Event-specific */}
          {rule.type === "event" && (
            <div className="space-y-3 pt-2 border-t border-neutral-200">
              <FormSelect
                id={`event-key-${ruleIdx}`}
                label="Event"
                value={rule.event_key || ""}
                onChange={(e) =>
                  updateRule(ruleIdx, { event_key: e.target.value })
                }
                options={[
                  { label: "Select event...", value: "" },
                  ...eventOptions,
                ]}
              />

              {/* Metadata conditions */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-neutral-500">
                    Metadata Conditions
                  </span>
                  <button
                    type="button"
                    onClick={() => addCondition(ruleIdx)}
                    className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                  >
                    + Add
                  </button>
                </div>
                {(rule.metadata_conditions || []).map((cond, condIdx) => (
                  <div key={condIdx} className="flex items-end gap-2">
                    <div className="flex-1">
                      <FormInput
                        id={`cond-field-${ruleIdx}-${condIdx}`}
                        label="Field"
                        value={cond.field}
                        onChange={(e) =>
                          updateCondition(ruleIdx, condIdx, {
                            field: e.target.value,
                          })
                        }
                        placeholder="e.g. screen"
                      />
                    </div>
                    <div className="w-32">
                      <FormSelect
                        id={`cond-op-${ruleIdx}-${condIdx}`}
                        label="Op"
                        value={cond.operator}
                        onChange={(e) =>
                          updateCondition(ruleIdx, condIdx, {
                            operator: e.target.value as MetadataOperator,
                          })
                        }
                        options={OPERATOR_OPTIONS}
                      />
                    </div>
                    <div className="flex-1">
                      <FormInput
                        id={`cond-val-${ruleIdx}-${condIdx}`}
                        label="Value"
                        value={String(cond.value || "")}
                        onChange={(e) =>
                          updateCondition(ruleIdx, condIdx, {
                            value: e.target.value,
                          })
                        }
                        placeholder="e.g. home"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeCondition(ruleIdx, condIdx)}
                      className="mb-1 p-1.5 text-error-500 hover:bg-error-50 rounded transition-colors"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
