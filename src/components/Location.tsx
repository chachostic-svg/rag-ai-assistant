'use client';

import React from 'react';
import { LOCATION_INFO } from '@/data/mockData';
import { MapPin, Navigation, Clock, Car, Train, Building, CheckCircle2 } from 'lucide-react';

export default function Location() {
  return (
    <section id="location" className="py-16 sm:py-24 bg-white dark:bg-slate-950 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-xs sm:text-sm font-bold uppercase tracking-wider mb-4 border border-blue-100 dark:border-blue-800">
            <MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>Локация и транспорт</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4">
            Удобное расположение в самом центре
          </h2>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
            Мы находимся в 2 минутах от метро с собственной охраняемой парковкой и комфортной зоной ожидания для родителей.
          </p>
        </div>

        {/* Content Layout: Info Card + Interactive Map */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Info Side (5 cols) */}
          <div className="lg:col-span-5 flex flex-col justify-between bg-slate-50/80 dark:bg-slate-900/80 rounded-3xl p-6 sm:p-8 border border-slate-200/90 dark:border-slate-800 shadow-xs">
            <div>
              {/* Address Box */}
              <div className="flex items-start gap-4 mb-6 pb-6 border-b border-slate-200 dark:border-slate-800">
                <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-blue-500/20">
                  <Building className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-0.5">
                    Адрес центра
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    {LOCATION_INFO.city}, {LOCATION_INFO.address}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                    {LOCATION_INFO.office}
                  </p>
                </div>
              </div>

              {/* Metro Stations */}
              <div className="mb-6 pb-6 border-b border-slate-200 dark:border-slate-800">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3 flex items-center gap-1.5">
                  <Train className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                  <span>Ближайшие станции метро:</span>
                </div>
                <div className="space-y-2">
                  {LOCATION_INFO.metro.map((m, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between text-xs sm:text-sm bg-white dark:bg-slate-800/80 p-2.5 rounded-xl border border-slate-200/70 dark:border-slate-700"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                        <span className="font-bold text-slate-800 dark:text-slate-200">м. {m.station}</span>
                        <span className="text-slate-400 dark:text-slate-500 text-xs hidden sm:inline">({m.line})</span>
                      </div>
                      <span className="text-blue-600 dark:text-blue-400 font-semibold text-xs">{m.walkTime}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Working Hours */}
              <div className="mb-6 pb-6 border-b border-slate-200 dark:border-slate-800">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                  <span>График работы:</span>
                </div>
                <div className="space-y-1.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                  {LOCATION_INFO.workingHours.map((h, i) => (
                    <div key={i} className="flex justify-between">
                      <span className="text-slate-500 dark:text-slate-400">{h.days}:</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{h.hours}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Parking */}
              <div className="flex items-start gap-3 bg-amber-50/70 dark:bg-amber-950/40 p-3.5 rounded-xl border border-amber-200/60 dark:border-amber-800/60 mb-6">
                <Car className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div className="text-xs text-amber-900 dark:text-amber-200 leading-relaxed">
                  <strong className="block mb-0.5">Бесплатная парковка:</strong>
                  {LOCATION_INFO.parking}
                </div>
              </div>
            </div>

            {/* Amenities list */}
            <div className="space-y-2 pt-2">
              {LOCATION_INFO.amenities.map((a, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                  <span>{a}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Map Side (7 cols) */}
          <div className="lg:col-span-7 flex flex-col min-h-[420px] rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm relative bg-slate-100 dark:bg-slate-900">
            {/* Embedded interactive OpenStreetMap */}
            <iframe
              title="Интерактивная карта учебного центра"
              src="https://www.openstreetmap.org/export/embed.html?bbox=37.5950%2C55.7600%2C37.6160%2C55.7700&amp;layer=mapnik&amp;marker=55.7649%2C37.6055"
              className="w-full h-full min-h-[420px] border-0"
              loading="lazy"
            />

            {/* Map Overlay Card Badge */}
            <div className="absolute top-4 left-4 right-4 sm:right-auto sm:max-w-xs bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2 font-black text-slate-900 dark:text-white text-sm mb-1">
                <MapPin className="w-4 h-4 text-rose-500 fill-rose-500" />
                <span>Академия Будущего</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">
                ул. Тверская, 18к1 (БЦ «Тверской Пассаж», 4 этаж)
              </p>
              <a
                href="https://yandex.ru/maps/?text=Москва+Тверская+18к1"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 underline"
              >
                <Navigation className="w-3 h-3" />
                <span>Открыть маршрут в Яндекс.Картах</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
