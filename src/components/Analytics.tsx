import { collection, getDocs } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { db } from '../firebase';

interface AnalyticsData {
  totalNames: number;
  byGender: { boy: number; girl: number; unisex: number };
  bySource: { manual: number; link: number };
  avgNameLength: number;
  recentlyAdded: number; // last 7 days
  specialCharsCount: number;
  mostCommonLength: number;
}

export const Analytics: React.FC = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const namesSnapshot = await getDocs(collection(db, 'baby-names'));
      const names = namesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[];

      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const analytics: AnalyticsData = {
        totalNames: names.length,
        byGender: {
          boy: names.filter(n => n.gender === 'boy').length,
          girl: names.filter(n => n.gender === 'girl').length,
          unisex: names.filter(n => n.gender === 'unisex').length,
        },
        bySource: {
          manual: names.filter(n => n.source === 'manual' || !n.source).length,
          link: names.filter(n => n.source === 'link').length,
        },
        avgNameLength: names.reduce((acc, n) => acc + (n.nameLength || n.name?.length || 0), 0) / names.length,
        recentlyAdded: names.filter(n => {
          const createdAt = n.createdAt ? new Date(n.createdAt) : new Date(0);
          return createdAt > sevenDaysAgo;
        }).length,
        specialCharsCount: names.filter(n => n.hasSpecialChars).length,
        mostCommonLength: getMostCommonLength(names),
      };

      setData(analytics);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMostCommonLength = (names: any[]) => {
    const lengthCounts = names.reduce((acc, n) => {
      const length = n.nameLength || n.name?.length || 0;
      acc[length] = (acc[length] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    return Object.keys(lengthCounts).reduce((a, b) => 
      lengthCounts[Number(a)] > lengthCounts[Number(b)] ? Number(a) : Number(b), 0
    );
  };

  if (loading) {
    return (
      <div className="w-full max-w-4xl mx-auto p-6">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/40 p-6">
          <div className="text-center">Loading analytics...</div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="w-full max-w-4xl mx-auto p-6">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/40 p-6">
          <div className="text-center text-red-600">Failed to load analytics</div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/40 p-6">
        <h2 className="text-2xl font-bold text-fuchsia-700 mb-6 text-center">📊 Analytics Dashboard</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Total Names */}
          <div className="bg-gradient-to-br from-blue-100 to-blue-200 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-800">Total Names</h3>
            <p className="text-3xl font-bold text-blue-900">{data.totalNames}</p>
          </div>

          {/* By Gender */}
          <div className="bg-gradient-to-br from-purple-100 to-purple-200 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-purple-800">By Gender</h3>
            <div className="space-y-1">
              <p className="text-sky-700">👦 Boys: {data.byGender.boy}</p>
              <p className="text-fuchsia-700">👧 Girls: {data.byGender.girl}</p>
              <p className="text-purple-700">⚧ Unisex: {data.byGender.unisex}</p>
            </div>
          </div>

          {/* Recently Added */}
          <div className="bg-gradient-to-br from-green-100 to-green-200 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-green-800">Recent (7 days)</h3>
            <p className="text-3xl font-bold text-green-900">{data.recentlyAdded}</p>
          </div>

          {/* Average Name Length */}
          <div className="bg-gradient-to-br from-yellow-100 to-yellow-200 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-yellow-800">Avg Length</h3>
            <p className="text-3xl font-bold text-yellow-900">{data.avgNameLength.toFixed(1)}</p>
          </div>

          {/* Most Common Length */}
          <div className="bg-gradient-to-br from-orange-100 to-orange-200 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-orange-800">Most Common Length</h3>
            <p className="text-3xl font-bold text-orange-900">{data.mostCommonLength}</p>
          </div>

          {/* Special Characters */}
          <div className="bg-gradient-to-br from-red-100 to-red-200 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-red-800">Special Chars</h3>
            <p className="text-3xl font-bold text-red-900">{data.specialCharsCount}</p>
          </div>
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={fetchAnalytics}
            className="px-6 py-2 bg-gradient-to-br from-fuchsia-400 to-sky-400 text-white font-bold rounded-lg shadow hover:from-fuchsia-500 hover:to-sky-500 transition-all duration-200"
          >
            Refresh Data
          </button>
        </div>
      </div>
    </div>
  );
};
