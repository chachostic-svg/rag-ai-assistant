'use client';

import React, { useState, useEffect } from 'react';
import { COURSES } from '@/data/mockData';
import { Send, CheckCircle2, ShieldCheck, Sparkles, X, Clock } from 'lucide-react';

interface EnrollFormProps {
  selectedCourse: string;
  onCourseChange: (course: string) => void;
}

export default function EnrollForm({ selectedCourse, onCourseChange }: EnrollFormProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [format, setFormat] = useState<
    | 'Очно (группа до 12 чел.)'
    | 'Онлайн (группа до 12 чел.)'
    | 'Индивидуально (1 на 1)'
  >('Очно (группа до 12 чел.)');
  const [day, setDay] = useState('Понедельник');
  const [time, setTime] = useState('15:30');
  const [comment, setComment] = useState('');
  const [agreement, setAgreement] = useState(true);

  const [errors, setErrors] = useState<{ name?: string; phone?: string; agreement?: string }>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // Auto-fill course if empty
  useEffect(() => {
    if (!selectedCourse && COURSES.length > 0) {
      onCourseChange(COURSES[0].title);
    }
  }, [selectedCourse, onCourseChange]);

  const validate = () => {
    const errs: { name?: string; phone?: string; agreement?: string } = {};
    if (!name.trim()) {
      errs.name = 'Пожалуйста, введите ваше имя';
    }
    if (!phone.trim() || phone.replace(/\D/g, '').length < 10) {
      errs.phone = 'Укажите корректный номер телефона (минимум 10 цифр)';
    }
    if (!agreement) {
      errs.agreement = 'Необходимо согласие на обработку персональных данных';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const res = await fetch('/api/enroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          phone,
          email,
          course: selectedCourse,
          format,
          day,
          time,
          comment,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.ok) {
        setSubmitError(
          data?.error || 'Не удалось сохранить запись. Попробуйте позже.'
        );
      } else {
        setShowModal(true);
      }
    } catch {
      setSubmitError('Ошибка сети при отправке заявки.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setName('');
    setPhone('');
    setEmail('');
    setComment('');
  };

  return (
    <section id="enroll" className="py-16 sm:py-24 bg-gradient-to-b from-slate-50 to-blue-50/40 dark:from-slate-900/60 dark:to-slate-950 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Info Column */}
          <div className="lg:col-span-5">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 text-xs sm:text-sm font-bold uppercase tracking-wider mb-4 border border-transparent dark:border-blue-800">
              <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Бесплатный первый шаг</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-6">
              Запишитесь на бесплатный пробный урок и диагностику
            </h2>

            <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed mb-8">
              Попробуйте обучение без рисков и обязательств! На первом занятии преподаватель определит сильные стороны и пробелы ученика, а также составит пошаговый план подготовки к экзаменам или олимпиадам.
            </p>

            {/* Benefit Checkmarks */}
            <div className="space-y-4 mb-8">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                    Бесплатное 60-минутное занятие
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    Знакомство с преподавателем и интерактивным форматом
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                    Детальная карта знаний
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    Письменный отчет методиста с прогнозом баллов на экзамене
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                    Скидка 10% на первый месяц
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    При заключении договора в день посещения пробного урока
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 bg-white/70 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>Ваши данные строго конфиденциальны и защищены ФЗ-152.</span>
            </div>
          </div>

          {/* Right Form Column */}
          <div className="lg:col-span-7">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-10 shadow-xl border border-slate-200/90 dark:border-slate-800 relative">
              <div className="mb-6">
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mb-1">
                  Заполните заявку
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                  Методист свяжется с вами в течение 15 минут для согласования удобного времени
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Name */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                    Ваше имя или имя ученика <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Например: Иван Смирнов"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (errors.name) setErrors({ ...errors, name: undefined });
                    }}
                    className={`w-full px-4 py-3 rounded-xl border text-sm text-slate-900 dark:text-white bg-white dark:bg-slate-800/80 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/30 ${
                      errors.name ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200 dark:border-slate-700 focus:border-blue-500'
                    }`}
                  />
                  {errors.name && (
                    <p className="text-xs text-rose-500 mt-1 font-medium">{errors.name}</p>
                  )}
                </div>

                {/* Phone & Email Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                      Телефон <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="tel"
                      placeholder="+7 (___) ___-__-__"
                      value={phone}
                      onChange={(e) => {
                        setPhone(e.target.value);
                        if (errors.phone) setErrors({ ...errors, phone: undefined });
                      }}
                      className={`w-full px-4 py-3 rounded-xl border text-sm text-slate-900 dark:text-white bg-white dark:bg-slate-800/80 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/30 ${
                        errors.phone ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200 dark:border-slate-700 focus:border-blue-500'
                      }`}
                    />
                    {errors.phone && (
                      <p className="text-xs text-rose-500 mt-1 font-medium">{errors.phone}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                      Email для расписания
                    </label>
                    <input
                      type="email"
                      placeholder="student@example.ru"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white bg-white dark:bg-slate-800/80 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                    />
                  </div>
                </div>

                {/* Course Selection */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                    Выберите интересующий курс <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={selectedCourse}
                    onChange={(e) => onCourseChange(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white bg-white dark:bg-slate-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 cursor-pointer"
                  >
                    {COURSES.map((course) => (
                      <option key={course.id} value={course.title}>
                        [{course.categoryName}] {course.title} — {course.price.toLocaleString('ru-RU')} ₽/мес
                      </option>
                    ))}
                  </select>
                </div>

                {/* Format Radio Selection */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                    Удобный формат обучения
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <button
                      type="button"
                      onClick={() => setFormat('Очно (группа до 12 чел.)')}
                      className={`py-2.5 px-3 rounded-xl text-xs font-bold border text-center transition-all cursor-pointer ${
                        format === 'Очно (группа до 12 чел.)'
                          ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-600 dark:border-blue-500 text-blue-700 dark:text-blue-300 shadow-xs'
                          : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                      }`}
                    >
                      🏢 Очно (группа до 12 чел.)
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormat('Онлайн (группа до 12 чел.)')}
                      className={`py-2.5 px-3 rounded-xl text-xs font-bold border text-center transition-all cursor-pointer ${
                        format === 'Онлайн (группа до 12 чел.)'
                          ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-600 dark:border-blue-500 text-blue-700 dark:text-blue-300 shadow-xs'
                          : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                      }`}
                    >
                      💻 Онлайн (группа до 12 чел.)
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormat('Индивидуально (1 на 1)')}
                      className={`py-2.5 px-3 rounded-xl text-xs font-bold border text-center transition-all cursor-pointer ${
                        format === 'Индивидуально (1 на 1)'
                          ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-600 dark:border-blue-500 text-blue-700 dark:text-blue-300 shadow-xs'
                          : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                      }`}
                    >
                      👤 Индивидуально (1 на 1)
                    </button>
                  </div>
                </div>

                {/* Day & Time Selection */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                      Удобный день недели
                    </label>
                    <select
                      value={day}
                      onChange={(e) => setDay(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white bg-white dark:bg-slate-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 cursor-pointer"
                    >
                      <option value="Понедельник">Понедельник</option>
                      <option value="Вторник">Вторник</option>
                      <option value="Среда">Среда</option>
                      <option value="Четверг">Четверг</option>
                      <option value="Пятница">Пятница</option>
                      <option value="Суббота">Суббота</option>
                      <option value="Воскресенье">Воскресенье</option>
                      <option value="По согласованию">По согласованию</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                      Предпочтительное время
                    </label>
                    <select
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white bg-white dark:bg-slate-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 cursor-pointer"
                    >
                      <option value="10:00">10:00</option>
                      <option value="11:30">11:30</option>
                      <option value="14:00">14:00</option>
                      <option value="15:30">15:30</option>
                      <option value="17:00">17:00</option>
                      <option value="18:30">18:30</option>
                      <option value="19:30">19:30</option>
                      <option value="По согласованию">По согласованию</option>
                    </select>
                  </div>
                </div>

                {/* Comment / Questions */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                    Комментарий или пожелания по времени
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Например: 10 класс, интересуют вечерние группы по вторникам и четвергам"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white bg-white dark:bg-slate-800/80 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 resize-none"
                  />
                </div>

                {/* Agreement Checkbox */}
                <div>
                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={agreement}
                      onChange={(e) => {
                        setAgreement(e.target.checked);
                        if (errors.agreement) setErrors({ ...errors, agreement: undefined });
                      }}
                      className="mt-1 w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-xs text-slate-500 dark:text-slate-400 leading-normal">
                      Я согласен на обработку персональных данных в соответствии с{' '}
                      <span className="text-blue-600 dark:text-blue-400 underline">Политикой конфиденциальности</span>
                    </span>
                  </label>
                  {errors.agreement && (
                    <p className="text-xs text-rose-500 mt-1 font-medium">{errors.agreement}</p>
                  )}
                </div>

                {submitError && (
                  <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-200 font-medium">
                    {submitError}
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-base shadow-lg shadow-blue-600/30 hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
                >
                  {isSubmitting ? (
                    <span>Отправка заявки...</span>
                  ) : (
                    <>
                      <span>Отправить заявку на пробный урок</span>
                      <Send className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Success Modal Popup */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative border border-slate-100 dark:border-slate-800 text-center animate-in zoom-in-95 duration-200">
            <button
              onClick={handleCloseModal}
              className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center mb-4">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-2">
              Заявка успешно принята!
            </h3>

            <p className="text-sm text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
              Спасибо, <strong>{name}</strong>! Мы зарезервировали место на пробное занятие по курсу:
              <br />
              <span className="inline-block font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 px-3 py-1 rounded-lg mt-2 text-xs">
                {selectedCourse} ({format})
              </span>
            </p>

            <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-4 border border-slate-100 dark:border-slate-700 text-left mb-6 text-xs text-slate-600 dark:text-slate-300 space-y-2">
              <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200">
                <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>Что произойдет дальше:</span>
              </div>
              <p>• Наш методист позвонит вам в течение 15 минут для подтверждения времени.</p>
              <p>• Мы вышлем на ваш номер памятку и карту проезда в центр.</p>
            </div>

            <button
              onClick={handleCloseModal}
              className="w-full py-3 px-4 rounded-xl bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-500 text-white font-bold text-sm transition-all"
            >
              Отлично, жду звонка
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
