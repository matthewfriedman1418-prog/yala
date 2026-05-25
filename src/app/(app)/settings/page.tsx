'use client';

/**
 * /settings — user preferences. Real toggles, real persistence.
 *
 * Sections (sidebar nav on desktop, scroll anchors on mobile):
 *   - Account        (display name, email, KYC, privacy toggle)
 *   - Notifications  (per-kind toggles + email/push)
 *   - Sound          (master + categories + volume slider)
 *   - Display        (language, density, motion, chat, timestamps)
 *   - Security       (2FA, hide balances, trusted devices)
 *   - Sessions       (revoke individual or all-other sessions)
 *   - Danger zone    (reset settings, sign out)
 */

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  User, Bell, Volume2, Monitor, Shield, Smartphone, AlertTriangle,
  Pencil, Check, X, LogOut, RotateCcw, Eye, EyeOff, Globe, Trash2,
  CheckCircle2,
} from 'lucide-react';
import { useAuthStore } from '@/lib/store/auth';
import { useUIStore } from '@/lib/store/ui';
import { useSettingsStore, type Language, type Density } from '@/lib/store/settings';

type SectionId = 'account' | 'notifications' | 'sound' | 'display' | 'security' | 'sessions' | 'danger';

const SECTIONS: { id: SectionId; label: string; icon: typeof User }[] = [
  { id: 'account',       label: 'Account',       icon: User },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'sound',         label: 'Sound',         icon: Volume2 },
  { id: 'display',       label: 'Display',       icon: Monitor },
  { id: 'security',      label: 'Security',      icon: Shield },
  { id: 'sessions',      label: 'Sessions',      icon: Smartphone },
  { id: 'danger',        label: 'Danger zone',   icon: AlertTriangle },
];

const LANGUAGES: { id: Language; label: string }[] = [
  { id: 'en', label: 'English' },
  { id: 'es', label: 'Español' },
  { id: 'pt', label: 'Português' },
  { id: 'fr', label: 'Français' },
  { id: 'de', label: 'Deutsch' },
];

export default function SettingsPage() {
  const { isLoggedIn, user, updateDisplayName, setProfilePrivate, logout } = useAuthStore();
  const { openAuthModal } = useUIStore();
  const router = useRouter();

  const settings = useSettingsStore();

  const [active, setActive] = useState<SectionId>('account');
  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState('');

  // Signed-out state
  if (!isLoggedIn) {
    return (
      <div className="flex flex-col items-center justify-center min-h-64 gap-4">
        <Shield className="w-10 h-10" style={{ color: '#4A6A55' }} />
        <p style={{ color: '#8FA899' }}>Sign in to view your settings.</p>
        <button
          onClick={() => openAuthModal()}
          className="px-6 py-3 rounded-xl font-bold text-sm transition-all hover:brightness-110"
          style={{ background: 'linear-gradient(135deg, #2DC97A, #F0B232)', color: '#060E0A' }}
        >
          Sign in
        </button>
      </div>
    );
  }

  const handleSaveName = () => {
    const v = nameDraft.trim();
    if (v.length < 3 || v.length > 24) { toast.error('Name must be 3–24 characters'); return; }
    updateDisplayName(v);
    setEditingName(false);
    toast.success('Display name updated');
  };

  const handleSignOut = () => {
    if (!confirm('Sign out of Yala?')) return;
    logout();
    toast('Signed out');
    router.push('/');
  };

  return (
    <div className="space-y-6 animate-[fade-in_0.3s_ease-out] max-w-6xl">
      <div>
        <h1 className="font-display text-2xl font-black tracking-tight" style={{ color: '#F5E8C8' }}>
          Settings
        </h1>
        <p className="text-xs mt-0.5" style={{ color: '#8FA899' }}>
          Preferences, security, sessions. Changes save automatically.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr] gap-5">
        {/* ── Section nav ─────────────────────── */}
        <nav
          className="rounded-2xl p-2 lg:sticky lg:top-20 h-fit"
          style={{ background: '#0F1A14', border: '1px solid #1A2E22' }}
        >
          <ul className="flex lg:flex-col gap-1 overflow-x-auto no-scrollbar">
            {SECTIONS.map((s) => {
              const Icon = s.icon;
              const isActive = active === s.id;
              const isDanger = s.id === 'danger';
              return (
                <li key={s.id} className="flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => setActive(s.id)}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[12px] font-bold transition-colors whitespace-nowrap"
                    style={{
                      background: isActive ? (isDanger ? 'rgba(239,68,68,0.10)' : 'rgba(240,178,50,0.10)') : 'transparent',
                      color:      isActive ? (isDanger ? '#EF4444' : '#F0B232') : '#8FA899',
                      border:     `1px solid ${isActive ? (isDanger ? 'rgba(239,68,68,0.30)' : 'rgba(240,178,50,0.30)') : 'transparent'}`,
                    }}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {s.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* ── Section content ─────────────────── */}
        <div className="space-y-5">
          {/* ACCOUNT */}
          {active === 'account' && (
            <Card title="Account" subtitle="Your public-facing identity and verification.">
              <Row label="Display name" hint="Shown on your profile card, leaderboards, and chat. Editable.">
                {editingName ? (
                  <div className="flex items-center gap-2">
                    <input
                      autoFocus
                      value={nameDraft}
                      onChange={(e) => setNameDraft(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveName();
                        if (e.key === 'Escape') setEditingName(false);
                      }}
                      maxLength={24}
                      className="px-2.5 py-1.5 text-sm font-bold bg-transparent rounded-lg focus:outline-none"
                      style={{ color: '#F5E8C8', border: '1px solid rgba(240,178,50,0.4)' }}
                    />
                    <button onClick={handleSaveName} aria-label="Save" className="p-1.5 rounded-lg hover:bg-emerald-500/10" style={{ color: '#2DC97A' }}>
                      <Check className="w-4 h-4" />
                    </button>
                    <button onClick={() => setEditingName(false)} aria-label="Cancel" className="p-1.5 rounded-lg hover:bg-white/5" style={{ color: '#8FA899' }}>
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold" style={{ color: '#F5E8C8' }}>
                      {user?.displayName || user?.username}
                    </span>
                    <button
                      onClick={() => { setNameDraft(user?.displayName || user?.username || ''); setEditingName(true); }}
                      aria-label="Edit display name"
                      className="p-1 rounded-lg hover:bg-white/5"
                      style={{ color: '#8FA899' }}
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </Row>
              <Row label="Email" hint="Used for login, withdrawals, and notification email if enabled.">
                <span className="text-sm" style={{ color: '#F5E8C8' }}>{user?.email}</span>
              </Row>
              <Row label="Verification" hint="KYC unlocks higher withdrawal limits and sweepstakes redemptions.">
                {user?.isVerified ? (
                  <span className="flex items-center gap-1 text-sm font-bold" style={{ color: '#2DC97A' }}>
                    <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                  </span>
                ) : (
                  <Link
                    href="/kyc"
                    className="text-xs font-bold px-3 py-1.5 rounded-lg transition-colors hover:brightness-110"
                    style={{ background: 'rgba(240,178,50,0.12)', color: '#F0B232', border: '1px solid rgba(240,178,50,0.30)' }}
                  >
                    Start verification →
                  </Link>
                )}
              </Row>
              <Row label="Private profile" hint="Hides your stats from other players in chat. They'll still see your name and tier.">
                <Toggle
                  on={!!user?.profilePrivate}
                  onChange={(v) => {
                    setProfilePrivate(v);
                    toast.success(v ? 'Profile set to private' : 'Profile set to public');
                  }}
                  icon={user?.profilePrivate ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                />
              </Row>
            </Card>
          )}

          {/* NOTIFICATIONS */}
          {active === 'notifications' && (
            <Card
              title="Notifications"
              subtitle="Choose what reaches your bell and where it's delivered."
              footer={
                <Link href="/notifications" className="text-xs font-bold underline" style={{ color: '#F0B232' }}>
                  Open your notification inbox →
                </Link>
              }
            >
              <Group label="In-app notifications">
                <Row label="Wins"        hint="When you cash out on an Original."><Toggle on={settings.notifications.wins}     onChange={(v) => settings.setNotification('wins', v)} /></Row>
                <Row label="Missions"    hint="Mission completion + reward drops."><Toggle on={settings.notifications.missions} onChange={(v) => settings.setNotification('missions', v)} /></Row>
                <Row label="Level-ups"   hint="When you cross a VIP tier."><Toggle on={settings.notifications.levelUp}        onChange={(v) => settings.setNotification('levelUp', v)} /></Row>
                <Row label="Promotions"  hint="New promo drops and reload offers."><Toggle on={settings.notifications.promos}  onChange={(v) => settings.setNotification('promos', v)} /></Row>
                <Row label="Rakeback"    hint="When rakeback is ready to claim."><Toggle on={settings.notifications.rakeback}  onChange={(v) => settings.setNotification('rakeback', v)} /></Row>
                <Row label="Chat rain"   hint="Notify me when I'm in a rain drop."><Toggle on={settings.notifications.rain}    onChange={(v) => settings.setNotification('rain', v)} /></Row>
                <Row label="Tips"        hint="When someone tips you in chat."><Toggle on={settings.notifications.tips}        onChange={(v) => settings.setNotification('tips', v)} /></Row>
                <Row label="System"      hint="Account, security, and KYC alerts. Recommended on."><Toggle on={settings.notifications.system} onChange={(v) => settings.setNotification('system', v)} /></Row>
              </Group>
              <Group label="Delivery channels">
                <Row label="Email" hint={`Send important alerts to ${user?.email}.`}><Toggle on={settings.notifications.email} onChange={(v) => settings.setNotification('email', v)} /></Row>
                <Row label="Push"  hint="Browser push notifications (requires permission)."><Toggle on={settings.notifications.push}  onChange={(v) => settings.setNotification('push', v)} /></Row>
              </Group>
            </Card>
          )}

          {/* SOUND */}
          {active === 'sound' && (
            <Card title="Sound" subtitle="Game and interface audio.">
              <Row label="Master sound" hint="Disables all in-app audio.">
                <Toggle
                  on={settings.sound.enabled}
                  onChange={(v) => { settings.setSound('enabled', v); toast(v ? 'Sound enabled' : 'Sound muted'); }}
                />
              </Row>
              <Row label="Volume" hint={`${settings.sound.volume}%`}>
                <input
                  type="range"
                  min={0} max={100} step={5}
                  value={settings.sound.volume}
                  disabled={!settings.sound.enabled}
                  onChange={(e) => settings.setSound('volume', parseInt(e.target.value, 10))}
                  className="w-44 accent-[#F0B232] disabled:opacity-40"
                />
              </Row>
              <Group label="Categories">
                <Row label="Game effects" hint="Reels, crash explosions, cash-out chimes."><Toggle on={settings.sound.gameEffects} onChange={(v) => settings.setSound('gameEffects', v)} disabled={!settings.sound.enabled} /></Row>
                <Row label="Win sounds"   hint="Plays on bigger multipliers."><Toggle on={settings.sound.win}                onChange={(v) => settings.setSound('win', v)} disabled={!settings.sound.enabled} /></Row>
                <Row label="UI clicks"    hint="Subtle interface feedback."><Toggle on={settings.sound.uiClicks}              onChange={(v) => settings.setSound('uiClicks', v)} disabled={!settings.sound.enabled} /></Row>
              </Group>
            </Card>
          )}

          {/* DISPLAY */}
          {active === 'display' && (
            <Card title="Display" subtitle="Visual preferences. Some take effect immediately.">
              <Row label="Language" hint="Translates UI strings where available.">
                <select
                  value={settings.display.language}
                  onChange={(e) => { settings.setDisplay('language', e.target.value as Language); toast.success('Language updated'); }}
                  className="text-sm font-bold rounded-lg px-3 py-1.5 focus:outline-none"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid #1A2E22', color: '#F5E8C8' }}
                >
                  {LANGUAGES.map((l) => <option key={l.id} value={l.id} style={{ background: '#0F1A14' }}>{l.label}</option>)}
                </select>
              </Row>
              <Row label="Density" hint="Compact mode trims padding in lists and tables.">
                <SegmentedControl<Density>
                  value={settings.display.density}
                  options={[{ id: 'comfy', label: 'Comfy' }, { id: 'compact', label: 'Compact' }]}
                  onChange={(v) => settings.setDisplay('density', v)}
                />
              </Row>
              <Row label="Reduce motion" hint="Disables animations and transitions for accessibility."><Toggle on={settings.display.reduceMotion}   onChange={(v) => settings.setDisplay('reduceMotion', v)} /></Row>
              <Row label="Compact chat"  hint="Smaller avatars, denser message spacing in the chat panel."><Toggle on={settings.display.compactChat} onChange={(v) => settings.setDisplay('compactChat', v)} /></Row>
              <Row label="Show timestamps" hint="Always show message timestamps in chat (not just on hover)."><Toggle on={settings.display.showTimestamps} onChange={(v) => settings.setDisplay('showTimestamps', v)} /></Row>
            </Card>
          )}

          {/* SECURITY */}
          {active === 'security' && (
            <Card title="Security" subtitle="Account protection and visibility.">
              <Row label="Two-factor authentication" hint="Require a code from your authenticator app on each sign-in.">
                {settings.security.twoFactorEnabled ? (
                  <button
                    type="button"
                    onClick={() => { settings.setSecurity('twoFactorEnabled', false); toast('2FA disabled'); }}
                    className="text-xs font-bold px-3 py-1.5 rounded-lg transition-colors hover:bg-red-500/10"
                    style={{ background: 'rgba(45,201,122,0.10)', color: '#2DC97A', border: '1px solid rgba(45,201,122,0.30)' }}
                  >
                    Enabled · Disable
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => { settings.setSecurity('twoFactorEnabled', true); toast.success('2FA enabled (demo)'); }}
                    className="text-xs font-bold px-3 py-1.5 rounded-lg transition-colors hover:brightness-110"
                    style={{ background: 'rgba(240,178,50,0.12)', color: '#F0B232', border: '1px solid rgba(240,178,50,0.30)' }}
                  >
                    Set up 2FA →
                  </button>
                )}
              </Row>
              <Row label="Hide balances" hint="Replaces wallet balances with •••• until you tap to reveal."><Toggle on={settings.security.hideBalances}   onChange={(v) => settings.setSecurity('hideBalances', v)} /></Row>
              <Row label="Trust this device" hint="Remember this browser for 30 days (skip 2FA re-prompts)."><Toggle on={settings.security.trustedDevices} onChange={(v) => settings.setSecurity('trustedDevices', v)} /></Row>
              <Row label="Password" hint="Last changed 3 months ago.">
                <button
                  type="button"
                  onClick={() => toast('Password change flow coming soon')}
                  className="text-xs font-bold px-3 py-1.5 rounded-lg transition-colors hover:bg-white/5"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid #1A2E22', color: '#F5E8C8' }}
                >
                  Change password
                </button>
              </Row>
            </Card>
          )}

          {/* SESSIONS */}
          {active === 'sessions' && (
            <Card
              title="Active sessions"
              subtitle="Devices that are currently signed in to your account."
              footer={
                settings.sessions.filter((s) => !s.current).length > 0 && (
                  <button
                    type="button"
                    onClick={() => { settings.endAllOthers(); toast.success('All other sessions ended'); }}
                    className="text-xs font-bold px-3 py-1.5 rounded-lg transition-colors hover:bg-red-500/10"
                    style={{ background: 'rgba(239,68,68,0.10)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.30)' }}
                  >
                    End all other sessions
                  </button>
                )
              }
            >
              <div className="space-y-2">
                {settings.sessions.map((s) => (
                  <div
                    key={s.id}
                    className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl"
                    style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid #1A2E22' }}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid #1A2E22' }}
                      >
                        <Smartphone className="w-4 h-4" style={{ color: s.current ? '#2DC97A' : '#8FA899' }} />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold truncate" style={{ color: '#F5E8C8' }}>{s.device}</p>
                          {s.current && (
                            <span
                              className="text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-full"
                              style={{ background: 'rgba(45,201,122,0.14)', color: '#2DC97A', border: '1px solid rgba(45,201,122,0.30)' }}
                            >
                              This device
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] truncate" style={{ color: '#8FA899' }}>
                          <Globe className="inline w-3 h-3 mr-1 -mt-0.5" />
                          {s.location} · {s.lastActive}
                        </p>
                      </div>
                    </div>
                    {!s.current && (
                      <button
                        type="button"
                        onClick={() => { settings.endSession(s.id); toast(`Ended session: ${s.device}`); }}
                        className="text-[11px] font-bold px-3 py-1.5 rounded-lg transition-colors hover:bg-red-500/10"
                        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid #1A2E22', color: '#8FA899' }}
                      >
                        End
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* DANGER ZONE */}
          {active === 'danger' && (
            <Card
              title="Danger zone"
              subtitle="Destructive actions. Read carefully."
              tone="danger"
            >
              <Row label="Reset all preferences" hint="Restores notifications, sound, display, and security to defaults. Your account is untouched.">
                <button
                  type="button"
                  onClick={() => {
                    if (!confirm('Reset all settings to defaults?')) return;
                    settings.resetToDefaults();
                    toast.success('Settings restored to defaults');
                  }}
                  className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors hover:bg-white/5"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid #1A2E22', color: '#F5E8C8' }}
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Reset settings
                </button>
              </Row>
              <Row label="Sign out" hint="Sign out of this device only.">
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors hover:brightness-110"
                  style={{ background: 'rgba(239,68,68,0.10)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.30)' }}
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign out
                </button>
              </Row>
              <Row label="Delete account" hint="Permanently remove your account and all data. Requires email confirmation.">
                <button
                  type="button"
                  onClick={() => toast('Account deletion requires contact with support', { description: 'For your safety, this requires a verification email from support.' })}
                  className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors hover:brightness-110"
                  style={{ background: 'rgba(239,68,68,0.10)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.30)' }}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Request deletion
                </button>
              </Row>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Layout primitives ────────────────────────────────────────────────────

function Card({
  title, subtitle, children, footer, tone,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  tone?: 'danger';
}) {
  const borderColor = tone === 'danger' ? 'rgba(239,68,68,0.25)' : '#1A2E22';
  return (
    <section
      className="rounded-2xl overflow-hidden"
      style={{ background: '#0F1A14', border: `1px solid ${borderColor}` }}
    >
      <header className="px-5 py-4" style={{ borderBottom: `1px solid ${borderColor}` }}>
        <h2 className="text-sm font-bold" style={{ color: tone === 'danger' ? '#EF4444' : '#F5E8C8' }}>{title}</h2>
        {subtitle && <p className="text-[11px] mt-0.5" style={{ color: '#8FA899' }}>{subtitle}</p>}
      </header>
      <div className="px-5 py-3 divide-y" style={{ borderColor: '#1A2E22' }}>{children}</div>
      {footer && (
        <footer
          className="px-5 py-3 flex items-center justify-end gap-2"
          style={{ borderTop: `1px solid ${borderColor}`, background: '#0A1410' }}
        >
          {footer}
        </footer>
      )}
    </section>
  );
}

function Row({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3 py-3 first:pt-0 last:pb-0" style={{ borderColor: '#1A2E22' }}>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold" style={{ color: '#F5E8C8' }}>{label}</p>
        {hint && <p className="text-[11px] mt-0.5" style={{ color: '#8FA899' }}>{hint}</p>}
      </div>
      <div className="flex-shrink-0">{children}</div>
    </div>
  );
}

function Group({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="py-3 first:pt-0 last:pb-0">
      <p className="text-[9px] font-black uppercase tracking-widest mb-1" style={{ color: '#4A6A55' }}>{label}</p>
      <div className="divide-y" style={{ borderColor: '#1A2E22' }}>{children}</div>
    </div>
  );
}

function Toggle({
  on, onChange, icon, disabled,
}: {
  on: boolean;
  onChange: (v: boolean) => void;
  icon?: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      disabled={disabled}
      onClick={() => onChange(!on)}
      className="relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors disabled:opacity-40"
      style={{ background: on ? '#F0B232' : '#1A2E22' }}
    >
      <span
        className="inline-flex items-center justify-center h-5 w-5 rounded-full transition-transform"
        style={{
          background: on ? '#060E0A' : '#8FA899',
          color:      on ? '#F0B232' : '#0F1A14',
          transform:  on ? 'translateX(22px)' : 'translateX(2px)',
        }}
      >
        {icon}
      </span>
    </button>
  );
}

function SegmentedControl<T extends string>({
  value, options, onChange,
}: {
  value: T;
  options: { id: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div
      className="inline-flex rounded-lg p-0.5"
      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid #1A2E22' }}
    >
      {options.map((o) => {
        const active = value === o.id;
        return (
          <button
            key={o.id}
            type="button"
            onClick={() => onChange(o.id)}
            className="px-3 py-1 rounded-md text-[11px] font-bold transition-colors"
            style={{
              background: active ? 'rgba(240,178,50,0.14)' : 'transparent',
              color:      active ? '#F0B232' : '#8FA899',
            }}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
