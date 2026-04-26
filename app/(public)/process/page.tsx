import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Process',
  description: 'How Domestic Eclectic prints are made — materials, printing, and fulfilment.',
}

export default function ProcessPage() {
  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-10 pt-12 pb-24">
      <p className="caption text-terracotta mb-4">Process</p>
      <h1 className="font-display text-4xl md:text-5xl italic text-ink mb-12 leading-tight">
        How your print is made
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
        <div className="flex flex-col gap-12">
          {[
            {
              step: '01',
              title: 'The original work',
              body: `Each Domestic Eclectic print begins as an original hand-made
                collage — torn, cut, and layered over days or weeks in Lara's
                Melbourne studio. The originals are then scanned at very high
                resolution to capture every texture, every brushstroke, every
                edge of a torn fragment.`,
            },
            {
              step: '02',
              title: 'Print production',
              body: `Prints are produced by Southern Buoy, a fine art print studio
                in Mornington, Victoria. They use archival pigment inks on
                materials chosen for their quality and longevity: Hahnemühle
                cotton rag (in smooth hot-pressed or textured cold-pressed finish)
                and a choice of satin or lustre canvas.`,
            },
            {
              step: '03',
              title: 'Framing options',
              body: `Prints can be ordered unframed (rolled and shipped in a
                protective tube) or pre-framed. Framing is done by Southern Buoy
                before dispatch. Standard frames come in Flooded Gum or American
                Ash; premium stained frames are available in White, Native
                Mahogany, Walnut, and Black.`,
            },
            {
              step: '04',
              title: 'Packing & dispatch',
              body: `Unframed prints are rolled in acid-free tissue and shipped in
                a rigid tube. Framed prints are packed in custom foam-lined
                cartons. Orders are dispatched from Mornington — most Australian
                deliveries arrive within 5–10 business days after print production.`,
            },
          ].map(({ step, title, body }) => (
            <div key={step} className="flex gap-8">
              <p className="font-display text-4xl italic text-border shrink-0 select-none pt-1">
                {step}
              </p>
              <div>
                <h2 className="font-display text-xl italic text-ink mb-3">{title}</h2>
                <p className="text-ink-muted leading-relaxed">{body}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Materials sidebar */}
        <div className="lg:border-l lg:border-border lg:pl-16">
          <p className="caption text-ink mb-6">Materials available</p>

          <div className="flex flex-col gap-8">
            {[
              {
                name: 'Cotton Rag Smooth',
                subtitle: 'Hot pressed',
                description:
                  'A bright white, smooth-surface fine art paper. High colour saturation and sharp detail. Ideal for works with fine linework or dense colour.',
              },
              {
                name: 'Cotton Rag Textured',
                subtitle: 'Cold pressed',
                description:
                  'A warm white paper with a subtle tooth. The texture becomes part of the image, softening the appearance and giving a more painterly feel.',
              },
              {
                name: 'Canvas Satin',
                subtitle: 'Poly-cotton blend',
                description:
                  'A fine-weave canvas with a satin finish. Brings a warm, gallery quality to the print. Best for larger sizes.',
              },
              {
                name: 'Canvas Lustre',
                subtitle: 'Poly-cotton blend',
                description:
                  'Similar to satin but with a slightly more matte finish. Reduces reflectivity in bright rooms.',
              },
            ].map(({ name, subtitle, description }) => (
              <div key={name} className="border-t border-border pt-6">
                <div className="flex items-baseline gap-3 mb-2">
                  <h3 className="font-display text-lg italic text-ink">{name}</h3>
                  <span className="caption text-ink-muted">{subtitle}</span>
                </div>
                <p className="text-sm text-ink-muted leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
