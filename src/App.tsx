import { useState, useMemo, useEffect, useCallback, useRef } from 'react'
import { createPortal } from 'react-dom'

// ─── Types ───────────────────────────────────────────────────────────────────

type Profile = 'Administrador' | 'Gestor Público' | 'Pesquisador'
type UserStatus = 'Ativo' | 'Inativo'

interface User {
  id: number
  name: string
  email: string
  profile: Profile
  municipality: string | null
  status: UserStatus
  lastAccess: string
}

interface Toast {
  id: number
  type: 'success' | 'error'
  message: string
  exiting?: boolean
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_USERS: User[] = [
  { id: 1,  name: 'Ana Beatriz Ferreira',    email: 'ana.ferreira@pulsourbano.gov.br',    profile: 'Administrador',  municipality: null,              status: 'Ativo',   lastAccess: '18/09/2026 09:14' },
  { id: 2,  name: 'Carlos Eduardo Mendes',   email: 'carlos.mendes@saopaulo.sp.gov.br',   profile: 'Gestor Público', municipality: 'São Paulo',        status: 'Ativo',   lastAccess: '17/09/2026 16:42' },
  { id: 3,  name: 'Fernanda Lima Souza',     email: 'fernanda.lima@recife.pe.gov.br',     profile: 'Gestor Público', municipality: 'Recife',           status: 'Ativo',   lastAccess: '16/09/2026 11:30' },
  { id: 4,  name: 'Rodrigo Alves Pereira',   email: 'rodrigo.alves@ufrj.br',             profile: 'Pesquisador',    municipality: 'Rio de Janeiro',   status: 'Ativo',   lastAccess: '18/09/2026 07:58' },
  { id: 5,  name: 'Juliana Costa Nunes',     email: 'juliana.nunes@bh.mg.gov.br',        profile: 'Gestor Público', municipality: 'Belo Horizonte',   status: 'Inativo', lastAccess: '02/08/2026 14:20' },
  { id: 6,  name: 'Marcelo Santos Barros',   email: 'marcelo.barros@ufba.br',            profile: 'Pesquisador',    municipality: 'Salvador',         status: 'Ativo',   lastAccess: '15/09/2026 18:05' },
  { id: 7,  name: 'Patrícia Oliveira Cruz',  email: 'patricia.cruz@pulsourbano.gov.br',   profile: 'Administrador',  municipality: null,              status: 'Ativo',   lastAccess: '18/09/2026 08:30' },
  { id: 8,  name: 'Thiago Ramos Machado',    email: 'thiago.machado@curitiba.pr.gov.br',  profile: 'Gestor Público', municipality: 'Curitiba',         status: 'Ativo',   lastAccess: '17/09/2026 10:11' },
  { id: 9,  name: 'Larissa Gomes Teixeira',  email: 'larissa.teixeira@usp.br',           profile: 'Pesquisador',    municipality: 'São Paulo',        status: 'Inativo', lastAccess: '10/07/2026 09:45' },
  { id: 10, name: 'Rafael Vieira Cardoso',   email: 'rafael.cardoso@fortaleza.ce.gov.br', profile: 'Gestor Público', municipality: 'Fortaleza',        status: 'Ativo',   lastAccess: '14/09/2026 15:33' },
  { id: 11, name: 'Camila Martins Rocha',    email: 'camila.rocha@ufam.br',              profile: 'Pesquisador',    municipality: 'Manaus',           status: 'Ativo',   lastAccess: '16/09/2026 12:00' },
  { id: 12, name: 'Bruno Lopes Azevedo',     email: 'bruno.azevedo@poa.rs.gov.br',       profile: 'Gestor Público', municipality: 'Porto Alegre',     status: 'Inativo', lastAccess: '05/06/2026 08:17' },
  { id: 13, name: 'Vanessa Pinto Moreira',   email: 'vanessa.moreira@belem.pa.gov.br',   profile: 'Gestor Público', municipality: 'Belém',            status: 'Ativo',   lastAccess: '13/09/2026 17:50' },
  { id: 14, name: 'Diego Nascimento Silva',  email: 'diego.silva@ufg.br',                profile: 'Pesquisador',    municipality: 'Goiânia',          status: 'Ativo',   lastAccess: '18/09/2026 06:45' },
  { id: 15, name: 'Aline Freitas Campos',    email: 'aline.campos@guarulhos.sp.gov.br',  profile: 'Gestor Público', municipality: 'Guarulhos',        status: 'Ativo',   lastAccess: '17/09/2026 14:22' },
  { id: 16, name: 'Gustavo Ribeiro Faria',   email: 'gustavo.faria@pulsourbano.gov.br',  profile: 'Administrador',  municipality: null,              status: 'Inativo', lastAccess: '01/05/2026 10:00' },
  { id: 17, name: 'Isabela Torres Cunha',    email: 'isabela.cunha@ufc.br',              profile: 'Pesquisador',    municipality: 'Fortaleza',        status: 'Ativo',   lastAccess: '11/09/2026 19:12' },
  { id: 18, name: 'Henrique Borges Lima',    email: 'henrique.lima@campinas.sp.gov.br',  profile: 'Gestor Público', municipality: 'Campinas',         status: 'Ativo',   lastAccess: '16/09/2026 09:38' },
  { id: 19, name: 'Tatiana Almeida Dias',    email: 'tatiana.dias@ufpe.br',              profile: 'Pesquisador',    municipality: 'Recife',           status: 'Inativo', lastAccess: '22/08/2026 13:15' },
  { id: 20, name: 'Leandro Carvalho Melo',   email: 'leandro.melo@saopaulo.sp.gov.br',  profile: 'Gestor Público', municipality: 'São Paulo',        status: 'Ativo',   lastAccess: '18/09/2026 08:05' },
  { id: 21, name: 'Renata Correia Baptista', email: 'renata.baptista@ufmg.br',           profile: 'Pesquisador',    municipality: 'Belo Horizonte',   status: 'Ativo',   lastAccess: '15/09/2026 20:30' },
  { id: 22, name: 'Fábio Moura Santos',      email: 'fabio.santos@salvador.ba.gov.br',   profile: 'Gestor Público', municipality: 'Salvador',         status: 'Inativo', lastAccess: '14/08/2026 16:40' },
  { id: 23, name: 'Priscila Ferreira Leal',  email: 'priscila.leal@ufpr.br',             profile: 'Pesquisador',    municipality: 'Curitiba',         status: 'Ativo',   lastAccess: '17/09/2026 21:00' },
  { id: 24, name: 'Sérgio Monteiro Paiva',   email: 'sergio.paiva@manaus.am.gov.br',     profile: 'Gestor Público', municipality: 'Manaus',           status: 'Ativo',   lastAccess: '12/09/2026 10:55' },
  { id: 25, name: 'Mônica Barbosa Reis',     email: 'monica.reis@pucrs.br',              profile: 'Pesquisador',    municipality: 'Porto Alegre',     status: 'Ativo',   lastAccess: '16/09/2026 22:10' },
  { id: 26, name: 'Adriano Fontes Queiroz',  email: 'adriano.queiroz@belem.pa.gov.br',   profile: 'Gestor Público', municipality: 'Belém',            status: 'Inativo', lastAccess: '30/07/2026 11:20' },
  { id: 27, name: 'Cristiane Duarte Vargas', email: 'cristiane.vargas@unesp.br',         profile: 'Pesquisador',    municipality: 'Campinas',         status: 'Ativo',   lastAccess: '13/09/2026 14:08' },
  { id: 28, name: 'Eduardo Pinto Andrade',   email: 'eduardo.andrade@goiania.go.gov.br', profile: 'Gestor Público', municipality: 'Goiânia',          status: 'Ativo',   lastAccess: '18/09/2026 07:30' },
  { id: 29, name: 'Luciana Vieira Siqueira', email: 'luciana.siqueira@pulsourbano.gov.br', profile: 'Administrador', municipality: null,             status: 'Ativo',   lastAccess: '18/09/2026 09:00' },
  { id: 30, name: 'Tiago Aquino Fontana',    email: 'tiago.fontana@ufrgs.br',            profile: 'Pesquisador',    municipality: 'Porto Alegre',     status: 'Inativo', lastAccess: '19/08/2026 17:45' },
]

const MUNICIPALITIES = [...new Set(MOCK_USERS.filter(u => u.municipality).map(u => u.municipality as string))].sort()

// ─── Helpers ──────────────────────────────────────────────────────────────────

function profileBadge(profile: Profile) {
  switch (profile) {
    case 'Administrador': return { bg: 'rgba(0,166,230,0.15)', border: 'rgba(0,166,230,0.35)', text: '#00A6E6' }
    case 'Gestor Público': return { bg: 'rgba(34,184,181,0.15)', border: 'rgba(34,184,181,0.35)', text: '#22B8B5' }
    case 'Pesquisador':   return { bg: 'rgba(242,140,40,0.15)', border: 'rgba(242,140,40,0.35)', text: '#F28C28' }
  }
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function IconSearch() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
}
function IconX({ size = 14 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
}
function IconChevronLeft() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
}
function IconChevronRight() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
}
function IconFilter() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
}
function IconCheck() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
}
function IconAlertTriangle() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
}
function IconRefresh() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/></svg>
}
function IconEmptyBox() {
  return <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#203752" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>
}
function IconTrash({ size = 16 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
}
function IconMonitor() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="3" rx="2"/><path d="M8 21h8m-4-4v4"/></svg>
}
function IconSmartphone() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="20" x="5" y="2" rx="2"/><path d="M12 18h.01"/></svg>
}

// ─── Toggle ───────────────────────────────────────────────────────────────────

function Toggle({ checked, loading, onChange }: { checked: boolean; loading: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      onClick={onChange}
      disabled={loading}
      aria-checked={checked}
      role="switch"
      className="press"
      style={{
        width: 40, height: 22, borderRadius: 11, padding: 2, border: 'none',
        cursor: loading ? 'not-allowed' : 'pointer',
        background: checked ? '#00A6E6' : '#203752',
        position: 'relative', display: 'inline-flex', alignItems: 'center',
        transition: 'background 260ms cubic-bezier(0.22,1,0.36,1)', flexShrink: 0,
        opacity: loading ? 0.7 : 1,
        boxShadow: checked ? '0 0 0 1px rgba(0,166,230,0.4), 0 0 12px rgba(0,166,230,0.25)' : 'none',
      }}
    >
      <span key={checked ? 'on' : 'off'} style={{
        width: 18, height: 18, borderRadius: '50%', background: '#F8FAFC',
        transform: checked ? 'translateX(18px)' : 'translateX(0)',
        transition: 'transform 260ms cubic-bezier(0.34,1.56,0.64,1)', display: 'flex', alignItems: 'center',
        justifyContent: 'center', flexShrink: 0,
        animation: loading ? 'none' : 'thumb-pop 260ms ease',
      }}>
        {loading && (
          <svg width="10" height="10" viewBox="0 0 24 24" style={{ animation: 'spin 0.7s linear infinite' }}>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            <circle cx="12" cy="12" r="10" stroke="#00A6E6" strokeWidth="4" fill="none" strokeDasharray="60 20"/>
          </svg>
        )}
      </span>
    </button>
  )
}

// ─── Toast ────────────────────────────────────────────────────────────────────

function ToastContainer({ toasts, onRemove, inset }: { toasts: Toast[]; onRemove: (id: number) => void; inset?: boolean }) {
  return (
    <div style={{
      position: inset ? 'absolute' : 'fixed',
      top: inset ? 16 : 20,
      right: inset ? 8 : 20,
      zIndex: 9999, pointerEvents: 'auto',
      display: 'flex', flexDirection: 'column', gap: 8,
      maxWidth: inset ? 'calc(100% - 16px)' : 360,
      width: inset ? 'calc(100% - 16px)' : 'calc(100vw - 40px)',
    }}>
      {toasts.map(t => (
        <div
          key={t.id}
          className={t.exiting ? 'toast-exit' : 'toast-enter'}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '10px 12px', borderRadius: 8,
            background: t.type === 'success' ? 'rgba(140,221,45,0.12)' : 'rgba(240,82,82,0.12)',
            border: `1px solid ${t.type === 'success' ? 'rgba(140,221,45,0.3)' : 'rgba(240,82,82,0.3)'}`,
            fontSize: 12, fontWeight: 500,
            backdropFilter: 'blur(8px)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
          }}
        >
          <span className="check-pop" style={{ flexShrink: 0, display: 'flex', color: t.type === 'success' ? '#8CDD2D' : '#F05252' }}>
            {t.type === 'success' ? <IconCheck /> : <IconAlertTriangle />}
          </span>
          <span style={{ flex: 1, color: '#F8FAFC', lineHeight: 1.4 }}>{t.message}</span>
          <button onClick={() => onRemove(t.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', padding: 2, display: 'flex', flexShrink: 0 }}>
            <IconX size={11} />
          </button>
        </div>
      ))}
    </div>
  )
}

// ─── Confirm Modal ────────────────────────────────────────────────────────────

function ConfirmModal({ user, onConfirm, onCancel, inset }: { user: User; onConfirm: () => void; onCancel: () => void; inset?: boolean }) {
  return (
    <div
      onClick={onCancel}
      className="backdrop-in"
      style={{
        position: inset ? 'absolute' : 'fixed', inset: 0, zIndex: 8000,
        background: 'rgba(7,20,38,0.85)', display: 'flex', alignItems: 'center',
        justifyContent: 'center', padding: 16, backdropFilter: 'blur(4px)', pointerEvents: 'auto',
      }}
    >
      <div onClick={e => e.stopPropagation()} className="dialog-in" style={{
        background: '#0D1D33', border: '1px solid #203752', borderRadius: 12,
        padding: 24, maxWidth: 380, width: '100%',
        boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          <span className="check-pop" style={{ color: '#F05252', display: 'flex' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
              <path d="M12 9v4"/><path d="M12 17h.01"/>
            </svg>
          </span>
          <h2 style={{ fontSize: 16, fontWeight: 600, color: '#F8FAFC', margin: 0 }}>Desativar acesso?</h2>
        </div>
        <p style={{ fontSize: 13, color: '#94A3B8', marginBottom: 6, lineHeight: 1.5 }}>
          Este usuário não poderá mais acessar o sistema.
        </p>
        <p style={{ fontSize: 13, color: '#F8FAFC', marginBottom: 20, fontWeight: 500 }}>{user.name}</p>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button onClick={onCancel} className="press" style={{
            padding: '7px 16px', borderRadius: 6, border: '1px solid #203752',
            background: 'transparent', color: '#94A3B8', fontSize: 13, fontWeight: 500, cursor: 'pointer',
          }}>
            Cancelar
          </button>
          <button onClick={onConfirm} className="press" style={{
            padding: '7px 16px', borderRadius: 6, border: '1px solid rgba(240,82,82,0.4)',
            background: 'rgba(240,82,82,0.12)', color: '#F05252', fontSize: 13, fontWeight: 600, cursor: 'pointer',
          }}>
            Desativar acesso
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Edit User Modal ──────────────────────────────────────────────────────────

function EditUserModal({ user, onSave, onDelete, onCancel, inset }: { user: User; onSave: (u: User) => void; onDelete: (u: User) => void; onCancel: () => void; inset?: boolean }) {
  const [name, setName] = useState(user.name)
  const [email, setEmail] = useState(user.email)
  const [profile, setProfile] = useState<Profile>(user.profile)
  const [municipality, setMunicipality] = useState<string>(user.municipality ?? '__none')
  const [status, setStatus] = useState<UserStatus>(user.status)
  const [confirmingDelete, setConfirmingDelete] = useState(false)

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
  const canSave = name.trim().length > 0 && emailValid

  const labelStyle: React.CSSProperties = { fontSize: 12, fontWeight: 600, color: '#94A3B8', marginBottom: 6, display: 'block', letterSpacing: '0.02em' }
  const fieldStyle: React.CSSProperties = {
    background: '#11243D', border: '1px solid #203752', borderRadius: 8,
    color: '#F8FAFC', fontSize: 14, padding: '9px 12px', outline: 'none', width: '100%',
    transition: 'border-color 160ms ease, box-shadow 160ms ease',
  }
  const onFocus = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    e.target.style.borderColor = '#00A6E6'; e.target.style.boxShadow = '0 0 0 3px rgba(0,166,230,0.12)'
  }
  const onBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    e.target.style.borderColor = '#203752'; e.target.style.boxShadow = 'none'
  }

  const submit = () => {
    if (!canSave) return
    onSave({
      ...user,
      name: name.trim(),
      email: email.trim(),
      profile,
      municipality: municipality === '__none' ? null : municipality,
      status,
    })
  }

  return (
    <div
      onClick={onCancel}
      className="backdrop-in"
      style={{
        position: inset ? 'absolute' : 'fixed', inset: 0, zIndex: 8000,
        background: 'rgba(7,20,38,0.85)', display: 'flex', alignItems: 'center',
        justifyContent: 'center', padding: 16, backdropFilter: 'blur(4px)', pointerEvents: 'auto',
        overflowY: 'auto',
      }}
    >
      <div onClick={e => e.stopPropagation()} className="dialog-in" style={{
        background: '#0D1D33', border: '1px solid #203752', borderRadius: 12,
        padding: 24, maxWidth: 440, width: '100%',
        boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
          <h2 style={{ fontSize: 17, fontWeight: 700, color: '#F8FAFC', margin: 0, letterSpacing: '-0.01em' }}>Editar usuário</h2>
          <button onClick={onCancel} className="press" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', display: 'flex', padding: 2 }}>
            <IconX size={18} />
          </button>
        </div>
        <p style={{ fontSize: 13, color: '#94A3B8', margin: '0 0 20px' }}>
          Atualize os dados e o acesso deste usuário.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={labelStyle}>Nome</label>
            <input value={name} onChange={e => setName(e.target.value)} style={fieldStyle} onFocus={onFocus} onBlur={onBlur} placeholder="Nome completo" />
          </div>
          <div>
            <label style={labelStyle}>E-mail</label>
            <input value={email} onChange={e => setEmail(e.target.value)} style={{ ...fieldStyle, fontFamily: '"JetBrains Mono", monospace', fontSize: 13, borderColor: email.trim() && !emailValid ? 'rgba(240,82,82,0.6)' : '#203752' }} onFocus={onFocus} onBlur={e => { e.target.style.boxShadow = 'none'; e.target.style.borderColor = email.trim() && !emailValid ? 'rgba(240,82,82,0.6)' : '#203752' }} placeholder="email@dominio.gov.br" />
            {email.trim() && !emailValid && (
              <span style={{ fontSize: 11, color: '#F05252', marginTop: 5, display: 'block' }}>Informe um e-mail válido.</span>
            )}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={labelStyle}>Perfil</label>
              <select value={profile} onChange={e => setProfile(e.target.value as Profile)} style={{ ...fieldStyle, cursor: 'pointer' }} onFocus={onFocus} onBlur={onBlur}>
                <option value="Administrador">Administrador</option>
                <option value="Gestor Público">Gestor Público</option>
                <option value="Pesquisador">Pesquisador</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Status</label>
              <select value={status} onChange={e => setStatus(e.target.value as UserStatus)} style={{ ...fieldStyle, cursor: 'pointer' }} onFocus={onFocus} onBlur={onBlur}>
                <option value="Ativo">Ativo</option>
                <option value="Inativo">Inativo</option>
              </select>
            </div>
          </div>
          <div>
            <label style={labelStyle}>Município</label>
            <select value={municipality} onChange={e => setMunicipality(e.target.value)} style={{ ...fieldStyle, cursor: 'pointer' }} onFocus={onFocus} onBlur={onBlur}>
              <option value="__none">Não se aplica</option>
              {MUNICIPALITIES.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
        </div>

        {/* Danger zone */}
        <div style={{ borderTop: '1px solid #203752', margin: '20px 0 0', paddingTop: 16 }}>
          <button onClick={() => setConfirmingDelete(true)} className="press" title="Excluir usuário" style={{
            display: 'inline-flex', alignItems: 'center', gap: 7,
            padding: '8px 14px', borderRadius: 6, border: '1px solid rgba(240,82,82,0.4)',
            background: 'rgba(240,82,82,0.1)', color: '#F05252', fontSize: 13, fontWeight: 600, cursor: 'pointer',
          }}>
            <IconTrash size={15} />
            <span>Excluir usuário</span>
          </button>
        </div>

        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 20 }}>
          <button onClick={onCancel} className="press" style={{
            padding: '9px 18px', borderRadius: 6, border: '1px solid #203752',
            background: 'transparent', color: '#94A3B8', fontSize: 13, fontWeight: 500, cursor: 'pointer',
          }}>
            Cancelar
          </button>
          <button onClick={submit} disabled={!canSave} className="press cta-glow" style={{
            padding: '9px 18px', borderRadius: 6, border: '1px solid #00A6E6',
            background: 'rgba(0,166,230,0.15)', color: '#00A6E6', fontSize: 13, fontWeight: 600,
            cursor: canSave ? 'pointer' : 'not-allowed', opacity: canSave ? 1 : 0.5,
          }}>
            Salvar alterações
          </button>
        </div>
      </div>

      {/* Nested delete confirmation */}
      {confirmingDelete && (
        <div
          onClick={e => { e.stopPropagation(); setConfirmingDelete(false) }}
          className="backdrop-in"
          style={{
            position: 'absolute', inset: 0, zIndex: 8600,
            background: 'rgba(7,20,38,0.9)', display: 'flex', alignItems: 'center',
            justifyContent: 'center', padding: 16, backdropFilter: 'blur(4px)', pointerEvents: 'auto',
          }}
        >
          <div onClick={e => e.stopPropagation()} className="dialog-in" style={{
            background: '#0D1D33', border: '1px solid #203752', borderRadius: 12,
            padding: 24, maxWidth: 400, width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <span className="check-pop" style={{ color: '#F05252', display: 'flex' }}>
                <IconTrash size={18} />
              </span>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: '#F8FAFC', margin: 0 }}>Tem certeza que deseja excluir este usuário?</h2>
            </div>
            <p style={{ fontSize: 13, color: '#94A3B8', margin: '0 0 6px', lineHeight: 1.5 }}>
              Esta ação irá <span style={{ color: '#F8FAFC', fontWeight: 500 }}>inativar</span> o usuário e impedir seu acesso ao sistema. Os dados serão preservados.
            </p>
            <p style={{ fontSize: 13, color: '#F8FAFC', margin: '0 0 20px', fontWeight: 600 }}>{user.name}</p>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button onClick={() => setConfirmingDelete(false)} className="press" style={{
                padding: '9px 18px', borderRadius: 6, border: '1px solid #203752',
                background: 'transparent', color: '#94A3B8', fontSize: 13, fontWeight: 500, cursor: 'pointer',
              }}>
                Cancelar
              </button>
              <button onClick={() => onDelete(user)} className="press" style={{
                display: 'inline-flex', alignItems: 'center', gap: 7,
                padding: '9px 18px', borderRadius: 6, border: '1px solid rgba(240,82,82,0.5)',
                background: 'rgba(240,82,82,0.15)', color: '#F05252', fontSize: 13, fontWeight: 700, cursor: 'pointer',
              }}>
                <IconTrash size={15} /> Confirmar exclusão
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Create User Modal ────────────────────────────────────────────────────────

type NewUserData = Omit<User, 'id' | 'lastAccess'>

function CreateUserModal({ onCreate, onCancel, inset }: { onCreate: (u: NewUserData) => void; onCancel: () => void; inset?: boolean }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [profile, setProfile] = useState<Profile | ''>('')
  const [municipality, setMunicipality] = useState('')
  const [showErrors, setShowErrors] = useState(false)

  const needsMunicipality = profile === 'Gestor Público'
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())

  const errors = {
    name: !name.trim() ? 'Informe o nome completo.' : '',
    email: !email.trim() ? 'Informe o e-mail institucional.' : !emailValid ? 'E-mail inválido.' : '',
    password: !password ? 'Defina uma senha inicial.' : password.length < 6 ? 'A senha deve ter ao menos 6 caracteres.' : '',
    profile: !profile ? 'Selecione um perfil.' : '',
    municipality: needsMunicipality && !municipality ? 'Município é obrigatório para Gestor Público.' : '',
  }
  const hasErrors = Object.values(errors).some(Boolean)

  const labelStyle: React.CSSProperties = { fontSize: 12, fontWeight: 600, color: '#94A3B8', marginBottom: 6, display: 'block', letterSpacing: '0.02em' }
  const fieldBase: React.CSSProperties = {
    background: '#11243D', border: '1px solid #203752', borderRadius: 8,
    color: '#F8FAFC', fontSize: 14, padding: '9px 12px', outline: 'none', width: '100%',
    transition: 'border-color 160ms ease, box-shadow 160ms ease',
  }
  const fieldStyle = (hasError: boolean, extra?: React.CSSProperties): React.CSSProperties => ({
    ...fieldBase, ...extra,
    borderColor: hasError ? 'rgba(240,82,82,0.6)' : '#203752',
  })
  const onFocus = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    e.target.style.borderColor = '#00A6E6'; e.target.style.boxShadow = '0 0 0 3px rgba(0,166,230,0.12)'
  }
  const onBlur = (hasError: boolean) => (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    e.target.style.boxShadow = 'none'; e.target.style.borderColor = hasError ? 'rgba(240,82,82,0.6)' : '#203752'
  }
  const errText = (msg: string) => msg ? <span style={{ fontSize: 11, color: '#F05252', marginTop: 5, display: 'block' }}>{msg}</span> : null

  const submit = () => {
    setShowErrors(true)
    if (hasErrors) return
    // Senha inicial é validada aqui, mas não é persistida no registro mock do usuário.
    onCreate({
      name: name.trim(),
      email: email.trim(),
      profile: profile as Profile,
      municipality: needsMunicipality ? municipality : null,
      status: 'Ativo',
    })
  }

  return (
    <div
      onClick={onCancel}
      className="backdrop-in"
      style={{
        position: inset ? 'absolute' : 'fixed', inset: 0, zIndex: 8000,
        background: 'rgba(7,20,38,0.85)', display: 'flex', alignItems: 'center',
        justifyContent: 'center', padding: 16, backdropFilter: 'blur(4px)', pointerEvents: 'auto',
        overflowY: 'auto',
      }}
    >
      <div onClick={e => e.stopPropagation()} className="dialog-in" style={{
        background: '#0D1D33', border: '1px solid #203752', borderRadius: 12,
        padding: 24, maxWidth: 440, width: '100%',
        boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
          <h2 style={{ fontSize: 17, fontWeight: 700, color: '#F8FAFC', margin: 0, letterSpacing: '-0.01em' }}>Novo usuário</h2>
          <button onClick={onCancel} className="press" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', display: 'flex', padding: 2 }}>
            <IconX size={18} />
          </button>
        </div>
        <p style={{ fontSize: 13, color: '#94A3B8', margin: '0 0 20px' }}>
          Preencha os dados para conceder acesso à plataforma.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={labelStyle}>Nome completo</label>
            <input value={name} onChange={e => setName(e.target.value)} style={fieldStyle(showErrors && !!errors.name)} onFocus={onFocus} onBlur={onBlur(showErrors && !!errors.name)} placeholder="Ex.: Maria Silva Andrade" />
            {showErrors && errText(errors.name)}
          </div>
          <div>
            <label style={labelStyle}>E-mail institucional</label>
            <input value={email} onChange={e => setEmail(e.target.value)} style={fieldStyle(showErrors && !!errors.email, { fontFamily: '"JetBrains Mono", monospace', fontSize: 13 })} onFocus={onFocus} onBlur={onBlur(showErrors && !!errors.email)} placeholder="nome@orgao.gov.br" />
            {showErrors && errText(errors.email)}
          </div>
          <div>
            <label style={labelStyle}>Senha inicial</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} style={fieldStyle(showErrors && !!errors.password)} onFocus={onFocus} onBlur={onBlur(showErrors && !!errors.password)} placeholder="Mínimo de 6 caracteres" />
            {showErrors && errText(errors.password)}
          </div>
          <div>
            <label style={labelStyle}>Papel / Perfil</label>
            <select value={profile} onChange={e => setProfile(e.target.value as Profile | '')} style={fieldStyle(showErrors && !!errors.profile, { cursor: 'pointer', color: profile ? '#F8FAFC' : '#94A3B8' })} onFocus={onFocus} onBlur={onBlur(showErrors && !!errors.profile)}>
              <option value="" disabled>Selecione um perfil…</option>
              <option value="Administrador">Administrador</option>
              <option value="Gestor Público">Gestor Público</option>
              <option value="Pesquisador">Pesquisador</option>
            </select>
            {showErrors && errText(errors.profile)}
          </div>
          {needsMunicipality && (
            <div className="fade-in">
              <label style={labelStyle}>Município <span style={{ color: '#F05252' }}>*</span></label>
              <select value={municipality} onChange={e => setMunicipality(e.target.value)} style={fieldStyle(showErrors && !!errors.municipality, { cursor: 'pointer', color: municipality ? '#F8FAFC' : '#94A3B8' })} onFocus={onFocus} onBlur={onBlur(showErrors && !!errors.municipality)}>
                <option value="" disabled>Selecione o município…</option>
                {MUNICIPALITIES.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
              {showErrors && errText(errors.municipality)}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 24 }}>
          <button onClick={onCancel} className="press" style={{
            padding: '9px 18px', borderRadius: 6, border: '1px solid #203752',
            background: 'transparent', color: '#94A3B8', fontSize: 13, fontWeight: 500, cursor: 'pointer',
          }}>
            Cancelar
          </button>
          <button onClick={submit} className="press cta-glow" style={{
            padding: '9px 18px', borderRadius: 6, border: '1px solid #00A6E6',
            background: '#00A6E6', color: '#071426', fontSize: 13, fontWeight: 700, cursor: 'pointer',
          }}>
            Cadastrar usuário
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Profile Badge & Status Dot ───────────────────────────────────────────────

function ProfileBadge({ profile }: { profile: Profile }) {
  const c = profileBadge(profile)
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', padding: '3px 10px', borderRadius: 20,
      fontSize: 11, fontWeight: 600, letterSpacing: '0.02em',
      background: c.bg, border: `1px solid ${c.border}`, color: c.text, whiteSpace: 'nowrap',
    }}>
      {profile}
    </span>
  )
}

function StatusDot({ status }: { status: UserStatus }) {
  const active = status === 'Ativo'
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
      <span className={active ? 'dot-live' : undefined} style={{
        width: 7, height: 7, borderRadius: '50%', flexShrink: 0,
        background: active ? '#8CDD2D' : '#94A3B8',
      }}/>
      <span style={{ fontSize: 13, color: active ? '#8CDD2D' : '#94A3B8', fontWeight: 500 }}>{status}</span>
    </span>
  )
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function SkeletonTable() {
  return <>
    {Array.from({ length: 8 }).map((_, i) => (
      <tr key={i} style={{ borderBottom: '1px solid #203752' }}>
        {[200, 220, 100, 120, 80, 50].map((w, j) => (
          <td key={j} style={{ padding: '14px 16px' }}>
            <div className="skeleton" style={{ width: w, height: 14 }}/>
          </td>
        ))}
      </tr>
    ))}
  </>
}

function SkeletonCards() {
  return <>
    {Array.from({ length: 5 }).map((_, i) => (
      <div key={i} style={{
        background: '#0D1D33', border: '1px solid #203752', borderRadius: 10,
        padding: 16, display: 'flex', flexDirection: 'column', gap: 12,
      }}>
        <div className="skeleton" style={{ width: '60%', height: 15 }}/>
        <div className="skeleton" style={{ width: '82%', height: 12 }}/>
        <div style={{ display: 'flex', gap: 8 }}>
          <div className="skeleton" style={{ width: 80, height: 22, borderRadius: 20 }}/>
          <div className="skeleton" style={{ width: 60, height: 22, borderRadius: 20 }}/>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="skeleton" style={{ width: 100, height: 12 }}/>
          <div className="skeleton" style={{ width: 40, height: 22, borderRadius: 11 }}/>
        </div>
      </div>
    ))}
  </>
}

// ─── Pagination ───────────────────────────────────────────────────────────────

function Pagination({
  page, totalPages, pageSize, totalItems, onPage, onPageSize, isMobile,
}: {
  page: number; totalPages: number; pageSize: number; totalItems: number;
  onPage: (p: number) => void; onPageSize: (s: number) => void; isMobile: boolean;
}) {
  const start = (page - 1) * pageSize + 1
  const end = Math.min(page * pageSize, totalItems)

  const pageNums = useMemo(() => {
    const pages: (number | '...')[] = []
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
    } else {
      pages.push(1)
      if (page > 3) pages.push('...')
      for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) pages.push(i)
      if (page < totalPages - 2) pages.push('...')
      pages.push(totalPages)
    }
    return pages
  }, [page, totalPages])

  const btn = (active: boolean, disabled?: boolean) => ({
    minWidth: 32, height: 32, borderRadius: 6,
    border: active ? '1px solid #00A6E6' : '1px solid #203752',
    background: active ? 'rgba(0,166,230,0.15)' : 'transparent',
    color: active ? '#00A6E6' : disabled ? '#203752' : '#94A3B8',
    fontSize: 13, fontWeight: active ? 600 : 400,
    cursor: disabled ? 'not-allowed' : 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 8px',
    transition: 'border-color 150ms, background 150ms, color 150ms',
  })

  if (isMobile) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', gap: 8 }}>
      <button className="page-btn" disabled={page === 1} onClick={() => onPage(page - 1)} style={{ ...btn(false, page === 1), padding: '0 10px', gap: 4, fontSize: 12 }}>
        <IconChevronLeft /> Anterior
      </button>
      <span style={{ fontSize: 12, color: '#94A3B8' }}>
        Página <span key={page} className="count-flash" style={{ color: '#F8FAFC', fontWeight: 600, display: 'inline-block' }}>{page}</span> de {totalPages}
      </span>
      <button className="page-btn" disabled={page === totalPages} onClick={() => onPage(page + 1)} style={{ ...btn(false, page === totalPages), padding: '0 10px', gap: 4, fontSize: 12 }}>
        Próxima <IconChevronRight />
      </button>
    </div>
  )

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '14px 20px', borderTop: '1px solid #203752', flexWrap: 'wrap', gap: 10,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: 13, color: '#94A3B8' }}>
          Exibindo <span style={{ color: '#F8FAFC' }}>{start}–{end}</span> de <span style={{ color: '#F8FAFC' }}>{totalItems}</span> usuários
        </span>
        <select value={pageSize} onChange={e => onPageSize(Number(e.target.value))} style={{
          background: '#11243D', border: '1px solid #203752', color: '#F8FAFC',
          borderRadius: 6, padding: '4px 8px', fontSize: 13, cursor: 'pointer',
        }}>
          {[10, 20, 50].map(s => <option key={s} value={s}>{s} por página</option>)}
        </select>
      </div>
      <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
        <button className="page-btn" disabled={page === 1} onClick={() => onPage(page - 1)} style={btn(false, page === 1)} title="Anterior">
          <IconChevronLeft />
        </button>
        {pageNums.map((p, i) =>
          p === '...'
            ? <span key={`e${i}`} style={{ color: '#94A3B8', padding: '0 4px', fontSize: 13 }}>…</span>
            : <button key={p} className="page-btn" onClick={() => onPage(p)} style={btn(p === page)}>{p}</button>
        )}
        <button className="page-btn" disabled={page === totalPages} onClick={() => onPage(page + 1)} style={btn(false, page === totalPages)} title="Próxima">
          <IconChevronRight />
        </button>
      </div>
    </div>
  )
}

// ─── User Management Screen ───────────────────────────────────────────────────

function UserManagementScreen({ forceMobile = false, overlayHost }: { forceMobile?: boolean; overlayHost?: HTMLElement | null }) {
  const [users, setUsers] = useState<User[]>([])
  const [loadState, setLoadState] = useState<'loading' | 'error' | 'ready'>('loading')

  const [search, setSearch] = useState('')
  const [profileFilter, setProfileFilter] = useState<Profile | ''>('')
  const [municipalityFilter, setMunicipalityFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState<UserStatus | ''>('')

  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const [togglingId, setTogglingId] = useState<number | null>(null)
  const [confirmUser, setConfirmUser] = useState<User | null>(null)
  const [editUser, setEditUser] = useState<User | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [toasts, setToasts] = useState<Toast[]>([])
  const toastCounter = useRef(0)
  const [showFilterSheet, setShowFilterSheet] = useState(false)

  const [windowMobile, setWindowMobile] = useState(false)
  const [isTablet, setIsTablet] = useState(false)

  useEffect(() => {
    if (forceMobile) return
    const check = () => {
      setWindowMobile(window.innerWidth < 640)
      setIsTablet(window.innerWidth >= 640 && window.innerWidth < 1024)
    }
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [forceMobile])

  const isMobile = forceMobile || windowMobile

  // Sticky filter: detect when the filter bar reaches the top of its scroll
  // container so we can lift it with a shadow only while it's "stuck".
  // Desktop offsets below the fixed device-toggle bar; mobile sticks flush.
  const stickyTop = isMobile ? 0 : 60
  const [filterStuck, setFilterStuck] = useState(false)
  const stickySentinel = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = stickySentinel.current
    if (!el) return
    let root: HTMLElement | null = el.parentElement
    while (root) {
      const oy = getComputedStyle(root).overflowY
      if (oy === 'auto' || oy === 'scroll') break
      root = root.parentElement
    }
    const topOffset = isMobile ? 0 : 60
    const obs = new IntersectionObserver(
      ([entry]) => setFilterStuck(!entry.isIntersecting),
      { root, threshold: 1, rootMargin: `${-topOffset}px 0px 0px 0px` },
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [isMobile])

  useEffect(() => {
    setLoadState('loading')
    setUsers([])
    const t = setTimeout(() => { setUsers(MOCK_USERS); setLoadState('ready') }, 1400)
    return () => clearTimeout(t)
  }, [])

  const addToast = useCallback((type: 'success' | 'error', message: string) => {
    const id = ++toastCounter.current
    setToasts(prev => [...prev, { id, type, message }])
    setTimeout(() => {
      setToasts(prev => prev.map(t => t.id === id ? { ...t, exiting: true } : t))
      setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 220)
    }, 3800)
  }, [])

  const removeToast = useCallback((id: number) => {
    setToasts(prev => prev.map(t => t.id === id ? { ...t, exiting: true } : t))
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 220)
  }, [])

  const filtered = useMemo(() => users.filter(u => {
    const q = search.toLowerCase()
    return (
      (!q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)) &&
      (!profileFilter || u.profile === profileFilter) &&
      (!municipalityFilter || (municipalityFilter === '__nenhum' ? !u.municipality : u.municipality === municipalityFilter)) &&
      (!statusFilter || u.status === statusFilter)
    )
  }), [users, search, profileFilter, municipalityFilter, statusFilter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize)
  const hasFilters = !!(search || profileFilter || municipalityFilter || statusFilter)
  const resetPage = useCallback(() => setPage(1), [])

  const clearFilters = () => { setSearch(''); setProfileFilter(''); setMunicipalityFilter(''); setStatusFilter(''); setPage(1) }

  const chips: { label: string; clear: () => void }[] = [
    ...(search ? [{ label: `"${search}"`, clear: () => { setSearch(''); resetPage() } }] : []),
    ...(profileFilter ? [{ label: profileFilter, clear: () => { setProfileFilter(''); resetPage() } }] : []),
    ...(municipalityFilter ? [{ label: municipalityFilter === '__nenhum' ? 'Sem município' : municipalityFilter, clear: () => { setMunicipalityFilter(''); resetPage() } }] : []),
    ...(statusFilter ? [{ label: statusFilter, clear: () => { setStatusFilter(''); resetPage() } }] : []),
  ]

  const handleToggle = (user: User) => {
    if (user.status === 'Ativo') setConfirmUser(user)
    else performToggle(user)
  }

  const performToggle = (user: User) => {
    setConfirmUser(null)
    setTogglingId(user.id)
    const willBeActive = user.status === 'Inativo'
    setTimeout(() => {
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, status: willBeActive ? 'Ativo' : 'Inativo' } : u))
      setTogglingId(null)
      addToast('success', `${user.name.split(' ')[0]} foi ${willBeActive ? 'ativado' : 'desativado'} com sucesso.`)
    }, 900)
  }

  const handleCreate = (data: NewUserData) => {
    const id = users.reduce((max, u) => Math.max(max, u.id), 0) + 1
    const newUser: User = { id, ...data, lastAccess: 'Nunca acessou' }
    setUsers(prev => [newUser, ...prev])
    setShowCreate(false)
    setPage(1)
    addToast('success', `${data.name.split(' ')[0]} foi cadastrado com sucesso.`)
  }

  const handleSaveEdit = (updated: User) => {
    setUsers(prev => prev.map(u => u.id === updated.id ? updated : u))
    setEditUser(null)
    addToast('success', `${updated.name.split(' ')[0]} foi atualizado com sucesso.`)
  }

  const handleDeleteUser = (user: User) => {
    setUsers(prev => prev.map(u => u.id === user.id ? { ...u, status: 'Inativo' } : u))
    setEditUser(null)
    addToast('success', `${user.name.split(' ')[0]} foi inativado. Os dados foram preservados.`)
  }

  const handleRetry = () => {
    setLoadState('loading')
    setUsers([])
    setTimeout(() => { setUsers(MOCK_USERS); setLoadState('ready') }, 1400)
  }

  const inputStyle: React.CSSProperties = {
    background: '#11243D', border: '1px solid #203752', borderRadius: 8,
    color: '#F8FAFC', fontSize: 14, padding: '8px 12px', outline: 'none',
    transition: 'border-color 160ms ease, box-shadow 160ms ease', width: '100%',
  }
  const selectStyle: React.CSSProperties = { ...inputStyle, cursor: 'pointer' }

  const filterPanel = (
    <div style={{
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : isTablet ? '1fr 1fr' : '2fr 1fr 1fr 1fr',
      gap: 10, alignItems: 'end',
    }}>
      <div style={{ position: 'relative' }}>
        <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8', display: 'flex', pointerEvents: 'none' }}>
          <IconSearch />
        </span>
        <input
          type="text" placeholder="Buscar por nome ou e-mail…" value={search}
          onChange={e => { setSearch(e.target.value); resetPage() }}
          style={{ ...inputStyle, paddingLeft: 34 }}
          onFocus={e => { const s = (e.target as HTMLInputElement).style; s.borderColor = '#00A6E6'; s.boxShadow = '0 0 0 3px rgba(0,166,230,0.12)' }}
          onBlur={e => { const s = (e.target as HTMLInputElement).style; s.borderColor = '#203752'; s.boxShadow = 'none' }}
        />
      </div>
      <select value={profileFilter} onChange={e => { setProfileFilter(e.target.value as Profile | ''); resetPage() }} style={selectStyle}
        onFocus={e => { const s = (e.target as HTMLSelectElement).style; s.borderColor = '#00A6E6'; s.boxShadow = '0 0 0 3px rgba(0,166,230,0.12)' }}
        onBlur={e => { const s = (e.target as HTMLSelectElement).style; s.borderColor = '#203752'; s.boxShadow = 'none' }}>
        <option value="">Todos os perfis</option>
        <option value="Administrador">Administrador</option>
        <option value="Gestor Público">Gestor Público</option>
        <option value="Pesquisador">Pesquisador</option>
      </select>
      <select value={municipalityFilter} onChange={e => { setMunicipalityFilter(e.target.value); resetPage() }} style={selectStyle}
        onFocus={e => { const s = (e.target as HTMLSelectElement).style; s.borderColor = '#00A6E6'; s.boxShadow = '0 0 0 3px rgba(0,166,230,0.12)' }}
        onBlur={e => { const s = (e.target as HTMLSelectElement).style; s.borderColor = '#203752'; s.boxShadow = 'none' }}>
        <option value="">Todos os municípios</option>
        {MUNICIPALITIES.map(m => <option key={m} value={m}>{m}</option>)}
        <option value="__nenhum">Não se aplica</option>
      </select>
      <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value as UserStatus | ''); resetPage() }} style={selectStyle}
        onFocus={e => { const s = (e.target as HTMLSelectElement).style; s.borderColor = '#00A6E6'; s.boxShadow = '0 0 0 3px rgba(0,166,230,0.12)' }}
        onBlur={e => { const s = (e.target as HTMLSelectElement).style; s.borderColor = '#203752'; s.boxShadow = 'none' }}>
        <option value="">Todos os status</option>
        <option value="Ativo">Ativo</option>
        <option value="Inativo">Inativo</option>
      </select>
    </div>
  )

  const renderCards = () => {
    if (loadState === 'loading') return <SkeletonCards />
    if (loadState === 'error') return (
      <div style={{ textAlign: 'center', padding: '40px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#F05252" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        <p style={{ color: '#94A3B8', fontSize: 13 }}>Erro ao carregar usuários.</p>
        <button onClick={handleRetry} className="press" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 6, border: '1px solid #203752', background: '#11243D', color: '#F8FAFC', fontSize: 13, cursor: 'pointer' }}>
          <IconRefresh /> Tentar novamente
        </button>
      </div>
    )
    if (paginated.length === 0) return (
      <div style={{ textAlign: 'center', padding: '40px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
        <IconEmptyBox />
        <p style={{ color: '#94A3B8', fontSize: 13 }}>{hasFilters ? 'Nenhum usuário encontrado.' : 'Nenhum usuário cadastrado.'}</p>
        {hasFilters && (
          <button onClick={clearFilters} className="press cta-glow" style={{ padding: '8px 16px', borderRadius: 6, border: '1px solid #00A6E6', background: 'rgba(0,166,230,0.1)', color: '#00A6E6', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            Limpar filtros
          </button>
        )}
      </div>
    )
    return paginated.map((user, i) => (
      <div key={user.id} className="user-card" onClick={() => setEditUser(user)} style={{
        background: '#0D1D33', border: '1px solid #203752', borderRadius: 10,
        padding: 16, display: 'flex', flexDirection: 'column', gap: 10, cursor: 'pointer',
        animationDelay: `${Math.min(i, 12) * 45}ms`,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 14, fontWeight: 600, color: '#F8FAFC', margin: '0 0 3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user.name}
            </p>
            <p style={{ fontSize: 12, color: '#94A3B8', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: '"JetBrains Mono", monospace' }}>
              {user.email}
            </p>
          </div>
          <span onClick={e => e.stopPropagation()} style={{ display: 'flex' }}>
            <Toggle checked={user.status === 'Ativo'} loading={togglingId === user.id} onChange={() => handleToggle(user)} />
          </span>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
          <ProfileBadge profile={user.profile} />
          <StatusDot status={user.status} />
        </div>
        <p style={{ fontSize: 12, color: '#94A3B8', margin: 0 }}>
          <span style={{ color: '#F8FAFC' }}>{user.municipality ?? 'Não se aplica'}</span>
          {'  ·  '}Acesso: {user.lastAccess}
        </p>
      </div>
    ))
  }

  const renderTableBody = () => {
    if (loadState === 'loading') return <SkeletonTable />
    if (loadState === 'error') return (
      <tr><td colSpan={6}>
        <div style={{ textAlign: 'center', padding: '60px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#F05252" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          <p style={{ color: '#94A3B8', fontSize: 14, margin: 0 }}>Erro ao carregar usuários.</p>
          <button onClick={handleRetry} className="press" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 20px', borderRadius: 6, border: '1px solid #203752', background: '#11243D', color: '#F8FAFC', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            <IconRefresh /> Tentar novamente
          </button>
        </div>
      </td></tr>
    )
    if (paginated.length === 0) return (
      <tr><td colSpan={6}>
        <div style={{ textAlign: 'center', padding: '60px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          <IconEmptyBox />
          <p style={{ color: '#94A3B8', fontSize: 14, margin: 0 }}>
            {hasFilters ? 'Nenhum usuário encontrado para os filtros selecionados.' : 'Nenhum usuário cadastrado.'}
          </p>
          {hasFilters && (
            <button onClick={clearFilters} className="press cta-glow" style={{ padding: '8px 20px', borderRadius: 6, border: '1px solid #00A6E6', background: 'rgba(0,166,230,0.1)', color: '#00A6E6', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
              Limpar filtros
            </button>
          )}
        </div>
      </td></tr>
    )
    return paginated.map((user, i) => (
      <tr key={user.id}
        className="data-row"
        style={{ borderBottom: '1px solid #203752', animationDelay: `${Math.min(i, 12) * 35}ms`, cursor: 'pointer' }}
        onClick={() => setEditUser(user)}
        title="Clique para editar"
        onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#0D2540'}
        onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
      >
        <td style={{ padding: '13px 16px', fontSize: 14, fontWeight: 500, color: '#F8FAFC', whiteSpace: 'nowrap' }}>{user.name}</td>
        <td style={{ padding: '13px 16px', fontSize: 13, color: '#94A3B8', whiteSpace: 'nowrap', fontFamily: '"JetBrains Mono", monospace' }}>{user.email}</td>
        <td style={{ padding: '13px 16px' }}><ProfileBadge profile={user.profile} /></td>
        <td style={{ padding: '13px 16px', fontSize: 13, color: user.municipality ? '#F8FAFC' : '#94A3B8', whiteSpace: 'nowrap' }}>{user.municipality ?? 'Não se aplica'}</td>
        <td style={{ padding: '13px 16px' }}><StatusDot status={user.status} /></td>
        <td style={{ padding: '13px 16px' }} onClick={e => e.stopPropagation()}>
          <Toggle checked={user.status === 'Ativo'} loading={togglingId === user.id} onChange={() => handleToggle(user)} />
        </td>
      </tr>
    ))
  }

  // When embedded in the phone frame, overlays must anchor to the visible screen
  // (a fixed, non-scrolling host) rather than the tall scrolling content.
  const portal = (node: React.ReactNode) => (overlayHost ? createPortal(node, overlayHost) : node)

  return (
    <div style={{ minHeight: '100%', background: '#071426', color: '#F8FAFC', fontFamily: "'Inter', system-ui, sans-serif", position: 'relative' }}>
      {portal(<ToastContainer toasts={toasts} onRemove={removeToast} inset={forceMobile} />)}
      {confirmUser && portal(<ConfirmModal user={confirmUser} onConfirm={() => performToggle(confirmUser)} onCancel={() => setConfirmUser(null)} inset={forceMobile} />)}
      {editUser && portal(<EditUserModal user={editUser} onSave={handleSaveEdit} onDelete={handleDeleteUser} onCancel={() => setEditUser(null)} inset={forceMobile} />)}
      {showCreate && portal(<CreateUserModal onCreate={handleCreate} onCancel={() => setShowCreate(false)} inset={forceMobile} />)}

      {/* Mobile Filter Bottom Sheet */}
      {showFilterSheet && isMobile && portal(
        <>
          <div onClick={() => setShowFilterSheet(false)} style={{
            position: 'absolute', inset: 0, background: 'rgba(7,20,38,0.7)', zIndex: 7000, backdropFilter: 'blur(2px)', pointerEvents: 'auto',
          }}/>
          <div className="sheet-enter" style={{
            position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 7100, pointerEvents: 'auto',
            background: '#0D1D33', borderTop: '1px solid #203752',
            borderRadius: '16px 16px 0 0', padding: '20px 16px 32px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <span style={{ fontWeight: 600, fontSize: 16 }}>Filtros</span>
              <button onClick={() => setShowFilterSheet(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', display: 'flex' }}>
                <IconX size={18} />
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>{filterPanel}</div>
            <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
              {hasFilters && (
                <button onClick={() => { clearFilters(); setShowFilterSheet(false) }} className="press" style={{ flex: 1, padding: '10px', borderRadius: 8, border: '1px solid #203752', background: 'transparent', color: '#94A3B8', fontSize: 14, cursor: 'pointer' }}>
                  Limpar filtros
                </button>
              )}
              <button onClick={() => setShowFilterSheet(false)} className="press cta-glow" style={{ flex: 1, padding: '10px', borderRadius: 8, border: '1px solid #00A6E6', background: 'rgba(0,166,230,0.12)', color: '#00A6E6', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                Aplicar
              </button>
            </div>
          </div>
        </>
      )}

      <div style={{ maxWidth: isMobile ? undefined : 1200, margin: '0 auto', padding: isMobile ? '24px 16px' : '36px 32px' }}>
        {/* Header */}
        <div className="fade-in" style={{
          marginBottom: 28, display: 'flex', gap: 16,
          flexDirection: isMobile ? 'column' : 'row',
          alignItems: isMobile ? 'stretch' : 'flex-start',
          justifyContent: 'space-between',
        }}>
          <div>
            <h1 style={{ fontSize: isMobile ? 20 : 26, fontWeight: 700, color: '#F8FAFC', margin: '0 0 4px', letterSpacing: '-0.02em' }}>
              Gestão de Usuários
            </h1>
            <p style={{ fontSize: isMobile ? 13 : 14, color: '#94A3B8', margin: 0 }}>
              Visualize, filtre e controle o acesso dos usuários.
            </p>
          </div>
          <button onClick={() => setShowCreate(true)} className="press cta-glow" style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 7,
            padding: '10px 16px', borderRadius: 8, border: '1px solid #00A6E6',
            background: '#00A6E6', color: '#071426', fontSize: 14, fontWeight: 700,
            cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0,
            width: isMobile ? '100%' : undefined,
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>
            Novo usuário
          </button>
        </div>

        {/* Filters */}
        <div ref={stickySentinel} style={{ height: 1, margin: 0 }} aria-hidden />
        <div className="fade-in" style={{
          background: '#0D1D33', border: '1px solid #203752', borderRadius: 10,
          padding: isMobile ? 14 : 16, marginBottom: 14, animationDelay: '60ms',
          position: 'sticky', top: stickyTop, zIndex: 50,
          transition: 'box-shadow 200ms ease, border-color 200ms ease',
          boxShadow: filterStuck ? '0 8px 24px rgba(0,0,0,0.45)' : 'none',
          borderColor: filterStuck ? '#2c4a6e' : '#203752',
        }}>
          {isMobile ? (
            <button onClick={() => setShowFilterSheet(true)} className="filter-trigger" style={{
              width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              background: '#11243D', border: '1px solid #203752', borderRadius: 8,
              padding: '10px 14px', color: '#F8FAFC', fontSize: 14, cursor: 'pointer',
            }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <IconFilter /> Filtros
                {hasFilters && (
                  <span key={chips.length} className="chip-in" style={{ background: '#00A6E6', color: '#071426', borderRadius: 10, padding: '1px 7px', fontSize: 11, fontWeight: 700 }}>
                    {chips.length}
                  </span>
                )}
              </span>
              <span className="chevron-nudge" style={{ display: 'flex' }}><IconChevronRight /></span>
            </button>
          ) : filterPanel}

          {chips.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 12, alignItems: 'center' }}>
              {chips.map((chip, i) => (
                <span key={chip.label} className="chip-in" style={{
                  display: 'inline-flex', alignItems: 'center', gap: 5,
                  background: 'rgba(0,166,230,0.1)', border: '1px solid rgba(0,166,230,0.3)',
                  color: '#00A6E6', borderRadius: 20, padding: '3px 10px',
                  fontSize: 12, fontWeight: 500,
                  animationDelay: `${i * 40}ms`,
                }}>
                  {chip.label}
                  <button onClick={chip.clear} className="press" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#00A6E6', display: 'flex', padding: 0, opacity: 0.7 }}>
                    <IconX size={11} />
                  </button>
                </span>
              ))}
              <button onClick={clearFilters} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', fontSize: 12, fontWeight: 500, textDecoration: 'underline', padding: '0 4px', transition: 'color 150ms' }}
                onMouseEnter={e => (e.target as HTMLElement).style.color = '#F8FAFC'}
                onMouseLeave={e => (e.target as HTMLElement).style.color = '#94A3B8'}>
                Limpar filtros
              </button>
            </div>
          )}
        </div>

        {/* Count */}
        {loadState === 'ready' && (
          <p style={{ fontSize: 13, color: '#94A3B8', marginBottom: 10 }}>
            {filtered.length === 0
              ? 'Nenhum resultado encontrado'
              : <><span key={filtered.length} className="count-flash" style={{ color: '#F8FAFC', fontWeight: 600, display: 'inline-block' }}>{filtered.length}</span> usuário{filtered.length !== 1 ? 's' : ''} encontrado{filtered.length !== 1 ? 's' : ''}</>
            }
          </p>
        )}

        {/* Content */}
        {isMobile ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {renderCards()}
            {loadState === 'ready' && filtered.length > 0 && (
              <Pagination page={page} totalPages={totalPages} pageSize={pageSize} totalItems={filtered.length}
                onPage={setPage} onPageSize={s => { setPageSize(s); setPage(1) }} isMobile />
            )}
          </div>
        ) : (
          <div style={{ background: '#0D1D33', border: '1px solid #203752', borderRadius: 10, overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 720 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #203752', background: '#071D2F' }}>
                    {['Nome', 'E-mail', 'Perfil', 'Município', 'Status', 'Acesso'].map((col, i) => (
                      <th key={col} style={{
                        padding: '11px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600,
                        color: '#94A3B8', letterSpacing: '0.06em', textTransform: 'uppercase',
                        whiteSpace: 'nowrap', width: i === 5 ? 80 : undefined,
                      }}>{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>{renderTableBody()}</tbody>
              </table>
            </div>
            {loadState === 'ready' && filtered.length > 0 && (
              <Pagination page={page} totalPages={totalPages} pageSize={pageSize} totalItems={filtered.length}
                onPage={setPage} onPageSize={s => { setPageSize(s); setPage(1) }} isMobile={false} />
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Phone Frame ──────────────────────────────────────────────────────────────

function PhoneFrame() {
  const PHONE_W = 375
  const PHONE_H = 780
  const BEZEL = 14
  const RADIUS = 44
  const INNER_RADIUS = RADIUS - BEZEL + 4

  // Non-scrolling host for overlays (modal, toasts, filter sheet), anchored to
  // the visible phone screen instead of the scrolling content below.
  const [overlayHost, setOverlayHost] = useState<HTMLDivElement | null>(null)

  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '40px 24px 60px' }}>
      <div style={{
        position: 'relative',
        width: PHONE_W + BEZEL * 2,
        height: PHONE_H + BEZEL * 2 + 24,
        flexShrink: 0,
        filter: 'drop-shadow(0 32px 64px rgba(0,0,0,0.8)) drop-shadow(0 0 0 1px rgba(255,255,255,0.06))',
      }}>
        {/* Phone body */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(145deg, #1C2B3A 0%, #0D1620 40%, #0A1219 100%)',
          borderRadius: RADIUS,
          border: '1px solid rgba(255,255,255,0.1)',
        }}/>

        {/* Side buttons (volume) */}
        {[100, 136, 172].map(top => (
          <div key={top} style={{
            position: 'absolute', left: -3, top, width: 3, height: 28,
            background: 'linear-gradient(to right, #0D1620, #1a2535)',
            borderRadius: '2px 0 0 2px',
            border: '1px solid rgba(255,255,255,0.06)',
          }}/>
        ))}
        {/* Power button */}
        <div style={{
          position: 'absolute', right: -3, top: 130, width: 3, height: 48,
          background: 'linear-gradient(to left, #0D1620, #1a2535)',
          borderRadius: '0 2px 2px 0',
          border: '1px solid rgba(255,255,255,0.06)',
        }}/>

        {/* Screen area */}
        <div style={{
          position: 'absolute',
          top: BEZEL, left: BEZEL, right: BEZEL,
          height: PHONE_H,
          borderRadius: INNER_RADIUS,
          overflow: 'hidden',
          background: '#071426',
        }}>
          {/* Status bar */}
          <div style={{
            height: 44, background: '#071426',
            display: 'flex', alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 20px', flexShrink: 0,
          }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#F8FAFC' }}>09:41</span>
            {/* Dynamic island */}
            <div style={{
              width: 96, height: 26, borderRadius: 20,
              background: '#000', border: '1px solid rgba(255,255,255,0.04)',
            }}/>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              {/* Signal */}
              <svg width="16" height="12" viewBox="0 0 16 12" fill="#F8FAFC">
                <rect x="0" y="8" width="3" height="4" rx="0.5" opacity="1"/>
                <rect x="4.5" y="5" width="3" height="7" rx="0.5" opacity="1"/>
                <rect x="9" y="2" width="3" height="10" rx="0.5" opacity="1"/>
                <rect x="13.5" y="0" width="2.5" height="12" rx="0.5" opacity="0.3"/>
              </svg>
              {/* WiFi */}
              <svg width="16" height="12" viewBox="0 0 16 12" fill="none" stroke="#F8FAFC" strokeWidth="1.5" strokeLinecap="round">
                <path d="M1 4.5C3.8 1.8 7.2.7 10.8 1.3C12.2 1.6 13.5 2.1 14.6 2.9" opacity="0.4"/>
                <path d="M3.5 7C5.2 5.4 7.2 4.7 9.3 4.9C10.4 5 11.4 5.5 12.2 6.2" opacity="0.7"/>
                <path d="M6 9.3C7 8.5 8.5 8.3 9.8 8.9" opacity="1"/>
                <circle cx="8" cy="11.5" r="1" fill="#F8FAFC" stroke="none"/>
              </svg>
              {/* Battery */}
              <svg width="22" height="12" viewBox="0 0 22 12" fill="none">
                <rect x="0.5" y="0.5" width="18" height="11" rx="2.5" stroke="#F8FAFC" strokeOpacity="0.35"/>
                <rect x="2" y="2" width="14" height="8" rx="1.5" fill="#8CDD2D"/>
                <path d="M19.5 4v4a1.5 1.5 0 0 0 0-4Z" fill="#F8FAFC" fillOpacity="0.4"/>
              </svg>
            </div>
          </div>

          {/* Scrollable screen content */}
          <div style={{ height: PHONE_H - 44 - 34, overflowY: 'auto', overflowX: 'hidden' }}>
            <UserManagementScreen forceMobile overlayHost={overlayHost} />
          </div>

          {/* Home indicator */}
          <div style={{
            height: 34, background: '#071426',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <div style={{ width: 120, height: 4, borderRadius: 2, background: 'rgba(248,250,252,0.25)' }}/>
          </div>

          {/* Overlay host — fixed to the visible screen, sits above scroll content */}
          <div ref={setOverlayHost} style={{ position: 'absolute', inset: 0, zIndex: 200, pointerEvents: 'none' }} />
        </div>
      </div>
    </div>
  )
}

// ─── Device Toggle Bar ────────────────────────────────────────────────────────

function DeviceToggle({ active, onChange }: { active: 'desktop' | 'mobile'; onChange: (v: 'desktop' | 'mobile') => void }) {
  const tab = (id: 'desktop' | 'mobile', label: string, icon: React.ReactNode) => {
    const isActive = active === id
    return (
      <button
        onClick={() => onChange(id)}
        className="press"
        style={{
          display: 'flex', alignItems: 'center', gap: 7,
          padding: '7px 16px', borderRadius: 7,
          background: isActive ? 'rgba(0,166,230,0.15)' : 'transparent',
          border: isActive ? '1px solid rgba(0,166,230,0.4)' : '1px solid transparent',
          color: isActive ? '#00A6E6' : '#94A3B8',
          fontSize: 13, fontWeight: isActive ? 600 : 400,
          cursor: 'pointer', transition: 'background 150ms, border-color 150ms, color 150ms, transform 140ms cubic-bezier(0.22,1,0.36,1)',
        }}
      >
        {icon} {label}
      </button>
    )
  }

  return (
    <div style={{
      position: 'fixed', top: 16, left: '50%', transform: 'translateX(-50%)',
      zIndex: 10000, display: 'flex', gap: 4,
      background: '#0D1D33', border: '1px solid #203752',
      borderRadius: 10, padding: 4,
      boxShadow: '0 4px 24px rgba(0,0,0,0.5)',
      backdropFilter: 'blur(12px)',
    }}>
      {tab('desktop', 'Desktop', <IconMonitor />)}
      {tab('mobile', 'Celular', <IconSmartphone />)}
    </div>
  )
}

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop')

  return (
    <div style={{ minHeight: '100vh', background: device === 'mobile' ? '#050D18' : '#071426' }}>
      <DeviceToggle active={device} onChange={setDevice} />

      {device === 'desktop' ? (
        <div style={{ paddingTop: 64 }}>
          <UserManagementScreen />
        </div>
      ) : (
        <div style={{
          paddingTop: 72,
          minHeight: '100vh',
          background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(0,80,120,0.2) 0%, transparent 70%), #050D18',
          overflowX: 'auto',
        }}>
          <PhoneFrame />
        </div>
      )}
    </div>
  )
}
