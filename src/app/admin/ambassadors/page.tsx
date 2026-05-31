import { Metadata } from 'next'
export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Ambassadors' }
export default function AmbassadorsPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="page-header"><h1 className="page-title">Ambassadors</h1></div>
      <div className="card p-10 text-center">
        <p className="text-sm font-medium text-gray-700 mb-2">Ambassador programme</p>
        <p className="text-sm text-gray-400">Ambassador management coming in the next release. Campus ambassadors are identified during campus tours and onboarded directly by the MUI team.</p>
      </div>
    </div>
  )
}
