'use client';

import React, { useState } from 'react';
import { Calendar, Clock, MapPin, ExternalLink, Download, Compass, Check, Heart } from 'lucide-react';
import { WeddingCouple, WeddingEvent } from '../types/wedding';
import { getGoogleCalendarUrl, downloadIcsFile } from '../lib/calendar';
import { ScrollReveal } from './ScrollReveal';

interface InvitationProps {
  couple: WeddingCouple;
  events: WeddingEvent[];
}

export const Invitation: React.FC<InvitationProps> = ({ couple, events }) => {
  const [activeEventTab, setActiveEventTab] = useState<string>(events[1]?.id || events[0]?.id);
  const [downloadSuccessId, setDownloadSuccessId] = useState<string | null>(null);

  const selectedEvent = events.find((e) => e.id === activeEventTab) || events[0];

  const handleDownloadIcs = (event: WeddingEvent) => {
    downloadIcsFile(event);
    setDownloadSuccessId(event.id);
    setTimeout(() => setDownloadSuccessId(null), 3000);
  };

  return (
    <section id="invitation" className="relative py-24 sm:py-32 px-4 sm:px-6 overflow-hidden">
      {/* Scenic Bright Luxury Wedding Backdrop - Vividly visible */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <img
          src="/images/wedding/optimized/_DSC3447.jpg"
          alt="Luxury wedding backdrop"
          className="w-full h-full object-cover object-center filter blur-[0.5px] opacity-65 transform scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#FFFDFB]/65 via-[#FFFDFB]/35 to-[#FFFDFB]/65" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto">
        {/* Section Header */}
        <ScrollReveal animation="fade-up" duration={700}>
          <div className="text-center mb-16">
            <p className="font-script text-3xl sm:text-4xl text-rose-600 mb-1 drop-shadow-xs">
              Wedding Invitation
            </p>
            <h2 className="font-serif text-3xl sm:text-5xl font-bold text-stone-900 tracking-tight text-balance drop-shadow-xs">
              Thiệp Mời Báo Hỉ
            </h2>
            <div className="mt-4 flex items-center justify-center gap-3">
              <div className="h-px w-12 bg-rose-400" />
              <Heart className="w-4 h-4 fill-rose-500 text-rose-500 animate-pulse" />
              <div className="h-px w-12 bg-rose-400" />
            </div>
            <div className="mt-3 inline-block bg-white/80 backdrop-blur-sm px-5 py-1.5 rounded-full border border-rose-100/80 shadow-xs">
              <p className="font-serif italic text-stone-700 text-sm sm:text-base">
                Kính mời Quý khách tới chung vui cùng gia đình chúng tôi
              </p>
            </div>
          </div>
        </ScrollReveal>

        {/* Traditional Invitation Card Frame */}
        <ScrollReveal animation="zoom-in" delay={150} duration={750}>
          <div className="bg-white/98 backdrop-blur-md rounded-3xl p-6 sm:p-10 lg:p-12 shadow-xl border border-rose-100/90 mb-12 relative overflow-hidden">
            {/* Subtle vintage gold corner ornamentation */}
            <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-rose-300/60 rounded-tl-3xl m-3 pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-rose-300/60 rounded-br-3xl m-3 pointer-events-none" />

            {/* Family Introduction (Nhà Trai & Nhà Gái) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-10 border-b border-rose-100 text-center">
              {/* Nhà Trai */}
              <div className="p-6 rounded-2xl bg-rose-50/40 border border-rose-100/60 hover:shadow-md transition-all flex flex-col items-center">
                <div className="w-20 h-20 sm:w-24 sm:h-24 mb-4 rounded-full overflow-hidden border-2 border-rose-300 shadow-md">
                  <img
                    src="/images/wedding/optimized/_DSC3109.jpg"
                    alt={couple.groom.fullName}
                    className="w-full h-full object-cover object-top"
                  />
                </div>
                <span className="text-xs uppercase tracking-widest text-rose-600 font-bold block mb-2">
                  NHÀ TRAI
                </span>
                <p className="text-sm text-stone-700 font-medium">
                  Ông: <strong className="text-stone-900">{couple.groom.fatherName}</strong>
                </p>
                <p className="text-sm text-stone-700 font-medium mt-0.5">
                  Bà: <strong className="text-stone-900">{couple.groom.motherName}</strong>
                </p>
                <p className="text-xs text-stone-500 mt-2">
                  {couple.groom.address}
                </p>

                <div className="mt-5 pt-3 border-t border-rose-200/60 w-full">
                  <span className="text-xs text-rose-500 block uppercase tracking-wider font-semibold">Chú Rể</span>
                  <p className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 mt-1">
                    {couple.groom.fullName}
                  </p>
                </div>
              </div>

              {/* Nhà Gái */}
              <div className="p-6 rounded-2xl bg-rose-50/40 border border-rose-100/60 hover:shadow-md transition-all flex flex-col items-center">
                <div className="w-20 h-20 sm:w-24 sm:h-24 mb-4 rounded-full overflow-hidden border-2 border-rose-300 shadow-md">
                  <img
                    src="/images/wedding/optimized/_DSC2943.jpg"
                    alt={couple.bride.fullName}
                    className="w-full h-full object-cover object-top"
                  />
                </div>
                <span className="text-xs uppercase tracking-widest text-rose-600 font-bold block mb-2">
                  NHÀ GÁI
                </span>
                <p className="text-sm text-stone-700 font-medium">
                  Ông: <strong className="text-stone-900">{couple.bride.fatherName}</strong>
                </p>
                <p className="text-sm text-stone-700 font-medium mt-0.5">
                  Bà: <strong className="text-stone-900">{couple.bride.motherName}</strong>
                </p>
                <p className="text-xs text-stone-500 mt-2">
                  {couple.bride.address}
                </p>

                <div className="mt-5 pt-3 border-t border-rose-200/60 w-full">
                  <span className="text-xs text-rose-500 block uppercase tracking-wider font-semibold">Cô Dâu</span>
                  <p className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 mt-1">
                    {couple.bride.fullName}
                  </p>
                </div>
              </div>
            </div>

            {/* Invitation Letter Prose */}
            <div className="py-8 text-center max-w-2xl mx-auto">
              <p className="font-cormorant text-lg sm:text-xl text-stone-700 italic leading-relaxed">
                &ldquo;Sự hiện diện của Quý khách là niềm vinh hạnh và lời chúc phúc quý giá nhất dành cho đôi uyên ương và gia đình chúng tôi trong ngày vui trọng đại.&rdquo;
              </p>
            </div>

            {/* Event Selector Segmented Control */}
            <div className="flex items-center justify-center gap-2 p-1.5 bg-rose-50/60 border border-rose-100 rounded-2xl max-w-md mx-auto mb-8">
              {events.map((event) => (
                <button
                  key={event.id}
                  onClick={() => setActiveEventTab(event.id)}
                  className={`flex-1 py-2 px-3 text-xs sm:text-sm font-semibold rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                    activeEventTab === event.id
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-white/60'
                  }`}
                >
                  {event.title}
                </button>
              ))}
            </div>

            {/* Active Event Details */}
            {selectedEvent && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Event Info (Left Column) */}
                <div className="lg:col-span-6 space-y-6">
                  <div>
                    <span className="text-xs text-rose-600 font-bold uppercase tracking-wider block mb-1">
                      {selectedEvent.subtitle}
                    </span>
                    <h3 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900">
                      {selectedEvent.venueName}
                    </h3>
                  </div>

                  <div className="space-y-3 text-sm text-stone-700">
                    <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-rose-50/30 border border-rose-100/70">
                      <Clock className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                      <div>
                        <strong className="block text-stone-900 font-semibold">{selectedEvent.time}</strong>
                        <span className="text-xs text-stone-500">{selectedEvent.lunarTime}</span>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-rose-50/30 border border-rose-100/70">
                      <Calendar className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                      <div>
                        <strong className="block text-stone-900 font-semibold">{selectedEvent.date}</strong>
                        <span className="text-xs text-stone-500">Kính mời Quý khách đến tham dự đúng giờ</span>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-rose-50/30 border border-rose-100/70">
                      <MapPin className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                      <div>
                        <strong className="block text-stone-900 font-semibold">Địa Điểm:</strong>
                        <span className="text-xs sm:text-sm text-stone-600">{selectedEvent.address}</span>
                      </div>
                    </div>
                  </div>

                  {/* Calendar & Map Action Buttons */}
                  <div className="space-y-2 pt-2">
                    <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider block">
                      Lưu lịch &amp; Chỉ đường:
                    </span>
                    <div className="flex flex-wrap items-center gap-2">
                      <a
                        href={getGoogleCalendarUrl(selectedEvent)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-semibold bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white rounded-xl transition-all shadow-md shadow-rose-500/20"
                      >
                        <Calendar className="w-4 h-4" />
                        Google Calendar
                        <ExternalLink className="w-3 h-3 ml-0.5 opacity-80" />
                      </a>

                      <button
                        onClick={() => handleDownloadIcs(selectedEvent)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-medium border border-rose-200 text-stone-700 bg-white rounded-xl hover:bg-rose-50 transition-colors shadow-xs cursor-pointer"
                      >
                        {downloadSuccessId === selectedEvent.id ? (
                          <>
                            <Check className="w-4 h-4 text-emerald-600" />
                            <span className="text-emerald-700">Đã tải file .ICS</span>
                          </>
                        ) : (
                          <>
                            <Download className="w-4 h-4 text-stone-500" />
                            <span>Tải file .ICS</span>
                          </>
                        )}
                      </button>

                      <a
                        href={selectedEvent.mapDirectUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-medium border border-rose-200 text-stone-700 bg-white rounded-xl hover:bg-rose-50 transition-colors shadow-xs"
                      >
                        <Compass className="w-4 h-4 text-rose-600" />
                        Mở Google Maps
                      </a>
                    </div>
                  </div>
                </div>

                {/* Embedded Google Map (Right Column) */}
                <div className="lg:col-span-6 w-full h-[320px] sm:h-[390px] rounded-2xl overflow-hidden border border-rose-100 shadow-inner bg-stone-100 relative">
                  <iframe
                    title={`Bản đồ ${selectedEvent.venueName}`}
                    src={selectedEvent.mapEmbedUrl}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen={false}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="w-full h-full"
                  />
                </div>
              </div>
            )}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};
