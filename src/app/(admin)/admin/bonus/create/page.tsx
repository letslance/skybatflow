'use client'

import { useRouter } from 'next/navigation'
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

export default function CreateBonusPage() {
  const router = useRouter()
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { type: 'FIXED', amount: 0 },
  })

  const type = watch('type')

  async function onSubmit(data: FormData) {
    try {
      await adminApi.createBonus(data)
      toast.success('Bonus created')
      router.push('/admin/bonus')
    } catch (e: any) {
      toast.error(e?.response?.data?.error || 'Failed to create bonus')
    }
  }

  return (
    <div>
      <PageHeader title="Create Bonus">
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
            type="number"
            step="0.01"
            min="0"
            max={type === 'PERCENTAGE' ? 100 : undefined}
            className="input w-full"
            placeholder={type === 'FIXED' ? '500' : '10'}
          />
          {errors.amount && <p className="text-[11px] text-loss mt-1">{errors.amount.message}</p>}
        </div>

        <div>
          <label className="block text-xs text-tx-secondary mb-1">Description</label>
          <textarea
            {...register('description')}
            className="input w-full resize-none h-20 text-xs"
            placeholder="Optional description for this bonus..."
          />
        </div>

        <div className="flex gap-2 pt-1">
          <button type="submit" disabled={isSubmitting} className="btn-primary flex-1">
            {isSubmitting ? 'Creating...' : 'Create Bonus'}
          </button>
          <Link href="/admin/bonus" className="btn-outline flex-1 text-center py-2 text-sm">Cancel</Link>
        </div>
      </form>
    </div>
  )
}
