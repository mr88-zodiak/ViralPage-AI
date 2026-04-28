export interface SalesPageData {
  hero: {
    headline: string;
    subheadline: string;
    cta: string;
  };
  problem: {
    title: string;
    description: string;
  };
  solution: {
    title: string;
    description: string;
    keyPoints: string[];
  };
  features: {
    title: string;
    items: {
      title: string;
      description: string;
      icon: string;
    }[];
  };
  testimonials?: {
    quote: string;
    author: string;
    role: string;
  }[];
  pricing?: {
    planName: string;
    price: string;
    features: string[];
  };
  faq: {
    question: string;
    answer: string;
  }[];
  footerCta: {
    headline: string;
    cta: string;
  };
}

export interface GeneratorInputs {
  productName: string;
  description: string;
  targetAudience: string;
  tone: string;
  uniqueSellingPoint: string;
  price?: string;
}
