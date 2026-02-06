import Navbar from "@/app/components/Navbar";

export default function AboutPage() {
  return (
    <>
      <Navbar />

      <main className="mx-auto max-w-6xl px-4 pb-16">
        {/* Hero */}
        <section className="relative mt-8 overflow-hidden rounded-3xl bg-zinc-900 px-6 py-14 text-white">
          <div className="absolute inset-0 opacity-30">
            <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-emerald-500 blur-3xl" />
            <div className="absolute -bottom-28 -right-28 h-80 w-80 rounded-full bg-amber-500 blur-3xl" />
          </div>

          <div className="relative z-10 max-w-3xl space-y-5">
            <h1 className="text-3xl sm:text-5xl font-bold tracking-tight">
              About Qur’an Global
            </h1>

            <p className="text-zinc-200 text-base sm:text-lg leading-relaxed">
              Qur’an Global is a platform built to preserve, highlight, and make accessible
              beautiful Qur’anic recitations — especially from African and underrepresented reciters.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <a
                href="/reciters"
                className="rounded-xl bg-emerald-500 px-6 py-3 font-semibold text-zinc-900 hover:bg-emerald-400 transition text-center"
              >
                Explore Reciters
              </a>

              <a
                href="/recitations"
                className="rounded-xl border border-white/20 px-6 py-3 font-semibold hover:bg-white/10 transition text-center"
              >
                Browse Recitations
              </a>
            </div>
          </div>
        </section>

        {/* Content grid */}
        <section className="mt-8 grid gap-4 md:grid-cols-3">
          {/* Mission */}
          <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm md:col-span-2">
            <h2 className="text-xl font-semibold text-zinc-900">Our Mission</h2>
            <p className="mt-2 text-sm sm:text-base text-zinc-600 leading-relaxed">
              We aim to make Qur’anic recitations easy to discover, listen to, and share —
              while helping preserve voices that are not always represented on major platforms.
            </p>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
                <p className="text-sm font-semibold text-zinc-900">🌍 Representation</p>
                <p className="mt-1 text-sm text-zinc-600">
                  Spotlight reciters from Africa and other underrepresented regions.
                </p>
              </div>

              <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
                <p className="text-sm font-semibold text-zinc-900">🎧 Accessibility</p>
                <p className="mt-1 text-sm text-zinc-600">
                  Simple listening experience with reciter-by-reciter availability.
                </p>
              </div>

              <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
                <p className="text-sm font-semibold text-zinc-900">📥 Contribution</p>
                <p className="mt-1 text-sm text-zinc-600">
                  Anyone can recommend reciters or contribute verified audio sources.
                </p>
              </div>

              <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
                <p className="text-sm font-semibold text-zinc-900">🔎 Discoverability</p>
                <p className="mt-1 text-sm text-zinc-600">
                  Search by Surah, Reciter, or availability — then play or download.
                </p>
              </div>
            </div>
          </div>

          {/* Contribute */}
          <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-zinc-900">Contribute</h2>
            <p className="mt-2 text-sm text-zinc-600 leading-relaxed">
              Know a reciter whose recitation should be added? Or you want to submit your recitations?
              Contact us with the details and links.
            </p>

            <div className="mt-4 space-y-3">
              {/* WhatsApp */}
              <a
                href="https://wa.me/2348137215231?text=Assalamu%20Alaikum%2C%20I%20want%20to%20submit%20a%20reciter%20or%20recitations%20for%20Qur%E2%80%99an%20Global."
                target="_blank"
                rel="noreferrer"
                className="block rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-700 transition text-center"
              >
                Message on WhatsApp
              </a>

              {/* Email */}
              <a
                href="mailto:quranglobal9@gamil.com?subject=Reciter%20Submission%20-%20Qur%E2%80%99an%20Global&body=Assalamu%20Alaikum%2C%0A%0AI%20want%20to%20submit%20a%20reciter%20or%20recitations.%0A%0AReciter%20Name%3A%0ACountry%2FRegion%3A%0ALinks%20to%20audio%20or%20source%3A%0ANotes%3A%0A"
                className="block rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm font-semibold text-zinc-900 hover:bg-zinc-50 transition text-center"
              >
                Send Email
              </a>
            </div>

            <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
              Please include the reciter name, country/region, and a reliable link (YouTube, website,
              Telegram, etc.).
            </div>
          </div>
        </section>

        {/* Footer note */}
        <section className="mt-8 rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-zinc-900">Disclaimer</h3>
          <p className="mt-2 text-sm text-zinc-600 leading-relaxed">
            Qur’an Global is built for easy access and discovery. If you own a recitation source
            and want it removed or properly credited, please contact us and we will respond promptly.
          </p>
        </section>

        <footer className="mt-10 border-t border-zinc-200 py-8 text-sm text-zinc-600">
          <p>© {new Date().getFullYear()} Qur’an Global. All rights reserved.</p>
        </footer>
      </main>
    </>
  );
}
