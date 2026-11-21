'use client';

import React from 'react';
import Image from 'next/image';
import { CENTER_INFO } from '@/data/mockData';
import { Sparkles, ArrowRight, ShieldCheck, Star, Users, CheckCircle } from 'lucide-react';

export default function Hero() {
  const scrollTo = (id: string) => {
    const el = document.querySelector(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section id="hero" className="relative pt-6 pb-16 lg:pt-12 lg:pb-24 overflow-hidden">
      {/* Background ambient decorative glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-br from-blue-100/60 via-indigo-50/40 to-transparent dark:from-blue-950/30 dark:via-indigo-950/20 blur-3xl -z-10 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Headline and CTAs */}
          <div className="lg:col-span-7 flex flex-col items-start text-left">
            {/* Top Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200/80 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs sm:text-sm font-semibold mb-6 shadow-xs">
              <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400 animate-pulse" />
              <span>{CENTER_INFO.hero.badge}</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl xl:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.15] mb-6">
              Раскройте потенциал{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 dark:from-blue-400 dark:via-indigo-400 dark:to-blue-300">
                вашего ребенка
              </span>{' '}
              в сильном окружении
            </h1>

            {/* Description */}
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed mb-8 max-w-2xl font-normal">
              {CENTER_INFO.hero.description}
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto mb-10">
              <button
                onClick={() => scrollTo('#enroll')}
                className="px-7 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-base shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/35 transition-all hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-3 cursor-pointer"
              >
                <span>Записаться на пробный урок</span>
                <ArrowRight className="w-5 h-5" />
              </button>

              <button
                onClick={() => scrollTo('#courses')}
                className="px-7 py-4 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-100 font-bold text-base border border-slate-200 dark:border-slate-800 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Смотреть курсы</span>
              </button>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap items-center gap-6 pt-6 border-t border-slate-200/80 dark:border-slate-800 w-full text-slate-600 dark:text-slate-400 text-xs sm:text-sm">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <span className="font-semibold text-slate-800 dark:text-slate-200">Лицензия МинОбр</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <span className="font-semibold text-slate-800 dark:text-slate-200">Группы до 12 человек</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <span className="font-semibold text-slate-800 dark:text-slate-200">Эксперты ОГЭ/ЕГЭ</span>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Visual with Overlays */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              {/* Outer decorative ring */}
              <div className="absolute -inset-2 rounded-3xl bg-gradient-to-tr from-blue-500/20 to-indigo-500/20 blur-xl -z-10" />

              {/* Main Image Frame */}
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-white dark:border-slate-800 aspect-[4/3] bg-slate-100 dark:bg-slate-800">
                <Image
                  src={CENTER_INFO.hero.image}
                  alt="Аудитории учебного центра"
                  fill
                  sizes="(max-width: 1024px) 100vw, 500px"
                  className="object-cover object-center"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" />

                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <div className="inline-block px-3 py-1 rounded-md bg-blue-600/90 backdrop-blur-xs text-xs font-bold uppercase tracking-wider mb-1">
                    Учебный центр 2026
                  </div>
                  <p className="text-sm font-semibold drop-shadow-sm">
                    Современные классы, оборудованные лаборатории и комфорт
                  </p>
                </div>
              </div>

              {/* Floating Badge 1: Rating */}
              <div className="absolute -top-4 -left-4 sm:-left-6 bg-white dark:bg-slate-900 rounded-xl shadow-xl p-3 sm:p-4 border border-slate-100 dark:border-slate-800 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-500 flex items-center justify-center font-bold">
                  <Star className="w-6 h-6 fill-amber-400 text-amber-400" />
                </div>
                <div>
                  <div className="font-black text-slate-900 dark:text-white text-base flex items-center gap-1">
                    4.9 <span className="text-xs font-normal text-slate-500 dark:text-slate-400">/ 5.0</span>
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Рейтинг родителей</div>
                </div>
              </div>

              {/* Floating Badge 2: Budget admissions */}
              <div className="absolute -bottom-6 -right-4 sm:-right-6 bg-white dark:bg-slate-900 rounded-xl shadow-xl p-3 sm:p-4 border border-slate-100 dark:border-slate-800 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <span className="font-black text-base">98%</span>
                </div>
                <div>
                  <div className="font-bold text-slate-900 dark:text-white text-sm">Поступили на бюджет</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">МГУ, МФТИ, ВШЭ, Бауманка</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Global Key Stats Bar */}
        <div className="mt-14 pt-8 grid grid-cols-2 md:grid-cols-4 gap-6 bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200/80 dark:border-slate-800">
          {CENTER_INFO.stats.map((stat, idx) => (
            <div key={idx} className="flex flex-col items-center text-center px-4">
              <span className="text-3xl sm:text-4xl lg:text-5xl font-black text-blue-600 dark:text-blue-400 mb-1 tracking-tight">
                {stat.value}
              </span>
              <span className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
