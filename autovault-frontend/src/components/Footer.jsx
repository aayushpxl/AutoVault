import React from "react";
import { FaFacebookF, FaInstagram, FaTwitter, FaLinkedinIn } from "react-icons/fa";
import { MdEmail } from "react-icons/md";

export default function Footer() {
  return (
    <footer className="bg-gradient-dark text-gray-300 mt-20 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-4 gap-10">
        {/* Brand Info */}
        <div className="md:col-span-2">
          <h2 className="font-heading text-3xl font-bold text-white mb-3">AutoVault</h2>
          <p className="text-sm text-gray-400 leading-relaxed max-w-md">
            Your trusted vehicle rental partner. Explore premium cars, book with ease,
            and drive your dreams. Experience luxury and convenience at your fingertips.
          </p>

          {/* Newsletter */}
          <div className="mt-6">
            <h3 className="text-sm font-semibold text-white mb-3">Subscribe to our Newsletter</h3>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="email"
                  placeholder="Your email address"
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent transition-all duration-300"
                />
                <MdEmail className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
              <button className="bg-gradient-secondary text-white font-semibold px-6 py-2.5 rounded-lg hover:shadow-glow-orange transition-all duration-300">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="font-heading text-lg font-semibold text-white mb-4">Quick Links</h3>
          <ul className="space-y-2.5 text-sm">
            <li>
              <a href="/about" className="text-gray-400 hover:text-accent transition-colors duration-300 flex items-center gap-2">
                <span className="w-1 h-1 bg-accent rounded-full"></span>
                About Us
              </a>
            </li>
            <li>
              <a href="/contact" className="text-gray-400 hover:text-accent transition-colors duration-300 flex items-center gap-2">
                <span className="w-1 h-1 bg-accent rounded-full"></span>
                Contact
              </a>
            </li>
            <li>
              <a href="/faq" className="text-gray-400 hover:text-accent transition-colors duration-300 flex items-center gap-2">
                <span className="w-1 h-1 bg-accent rounded-full"></span>
                FAQs
              </a>
            </li>
            <li>
              <a href="/terms" className="text-gray-400 hover:text-accent transition-colors duration-300 flex items-center gap-2">
                <span className="w-1 h-1 bg-accent rounded-full"></span>
                Terms & Conditions
              </a>
            </li>
          </ul>
        </div>

        {/* Social Media */}
        <div>
          <h3 className="font-heading text-lg font-semibold text-white mb-4">Follow Us</h3>
          <div className="flex space-x-4">
            <a
              href="#"
              className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white hover:bg-accent hover:border-accent hover:shadow-glow transition-all duration-300 transform hover:scale-110"
            >
              <FaFacebookF />
            </a>
            <a
              href="#"
              className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white hover:bg-accent hover:border-accent hover:shadow-glow transition-all duration-300 transform hover:scale-110"
            >
              <FaInstagram />
            </a>
            <a
              href="#"
              className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white hover:bg-accent hover:border-accent hover:shadow-glow transition-all duration-300 transform hover:scale-110"
            >
              <FaTwitter />
            </a>
            <a
              href="#"
              className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white hover:bg-accent hover:border-accent hover:shadow-glow transition-all duration-300 transform hover:scale-110"
            >
              <FaLinkedinIn />
            </a>
          </div>

          <div className="mt-6">
            <h4 className="text-sm font-semibold text-white mb-2">Contact</h4>
            <p className="text-sm text-gray-400">support@autovault.com</p>
            <p className="text-sm text-gray-400">+1 (555) 123-4567</p>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 text-center text-sm py-6 bg-black/20">
        <p className="text-gray-400">
          &copy; {new Date().getFullYear()} <span className="text-accent font-semibold">AutoVault</span>. All rights reserved. Crafted with excellence.
        </p>
      </div>
    </footer>
  );
}
