'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { adminApi } from '@/lib/api'
import PageHeader from '@/components/ui/PageHeader'
import toast from 'react-hot-toast'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

const schema = z.object({
  name:        z.string().min(2, 'Name required'),
  type:        z.enum(['FIXED', 'PERCENTAGE']),
  amount:      z.number().min(0.01, 'Amount must be positive'),
  description: z.string().optional(),
})

type FormData = z.infer<typeof schema>

export default function EditBonusPage() {
  const { id } = useParams<{ id: string }>()
  const router  = useRouter()
  const [loadError, setLoadError] = useState(false)

  const { register, handleSubmit, watch, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { type: 'FIXED', amount: 0 },
  })

  const type = watch('type')

  useEffect(() => {
    adminApi.listBonuses()
      .then((list: any) => {
        const bonus = (list as any[]).find((b: any) => b.id === id)
        if (!bonus) { setLoadError(true); return }
        reset({ name: bonus.name, type: bonus.type, amount: bonus.amount, description: bonus.description || '' })
      })
      .catch(() => setLoadError(true))
  }, [id, reset])

  async function onSubmit(data: FormData) {
    try {
      await adminApi.updateBonus(id, data)
      toast.success('Bonus updated')
      router.push('/admin/bonus')
    } catch (e: any) {
      toast.error(e?.response?.data?.error || 'Failed to update bonus')
    }
  }

  if (loadError) return <div className="p-4 text-xs text-loss">Bonus not found</div>

  return (
    <div>
      <PageHeader title="Edit Bonus">
        <Link href="/admin/bonus" className="btn-outline btn-sm flex items-center gap-1">
          <ArrowLeft size={12} /> Back
        </Link>
      </PageHeader>

      <form onSubmit={handleSubmit(onSubmit)} className="card p-4 max-w-lg space-y-4">
        <div>
          <label className="block text-xs text-tx-secondary mb-1">Bonus Name *</label>
          <input {...register('name')} className="input w-full" placeholder="e.g. Welcome Bonus" />
          {errors.name && <p className="text-[11px] text-loss mt-1">{errors.name.message}</p>}
        </div>

        <div>
          <label className="block text-xs text-tx-secondary mb-1">Bonus Type *</label>
          <select {...register('type')} className="select w-full">
            <option value="FIXED">Fixed Amount (₹)</option>
            <option value="PERCENTAGE">Percentage (%)</option>
          </select>
        </div>

        <div>
          <label className="block text-xs text-tx-secondary mb-1">
            Amount {type === 'FIXED' ? '(₹)' : '(%)'} *
          </label>
          <input
            {...register('amount', { valueAsNumber: true })}
            type="number" step="0.01" min="0"
            max={type === 'PERCENTAGE' ? 100 : undefined}
            className="input w-full"
          />
          {errors.amount && <p className="text-[11px] text-loss mt-1">{errors.amount.message}</p>}
        </div>

        <div>
          <label className="block text-xs text-tx-secondary mb-1">Description</label>
          <textarea {...register('description')} className="input w-full resize-none h-20 text-xs" />
        </div>

        <div className="flex gap-2 pt-1">
          <button type="submit" disabled={isSubmitting} className="btn-primary flex-1">
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </button>
          <Link href="/admin/bonus" className="btn-outline flex-1 text-center py-2 text-sm">Cancel</Link>
        </div>
      </form>
    </div>
  )
}
