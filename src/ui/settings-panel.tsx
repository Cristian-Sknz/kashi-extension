import type { Ref } from 'react';
import type { LyricsState } from '../lyrics-controller';
import { languages, scripts, type Settings } from '../services/settings';
import popupCss from './settings-panel.css' with { type: 'text' };
import triggerCss from './settings-trigger.css' with { type: 'text' };

const STATUS_MESSAGES: Record<LyricsState, string> = {
  idle: 'Waiting for lyrics',
  loading: 'Converting…',
  ready: 'Converted locally',
  error: 'Conversion failed',
};

type TriggerProps = {
  buttonRef: Ref<HTMLButtonElement>;
  opened: boolean;
  onToggle(): void;
};

export function SettingsTrigger({ buttonRef, opened, onToggle }: TriggerProps) {
  return (
    <>
      <style>{triggerCss}</style>
      <button
        ref={buttonRef}
        type="button"
        aria-label="Kashi settings"
        title="Kashi settings"
        aria-haspopup="dialog"
        aria-expanded={opened}
        onClick={event => {
          event.stopPropagation();
          onToggle();
        }}
        onKeyDown={event => event.stopPropagation()}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M5 3h3v8l8-8h4L9 14l11 7h-5l-7-5v5H5z" />
        </svg>
      </button>
    </>
  );
}

type PanelProps = {
  panelRef: Ref<HTMLDivElement>;
  checkboxRef: Ref<HTMLInputElement>;
  nativePopover: boolean;
  opened: boolean;
  settings: Settings;
  state: LyricsState;
  notice: string;
  onChange(settings: Settings): void;
  onRetry(): void;
  onClose(): void;
  onPopoverToggle(): void;
};

export function SettingsPanel({
  panelRef,
  checkboxRef,
  nativePopover,
  opened,
  settings,
  state,
  notice,
  onChange,
  onRetry,
  onClose,
  onPopoverToggle,
}: PanelProps) {
  const { enabled, language, japaneseScript } = settings;
  const status = notice || (enabled ? STATUS_MESSAGES[state] : 'Original lyrics');

  return (
    <>
      <style>{popupCss}</style>
      <div
        ref={panelRef}
        className="panel"
        role="dialog"
        aria-label="Kashi settings"
        popover={nativePopover ? 'manual' : undefined}
        hidden={!nativePopover && !opened}
        onToggle={onPopoverToggle}
        onKeyDown={event => event.stopPropagation()}
      >
        <div className="heading">
          <strong>Kashi</strong>
          <button
            type="button"
            className="close"
            aria-label="Close Kashi settings"
            onClick={onClose}
          >
            ×
          </button>
        </div>
        <div className="rows">
          <label>
            Convert lyrics
            <input
              ref={checkboxRef}
              type="checkbox"
              checked={enabled}
              onChange={event => onChange({ ...settings, enabled: event.currentTarget.checked })}
            />
          </label>
          <label>
            Language
            <select
              data-language
              value={language ?? ''}
              disabled={!enabled}
              onChange={event => {
                const selected = languages.find(language => language === event.currentTarget.value);
                onChange({ enabled, japaneseScript, ...(selected ? { language: selected } : {}) });
              }}
            >
              <option value="">Automatic</option>
              {languages.map(language => (
                <option key={language}>{language}</option>
              ))}
            </select>
          </label>
          <label>
            Japanese
            <select
              data-script
              value={japaneseScript}
              disabled={!enabled || (language !== undefined && language !== 'Japanese')}
              onChange={event => {
                const selected = scripts.find(script => script === event.currentTarget.value);
                if (selected) onChange({ ...settings, japaneseScript: selected });
              }}
            >
              {scripts.map(script => (
                <option key={script} value={script}>
                  {script.charAt(0).toUpperCase() + script.slice(1)}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="status" role="status" aria-live="polite">
          {status}
        </div>
        <button type="button" data-retry hidden={state !== 'error'} onClick={onRetry}>
          Retry
        </button>
      </div>
    </>
  );
}
