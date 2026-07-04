import { Search, Ticket, Sparkles } from 'lucide-react';

const steps = [
  {
    icon: Search,
    title: 'Discover',
    description: 'Browse through hundreds of events, filter by category, date, or location.',
  },
  {
    icon: Ticket,
    title: 'Register',
    description: 'Select your ticket tier, fill in details, and complete payment in seconds.',
  },
  {
    icon: Sparkles,
    title: 'Experience',
    description: 'Attend the event, network, and share your feedback afterwards.',
  },
];

export const HowItWorks = () => {
  return (
    <section className="max-w-7xl mx-auto px-4 py-16">
      <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
        How It <span className="text-blue-600">Works</span>
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {steps.map((step, idx) => (
          <div key={idx} className="flex flex-col items-center text-center">
            <div className="bg-blue-100 p-4 rounded-full mb-4">
              <step.icon className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold">{step.title}</h3>
            <p className="text-gray-500 mt-2">{step.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};