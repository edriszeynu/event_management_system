import Link from 'next/link';

export const Footer = () => {
  return (
    <footer className="bg-linear-to-br from-blue-950 via-indigo-950 to-purple-950 text-blue-200 py-12">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <h3 className="text-white font-bold text-xl mb-4">EventHub</h3>
          <p className="text-sm">Your all-in-one event management platform.</p>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-4">Product</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="#" className="hover:text-white transition-colors">Features</Link></li>
            <li><Link href="#" className="hover:text-white transition-colors">Pricing</Link></li>
            <li><Link href="#" className="hover:text-white transition-colors">Integrations</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-4">Company</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="#" className="hover:text-white transition-colors">About</Link></li>
            <li><Link href="#" className="hover:text-white transition-colors">Blog</Link></li>
            <li><Link href="#" className="hover:text-white transition-colors">Careers</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-4">Support</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="#" className="hover:text-white transition-colors">Help Center</Link></li>
            <li><Link href="#" className="hover:text-white transition-colors">Contact</Link></li>
            <li><Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link></li>
          </ul>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 mt-8 pt-8 border-t border-white/10 text-center text-sm">
        &copy; {new Date().getFullYear()} EventHub. All rights reserved.
      </div>
    </footer>
  );
};
