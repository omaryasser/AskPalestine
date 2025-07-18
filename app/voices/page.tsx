import { getAllProPalestinians, initDatabase } from '../../lib/database';
import ProPalestinianCard from '../../components/ProPalestinianCard';
import PalestineButton from '../../components/PalestineButton';
import { PageHeader, PalestineFlagStats, SectionHeader } from '../../components/PalestineDesign';

interface ProPalestinian {
  id: string;
  name: string;
  bio: string;
  photo?: string;
  professional_identity?: string;
}

export default async function VoicesPage() {
  // Initialize database if not already done
  initDatabase();
  
  const proPalestinians = getAllProPalestinians();

  return (
    <div className="min-h-screen bg-gray-50">      
      <PageHeader 
        title="Palestinian Voices"
        subtitle="Discover insights and perspectives from Palestinian experts, journalists, activists, and thought leaders who provide clarity on Palestinian rights and the ongoing struggle for justice."
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back to Home */}
        <div className="mb-8">
          <PalestineButton href="/">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </PalestineButton>
        </div>

        {/* Stats */}
        <div className="mb-12">
          <PalestineFlagStats 
            count={proPalestinians.length}
            title="Expert Voices Available"
            subtitle="Standing for Palestinian Rights"
          />
        </div>

        {/* Voices Grid */}
        {proPalestinians.length > 0 ? (
          <div className="space-y-8">
            <SectionHeader 
              title="Voices of Truth and Justice"
              subtitle="Experts sharing perspectives on Palestinian rights"
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {proPalestinians.map((person, index) => (
                <div 
                  key={person.id} 
                  className="group"
                >
                  <div 
                    className="bg-white rounded-lg shadow-md hover:shadow-xl border-t-4 transition-all duration-300 overflow-hidden"
                    style={{
                      borderTopColor: index % 2 === 0 ? '#000000' : '#006234'
                    }}
                  >
                    <ProPalestinianCard person={person} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md border-t-4 p-12 text-center" style={{borderTopColor: '#006234'}}>
            <div className="text-lg font-semibold mb-2 text-gray-900">
              No pro-Palestinian voices available yet.
            </div>
            <div className="text-gray-600">
              Check back soon for expert insights and perspectives.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
