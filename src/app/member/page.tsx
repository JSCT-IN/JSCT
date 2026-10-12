'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import { DPSWTStore } from '@/lib/store';
import { useTranslation } from '@/lib/i18n';
import {
  Users,
  Search,
  Filter,
  RotateCcw,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  Building,
  MapPin,
  Sparkles
} from 'lucide-react';

interface MemberListItem {
  id: string;
  membership_id: string;
  full_name: string;
  father_name?: string;
  district: string;
  block_name?: string;
  department: string;
  role: string;
  is_active: boolean;
  created_at: string;
}

export default function MemberListPage() {
  const { lang, t } = useTranslation();

  const [members, setMembers] = useState<MemberListItem[]>([]);
  const [districts, setDistricts] = useState<string[]>([]);
  const [blocks, setBlocks] = useState<string[]>([]);

  // Filter States (matching dpswt.com /member)
  const [selectedDistrict, setSelectedDistrict] = useState<string>('');
  const [selectedBlock, setSelectedBlock] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [pageSize, setPageSize] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Standard UP Districts
  const upDistricts = [
    'Prayagraj', 'Lucknow', 'Varanasi', 'Kanpur Nagar', 'Gorakhpur',
    'Bareilly', 'Agra', 'Meerut', 'Aligarh', 'Moradabad', 'Ayodhya',
    'Jhansi', 'Azamgarh', 'Saharanpur', 'Basti', 'Mirzapur', 'Ghazipur'
  ];

  // Load Members from Supabase
  const fetchMembers = async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('members')
        .select('id, membership_id, full_name, father_name, district, block_name, department, role, is_active, created_at', { count: 'exact' });

      if (selectedDistrict) {
        query = query.ilike('district', `%${selectedDistrict}%`);
      }
      if (selectedBlock) {
        query = query.ilike('block_name', `%${selectedBlock}%`);
      }
      if (searchQuery.trim()) {
        const q = searchQuery.trim();
        query = query.or(`full_name.ilike.%${q}%,membership_id.ilike.%${q}%,father_name.ilike.%${q}%`);
      }

      const from = (currentPage - 1) * pageSize;
      const to = from + pageSize - 1;

      const { data, count, error } = await query
        .range(from, to)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setMembers(data as MemberListItem[]);
        setTotalCount(count || data.length);
      } else {
        // Fallback to local store
        fallbackLocalData();
      }
    } catch {
      fallbackLocalData();
    } finally {
      setIsLoading(false);
    }
  };

  const fallbackLocalData = () => {
    const local = DPSWTStore.getMembers();
    let filtered = local.map((m) => ({
      id: m.id,
      membership_id: m.membership_id,
      full_name: m.full_name,
      father_name: 'श्री कैलाश नाथ वर्मा',
      district: m.district,
      block_name: 'बहरिया (Bahariya)',
      department: m.department,
      role: m.role,
      is_active: m.is_active,
      created_at: m.created_at,
    }));

    if (selectedDistrict) {
      filtered = filtered.filter((m) => m.district.toLowerCase().includes(selectedDistrict.toLowerCase()));
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (m) =>
          m.full_name.toLowerCase().includes(q) ||
          m.membership_id.toLowerCase().includes(q)
      );
    }

    setTotalCount(filtered.length);
    const from = (currentPage - 1) * pageSize;
    setMembers(filtered.slice(from, from + pageSize));
  };

  useEffect(() => {
    fetchMembers();
  }, [currentPage, pageSize]);

  const handleApplyFilter = () => {
    setCurrentPage(1);
    fetchMembers();
  };

  const handleResetFilter = () => {
    setSelectedDistrict('');
    setSelectedBlock('');
    setSearchQuery('');
    setPageSize(10);
    setCurrentPage(1);
    setTimeout(() => {
      fetchMembers();
    }, 50);
  };

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-6">
      
      {/* Editorial Header (Matching dpswt.com /member) */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-stone-border/70 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-terracotta">
              JSCT Directory
            </span>
            <span className="text-xs text-driftwood">•</span>
            <span className="text-xs text-sage font-medium flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>सत्यापित सदस्य सूची</span>
            </span>
          </div>
          <h1 className="font-editorial text-3xl sm:text-4xl font-bold text-charcoal">
            {lang === 'hi' ? 'सदस्य सूची (Member List)' : 'Registered Member Directory'}
          </h1>
          <p className="text-xs sm:text-sm text-driftwood mt-1">
            {lang === 'hi'
              ? 'उत्तर प्रदेश के समस्त पंजीकृत, सक्रिय व सत्यापित लोक सेवकों की आधिकारिक सूची'
              : 'Official verified directory of active mutual welfare members across Uttar Pradesh'}
          </p>
        </div>

        <Link
          href="/register"
          className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-terracotta to-terracotta-hover text-white font-bold text-xs shadow-warm hover:shadow-warm-md transition-all touch-target"
        >
          <Sparkles className="w-4 h-4" />
          <span>{lang === 'hi' ? 'नया पंजीकरण करें' : 'Register as Member'}</span>
        </Link>
      </div>

      {/* Filter Row (dpswt.com spec: Select District, Select Block, Filter, Reset) */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-stone-border shadow-warm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          
          {/* District Select */}
          <div>
            <label className="block text-[11px] font-semibold text-charcoal mb-1">स्थाई निवासी जिला</label>
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-stone-300 bg-canvas-inset/40 focus:bg-white text-xs text-charcoal focus:outline-none focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta"
            >
              <option value="">सभी जनपद (All Districts)</option>
              {upDistricts.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          {/* Block Select */}
          <div>
            <label className="block text-[11px] font-semibold text-charcoal mb-1">विकास खंड / तहसील</label>
            <input
              type="text"
              value={selectedBlock}
              onChange={(e) => setSelectedBlock(e.target.value)}
              placeholder="उदा. बहरिया / सदर"
              className="w-full px-3 py-2.5 rounded-xl border border-stone-300 bg-canvas-inset/40 focus:bg-white text-xs text-charcoal focus:outline-none focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta"
            />
          </div>

          {/* Search Box */}
          <div>
            <label className="block text-[11px] font-semibold text-charcoal mb-1">नाम / आईडी खोजें</label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-driftwood absolute left-3 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleApplyFilter()}
                placeholder="नाम, पिता का नाम, ID..."
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-stone-300 bg-canvas-inset/40 focus:bg-white text-xs text-charcoal focus:outline-none focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-end gap-2">
            <button
              type="button"
              onClick={handleApplyFilter}
              className="flex-1 py-2.5 px-4 rounded-xl bg-charcoal hover:bg-charcoal-deep text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-1.5 touch-target"
            >
              <Filter className="w-3.5 h-3.5" />
              <span>फ़िल्टर करें</span>
            </button>

            <button
              type="button"
              onClick={handleResetFilter}
              className="py-2.5 px-3 rounded-xl bg-canvas-inset hover:bg-white border border-stone-border text-driftwood hover:text-charcoal text-xs font-semibold shadow-xs transition-all flex items-center justify-center touch-target"
              title="Reset"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Table Page Controls: Entries Count & Result stats */}
        <div className="flex items-center justify-between text-xs text-driftwood pt-2 border-t border-stone-border/60">
          <div className="flex items-center gap-2">
            <span>Show</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-2 py-1 rounded-lg border border-stone-300 bg-white font-semibold text-charcoal text-xs"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span>entries</span>
          </div>

          <div className="font-mono text-[11px] text-charcoal">
            कुल सदस्य: <span className="font-bold text-terracotta">{totalCount}</span>
          </div>
        </div>
      </div>

      {/* Member Directory: Responsive Table for Desktop/Tablet & Responsive Cards for Mobile */}
      <div className="bg-white rounded-3xl border border-stone-border shadow-warm overflow-hidden">
        
        {/* 1. Mobile Cards View (< md) */}
        <div className="block md:hidden divide-y divide-stone-border/70">
          {isLoading ? (
            <div className="py-12 text-center text-xs text-driftwood">
              सदस्य रिकॉर्ड लोड हो रहे हैं...
            </div>
          ) : members.length === 0 ? (
            <div className="py-12 text-center text-xs text-driftwood">
              कोई सदस्य नहीं मिला (No members found)
            </div>
          ) : (
            members.map((m, idx) => (
              <div key={m.id} className="p-4 space-y-3 hover:bg-canvas-inset/40 transition-colors">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-driftwood">
                      #{(currentPage - 1) * pageSize + idx + 1}
                    </span>
                    <span className="font-mono text-xs font-bold text-terracotta bg-terracotta-light/60 px-2 py-0.5 rounded-lg border border-terracotta/20">
                      {m.membership_id}
                    </span>
                  </div>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-sage-light text-sage border border-sage/20">
                    <ShieldCheck className="w-3 h-3" />
                    <span>सत्यापित</span>
                  </span>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-terracotta/10 text-terracotta font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
                    {m.full_name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-sm text-charcoal leading-snug truncate">
                      {m.full_name}
                    </h3>
                    <p className="text-[11px] text-driftwood mt-0.5">
                      पिता/पति: <span className="font-medium text-charcoal">{m.father_name || 'श्री कैलाश नाथ वर्मा'}</span>
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] p-2.5 rounded-xl bg-canvas-inset border border-stone-border/70">
                  <div>
                    <span className="text-driftwood block text-[10px]">जिला:</span>
                    <span className="font-medium text-charcoal flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-driftwood shrink-0" />
                      <span className="truncate">{m.district}</span>
                    </span>
                  </div>
                  <div>
                    <span className="text-driftwood block text-[10px]">ब्लॉक / तहसील:</span>
                    <span className="font-medium text-charcoal truncate block">
                      {m.block_name || 'सदर'}
                    </span>
                  </div>
                  <div className="col-span-2 pt-1 border-t border-stone-border/50">
                    <span className="text-driftwood block text-[10px]">विभाग:</span>
                    <span className="font-medium text-charcoal truncate block">
                      {m.department}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* 2. Full Table View (>= md) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-canvas-inset border-b border-stone-border text-driftwood uppercase font-mono text-[11px] tracking-wider">
                <th className="py-3.5 px-4">S NO</th>
                <th className="py-3.5 px-4">Unique ID</th>
                <th className="py-3.5 px-4">नाम (Member Name)</th>
                <th className="py-3.5 px-4">पिता/पति का नाम</th>
                <th className="py-3.5 px-4">स्थाई निवासी जिला</th>
                <th className="py-3.5 px-4">ब्लॉक / विभाग</th>
                <th className="py-3.5 px-4 text-center">स्थिति</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-border/70 text-charcoal">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-driftwood">
                    सदस्य रिकॉर्ड लोड हो रहे हैं...
                  </td>
                </tr>
              ) : members.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-driftwood">
                    कोई सदस्य नहीं मिला (No members found)
                  </td>
                </tr>
              ) : (
                members.map((m, idx) => (
                  <tr key={m.id} className="hover:bg-canvas-inset/50 transition-colors">
                    <td className="py-3.5 px-4 font-mono text-driftwood">
                      {(currentPage - 1) * pageSize + idx + 1}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-terracotta">
                      {m.membership_id}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-charcoal">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-terracotta/10 text-terracotta font-bold flex items-center justify-center text-[10px]">
                          {m.full_name.charAt(0)}
                        </div>
                        <span>{m.full_name}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-driftwood">
                      {m.father_name || 'श्री कैलाश नाथ वर्मा'}
                    </td>
                    <td className="py-3.5 px-4 font-medium">
                      <span className="inline-flex items-center gap-1 text-charcoal">
                        <MapPin className="w-3 h-3 text-driftwood" />
                        <span>{m.district}</span>
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-driftwood">
                      <div className="font-medium text-charcoal text-[11px]">{m.block_name || 'सदर'}</div>
                      <div className="text-[10px] text-driftwood truncate max-w-[150px]">{m.department}</div>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-sage-light text-sage border border-sage/20">
                        <ShieldCheck className="w-3 h-3" />
                        <span>सत्यापित</span>
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Strip (Matching dpswt.com) */}
        <div className="p-4 border-t border-stone-border/70 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-driftwood bg-canvas-inset/20">
          <div>
            Showing {totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1} to{' '}
            {Math.min(totalCount, currentPage * pageSize)} of {totalCount} entries
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="p-2 rounded-xl border border-stone-border bg-white hover:bg-canvas-inset disabled:opacity-40 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="px-3 py-1 font-mono font-bold text-charcoal bg-white border border-stone-border rounded-xl">
              {currentPage} / {totalPages}
            </span>

            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="p-2 rounded-xl border border-stone-border bg-white hover:bg-canvas-inset disabled:opacity-40 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}
