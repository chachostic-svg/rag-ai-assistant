'use client';

import React from 'react';
import { CONTACTS_INFO, LOCATION_INFO } from '@/data/mockData';
import { Phone, Mail, Send, MessageCircle, Share2, Clock, MapPin, Headphones } from 'lucide-react';

export default function Contacts() {
  return (
    <section id="contacts" className="py-16 sm:py-24 bg-slate-900 text-white relative overflow-hidden">
      {/* Decorative ambient gradients */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/20 text-blue-300 text-xs sm:text-sm font-bold uppercase tracking-wider mb-4 border border-blue-500/30">
            <Headphones className="w-4 h-4 text-blue-400" />
            <span>Всегда на связи</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-4">
            Контакты учебного центра
          </h2>
          <p className="text-base sm:text-lg text-slate-400 leading-relaxed">
            Позвоните нам или напишите в удобный мессенджер — наши методисты подробно проконсультируют по программам, стоимости и расписанию занятий.
          </p>
        </div>

        {/* Contact Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {/* Card 1: Phone */}
          <div className="bg-slate-800/80 rounded-2xl p-6 border border-slate-700/80 flex flex-col justify-between hover:border-blue-500/50 transition-colors">
            <div>
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center mb-4">
                <Phone className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white mb-1">Телефоны центра</h3>
              <p className="text-xs text-slate-400 mb-4">Бесплатная консультация</p>
              <div className="space-y-2">
                {CONTACTS_INFO.phones.map((phone, i) => (
                  <div key={i}>
                    <a
                      href={phone.link}
                      className="text-sm sm:text-base font-bold text-white hover:text-blue-400 transition-colors block"
                    >
                      {phone.display}
                    </a>
                    <span className="text-[11px] text-slate-400">{phone.label}</span>
                  </div>
                ))}
              </div>
            </div>
            <a
              href={CONTACTS_INFO.phones[0].link}
              className="mt-6 inline-flex items-center justify-center w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-colors"
            >
              Позвонить сейчас
            </a>
          </div>

          {/* Card 2: Telegram */}
          <div className="bg-slate-800/80 rounded-2xl p-6 border border-slate-700/80 flex flex-col justify-between hover:border-sky-500/50 transition-colors">
            <div>
              <div className="w-12 h-12 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center mb-4">
                <Send className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white mb-1">Telegram</h3>
              <p className="text-xs text-slate-400 mb-4">Быстрые ответы методиста</p>
              <p className="text-sm font-semibold text-slate-300">
                Задайте вопрос в нашем официальном чате или боте
              </p>
              <span className="text-xs text-sky-400 font-mono mt-2 block">
                {CONTACTS_INFO.messengers[0].handle}
              </span>
            </div>
            <a
              href={CONTACTS_INFO.messengers[0].link}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center justify-center w-full py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs transition-colors"
            >
              Написать в Telegram
            </a>
          </div>

          {/* Card 3: WhatsApp */}
          <div className="bg-slate-800/80 rounded-2xl p-6 border border-slate-700/80 flex flex-col justify-between hover:border-emerald-500/50 transition-colors">
            <div>
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4">
                <MessageCircle className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white mb-1">WhatsApp</h3>
              <p className="text-xs text-slate-400 mb-4">Чат с дежурным куратором</p>
              <p className="text-sm font-semibold text-slate-300">
                Отправка расписания, договоров и персональных программ
              </p>
              <span className="text-xs text-emerald-400 font-mono mt-2 block">
                {CONTACTS_INFO.messengers[1].handle}
              </span>
            </div>
            <a
              href={CONTACTS_INFO.messengers[1].link}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center justify-center w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors"
            >
              Написать в WhatsApp
            </a>
          </div>

          {/* Card 4: Email & Office */}
          <div className="bg-slate-800/80 rounded-2xl p-6 border border-slate-700/80 flex flex-col justify-between hover:border-indigo-500/50 transition-colors">
            <div>
              <div className="w-12 h-12 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center mb-4">
                <Mail className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white mb-1">Электронная почта</h3>
              <p className="text-xs text-slate-400 mb-4">Для официальных запросов</p>
              <a
                href={`mailto:${CONTACTS_INFO.email}`}
                className="text-sm sm:text-base font-bold text-white hover:text-indigo-400 transition-colors block break-all"
              >
                {CONTACTS_INFO.email}
              </a>
              <div className="mt-3 text-xs text-slate-400 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span>Отвечаем в течение 1 рабочего часа</span>
              </div>
            </div>
            <a
              href={`mailto:${CONTACTS_INFO.email}`}
              className="mt-6 inline-flex items-center justify-center w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-colors"
            >
              Написать на Email
            </a>
          </div>
        </div>

        {/* Bottom Banner with Metro & Schedule Reminder */}
        <div className="bg-slate-800/40 rounded-2xl p-6 border border-slate-700/50 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs sm:text-sm text-slate-400">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-blue-400 shrink-0" />
            <span>
              {LOCATION_INFO.city}, {LOCATION_INFO.address} ({LOCATION_INFO.office})
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Пн-Сб: 09:00 — 21:00, Вс: 10:00 — 18:00</span>
          </div>
        </div>
      </div>
    </section>
  );
}
