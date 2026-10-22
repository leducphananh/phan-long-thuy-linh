'use client';

import React from 'react';
import { Heart, Sparkles, Quote } from 'lucide-react';
import { WeddingStory } from '../types/wedding';
import { weddingStoryData } from '../data/weddingData';
import { ScrollReveal } from './ScrollReveal';

interface StoryProps {
  story?: WeddingStory;
  milestones?: any[]; // Kept for backwards compatibility
}

export const Story: React.FC<StoryProps> = ({ story = weddingStoryData }) => {
  return (
    <section id="story" className="relative py-24 sm:py-32 px-4 sm:px-6 overflow-hidden">
      {/* Scenic Bright Backdrop with real couple photo */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <img
          src="/images/wedding/optimized/_DSC2387.jpg"
          alt="Phan Long & Thùy Linh backdrop"
          className="w-full h-full object-cover object-center filter blur-[3px] opacity-15 transform scale-105"
        />
        {/* Soft, warm, bright scrim */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#FFFDFB]/95 via-[#FFFDFB]/85 to-[#FFFDFB]/95" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Section Header */}
        <ScrollReveal animation="fade-up" duration={700}>
          <div className="text-center mb-16 sm:mb-20">
            <p className="font-script text-3xl sm:text-4xl text-rose-500 mb-1">
              {story.subtitle || 'Our Love Story'}
            </p>
            <h2 className="font-serif text-3xl sm:text-5xl font-bold text-stone-900 tracking-tight text-balance">
              {story.title || 'Chuyện Chúng Mình'}
            </h2>
            <div className="mt-4 flex items-center justify-center gap-3">
              <div className="h-px w-12 bg-rose-300" />
              <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
              <div className="h-px w-12 bg-rose-300" />
            </div>
            <p className="mt-4 text-sm sm:text-base text-stone-600 max-w-xl mx-auto leading-relaxed font-medium">
              Không cần những lời thề non hẹn biển xa xôi, hành trình của chúng mình là sự đồng điệu của hai tâm hồn, cùng nhau sẻ chia từng khoảnh khắc bình yên và bước vào hôn nhân bằng cả trái tim.
            </p>
          </div>
        </ScrollReveal>

        {/* Unified Story Content Card - Editorial Magazine Layout */}
        <ScrollReveal animation="fade-up" delay={150} duration={800}>
          <div className="bg-white/95 backdrop-blur-md rounded-3xl p-6 sm:p-10 lg:p-14 border border-rose-100/90 shadow-xl relative overflow-hidden">
            {/* Subtle vintage gold corner ornamentation */}
            <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-rose-300/60 rounded-tl-3xl m-3 pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-rose-300/60 rounded-br-3xl m-3 pointer-events-none" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
              {/* Left Column: Visual Collage of Real Wedding Photos */}
              <div className="lg:col-span-5 relative">
                {/* Main Featured Photo */}
                <div className="relative mx-auto max-w-sm sm:max-w-md lg:max-w-none">
                  <div className="relative overflow-hidden rounded-3xl bg-stone-100 shadow-2xl border-4 border-white aspect-4/5 group">
                    <img
                      src={story.featuredImages?.[0]?.url || '/images/wedding/optimized/_DSC3182.jpg'}
                      alt={story.featuredImages?.[0]?.alt || 'Phan Long & Thùy Linh'}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-stone-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-5 text-white">
                      <p className="text-xs font-serif italic">
                        {story.featuredImages?.[0]?.caption || 'Khoảnh khắc trao lời thề nguyện'}
                      </p>
                    </div>
                  </div>

                  {/* Secondary Floating Overlap Card */}
                  <div className="absolute -bottom-6 -right-3 sm:-bottom-8 sm:-right-6 w-36 sm:w-48 overflow-hidden rounded-2xl bg-white p-2 shadow-xl border border-rose-100 hidden xs:block">
                    <div className="overflow-hidden rounded-xl aspect-4/3">
                      <img
                        src={story.featuredImages?.[1]?.url || '/images/wedding/optimized/_DSC2387.jpg'}
                        alt={story.featuredImages?.[1]?.alt || 'Khoảnh khắc ngọt ngào'}
                        loading="lazy"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <p className="mt-1.5 text-[10px] sm:text-xs text-center font-serif text-rose-700 font-semibold truncate">
                      Bên nhau trọn đời
                    </p>
                  </div>

                  {/* Decorative Love Badge */}
                  <div className="absolute -top-4 -left-3 sm:-left-4 bg-white/95 backdrop-blur-xs px-3.5 py-1.5 rounded-full border border-rose-200 shadow-md flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-rose-500" />
                    <span className="text-[11px] font-semibold text-rose-700 uppercase tracking-wider">
                      Forever Love
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Column: Unified Story Narrative */}
              <div className="lg:col-span-7 space-y-6">
                {/* Heartfelt Quote Block */}
                <div className="relative pl-6 border-l-2 border-rose-400 py-1">
                  <Quote className="w-6 h-6 text-rose-300 absolute -left-3 -top-2 fill-rose-100" />
                  <p className="font-cormorant text-lg sm:text-xl text-stone-700 italic leading-relaxed">
                    &ldquo;{story.quote}&rdquo;
                  </p>
                </div>

                {/* Narrative Paragraphs */}
                <div className="space-y-4 text-stone-700 text-sm sm:text-base leading-relaxed font-sans">
                  {story.paragraphs.map((paragraph, idx) => (
                    <p key={idx} className={idx === 0 ? 'first-letter:text-3xl first-letter:font-serif first-letter:font-bold first-letter:text-rose-600 first-letter:mr-1 first-letter:float-left' : ''}>
                      {paragraph}
                    </p>
                  ))}
                </div>

                {/* Bottom Signature & Promise Badge */}
                <div className="pt-6 border-t border-rose-100/80 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <Heart className="w-4 h-4 text-rose-500 fill-rose-500 animate-pulse" />
                    <span className="text-xs uppercase tracking-widest text-stone-500 font-semibold">
                      Lời Hứa Trọn Đời
                    </span>
                  </div>

                  <div className="text-center sm:text-right">
                    <p className="font-script text-2xl sm:text-3xl text-rose-600">
                      {story.signature}
                    </p>
                    <p className="text-[11px] text-stone-500 uppercase tracking-wider mt-0.5">
                      24.12.2026 · Hà Nội &amp; Sài Gòn
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};
