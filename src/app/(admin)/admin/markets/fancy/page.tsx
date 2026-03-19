'use client'

import { useEffect, useState } from 'react'
import { adminApi } from '@/lib/api'
import { formatDate } from '@/lib/utils'
import DataTable from '@/components/ui/DataTable'
import PageHeader from '@/components/ui/PageHeader'
import Modal from '@/components/ui/Modal'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'

interface FancyMarket {
  id: string
  eventId: string
  name: string
  status: string
  yesRate: number
  noRate: number
  result: number | null
  settledAt: string | null
}

export default function AdminFancyMarketsPage() {
  const [markets, setMarkets]       = useState<FancyMarket[]>([])
  const [loading, setLoading]       = useState(true)
  const [resultModal, setResultModal] = useState<FancyMarket | null>(null)
  const [resultValue, setResultValue] = useState('')
  const [settling, setSettling]     = useState(false)

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    try { setMarkets(await adminApi.fancyMarkets({ page: 0, size: 100 }) as FancyMarket[]) }
    catch { /* */ } finally { setLoading(false) }
  }

  async function toggleStatus(m: FancyMarket) {
    const next = m.status === 'OPEN' ? 'SUSPENDED' : 'OPEN'
    try {
      await adminApi.updateFancyStatus(m.id, next)
      toast.success(`Market ${next.toLowerCase()}`)
      load()
    } catch (e: any) {
      toast.error(e?.response?.data?.error || 'Failed')
    }
  }

  async function declareResult() {
    if (!resultModal || !resultValue) { toast.error('Enter result value'); return }
    const num = parseFloat(resultValue)
    if (isNaN(num)) { toast.error('Enter a valid number'); return }
    setSettling(true)
    try {
      await adminApi.settleFancyMarket(resultModal.id, num)
      toast.success('Fancy market settled')
      setResultModal(null)
      setResultValue('')
      load()
    } catch (e: any) {
      toast.error(e?.response?.data?.error || 'Failed')
    } finally {
      setSettling(false)
    }
  }

  return (
    <div>
      <PageHeader title="Fancy Markets" subtitle="Manage session / fancy markets" />

      <div className="card">
        <DataTable
          columns={[
            { key: 'name',      label: 'Market',   render: r => <span className="font-medium">{r.name}</span> },
            { key: 'yesRate',   label: 'Yes Rate', render: r => (
              <span className="text-win font-medium">{r.yesRate ?? '-'}</span>
            )},
            { key: 'noRate',    label: 'No Rate',  render: r => (
              <span className="text-loss font-medium">{r.noRate ?? '-'}</span>
            )},
            { key: 'result',    label: 'Result',   render: r => r.result != null
              ? <span className="font-semibold text-primary">{r.result}</span>
              : <span className="text-tx-muted">—</span>
            },
            { key: 'status',    label: 'Status',   render: r => (
              <span className={cn(
                r.status === 'OPEN'      ? 'badge-green' :
                r.status === 'SUSPENDED' ? 'badge-yellow' : 'badge-gray'
              )}>{r.status}</span>
            )},
            { key: 'settledAt', label: 'Settled',  render: r => r.settledAt
              ? <span className="text-tx-muted">{formatDate(r.settledAt)}</span>
              : <span className="text-tx-muted">—</span>
            },
            { key: 'actions',   label: '',         render: r => (
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
                      onClick={() => { setResultModal(r); setResultValue('') }}
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
          emptyMessage="No fancy markets"
          rowKey={r => r.id}
        />
      </div>

      {/* Declare result modal */}
      {resultModal && (
        <Modal open title={`Declare Result — ${resultModal.name}`} onClose={() => setResultModal(null)} size="sm">
          <div className="space-y-3">
            <p className="text-xs text-tx-muted">
              Enter the final session value. YES bets win if result ≥ their rate; NO bets win otherwise.
            </p>
            <div>
              <label className="block text-xs text-tx-secondary mb-1">Result Value</label>
              <input
                type="number"
                value={resultValue}
                onChange={e => setResultValue(e.target.value)}
                placeholder="e.g. 48"
                className="input w-full"
                step="0.01"
                min="0"
              />
            </div>
            <div className="text-xs text-tx-muted space-y-0.5">
              <div>Yes Rate: <span className="text-win font-medium">{resultModal.yesRate}</span></div>
              <div>No Rate: <span className="text-loss font-medium">{resultModal.noRate}</span></div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={declareResult}
                disabled={settling || !resultValue}
                className="btn-primary flex-1"
              >
                {settling ? 'Settling...' : 'Declare Result'}
              </button>
              <button onClick={() => setResultModal(null)} className="btn-outline flex-1">
                Cancel
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
