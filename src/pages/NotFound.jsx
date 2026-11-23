import { Link } from 'react-router-dom'
import { useMeta } from '../lib/meta.js'

export default function NotFound() {
  useMeta('Page not found')
  return (
    <section className="flex min-h-[80svh] items-center pt-20">
      <div className="wrap text-center">
        <img src="/media/logo/cloud-640.webp" alt="" className="mx-auto w-48 opacity-90" />
        <h1 className="display mt-6 text-5xl">This cloud drifted away.</h1>
        <p className="mt-4 text-mute">The page you’re looking for isn’t here.</p>
        <Link to="/" className="btn btn-primary mt-8">Back to the studio</Link>
      </div>
    </section>
  )
}
