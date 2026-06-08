import { BsRobot, BsGithub, BsLinkedin} from 'react-icons/bs'
import { FaXTwitter } from "react-icons/fa6";
const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 pt-16 pb-8 mt-auto">
      <div className="max-w-6xl mx-auto px-6">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
            
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className='bg-linear-to-r from-blue-400 to-blue-700 text-white rounded-lg p-2'>
                  <BsRobot size={20} />
              </div>
              <h2 className="font-bold text-xl text-gray-800">Interviewer.ai</h2>
            </div>
            <p className="text-gray-500 max-w-sm leading-relaxed">
              Master your next interview with AI-driven mock sessions, real-time feedback, and personalized insights.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-gray-800 mb-4">Quick Links</h4>
            <ul className="flex flex-col gap-3 text-gray-500">
              <li><a href="#" className="hover:text-green-600 transition">Home</a></li>
              <li><a href="#" className="hover:text-green-600 transition">Features</a></li>
              <li><a href="#" className="hover:text-green-600 transition">Pricing</a></li>
              <li><a href="#" className="hover:text-green-600 transition">Contact Us</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-gray-800 mb-4">Legal</h4>
            <ul className="flex flex-col gap-3 text-gray-500">
              <li><a href="#" className="hover:text-green-600 transition">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-green-600 transition">Terms of Service</a></li>
              <li><a href="#" className="hover:text-green-600 transition">Cookie Policy</a></li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-gray-100 gap-4">
          <p className="text-gray-400 text-sm">
            © {new Date().getFullYear()} Interviewer.ai. All rights reserved.
          </p>
          
          <div className="flex items-center gap-5 text-gray-400">
            <a href="https://x.com" className="hover:text-black transition cursor-pointer">
              <FaXTwitter size={20} />
            </a>
            <a href="https://github.com" className="hover:text-black transition cursor-pointer">
              <BsGithub size={20} />
            </a>
            <a href="https://linkedin.com" className="hover:text-blue-600 transition cursor-pointer">
              <BsLinkedin size={20} />
            </a>
          </div>
        </div>

      </div>
    </footer>
  )
}

export default Footer