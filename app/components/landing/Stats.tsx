const stats = [
  { label: 'Total Users', value: '50,000+' },
  { label: 'Events Hosted', value: '1,200+' },
  { label: 'Registrations', value: '85,000+' },
  { label: 'Satisfaction Rate', value: '94%' },
];

export const Stats = () => {
  return (
    <section className="bg-blue-600 py-16">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 text-white text-center">
        {stats.map((stat, idx) => (
          <div key={idx}>
            <div className="text-4xl md:text-5xl font-bold">{stat.value}</div>
            <div className="text-blue-200 mt-2">{stat.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
};