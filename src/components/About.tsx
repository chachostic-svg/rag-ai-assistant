'use client';

import React from 'react';
import Image from 'next/image';
import { CENTER_INFO } from '@/data/mockData';
import { Users, Award, Laptop, CheckCircle2, ShieldCheck, HeartHandshake } from 'lucide-react';

export default function About() {
  const iconMap: Record<string, React.ReactNode> = {
    Users: <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />,
    Award: <Award className="w-6 h-6 text-amber-500 dark:text-amber-400" />,
    Laptop: <Laptop className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />,
    CheckCircle2: <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />,
  };

  return (
    <section id="about" className="py-16 sm:py-24 bg-slate-50/70 dark:bg-slate-900/50 border-y border-slate-200/60 dark:border-slate-800 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-100/70 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 text-xs sm:text-sm font-bold uppercase tracking-wider mb-4 border border-transparent dark:border-blue-800">
            О нашем центре
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4">
            {CENTER_INFO.about.title}
          </h2>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
            {CENTER_INFO.about.subtitle}
          </p>
        </div>

        {/* Story & Philosophy Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center mb-16">
          <div className="lg:col-span-6 relative">
            <div className="relative rounded-2xl overflow-hidden shadow-xl aspect-[16/10] bg-slate-200 dark:bg-slate-800">
              <Image
                src="https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=1000&q=80"
                alt="Учебный процесс в Академии Будущего"
                fill
                sizes="(max-width: 1024px) 100vw, 600px"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <div className="text-sm font-bold drop-shadow">
                  Индивидуальный подход к каждому ученику с 2017 года
                </div>
              </div>
            </div>

            <div className="hidden sm:flex absolute -bottom-5 -right-5 bg-white dark:bg-slate-900 p-4 rounded-xl shadow-lg border border-slate-200 dark:border-slate-800 items-center gap-3">
              <HeartHandshake className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              <div>
                <div className="font-bold text-slate-900 dark:text-white text-sm">96% учеников</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">рекомендуют нас друзьям</div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 flex flex-col justify-center">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
              Мы учим мыслить свободно, системно и смело
            </h3>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
              {CENTER_INFO.about.story}
            </p>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
              Вместо механической зубрежки типовых тестов мы прививаем фундаментальную базу, объясняем логические взаимосвязи и формируем культуру самостоятельного поиска решений. Такой подход позволяет нашим ребятам не только блестяще сдавать ОГЭ, ЕГЭ и международные сертификации, но и легко учиться на бюджетных отделениях лучших университетов.
            </p>

            <div className="p-4 rounded-xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-900 flex items-start gap-3">
              <ShieldCheck className="w-6 h-6 text-blue-700 dark:text-blue-400 shrink-0 mt-0.5" />
              <div className="text-xs sm:text-sm text-blue-900 dark:text-blue-200">
                <span className="font-bold block mb-0.5">Официальная государственная лицензия:</span>
                {CENTER_INFO.license}. Вы можете оплачивать обучение материнским капиталом и получать налоговый вычет 13%.
              </div>
            </div>
          </div>
        </div>

        {/* 4 Pillars of Success */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {CENTER_INFO.about.values.map((item, index) => (
            <div
              key={index}
              className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-xs hover:shadow-md transition-shadow border border-slate-200/80 dark:border-slate-800 flex flex-col items-start"
            >
              <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-5">
                {iconMap[item.icon] || <CheckCircle2 className="w-6 h-6 text-blue-600" />}
              </div>
              <h4 className="font-bold text-lg text-slate-900 dark:text-white mb-2">
                {item.title}
              </h4>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
