import { useState } from 'react';
import { Check, Eye, EyeOff, KeyRound, ShieldCheck } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useToast } from '../contexts/ToastContext';

export function SecuritySettingsCard() {
  const { showToast } = useToast();
  const [nextSecret, setNextSecret] = useState('');
  const [repeatSecret, setRepeatSecret] = useState('');
  const [showFirst, setShowFirst] = useState(false);
  const [showSecond, setShowSecond] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (nextSecret.length < 8) {
      showToast('Пароль должен быть не менее 8 символов', 'error');
      return;
    }
    if (nextSecret !== repeatSecret) {
      showToast('Пароли не совпадают', 'error');
      return;
    }

    setSaving(true);
    setSaved(false);
    try {
      const { error } = await supabase.auth.updateUser({ password: nextSecret });
      if (error) throw error;

      setNextSecret('');
      setRepeatSecret('');
      setSaved(true);
      showToast('Новый пароль сохранён', 'success');

      if (window.location.hash.includes('access_token') || window.location.hash.includes('type=recovery')) {
        window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}`);
      }
      window.setTimeout(() => setSaved(false), 3000);
    } catch (error: any) {
      showToast(`Не удалось сменить пароль: ${error.message || error}`, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
      <div className="flex items-start gap-3 mb-5">
        <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
          <ShieldCheck className="w-5 h-5 text-slate-700" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Безопасность</h3>
          <p className="text-sm text-slate-500 mt-1">Задайте новый пароль для входа в аккаунт.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Новый пароль</label>
          <div className="relative">
            <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type={showFirst ? 'text' : 'password'}
              value={nextSecret}
              onChange={(event) => setNextSecret(event.target.value)}
              minLength={8}
              autoComplete="new-password"
              placeholder="Минимум 8 символов"
              className="w-full pl-10 pr-10 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button type="button" onClick={() => setShowFirst((value) => !value)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              {showFirst ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Повторите пароль</label>
          <div className="relative">
            <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type={showSecond ? 'text' : 'password'}
              value={repeatSecret}
              onChange={(event) => setRepeatSecret(event.target.value)}
              minLength={8}
              autoComplete="new-password"
              placeholder="Повторите новый пароль"
              className="w-full pl-10 pr-10 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button type="button" onClick={() => setShowSecond((value) => !value)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              {showSecond ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="md:col-span-2 flex items-center justify-between gap-4 pt-1">
          <p className="text-xs text-slate-500">После сохранения новый пароль начнёт действовать сразу.</p>
          <button type="submit" disabled={saving || !nextSecret || !repeatSecret} className={`px-4 py-2.5 rounded-lg font-medium transition flex items-center gap-2 ${saved ? 'bg-green-600 text-white' : 'bg-slate-900 text-white hover:bg-slate-800'} disabled:opacity-50 disabled:cursor-not-allowed`}>
            {saved ? <Check className="w-4 h-4" /> : <KeyRound className="w-4 h-4" />}
            {saved ? 'Пароль изменён' : saving ? 'Сохраняем…' : 'Сменить пароль'}
          </button>
        </div>
      </form>
    </div>
  );
}
