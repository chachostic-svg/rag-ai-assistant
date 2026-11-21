'use client';

import React, { useState, useEffect } from 'react';
import { Menu, X, Phone, GraduationCap, ArrowRight } from 'lucide-react';
import { CONTACTS_INFO } from '@/data/mockData';
import ThemeToggle from '@/components/ThemeToggle';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'О нас', href: '#about' },
    { name: 'Курсы', href: '#courses' },
    { name: 'Преподаватели', href: '#teachers' },
    { name: 'Результаты', href: '#results' },
    { name: 'Геолокация', href: '#location' },
    { name: 'Контакты', href: '#contacts' },
  ];

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setIsOpen(false);
    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-md py-3 border-b border-slate-200 dark:border-slate-800'
          : 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm py-4 border-b border-slate-100 dark:border-slate-800/60'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <a
            href="#hero"
            onClick={(e) => handleLinkClick(e, '#hero')}
            className="flex items-center gap-3 group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
                Академия<span className="text-blue-600 dark:text-blue-400">Будущего</span>
              </span>
              <span className="text-[11px] uppercase tracking-wider block text-slate-500 dark:text-slate-400 font-medium">
                Учебный центр
              </span>
            </div>
          </a>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => handleLinkClick(e, link.href)}
                className="px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50/60 dark:hover:bg-slate-800/80 transition-colors"
              >
                {link.name}
              </a>
            ))}
          </nav>

          {/* Theme Toggle, Phone & CTA Button */}
          <div className="hidden sm:flex items-center gap-3">
            {/* Theme Toggle Button */}
            <ThemeToggle />

            <a
              href={CONTACTS_INFO.phones[0].link}
              className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-slate-800 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <Phone className="w-4 h-4" />
              </div>
              <span>{CONTACTS_INFO.phones[0].display}</span>
            </a>

            <a
              href="#enroll"
              onClick={(e) => handleLinkClick(e, '#enroll')}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-md shadow-blue-600/25 transition-all hover:shadow-lg hover:shadow-blue-600/35 hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2"
            >
              <span>Записаться</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>

          {/* Mobile Menu & Theme Button */}
          <div className="flex sm:hidden items-center gap-2">
            <ThemeToggle />
            <a
              href="#enroll"
              onClick={(e) => handleLinkClick(e, '#enroll')}
              className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold"
            >
              Запись
            </a>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Переключить меню"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isOpen && (
        <div className="sm:hidden border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-4 pt-3 pb-6 animate-in fade-in slide-in-from-top-4 duration-200">
          <nav className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => handleLinkClick(e, link.href)}
                className="px-4 py-3 rounded-lg text-base font-semibold text-slate-800 dark:text-slate-100 hover:bg-blue-50 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                {link.name}
              </a>
            ))}
            <div className="pt-4 mt-2 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-3">
              <a
                href={CONTACTS_INFO.phones[0].link}
                className="flex items-center gap-3 px-4 py-2 text-sm font-bold text-slate-700 dark:text-slate-200"
              >
                <Phone className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>{CONTACTS_INFO.phones[0].display}</span>
              </a>
              <a
                href="#enroll"
                onClick={(e) => handleLinkClick(e, '#enroll')}
                className="w-full text-center py-3 rounded-xl bg-blue-600 text-white font-semibold text-sm shadow-md"
              >
                Записаться на пробный урок
              </a>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
