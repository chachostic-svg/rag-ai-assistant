'use client';

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import About from '@/components/About';
import Courses from '@/components/Courses';
import Teachers from '@/components/Teachers';
import Results from '@/components/Results';
import EnrollForm from '@/components/EnrollForm';
import Location from '@/components/Location';
import Contacts from '@/components/Contacts';
import Footer from '@/components/Footer';
import RagAssistant from '@/components/RagAssistant';
import { COURSES } from '@/data/mockData';
import { ThemeProvider } from '@/context/ThemeContext';

export default function Home() {
  const [selectedCourse, setSelectedCourse] = useState<string>(COURSES[0].title);

  return (
    <ThemeProvider>
      <div className="min-h-screen flex flex-col w-full overflow-x-hidden bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
        {/* 1. Header & Navigation */}
        <Navbar />

        <main className="flex-grow">
          {/* 2. Hero Section: photo, brief info, CTAs & stats */}
          <Hero />

          {/* 3. About Us Section */}
          <About />

          {/* 4. Courses Section: Math, English, IT with category tabs */}
          <Courses onSelectCourse={(courseTitle) => setSelectedCourse(courseTitle)} />

          {/* 5. Teachers Section: experience, achievements, results */}
          <Teachers />

          {/* 6. Best Student Results: exam scores, universities, reviews */}
          <Results />

          {/* 7. Course Enrollment Form with validation and popup modal */}
          <EnrollForm
            selectedCourse={selectedCourse}
            onCourseChange={(course) => setSelectedCourse(course)}
          />

          {/* 8. Geolocation Section: map, address, metro, working hours */}
          <Location />

          {/* 9. Contacts Section: phone numbers, messengers, socials */}
          <Contacts />
        </main>

        {/* 10. Footer */}
        <Footer />

        {/* 11. RAG AI Assistant (gemini-3.5-flash-lite) */}
        <RagAssistant />
      </div>
    </ThemeProvider>
  );
}
