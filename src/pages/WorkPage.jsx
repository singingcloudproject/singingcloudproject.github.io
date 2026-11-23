import { motion } from 'framer-motion'
import PortfolioGrid from '../components/Portfolio.jsx'
import { ContactSection } from '../components/Contact.jsx'
import { reveal } from '../lib/motion.js'
import { useMeta } from '../lib/meta.js'

export default function WorkPage() {
  useMeta('Work', 'AI videos, AI photos, websites and Instagram carousels made by Singing Cloud Studio.')
  return (
    <>
      <section className="pb-16 pt-28 sm:pt-36">
        <div className="wrap">
          <motion.div {...reveal} className="max-w-2xl">
            <p className="kicker">Portfolio</p>
            <h1 className="display mt-4 text-[clamp(44px,10vw,88px)]">The work.</h1>
            <p className="mt-5 text-lg text-mute">AI videos, AI photos, websites and carousels. Tap any piece to see it large. Pieces marked “Concept” are the studio’s own creative work.</p>
          </motion.div>
          <div className="mt-12"><PortfolioGrid /></div>
        </div>
      </section>
      <ContactSection title="Like what you see? Let’s make yours." />
    </>
  )
}
