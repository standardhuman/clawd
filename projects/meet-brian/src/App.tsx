function PhotoPlaceholder({ size = 'md', className = '' }: { size?: 'lg' | 'md'; className?: string }) {
  const dimensions = size === 'lg' ? 'w-40 h-40 sm:w-48 sm:h-48' : 'w-full h-56 sm:h-64'
  const shape = size === 'lg' ? 'rounded-full' : 'rounded-2xl'

  return (
    <div
      className={`${dimensions} ${shape} border border-sage/30 bg-charcoal-light flex items-center justify-center ${className}`}
    >
      {size === 'lg' ? (
        <span className="text-sage text-4xl sm:text-5xl font-sans font-semibold tracking-wide select-none">
          BC
        </span>
      ) : (
        <div className="flex flex-col items-center gap-2 text-sage/40">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z" />
          </svg>
          <span className="text-xs font-sans tracking-wider uppercase">Photo</span>
        </div>
      )}
    </div>
  )
}

function Divider() {
  return <div className="w-16 h-px bg-sage/30 mx-auto" />
}

function App() {
  return (
    <div className="min-h-screen bg-charcoal">
      {/* Hero */}
      <header className="pt-16 sm:pt-24 pb-12 sm:pb-16 px-6">
        <div className="max-w-2xl mx-auto flex flex-col items-center text-center">
          <PhotoPlaceholder size="lg" className="mb-8" />
          <h1 className="text-4xl sm:text-5xl font-sans font-light tracking-tight text-cream mb-3">
            Brian Cline
          </h1>
          <p className="text-lg font-sans font-light text-cream-dim tracking-wide">
            Berkeley, CA
          </p>
        </div>
      </header>

      {/* Main content */}
      <main className="px-6 pb-16 sm:pb-24">
        <div className="max-w-2xl mx-auto">

          {/* Opening */}
          <section className="mb-16 sm:mb-20">
            <p className="text-xl sm:text-2xl leading-relaxed text-cream mb-6">
              I'm 46, I live in Berkeley, and I'm looking to meet someone.
            </p>
            <p className="text-lg leading-relaxed text-cream/85 mb-6">
              I'm not on the apps. I spent most of my adult dating life on them and I've realized that's not how I want to find a partner. The endless scrolling, the sense that there's always someone else around the corner — it doesn't let you appreciate the person in front of you. I'd rather meet someone through people who actually know us both.
            </p>
            <p className="text-lg leading-relaxed text-cream/85">
              If you're reading this, someone who cares about me shared this with you. That already means something.
            </p>
          </section>

          <Divider />

          {/* What my days look like */}
          <section className="my-16 sm:my-20">
            <h2 className="text-2xl sm:text-3xl font-sans font-light text-cream mb-8 sm:mb-10">
              What my days look like
            </h2>
            <p className="text-lg leading-relaxed text-cream/85 mb-6">
              I spend half my week underwater. I run a hull cleaning business in the East Bay marinas — I dive on boats and keep their hulls clean. It's physical work, it's on the water, and I love it. The other half of my week I'm building the software platform for that business. I like making things.
            </p>
            <p className="text-lg leading-relaxed text-cream/85 mb-6">
              I sail. In 2014 I solo raced from San Francisco to Hawaii and back — 4,000 miles of open ocean, alone. It was the hardest and most clarifying thing I've ever done.
            </p>

            {/* Photo placeholder for sailing/biking/Pocket */}
            <div className="my-10 sm:my-12">
              <PhotoPlaceholder size="md" />
            </div>

            <p className="text-lg leading-relaxed text-cream/85 mb-6">
              I mountain bike fast, technical trails around the East Bay — 20 to 40 miles at a time. My dog Pocket comes along. She's a big part of my life.
            </p>
            <p className="text-lg leading-relaxed text-cream/85">
              I didn't take a traditional path to get here. I traveled the country on freight trains and hitchhiking when I was young, came back to school, studied social psychology, and rode a motorcycle to San Francisco in 2006 with nothing but what I could carry. I've been building a life here ever since.
            </p>
          </section>

          <Divider />

          {/* What matters to me */}
          <section className="my-16 sm:my-20">
            <h2 className="text-2xl sm:text-3xl font-sans font-light text-cream mb-8 sm:mb-10">
              What matters to me
            </h2>
            <p className="text-lg leading-relaxed text-cream/85 mb-6">
              I'm in a men's group called The Men's Circle that meets every week. It's one of the most important things in my life. We show up for each other honestly — no performing, no fixing, just presence. I practice Nonviolent Communication and I believe in saying what's real, even when it's uncomfortable.
            </p>
            <p className="text-lg leading-relaxed text-cream/85 mb-6">
              I've been doing a lot of personal growth work and I'm going to keep doing it. Attachment workshops, improv, community events. I'm showing up to things and meeting people and staying open.
            </p>
            <p className="text-lg leading-relaxed text-cream/85">
              I recently got out of a relationship and I've taken my time with it. I'm not rushing. I'm not rebounding. I'm being intentional about what comes next.
            </p>
          </section>

          <Divider />

          {/* What I'm looking for */}
          <section className="my-16 sm:my-20">
            <h2 className="text-2xl sm:text-3xl font-sans font-light text-cream mb-8 sm:mb-10">
              What I'm looking for
            </h2>
            <p className="text-lg leading-relaxed text-cream/85 mb-6">
              Someone who's curious about themselves. You don't have to have it all figured out — I don't — but you're paying attention to your own life. You notice things. You're willing to go there.
            </p>
            <p className="text-lg leading-relaxed text-cream/85 mb-6">
              Someone active. I'm on the water or on the trails most days. I'd love a partner who wants to come along sometimes, or who has her own thing that gets her outside and moving.
            </p>
            <p className="text-lg leading-relaxed text-cream/85">
              Someone who values real connection. Who'd rather meet through a friend than through an algorithm. Who puts her phone down at dinner.
            </p>
          </section>

          <Divider />

          {/* If something resonates */}
          <section className="my-16 sm:my-20">
            <h2 className="text-2xl sm:text-3xl font-sans font-light text-cream mb-8 sm:mb-10">
              If something resonates
            </h2>
            <p className="text-lg leading-relaxed text-cream/85 mb-8">
              Reach out. A simple email is perfect.
            </p>

            <div className="mb-8">
              <a
                href="mailto:brian@briancline.co"
                className="text-2xl sm:text-3xl font-sans font-light text-terracotta hover:text-terracotta-light transition-colors"
              >
                brian@briancline.co
              </a>
            </div>

            <p className="text-lg leading-relaxed text-cream/85 mb-6">
              No pressure. No expectations. Just two people seeing if there's something worth exploring over coffee.
            </p>
            <p className="text-lg leading-relaxed text-cream/85">
              And if you're a friend reading this and someone comes to mind — I'd be grateful for the introduction. Even a simple "I think you two should meet" is enough.
            </p>
          </section>

        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-sage/15 py-10 sm:py-12 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-sm font-sans text-cream-dim/60 tracking-wide">
            Brian Cline · Berkeley, CA
          </p>
          <a
            href="https://briancline.co"
            className="text-xs font-sans text-cream-dim/40 hover:text-cream-dim/60 transition-colors mt-2 inline-block"
          >
            briancline.co
          </a>
        </div>
      </footer>
    </div>
  )
}

export default App
