import { ContactSection } from '../components/Contact.jsx'
import { useMeta } from '../lib/meta.js'

export default function ContactPage() {
  useMeta('Contact', 'Start your project with Singing Cloud Project: send a message, DM on Instagram or email singingcloudstudio@outlook.com.')
  return <div className="pt-16"><ContactSection title="Let’s make something unforgettable." /></div>
}
