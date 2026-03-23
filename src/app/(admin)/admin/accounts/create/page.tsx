'use client'

import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { adminApi } from '@/lib/api'
import { useAuthStore } from '@/lib/store'
import { UserRole } from '@/types'
import toast from 'react-hot-toast'
import { useState, useEffect } from 'react'

/**
 * Role hierarchy — matches old adminui CreateAccount.vue logic.
 * Admin and below can create multiple levels in one step.
 */
const ROLE_HIERARCHY: Record<UserRole, UserRole[]> = {
  SUPERADMIN: ['ADMIN'],
  ADMIN:      ['SUBADMIN', 'MASTER', 'MANAGER', 'PLAYER'],
  SUBADMIN:   ['MASTER', 'MANAGER', 'PLAYER'],
  MASTER:     ['MANAGER', 'PLAYER'],
  MANAGER:    ['PLAYER'],
  PLAYER:     [],
}

const ROLE_LABELS: Record<UserRole, string> = {
  SUPERADMIN: 'Super Admin',
  ADMIN:      'Admin',
  SUBADMIN:   'Super Master',
  MASTER:     'Master',
  MANAGER:    'Agent',
  PLAYER:     'User',
}

const schema = z.object({
  username:        z.string().min(3).max(30).regex(/^[a-zA-Z0-9_]+$/, 'Only letters, numbers and underscores'),
  fullName:        z.string().min(1, 'Full name is required'),
  password:        z.string().min(6, 'Minimum 6 characters'),
  confirmPassword: z.string().min(6, 'Minimum 6 characters'),
  city:            z.string().optional(),
  mobile:          z.string().optional(),
  creditAmount:    z.string().optional(),
  userType:        z.string().min(1, 'Please select user type'),
  partnership:     z.string().optional(),
  remark:          z.string().optional(),
  txnCode:         z.string().optional(),
}).refine(d => d.password === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

type FormData = z.infer<typeof schema>

export default function CreateAccountPage() {
  const { user }       = useAuthStore()
  const router         = useRouter()
  const allowedRoles   = user ? (ROLE_HIERARCHY[user.role] ?? []) : []

  const [maxPship, setMaxPship]                       = useState(100)
  const [ourPartnership, setOurPartnership]           = useState(100)
  const [downLinePartnership, setDownLinePartnership] = useState(0)
  const [showValidationMsg, setShowValidationMsg]     = useState(false)

  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      userType:    allowedRoles[0] ?? '',
      partnership: '100',
    },
  })

  // Load the current admin's max partnership from their user profile
  useEffect(() => {
    if (!user?.id) return
    adminApi.getUser(user.id)
      .then(u => {
        const mp = u.commission?.partnershipPct || 100
        setMaxPship(mp)
        setOurPartnership(mp)
        setValue('partnership', String(mp))
      })
      .catch(() => {/* use default 100 */})
  }, [user?.id])

  const watchedRole  = watch('userType')
  const watchedPship = watch('partnership')

  // Recalculate "You Keep / Child Gets" whenever partnership input changes
  useEffect(() => {
    if (watchedPship === '' || watchedPship === undefined) {
      setOurPartnership(maxPship)
      setDownLinePartnership(0)
      setShowValidationMsg(false)
      return
    }
    const val = parseInt(watchedPship) || 0
    if (val > maxPship) {
      setValue('partnership', String(maxPship))
      setOurPartnership(0)
      setDownLinePartnership(maxPship)
      setShowValidationMsg(true)
      setTimeout(() => setShowValidationMsg(false), 3000)
    } else {
      setOurPartnership(maxPship - val)
      setDownLinePartnership(val)
      setShowValidationMsg(false)
    }
  }, [watchedPship, maxPship])

  async function onSubmit(data: FormData) {
    try {
      await adminApi.createUser({
        username:            data.username,
        fullName:            data.fullName,
        password:            data.password,
        transactionPassword: data.txnCode || '',
        role:                data.userType,
        mobile:              data.mobile      || undefined,
        city:                data.city        || undefined,
        creditLimit:         parseFloat(data.creditAmount || '0') || 0,
        partnershipPct:      parseInt(data.partnership    || '0') || 0,
        remark:              data.remark      || undefined,
        // API-required fields not shown on form — send safe defaults
        sportsCommissionPct: 0,
        casinoCommissionPct: 0,
        minBet:              100,
        maxBet:              100_000,
      })
      toast.success('Account created successfully')
      router.push('/admin/accounts')
    } catch (e: any) {
      toast.error(e?.response?.data?.error || 'Failed to create account')
    }
  }

  if (allowedRoles.length === 0) {
    return (
      <div>
        <div className="flex justify-between items-center mx-3 mb-3">
          <h6 className="text-sm font-bold uppercase">CREATE ACCOUNT</h6>
          <nav className="text-xs text-tx-muted">Home / Users / <span className="font-bold text-tx-primary">Create Account</span></nav>
        </div>
        <p className="text-sm mx-3 mt-4">Your role ({user?.role}) cannot create sub-accounts.</p>
      </div>
    )
  }

  const err    = errors
  const field  = 'w-full px-3 py-2 text-sm border border-[#ccc] rounded text-[#495057] focus:border-primary focus:outline-none'
  const lbl    = 'block font-semibold text-sm mb-[5px]'
  const grp    = 'mb-[15px]'

  return (
    <div>
      {/* Page header */}
      <div className="flex justify-between items-center mx-3 mb-3">
        <h6 className="text-sm font-bold uppercase">CREATE ACCOUNT</h6>
        <nav className="text-xs text-tx-muted">
          Home / Users / <span className="font-bold text-tx-primary">Create Account</span>
        </nav>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-row gap-5 flex-wrap mx-3">

        {/* ── Left Column: General Information ──────────────── */}
        <div className="flex-1 min-w-[300px] flex flex-col bg-white p-6 rounded-md" style={{ boxShadow: '0 0 5px rgba(0,0,0,0.05)' }}>
          <h6 className="text-sm font-semibold text-[#495057] mb-3">General Information</h6>

          <div className={grp}>
            <label className={lbl}>User name: *</label>
            <input {...register('username')} type="text" className={field} />
            {err.username && <p className="text-xs text-red-600 mt-1">{err.username.message}</p>}
          </div>

          <div className={grp}>
            <label className={lbl}>Full Name: *</label>
            <input {...register('fullName')} type="text" className={field} />
            {err.fullName && <p className="text-xs text-red-600 mt-1">{err.fullName.message}</p>}
          </div>

          <div className={grp}>
            <label className={lbl}>Password: *</label>
            <input {...register('password')} type="password" className={field} />
            {err.password && <p className="text-xs text-red-600 mt-1">{err.password.message}</p>}
          </div>

          <div className={grp}>
            <label className={lbl}>Confirm Password: *</label>
            <input {...register('confirmPassword')} type="password" className={field} />
            {err.confirmPassword && <p className="text-xs text-red-600 mt-1">{err.confirmPassword.message}</p>}
          </div>

          <div className={grp}>
            <label className={lbl}>City:</label>
            <input {...register('city')} type="text" className={field} />
          </div>

          <div className={grp}>
            <label className={lbl}>Mobile Number:</label>
            <input {...register('mobile')} type="text" className={field} />
          </div>
        </div>

        {/* ── Right Column: Credit, User Type, Partnership ───── */}
        <div className="flex-1 min-w-[300px] flex flex-col bg-white p-6 rounded-md" style={{ boxShadow: '0 0 5px rgba(0,0,0,0.05)' }}>

          <div className={grp}>
            <label className={lbl}>Credit Amount:</label>
            <input {...register('creditAmount')} type="text" className={field} />
          </div>

          <div className={grp}>
            <label className={lbl}>
              User Type: *
              {user?.role && (
                <span className="text-xs text-tx-muted font-normal ml-1">({user.role})</span>
              )}
            </label>
            <select {...register('userType')} className={field}>
              <option value="">Select User Type</option>
              {allowedRoles.map(r => (
                <option key={r} value={r}>{ROLE_LABELS[r]}</option>
              ))}
            </select>
            {err.userType && <p className="text-xs text-red-600 mt-1">{err.userType.message}</p>}
          </div>

          <h6 className="text-sm font-semibold text-[#495057] mb-3">Partnership Information</h6>

          {watchedRole !== 'PLAYER' && (
            <div className={grp}>
              <label className={lbl}>Partnership to Give Child: (Max: {maxPship}%)</label>
              <input {...register('partnership')} type="text" className={field} />
              <p className="text-xs text-[#777] mt-1">
                You Keep: {ourPartnership}% | Child Gets: {downLinePartnership}%
              </p>
              {showValidationMsg && (
                <p className="text-xs text-red-600 mt-1 font-medium">
                  Maximum partnership limit is {maxPship}%. Value has been adjusted.
                </p>
              )}
            </div>
          )}

          <div className={grp}>
            <label className={lbl}>Remark:</label>
            <textarea {...register('remark')} rows={3} className={`${field} resize-y`} />
          </div>

          <div className={grp}>
            <label className={lbl}>Transaction Code:</label>
            <input {...register('txnCode')} type="text" className={field} />
          </div>

          <div className="text-right mt-auto">
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-[#111] text-white px-5 py-2 rounded font-bold cursor-pointer hover:bg-[#222] disabled:opacity-60 text-sm"
            >
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
