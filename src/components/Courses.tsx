'use client';

import React, { useState } from 'react';
import { COURSES } from '@/data/mockData';
import { BookOpen, Clock, Calendar, Check, ArrowRight, Flame } from 'lucide-react';

interface CoursesProps {
  onSelectCourse?: (courseTitle: string) => void;
}

export default function Courses({ onSelectCourse }: CoursesProps) {
  const [activeCategory, setActiveCategory] = useState<'all' | 'math' | 'english' | 'it'>('all');

  const categories = [
    { id: 'all', name: 'Все направления' },
    { id: 'math', name: 'Математика' },
    { id: 'english', name: 'Английский язык' },
    { id: 'it', name: 'Информатика & IT' },
  ];

  const filteredCourses =
    activeCategory === 'all'
      ? COURSES
      : COURSES.filter((c) => c.category === activeCategory);

  const handleEnrollClick = (courseTitle: string) => {
    if (onSelectCourse) {
      onSelectCourse(courseTitle);
    }
    const enrollSection = document.querySelector('#enroll');
    if (enrollSection) {
      enrollSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const getCategoryTheme = (category: string) => {
    switch (category) {
      case 'math':
        return {
          badge: 'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800',
          button: 'bg-blue-600 hover:bg-blue-700 text-white',
          accent: 'text-blue-600 dark:text-blue-400',
        };
      case 'english':
        return {
          badge: 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
          button: 'bg-emerald-600 hover:bg-emerald-700 text-white',
          accent: 'text-emerald-600 dark:text-emerald-400',
        };
      case 'it':
        return {
          badge: 'bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
          button: 'bg-indigo-600 hover:bg-indigo-700 text-white',
          accent: 'text-indigo-600 dark:text-indigo-400',
        };
      default:
        return {
          badge: 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700',
          button: 'bg-blue-600 hover:bg-blue-700 text-white',
          accent: 'text-blue-600 dark:text-blue-400',
        };
    }
  };

  return (
    <section id="courses" className="py-16 sm:py-24 bg-white dark:bg-slate-950 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-xs sm:text-sm font-bold uppercase tracking-wider mb-4 border border-blue-100 dark:border-blue-800">
            Каталог программ 2026
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4">
            Наши ключевые курсы
          </h2>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
            Фундаментальная подготовка по математике, английскому и программированию. Выберите интересующее направление для старта:
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-12">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id as any)}
              className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                activeCategory === cat.id
                  ? 'bg-slate-900 dark:bg-blue-600 text-white shadow-md shadow-slate-900/20 dark:shadow-blue-600/30 scale-105'
                  : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCourses.map((course) => {
            const theme = getCategoryTheme(course.category);
            return (
              <div
                key={course.id}
                className="group relative flex flex-col justify-between bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-300 p-6 sm:p-7 overflow-hidden"
              >
                {/* Popular Flag */}
                {course.isPopular && (
                  <div className="absolute top-0 right-0 bg-gradient-to-l from-amber-500 to-orange-500 text-white text-[11px] font-black uppercase tracking-wider py-1.5 px-4 rounded-bl-xl shadow-xs flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 fill-white" />
                    <span>Популярный</span>
                  </div>
                )}

                {/* Top Section */}
                <div>
                  {/* Category & Badge */}
                  <div className="flex items-center gap-2 mb-3">
                    <span
                      className={`text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-md border ${theme.badge}`}
                    >
                      {course.categoryName}
                    </span>
                    {course.badge && !course.isPopular && (
                      <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                        {course.badge}
                      </span>
                    )}
                  </div>

                  {/* Course Title */}
                  <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-snug">
                    {course.title}
                  </h3>

                  {/* Short Description */}
                  <p className="text-sm text-slate-600 dark:text-slate-300 mb-6 leading-relaxed line-clamp-3">
                    {course.description}
                  </p>

                  {/* Course Info Specs */}
                  <div className="space-y-2.5 mb-6 text-xs sm:text-sm text-slate-600 dark:text-slate-400 pb-6 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2.5">
                      <BookOpen className="w-4 h-4 text-slate-400 shrink-0" />
                      <span>
                        <strong className="text-slate-800 dark:text-slate-200">Уровень:</strong> {course.level}
                      </span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                      <span>
                        <strong className="text-slate-800 dark:text-slate-200">Длительность:</strong> {course.duration}
                      </span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                      <span>
                        <strong className="text-slate-800 dark:text-slate-200">Формат:</strong> {course.format}
                      </span>
                    </div>
                  </div>

                  {/* Highlights Bullet List */}
                  <div className="mb-6 space-y-2">
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
                      Что входит в программу:
                    </div>
                    {course.highlights.map((h, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300">
                        <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{h}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bottom Section: Price & Action */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 mt-auto">
                  <div className="flex items-baseline justify-between mb-4">
                    <div>
                      <span className="text-2xl font-black text-slate-900 dark:text-white">
                        {course.price.toLocaleString('ru-RU')} ₽
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-medium ml-1">/ месяц</span>
                    </div>
                    {course.originalPrice && (
                      <span className="text-xs text-slate-400 dark:text-slate-500 line-through">
                        {course.originalPrice.toLocaleString('ru-RU')} ₽
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => handleEnrollClick(course.title)}
                    className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Записаться на курс</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
