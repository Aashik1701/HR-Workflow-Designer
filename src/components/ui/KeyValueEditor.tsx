import { Plus, Trash2 } from 'lucide-react';
import type { KeyValuePair } from '../../types/workflow';

interface Props {
  value: KeyValuePair[];
  onChange: (pairs: KeyValuePair[]) => void;
  label?: string;
}

export function KeyValueEditor({ value, onChange, label = 'Custom Fields' }: Props) {
  const add = () => onChange([...value, { key: '', value: '' }]);
  const remove = (i: number) => onChange(value.filter((_, idx) => idx !== i));
  const update = (i: number, field: 'key' | 'value', v: string) => {
    const updated = [...value];
    updated[i] = { ...updated[i], [field]: v };
    onChange(updated);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium text-slate-600">{label}</label>
        <button
          type="button"
          onClick={add}
          className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800"
        >
          <Plus size={10} /> Add
        </button>
      </div>
      {value.map((pair, i) => (
        <div key={i} className="flex gap-1">
          <input
            className="flex-1 text-xs border border-slate-200 rounded px-2 py-1 focus:ring-1 ring-indigo-400 outline-none"
            placeholder="key"
            value={pair.key}
            onChange={e => update(i, 'key', e.target.value)}
          />
          <input
            className="flex-1 text-xs border border-slate-200 rounded px-2 py-1 focus:ring-1 ring-indigo-400 outline-none"
            placeholder="value"
            value={pair.value}
            onChange={e => update(i, 'value', e.target.value)}
          />
          <button type="button" onClick={() => remove(i)} className="text-slate-400 hover:text-red-500">
            <Trash2 size={12} />
          </button>
        </div>
      ))}
    </div>
  );
}
