import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import useRoomStore from '../../store/useRoomStore';
import type { Room, RoomType } from '../../types/rooms';
import RoomFilter from '../../components/rooms/RoomFilter';
import RoomTypeCard from '../../components/rooms/RoomTypeCard';
import RoomCardSkeleton from '../../components/rooms/RoomCardSkeleton';
import Pagination from '../../components/rooms/Pagination';
import { ArrowLeft } from 'lucide-react';

const RoomListPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { t } = useTranslation();
  const { fetchRooms, fetchRoomTypes, searchAvailable, isLoading, error: storeError } = useRoomStore();
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [representativeRooms, setRepresentativeRooms] = useState<Record<number, Room | null>>({});
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  });

  // Fetch rooms based on URL params
  useEffect(() => {
    const loadRooms = async () => {
      setError(null);

      try {
        const params = {
          type: searchParams.get('type') || undefined,
          minPrice: searchParams.get('minPrice')
            ? Number(searchParams.get('minPrice'))
            : undefined,
          maxPrice: searchParams.get('maxPrice')
            ? Number(searchParams.get('maxPrice'))
            : undefined,
          capacity: searchParams.get('capacity')
            ? Number(searchParams.get('capacity'))
            : undefined,
          page: searchParams.get('page')
            ? Number(searchParams.get('page'))
            : 1,
          limit: 12,
          from: searchParams.get('from') || undefined,
          to: searchParams.get('to') || undefined,
          amenities: searchParams.get('amenities') || undefined,
        };

        // If dates are provided, use availability search
        if (params.from && params.to) {
          await searchAvailable({
            from: params.from,
            to: params.to,
            type: params.type,
            capacity: params.capacity,
            minPrice: params.minPrice,
            maxPrice: params.maxPrice,
            amenities: params.amenities,
            page: params.page,
            limit: params.limit,
          });
          
          // Get data from store
          const storeState = useRoomStore.getState();
          const types = storeState.rooms as any as RoomType[];
          setRoomTypes(types);
          
          if (storeState.pagination) {
            setPagination({
              ...storeState.pagination,
              totalPages: storeState.pagination.totalPages || 1
            });
          }

          // Fetch representative rooms for linking
          try {
            const samples = await Promise.all(types.map(async (t) => {
              try {
                await fetchRooms({ type: String(t.id), limit: 1 });
                const state = useRoomStore.getState();
                const room = state.rooms?.[0] ?? null;
                return { typeId: t.id, room };
              } catch (e) {
                return { typeId: t.id, room: null };
              }
            }));

            const map: Record<number, Room | null> = {};
            samples.forEach((s) => { map[s.typeId] = s.room; });
            setRepresentativeRooms(map);
          } catch (e) {
            console.warn('Failed to fetch representative rooms', e);
          }
        } else {
          // No dates: use fetchRoomTypes
          await fetchRoomTypes();
          
          // Get data from store and filter client-side
          const storeState = useRoomStore.getState();
          let types = storeState.roomTypes as RoomType[];
          
          // Apply filters
          if (params.capacity) {
            types = types.filter((t) => (t.capacity || 0) >= params.capacity!);
          }
          if (params.minPrice) {
            types = types.filter((t) => Number(t.base_price || 0) >= params.minPrice!);
          }
          if (params.maxPrice) {
            types = types.filter((t) => Number(t.base_price || 0) <= params.maxPrice!);
          }
          
          // Apply amenities filter
          if (params.amenities) {
            const selectedAmenities = params.amenities
              .split(',')
              .map(s => s.trim())
              .filter(Boolean);
            
            console.log('🔍 Selected amenities:', selectedAmenities);
            console.log('🔍 Total types before filter:', types.length);
            
            if (selectedAmenities.length > 0) {
              types = types.filter((t) => {
                // Parse amenities - handle both string and array
                let roomAmenities: string[] = [];
                if (Array.isArray(t.amenities)) {
                  roomAmenities = t.amenities;
                } else if (typeof t.amenities === 'string') {
                  try {
                    const parsed = JSON.parse(t.amenities);
                    roomAmenities = Array.isArray(parsed) ? parsed : [];
                  } catch {
                    roomAmenities = [];
                  }
                }
                
                console.log(`Room ${t.name} amenities:`, roomAmenities);
                
                // Check if room has all selected amenities
                const hasAllAmenities = selectedAmenities.every(amenity => 
                  roomAmenities.some(ra => 
                    String(ra).toLowerCase().includes(amenity.toLowerCase())
                  )
                );
                
                console.log(`Room ${t.name} has all amenities:`, hasAllAmenities);
                return hasAllAmenities;
              });
              
              console.log('🔍 Total types after filter:', types.length);
            }
          }

          const sliced = types.slice(0, params.limit || 12);
          setRoomTypes(sliced);
          setPagination({ 
            total: types.length, 
            page: params.page, 
            limit: params.limit, 
            totalPages: Math.ceil(types.length / params.limit) 
          });

          // Fetch representative rooms
          try {
            const samples = await Promise.all(sliced.map(async (t) => {
              try {
                await fetchRooms({ type: String(t.id), limit: 1 });
                const state = useRoomStore.getState();
                const room = state.rooms?.[0] ?? null;
                return { typeId: t.id, room };
              } catch (e) {
                return { typeId: t.id, room: null };
              }
            }));

            const map: Record<number, Room | null> = {};
            samples.forEach((s) => { map[s.typeId] = s.room; });
            setRepresentativeRooms(map);
          } catch (e) {
            console.warn('Failed to fetch representative rooms', e);
          }
        }
      } catch (err) {
        console.error('Error fetching rooms:', err);
        setError(t('rooms.errorLoading'));
      }
    };

    loadRooms();
  }, [searchParams, searchAvailable, fetchRoomTypes]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Back Button */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 bg-indigo-600 
            text-white px-3 py-2 rounded-md hover:bg-indigo-700 
            disabled:bg-gray-400 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>{t('common.backToHome')}</span>
        </Link>

        <div className="mb-10">
          <h1 className="text-3xl text-center font-bold text-gray-900 dark:text-gray-100">
            {t('rooms.title')}
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <aside className="lg:col-span-1 z-50">
            <div className="lg:sticky lg:top-16 lg:self-start">
              <RoomFilter />
            </div>
          </aside>

          <main className="lg:col-span-3">
            {isLoading && (
              <div className="grid grid-cols-1 md:grid-cols-2 
                xl:grid-cols-3 gap-6"
              >
                {Array.from({ length: 6 }).map((_, index) => (
                  <RoomCardSkeleton key={index} />
                ))}
              </div>
            )}

            {(error || storeError) && !isLoading && (
              <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700
                rounded-lg p-6 text-center"
              >
                <svg
                  className="w-12 h-12 text-red-400 dark:text-red-300 mx-auto mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 
                      9 9 0 0118 0z"
                  />
                </svg>
                <p className="text-red-800 dark:text-red-300 font-medium">{error || storeError}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-4 px-4 py-2 bg-red-600 
                    text-white rounded-lg hover:bg-red-700 
                    transition-colors"
                >
                  {t('common.tryAgain')}
                </button>
              </div>
            )}

            {!isLoading && !error && !storeError && roomTypes.length === 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md 
                p-12 text-center"
              >
                <svg
                  className="w-24 h-24 text-gray-300 mx-auto mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 
                      0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 
                      4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
                <h3 className="text-xl font-semibold 
                  text-gray-800 dark:text-gray-100 mb-2"
                >
                  {t('common.noResults')}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  {t('common.noResultsDesc')}
                </p>
                <button
                  onClick={() => window.location.href = '/rooms'}
                  className="px-6 py-2 bg-blue-600 text-white 
                    rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {t('common.clearFilters')}
                </button>
              </div>
            )}

            {!isLoading && !error && !storeError && roomTypes.length > 0 && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 
                  xl:grid-cols-2 gap-6"
                >
                  {roomTypes.map((rt) => (
                    <RoomTypeCard
                      key={rt.id}
                      roomType={rt}
                      room={representativeRooms[rt.id] ?? undefined}
                    />
                  ))}
                </div>

                <Pagination
                  currentPage={pagination.page}
                  totalPages={pagination.totalPages}
                />
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default RoomListPage;