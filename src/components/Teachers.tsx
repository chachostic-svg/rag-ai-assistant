'use client';

import React from 'react';
import Image from 'next/image';
import { TEACHERS } from '@/data/mockData';
import { Award, Briefcase, GraduationCap, CheckCircle, Quote } from 'lucide-react';

export default function Teachers() {
  return (
    <section id="teachers" className="py-16 sm:py-24 bg-slate-50/80 dark:bg-slate-900/60 border-y border-slate-200/60 dark:border-slate-800 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-xs sm:text-sm font-bold uppercase tracking-wider mb-4 border border-indigo-100 dark:border-indigo-800">
            Наша команда
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4">
            Преподаватели и наставники
          </h2>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
            Сильный преподавательский состав — наша главная гордость. Эксперты ЕГЭ, кандидаты наук и сертифицированные методисты с многолетним стажем работы.
          </p>
        </div>

        {/* Teachers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
          {TEACHERS.map((teacher) => (
            <div
              key={teacher.id}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-lg transition-all duration-300 p-6 sm:p-8 flex flex-col justify-between"
            >
              <div>
                {/* Top: Avatar, Name, Experience Pill */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 mb-6">
                  <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden shrink-0 border-2 border-indigo-100 dark:border-indigo-900 shadow-sm bg-slate-100 dark:bg-slate-800">
                    <Image
                      src={teacher.photo}
                      alt={teacher.name}
                      fill
                      sizes="120px"
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-xs font-bold mb-2">
                      <Briefcase className="w-3.5 h-3.5" />
                      <span>{teacher.experience}</span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white leading-snug">
                      {teacher.name}
                    </h3>
                    <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 mt-0.5">
                      {teacher.role}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1.5">
                      <GraduationCap className="w-4 h-4 text-slate-400 shrink-0" />
                      <span>{teacher.education}</span>
                    </p>
                  </div>
                </div>

                {/* Achievements Block */}
                <div className="mb-5 bg-slate-50 dark:bg-slate-800/60 rounded-xl p-4 border border-slate-100 dark:border-slate-800">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mb-2.5">
                    <Award className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                    <span>Достижения и квалификация:</span>
                  </div>
                  <ul className="space-y-1.5">
                    {teacher.achievements.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300">
                        <CheckCircle className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Results Block */}
                <div className="grid grid-cols-3 gap-2 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 dark:from-slate-800/80 dark:to-slate-800/80 rounded-xl p-3 border border-blue-100/60 dark:border-slate-700 text-center mb-6">
                  <div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Ср. результат</div>
                    <div className="font-extrabold text-blue-700 dark:text-blue-400 text-sm sm:text-base">
                      {teacher.results.avgScore}
                    </div>
                  </div>
                  <div className="border-x border-blue-200/50 dark:border-slate-700 px-1">
                    <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Стобалльники</div>
                    <div className="font-extrabold text-indigo-700 dark:text-indigo-400 text-sm sm:text-base">
                      {teacher.results.topScoreCount}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Бюджет</div>
                    <div className="font-extrabold text-emerald-700 dark:text-emerald-400 text-sm sm:text-base">
                      {teacher.results.budgetPercent.includes('%')
                        ? teacher.results.budgetPercent.split(' ')[0]
                        : 'Топ ВУЗы'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Teacher Quote */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-start gap-2.5 text-xs sm:text-sm italic text-slate-600 dark:text-slate-400">
                <Quote className="w-5 h-5 text-indigo-400 dark:text-indigo-400 shrink-0 mt-0.5" />
                <span>{teacher.quote}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
