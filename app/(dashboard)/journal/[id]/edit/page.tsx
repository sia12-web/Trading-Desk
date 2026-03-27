import { getTrade } from '@/lib/data/trades'
import { TradeEntryForm } from '@/app/(dashboard)/journal/_components/TradeEntryForm'
import { getAccountSummary } from '@/lib/oanda/client'
import { notFound } from 'next/navigation'

interface EditTradePageProps {
    params: Promise<{
        id: string
    }>
}

export default async function EditTradePage({ params }: EditTradePageProps) {
    const { id } = await params
    let trade
    try {
        trade = await getTrade(id)
    } catch (e) {
        notFound()
    }

    if (!trade) notFound()

    const { data: accountInfo } = await getAccountSummary()
    return <TradeEntryForm initialData={trade} mode="edit" accountInfo={accountInfo} />
}
