'use client'

import { useEffect, useState } from 'react'
import { adminApi } from '@/lib/api'
import { formatDate, cn } from '@/lib/utils'
import DataTable from '@/components/ui/DataTable'
import PageHeader from '@/components/ui/PageHeader'
import Modal from '@/components/ui/Modal'
import Link from 'next/link'
import { PlusCircle } from 'lucide-react'
import toast from 'react-hot-toast'

interface Bonus {
  id: string
  name: string
  type: 'FIXED' | 'PERCENTAGE'
  amount: number
  active: boolean
  createdAt: string
}

export default function BonusListPage() {
  const [bonuses, setBonuses] = useState<Bonus[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteModal, setDeleteModal] = useState<Bonus | null>(null)

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    try { setBonuses(await adminApi.listBonuses() as Bonus[]) }
    catch { toast.error('Failed to load bonuses') }
    finally { setLoading(false) }
  }

  async function toggleStatus(bonus: Bonus) {
    try {
      await adminApi.toggleBonus(bonus.id, !bonus.active)
      toast.success(`Bonus ${!bonus.active ? 'activated' : 'deactivated'}`)
      load()
    } catch { toast.error('Failed to update status') }
  }

  async function deleteBonus(bonus: Bonus) {
    try {
      await adminApi.deleteBonus(bonus.id)
      toast.success('Bonus deleted')
      setDeleteModal(null)
      load()
    } catch { toast.error('Failed to delete bonus') }
  }

  return (
    <div>
      <PageHeader title="Bonus Management" subtitle={`${bonuses.length} bonuses configured`}>
        <Link href="/admin/bonus/create" className="btn-primary btn-sm flex items-center gap-1.5">
          <PlusCircle size={13} /> Add Bonus
        </Link>
      </PageHeader>

      <div className="card">
        <DataTable
          columns={[
            { key: 'name',      label: 'Bonus Name', render: r => <span className="font-semibold text-tx-primary">{r.name}</span> },
            { key: 'type',      label: 'Type',        render: r => (
              <span className="badge badge-blue text-[10px]">{r.type === 'FIXED' ? 'Fixed Amount' : 'Percentage'}</span>
            )},
            { key: 'amount',    label: 'Amount',      render: r => (
              <span>{r.type === 'FIXED' ? `₹${r.amount.toLocaleString()}` : `${r.amount}%`}</span>
            )},
            { key: 'active',    label: 'Status',      render: r => (
              <span className={cn('badge', r.active ? 'badge-green' : 'badge-red')}>
                {r.active ? 'Active' : 'Inactive'}
              </span>
            )},
            { key: 'createdAt', label: 'Created',     render: r => (
              <span className="text-tx-muted text-[11px]">{formatDate(r.createdAt)}</span>
            )},
            { key: 'actions',   label: '',            render: r => (
              <div className="flex gap-1">
                <Link href={`/admin/bonus/${r.id}/edit`} className="btn-outline btn-sm">Edit</Link>
                <button
                  onClick={() => toggleStatus(r)}
                  className={cn('btn-sm rounded px-2 py-0.5 text-xs', r.active ? 'btn-danger' : 'btn-primary')}
                >
                  {r.active ? 'Deactivate' : 'Activate'}
                </button>
                <button
                  onClick={() => setDeleteModal(r)}
                  className="btn-sm btn-danger rounded px-2 py-0.5 text-xs"
                >
                  Delete
                </button>
              </div>
            )},
          ]}
          data={bonuses}
          loading={loading}
          emptyMessage="No bonuses configured"
          rowKey={r => r.id}
        />
      </div>

      {deleteModal && (
        <Modal open title="Delete Bonus" onClose={() => setDeleteModal(null)} size="sm">
          <p className="text-sm text-tx-primary mb-4">
            Are you sure you want to delete <strong>{deleteModal.name}</strong>? This cannot be undone.
          </p>
          <div className="flex gap-2">
            <button onClick={() => deleteBonus(deleteModal)} className="btn-danger flex-1">Delete</button>
            <button onClick={() => setDeleteModal(null)} className="btn-outline flex-1">Cancel</button>
          </div>
        </Modal>
      )}
    </div>
  )
}
