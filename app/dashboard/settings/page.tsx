export const dynamic = 'force-dynamic'
import { createClient } from '@/lib/supabase'

export default async function SettingsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user?.id || '').single()

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Settings</h1>
      <div className="space-y-6">
        {/* Profile */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Profile</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <div className="w-full border border-gray-200 rounded-lg px-3 py-2 bg-gray-50 text-gray-600 text-sm">
                {user?.email || '—'}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input type="text" defaultValue={profile?.full_name || ''}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700">
              Save Changes
            </button>
          </div>
        </div>

        {/* Plan */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Billing</h2>
          <div className="flex items-center justify-between p-4 bg-indigo-50 rounded-xl mb-4">
            <div>
              <div className="font-semibold text-gray-900 capitalize">{profile?.plan || 'free'} Plan</div>
              <div className="text-gray-500 text-sm">
                {profile?.plan === 'free' ? '1 course limit' : profile?.plan === 'pro' ? '$9/month' : '$29/month'}
              </div>
            </div>
            <span className="bg-indigo-600 text-white text-xs font-medium px-2 py-1 rounded">
              {profile?.plan?.toUpperCase() || 'FREE'}
            </span>
          </div>
          <form action="/api/stripe/portal" method="POST">
            <button type="submit" className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-semibold hover:border-gray-400">
              Manage Billing
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
