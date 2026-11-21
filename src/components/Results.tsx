'use client';

import React from 'react';
import Image from 'next/image';
import { STUDENT_RESULTS } from '@/data/mockData';
import { Trophy, Star, Sparkles, Building2, CheckCircle } from 'lucide-react';

export default function Results() {
  return (
    <section id="results" className="py-16 sm:py-24 bg-white dark:bg-slate-950 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-xs sm:text-sm font-bold uppercase tracking-wider mb-4 border border-amber-200/60 dark:border-amber-800">
            <Trophy className="w-4 h-4 text-amber-500" />
            <span>Гордость центра</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4">
            Лучшие результаты наших учеников
          </h2>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
            Реальные истории ребят, которые пришли к нам за знаниями и уверенностью, набрали рекордные баллы и поступили на бюджетные места мечты.
          </p>
        </div>

        {/* Results Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {STUDENT_RESULTS.map((student) => (
            <div
              key={student.id}
              className="group bg-slate-50/70 dark:bg-slate-900/80 hover:bg-white dark:hover:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 hover:border-blue-200 dark:hover:border-blue-700 p-6 flex flex-col justify-between transition-all duration-300 hover:shadow-xl"
            >
              <div>
                {/* Header: Avatar, Name, Year */}
                <div className="flex items-center gap-3.5 mb-4">
                  <div className="relative w-14 h-14 rounded-full overflow-hidden shrink-0 border-2 border-white dark:border-slate-800 shadow-sm bg-slate-200 dark:bg-slate-800">
                    <Image
                      src={student.photo}
                      alt={student.name}
                      fill
                      sizes="60px"
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-base leading-tight">
                      {student.name}
                    </h3>
                    <div className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                      {student.year}
                    </div>
                  </div>
                </div>

                {/* Score Pill Badge */}
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-100/70 dark:bg-amber-950/70 text-amber-900 dark:text-amber-300 font-extrabold text-xs mb-4 shadow-xs">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                  <span>{student.score}</span>
                </div>

                {/* University Destination */}
                <div className="mb-4 bg-white/80 dark:bg-slate-800/80 rounded-xl p-3 border border-slate-200/60 dark:border-slate-700">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400 flex items-center gap-1 mb-1">
                    <Building2 className="w-3.5 h-3.5" />
                    <span>Поступление:</span>
                  </div>
                  <div className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">
                    {student.university}
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 line-clamp-1">
                    {student.faculty}
                  </div>
                  {student.isBudget && (
                    <div className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md">
                      <CheckCircle className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                      <span>Бюджетная основа</span>
                    </div>
                  )}
                </div>

                {/* Student Testimonial */}
                <p className="text-xs text-slate-600 dark:text-slate-300 italic leading-relaxed line-clamp-4">
                  «{student.testimonial}»
                </p>
              </div>

              {/* Bottom Stars */}
              <div className="pt-4 mt-4 border-t border-slate-200/50 dark:border-slate-800 flex items-center gap-1 text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Banner Callout */}
        <div className="mt-14 rounded-2xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 dark:from-slate-900 dark:via-blue-950 dark:to-slate-900 p-8 sm:p-10 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl border border-transparent dark:border-slate-800">
          <div className="max-w-2xl text-center md:text-left">
            <h3 className="text-2xl sm:text-3xl font-extrabold mb-2">
              Хотите, чтобы ваш ребенок был среди них?
            </h3>
            <p className="text-slate-300 text-sm sm:text-base">
              Запишитесь на бесплатную диагностику знаний. Определим текущий уровень, подберем программу и составим индивидуальный план подготовки.
            </p>
          </div>
          <a
            href="#enroll"
            className="px-6 py-3.5 rounded-xl bg-blue-500 hover:bg-blue-400 text-white font-bold text-sm shadow-md transition-all shrink-0 cursor-pointer"
          >
            Записаться на диагностику
          </a>
        </div>
      </div>
    </section>
  );
}
