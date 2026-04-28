import { motion } from 'motion/react';
import * as LucideIcons from 'lucide-react';
import { SalesPageData } from '../types';
import { cn } from '../lib/utils';

interface SalesPagePreviewProps {
  data: SalesPageData;
}

const IconLoader = ({ name, className }: { name: string; className?: string }) => {
  const Icon = (LucideIcons as any)[name] || LucideIcons.HelpCircle;
  return <Icon className={className} />;
};

export default function SalesPagePreview({ data }: SalesPagePreviewProps) {
  return (
    <div className="w-full bg-white selection:bg-blue-600 selection:text-white">
      {/* Hero Section */}
      <section className="relative px-8 py-24 lg:py-32 bg-slate-900 text-white overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-blue-600/10 to-transparent pointer-events-none" />
        <div className="relative z-10 max-w-4xl mx-auto text-center lg:text-left">
          <motion.span 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-blue-400 font-bold text-xs uppercase tracking-[0.2em] mb-6 block"
          >
            New Release
          </motion.span>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-5xl lg:text-7xl font-extrabold tracking-tight leading-[0.95] mb-8"
          >
            {data.hero.headline.split(' ').map((word, i) => (
              <span key={i} className={i > 2 ? "text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400" : ""}>
                {word}{' '}
              </span>
            ))}
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-slate-400 max-w-2xl mb-12 leading-relaxed"
          >
            {data.hero.subheadline}
          </motion.p>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <motion.button 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-blue-600 text-white px-10 py-4 rounded-lg font-bold text-lg hover:bg-blue-700 transition-all hover:scale-105 active:scale-95 shadow-xl shadow-blue-900/40"
            >
              {data.hero.cta}
            </motion.button>
            <button className="px-10 py-4 text-slate-400 font-bold hover:text-white transition-colors">
              Learn More
            </button>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="px-8 py-24 bg-slate-50 border-y border-slate-100">
        <div className="max-w-4xl mx-auto text-center">
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600 mb-4 block">The Challenge</span>
          <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-6">{data.problem.title}</h2>
          <p className="text-lg text-slate-500 leading-relaxed max-w-2xl mx-auto">{data.problem.description}</p>
        </div>
      </section>

      {/* Solution Section */}
      <section className="px-8 py-24 lg:py-32">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <div className="relative group">
            <div className="aspect-square bg-slate-100 rounded-3xl flex items-center justify-center overflow-hidden border border-slate-200">
              <div className="w-24 h-24 bg-blue-600 rounded-[2rem] flex items-center justify-center shadow-2xl shadow-blue-600/30 group-hover:scale-110 transition-transform duration-500">
                  <LucideIcons.CheckCircle2 className="w-12 h-12 text-white" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/5 to-transparent" />
            </div>
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 mb-4 block">The Breakthrough</span>
            <h2 className="text-5xl font-extrabold text-slate-900 tracking-tighter leading-none mb-8">{data.solution.title}</h2>
            <p className="text-lg text-slate-600 mb-10 leading-relaxed">{data.solution.description}</p>
            <ul className="space-y-5">
              {data.solution.keyPoints.map((point, i) => (
                <li key={i} className="flex items-start gap-4 font-semibold text-slate-800">
                  <div className="mt-1 w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center shrink-0 border border-blue-100">
                    <LucideIcons.Check className="w-3.5 h-3.5 text-blue-600" strokeWidth={3} />
                  </div>
                  {point}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="px-8 py-24 bg-slate-900">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl lg:text-5xl font-extrabold text-white tracking-tight mb-4">{data.features.title}</h2>
            <div className="h-1 w-16 bg-blue-600 mx-auto rounded-full" />
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {data.features.items.map((feature, i) => (
              <div key={i} className="group p-8 rounded-2xl border border-slate-800 hover:border-slate-700 transition-all bg-slate-800/30 hover:bg-slate-800/50">
                <div className="w-12 h-12 bg-blue-600/10 rounded-xl flex items-center justify-center mb-6 border border-blue-600/20 group-hover:bg-blue-600 transition-colors">
                  <IconLoader name={feature.icon} className="w-6 h-6 text-blue-400 group-hover:text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3 tracking-tight">{feature.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      {data.testimonials && data.testimonials.length > 0 && (
        <section className="px-8 py-24 overflow-hidden relative">
          <div className="max-w-6xl mx-auto relative z-10">
            <div className="grid lg:grid-cols-2 gap-8">
              {data.testimonials.map((t, i) => (
                <div key={i} className="bg-slate-50 p-10 rounded-2xl border border-slate-100 flex flex-col justify-between">
                   <div className="mb-8">
                      <LucideIcons.Quote className="w-10 h-10 text-blue-600/10 mb-6" />
                      <p className="text-xl font-medium tracking-tight leading-relaxed text-slate-800 italic">"{t.quote}"</p>
                   </div>
                   <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-slate-200 rounded-full flex-shrink-0" />
                      <div>
                        <h4 className="font-bold text-slate-900">{t.author}</h4>
                        <p className="text-[10px] text-blue-600 tracking-widest uppercase font-bold">{t.role}</p>
                      </div>
                   </div>
                </div>
              ))}
            </div>
          </div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 rounded-full blur-3xl -mr-32 -mt-32" />
        </section>
      )}

      {/* Pricing */}
      {data.pricing && (
        <section className="px-8 py-24 bg-slate-50 border-y border-slate-200">
          <div className="max-w-sm mx-auto bg-white p-10 rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/50 text-center relative">
            <div className="absolute top-0 inset-x-0 h-1.5 bg-blue-600 rounded-t-2xl" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-6 block">Premium Access</span>
            <h2 className="text-3xl font-extrabold text-slate-900 mb-2">{data.pricing.planName}</h2>
            <div className="flex items-baseline justify-center gap-1 mb-8">
               <span className="text-5xl font-black tracking-tighter text-slate-900">{data.pricing.price}</span>
            </div>
            <ul className="text-left space-y-4 mb-10 border-t border-slate-100 pt-8">
              {data.pricing.features.map((f, i) => (
                <li key={i} className="flex items-start gap-3 text-slate-600 font-semibold text-sm">
                  <LucideIcons.Check className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" strokeWidth={3} />
                  {f}
                </li>
              ))}
            </ul>
            <button className="w-full bg-slate-900 text-white py-4 rounded-lg font-bold text-lg hover:bg-black transition-all active:scale-[0.98]">
              Get Started Now
            </button>
          </div>
        </section>
      )}

      {/* FAQ */}
      <section className="px-8 py-24 max-w-3xl mx-auto">
        <h2 className="text-4xl font-extrabold text-slate-900 text-center mb-16 tracking-tight">Questions?</h2>
        <div className="space-y-10">
          {data.faq.map((item, i) => (
            <div key={i} className="group">
              <h3 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-3">
                <span className="w-1.5 h-1.5 bg-blue-600 rounded-full group-hover:scale-150 transition-transform" />
                {item.question}
              </h3>
              <p className="text-slate-500 leading-relaxed pl-4.5 border-l border-slate-200">{item.answer}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-8 py-32 text-center bg-blue-600 text-white relative overflow-hidden">
        <div className="relative z-10 max-w-3xl mx-auto">
          <LucideIcons.Zap className="w-12 h-12 mx-auto mb-8 text-blue-200 animate-pulse" />
          <h2 className="text-5xl lg:text-7xl font-extrabold tracking-tight leading-[0.95] mb-12">
            {data.footerCta.headline}
          </h2>
          <button className="bg-white text-blue-600 px-12 py-5 rounded-lg font-bold text-xl hover:scale-105 transition-all shadow-2xl shadow-blue-900/20 active:scale-95">
            {data.footerCta.cta}
          </button>
        </div>
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-indigo-700/50 to-transparent" />
      </section>

      <footer className="px-8 py-12 bg-slate-50 border-t border-slate-200 text-center text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
        &copy; 2024 SalesForge Intelligence. Engineered with Gemini.
      </footer>
    </div>
  );
}
