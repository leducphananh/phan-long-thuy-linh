import React from 'react';
import { Heart, MapPin, Sparkles } from 'lucide-react';
import { StoryMilestone } from '../types/wedding';
import { ScrollReveal } from './ScrollReveal';

interface StoryProps {
  milestones: StoryMilestone[];
}

export const Story: React.FC<StoryProps> = ({ milestones }) => {
  return (
    <section id="story" className="relative py-24 sm:py-32 px-4 sm:px-6 overflow-hidden">
      {/* Scenic Bright Garden & Blooming Flowers Background Image */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <img
          src="https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=2000&q=80"
          alt="Bright floral garden background"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center filter blur-[1px] opacity-25 transform scale-105"
        />
        {/* Soft, bright, warm sunlight scrim */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#FFFDFB]/90 via-[#FFFDFB]/75 to-[#FFFDFB]/90" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto">
        {/* Section Header */}
        <ScrollReveal animation="fade-up" duration={700}>
          <div className="text-center mb-16 sm:mb-20">
            <p className="font-script text-3xl sm:text-4xl text-rose-500 mb-1">
              Our Journey
            </p>
            <h2 className="font-serif text-3xl sm:text-5xl font-bold text-stone-900 tracking-tight text-balance">
              Chuyện Chúng Mình
            </h2>
            <div className="mt-4 flex items-center justify-center gap-3">
              <div className="h-px w-12 bg-rose-300" />
              <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
              <div className="h-px w-12 bg-rose-300" />
            </div>
            <p className="mt-4 text-sm sm:text-base text-stone-600 max-w-xl mx-auto leading-relaxed font-medium">
              Từng bước chân qua năm tháng, từ những ngày đầu bỡ ngỡ đến lời hẹn ước trọn đời. Dưới đây là những cột mốc ngọt ngào nhất trên hành trình chúng mình cùng nhau bước qua.
            </p>
          </div>
        </ScrollReveal>

        {/* Timeline Container */}
        <div className="relative">
          {/* Central Vertical Line */}
          <div 
            aria-hidden="true" 
            className="absolute left-6 md:left-1/2 top-4 bottom-8 -translate-x-1/2 w-0.5 bg-gradient-to-b from-rose-300 via-rose-400 to-rose-300" 
          />

          <div className="space-y-12 sm:space-y-16">
            {milestones.map((item, index) => {
              const isEven = index % 2 === 0;

              return (
                <div
                  key={item.id}
                  className="relative flex flex-col md:flex-row items-start md:items-center group"
                >
                  {/* Timeline node icon */}
                  <div className="absolute left-6 md:left-1/2 -translate-x-1/2 z-10 w-9 h-9 rounded-full bg-white border-2 border-rose-500 shadow-md flex items-center justify-center text-rose-600 group-hover:scale-110 group-hover:bg-rose-50 transition-transform duration-300">
                    <Sparkles className="w-4 h-4" />
                  </div>

                  {/* Content Card Layout with Alternating Slide Animation */}
                  <div
                    className={`w-full md:w-1/2 pl-14 md:pl-0 ${
                      isEven
                        ? 'md:pr-12 md:text-right'
                        : 'md:pl-12 md:ml-auto md:text-left'
                    }`}
                  >
                    <ScrollReveal
                      animation={isEven ? 'fade-right' : 'fade-left'}
                      delay={100}
                      duration={650}
                    >
                      <div className="bg-white/95 backdrop-blur-md p-5 sm:p-6 rounded-3xl border border-rose-100 shadow-md hover:shadow-xl hover:border-rose-300 transition-all duration-300">
                        {/* Media Thumbnail with Fallback */}
                        <div className="relative mb-4 overflow-hidden rounded-2xl bg-stone-100 aspect-16/9 shadow-inner">
                          <img
                            src={item.imageUrl}
                            alt={item.imageAlt}
                            referrerPolicy="no-referrer"
                            loading="lazy"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                            onError={(e) => {
                              const target = e.currentTarget;
                              target.style.display = 'none';
                              const parent = target.parentElement;
                              if (parent) {
                                parent.className += ' flex items-center justify-center bg-rose-50 text-rose-500 p-6';
                                parent.innerHTML = `
                                  <div class="text-center">
                                    <span class="text-xs font-serif uppercase tracking-widest text-rose-700">${item.title}</span>
                                    <p class="text-xs text-stone-500 mt-1">${item.date}</p>
                                  </div>
                                `;
                              }
                            }}
                          />
                        </div>

                        {/* Metadata Header - Clean Unboxed Text */}
                        <div
                          className={`flex items-center gap-2 text-xs text-rose-600 font-semibold tracking-wider mb-2 ${
                            isEven ? 'md:justify-end' : 'justify-start'
                          }`}
                        >
                          <span>{item.year}</span>
                          <span aria-hidden="true">·</span>
                          <span className="text-stone-500 font-normal">{item.date}</span>
                          {item.location && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span className="flex items-center gap-1 text-stone-500 font-normal">
                                <MapPin className="w-3 h-3 text-rose-500" />
                                {item.location}
                              </span>
                            </>
                          )}
                        </div>

                        {/* Title */}
                        <h3 className="font-serif text-xl sm:text-2xl font-bold text-stone-900 mb-2">
                          {item.title}
                        </h3>

                        {/* Description */}
                        <p className="text-stone-600 text-sm leading-relaxed">
                          {item.description}
                        </p>
                      </div>
                    </ScrollReveal>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
