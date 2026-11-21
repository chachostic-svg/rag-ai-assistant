'use client';

import React from 'react';
import { CENTER_INFO, CONTACTS_INFO } from '@/data/mockData';
import { GraduationCap, ArrowUp } from 'lucide-react';

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navLinks = [
    { name: 'Главная', href: '#hero' },
    { name: 'О нас', href: '#about' },
    { name: 'Курсы', href: '#courses' },
    { name: 'Преподаватели', href: '#teachers' },
    { name: 'Результаты', href: '#results' },
    { name: 'Геолокация', href: '#location' },
    { name: 'Контакты', href: '#contacts' },
  ];

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <footer className="bg-slate-950 text-slate-400 text-xs py-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-10 border-b border-slate-800/80">
          {/* Col 1: Brand Info (5 cols) */}
          <div className="md:col-span-5">
            <div className="flex items-center gap-2.5 text-white font-extrabold text-lg mb-3">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                <GraduationCap className="w-5 h-5" />
              </div>
              <span>{CENTER_INFO.name}</span>
            </div>
            <p className="text-slate-400 leading-relaxed mb-4 max-w-sm">
              {CENTER_INFO.tagline}. Индивидуальный подход, качественная подготовка к ОГЭ, ЕГЭ и олимпиадам в группах до 12 человек.
            </p>
            <p className="text-slate-500 text-[11px] leading-relaxed">
              {CENTER_INFO.license}
            </p>
          </div>

          {/* Col 2: Navigation Links (4 cols) */}
          <div className="md:col-span-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
              Навигация по разделам
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={(e) => handleLinkClick(e, link.href)}
                  className="hover:text-blue-400 transition-colors py-1 text-slate-300"
                >
                  {link.name}
                </a>
              ))}
            </div>
          </div>

          {/* Col 3: Programs & Action (3 cols) */}
          <div className="md:col-span-3 flex flex-col justify-between">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
                Ключевые предметы
              </h4>
              <ul className="space-y-1.5 text-slate-300">
                <li>• Профильная математика</li>
                <li>• Английский язык (IELTS/Speaking)</li>
                <li>• Информатика (КЕГЭ & Python)</li>
                <li>• Олимпиадная логика 5–8 классы</li>
              </ul>
            </div>

            <button
              onClick={scrollToTop}
              className="mt-6 inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer self-start"
            >
              <span>Наверх</span>
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Legal */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <div>
            © 2026 {CENTER_INFO.name}. Все права защищены.
          </div>
          <div className="flex items-center gap-6">
            <span className="hover:text-slate-400 cursor-pointer">
              Политика конфиденциальности
            </span>
            <span className="hover:text-slate-400 cursor-pointer">
              Договор оферты
            </span>
            <span className="hover:text-slate-400 cursor-pointer">
              Сведения об образовательной организации
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
