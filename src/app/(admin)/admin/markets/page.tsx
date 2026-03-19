'use client'

import { useEffect, useState } from 'react'
import { adminApi } from '@/lib/api'
import { formatDate } from '@/lib/utils'
import DataTable from '@/components/ui/DataTable'
import PageHeader from '@/components/ui/PageHeader'
import Modal from '@/components/ui/Modal'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'

interface AdminMarket {
  id: string
  name: string
  marketType: string
  eventName: string
  status: string
  inplay: boolean
  runners: { id: string; name: string }[]
  openDate: string
}

export default function AdminMarketsPage() {
  const [markets, setMarkets]     = useState<AdminMarket[]>([])
  const [loading, setLoading]     = useState(true)
  const [resultModal, setResultModal] = useState<AdminMarket | null>(null)
  const [winnerId, setWinnerId]   = useState('')
  const [settling, setSettling]   = useState(false)

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    try { setMarkets(await adminApi.markets({ page: 0, size: 50 }) as AdminMarket[]) }
    catch { /* */ } finally { setLoading(false) }
  }

  async function toggleStatus(market: AdminMarket) {
    const next = market.status === 'OPEN' ? 'SUSPENDED' : 'OPEN'
    try {
      await adminApi.updateMarketStatus(market.id, next)
      toast.success(`Market ${next.toLowerCase()}`)
      load()
    } catch (e: any) {
      toast.error(e?.response?.data?.error || 'Failed')
    }
  }

  async function settleMarket() {
    if (!resultModal || !winnerId) { toast.error('Select winner'); return }
    setSettling(true)
    try {
      await adminApi.settleMarket(resultModal.id, winnerId)
      toast.success('Market settled')
      setResultModal(null)
      load()
    } catch (e: any) {
      toast.error(e?.response?.data?.error || 'Failed')
    } finally { setSettling(false) }
  }

  return (
    <div>
      <PageHeader title="Markets" subtitle="Manage betting markets" />

      <div className="card">
        <DataTable
          columns={[
            { key: 'eventName', label: 'Event',  render: r => <span className="font-medium">{r.eventName}</span> },
            { key: 'name',      label: 'Market' },
            { key: 'marketType', label: 'Type', render: r => (
              <span className="badge badge-gray">{r.marketType}</span>
            )},
            { key: 'inplay', label: 'In-Play', render: r => r.inplay
              ? <span className="badge-red">LIVE</span>
              : <span className="text-tx-muted">Pre</span>
            },
            { key: 'status', label: 'Status', render: r => (
              <span className={cn(
                r.status === 'OPEN' ? 'badge-green' :
                r.status === 'SUSPENDED' ? 'badge-yellow' : 'badge-gray'
              )}>{r.status}</span>
            )},
            { key: 'openDate', label: 'Date', render: r => (
              <span className="text-tx-muted">{formatDate(r.openDate)}</span>
            )},
            { key: 'actions', label: '', render: r => (
              <div className="flex gap-1">
                {(r.status === 'OPEN' || r.status === 'SUSPENDED') && (
                  <>
                    <button
                      onClick={() => toggleStatus(r)}
                      className={cn('btn-sm rounded px-2 py-0.5 text-xs',
                        r.status === 'OPEN' ? 'btn-outline' : 'btn-primary'
                      )}
                    >
                      {r.status === 'OPEN' ? 'Suspend' : 'Open'}
                    </button>
                    <button
                      onClick={() => { setResultModal(r); setWinnerId('') }}
                      className="btn-sm btn-outline rounded px-2 py-0.5 text-xs text-win"
                    >
                      Result
                    </button>
                  </>
                )}
              </div>
            )},
          ]}
          data={markets}
          loading={loading}
          emptyMessage="No markets"
          rowKey={r => r.id}
        />
      </div>

      {/* Result modal */}
      {resultModal && (
        <Modal open title={`Declare Result — ${resultModal.name}`} onClose={() => setResultModal(null)} size="sm">
          <div className="space-y-3">
            <p className="text-xs text-tx-muted">Select the winning runner to settle all bets.</p>
            <div>
              <label className="block text-xs text-tx-secondary mb-1">Winner</label>
              <select value={winnerId} onChange={e => setWinnerId(e.target.value)} className="select">
                <option value="">-- Select Winner --</option>
                {resultModal.runners.map(r => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
                <option value="VOID">Void / Cancelled</option>
              </select>
            </div>
            <div className="flex gap-2">
              <button onClick={settleMarket} disabled={settling || !winnerId} className="btn-primary flex-1">
                {settling ? 'Settling...' : 'Declare Result'}
              </button>
              <button onClick={() => setResultModal(null)} className="btn-outline flex-1">Cancel</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
