import { motion } from 'framer-motion'
import PortfolioGrid from '../components/Portfolio.jsx'
import { ContactSection } from '../components/Contact.jsx'
import { reveal } from '../lib/motion.js'
import { useMeta } from '../lib/meta.js'

export default function WorkPage() {
  useMeta('Work', 'Product videos, AI product photos, ad campaigns and websites made by Singing Cloud Project.')
  return (
    <>
      <section className="pb-16 pt-28 sm:pt-36">
        <div className="wrap">
          <motion.div {...reveal} className="max-w-2xl">
            <p className="kicker">Portfolio</p>
            <h1 className="display mt-4 text-[clamp(44px,10vw,88px)]">The work.</h1>
            <p className="mt-5 text-lg text-mute">Product videos, AI product photos, ad campaigns and websites. Tap any piece to see it large.</p>
          </motion.div>
          <div className="mt-12"><PortfolioGrid /></div>
        </div>
      </section>
      <ContactSection title="Like what you see? Let’s make yours." />
    </>
  )
}
