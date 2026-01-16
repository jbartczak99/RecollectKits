export default function About() {
  return (
    <div className="space-y-12">
      {/* Page Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">About RecollectKits</h1>
        <p className="text-xl text-gray-600">
          Learn more about our story, mission, and the people behind the platform.
        </p>
      </div>

      {/* Our Story Section */}
      <section className="card">
        <div className="card-body">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Story</h2>
          <div className="text-gray-600 space-y-4">
            <p className="text-lg">
              RecollectKits was born from a simple frustration: there was no easy way to organize a football kit collection and discover new kits.
            </p>
            <p className="text-lg">
              As collectors, we've all been there. Kits scattered across closets, some hanging, some folded, trying to remember what we own and what's still on the hunt list. Social media posts disappear. Memory fails.
            </p>
            <p className="text-lg">
              Some of the most beautiful kits come from small clubs around the world. Teams you would never hear about otherwise. You might catch a glimpse on social media, fall in love with the design, then lose it forever in the scroll. There had to be a better way to discover and preserve these finds.
            </p>
            <p className="text-lg">
              What started as a weekend project to solve this problem for ourselves quickly evolved once we saw the value to the global football community.
            </p>
            <p className="text-lg">
              We launched RecollectKits in late 2025 to build something the community had been waiting for—a dedicated platform to discover, catalog, showcase, and connect around the kits that tell the stories of the beautiful game.
            </p>
          </div>
        </div>
      </section>

      {/* Where It Began Section */}
      <section className="card">
        <div className="card-body">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Where It Began</h2>
          <div className="text-gray-600 space-y-4">
            <p className="text-lg">
              Buffalo, New York—where football and hockey reign, but soccer is growing. The collection that inspired RecollectKits came from everywhere. Online marketplaces. New York City storefronts. Team stores at Irish matches. Gifts from the ones we care about most. Every kit has a story.
            </p>
            <p className="text-lg">
              We're building a platform for the global collector community to discover new kits and access authentic shirts from trusted sources worldwide.
            </p>
          </div>
        </div>
      </section>

      {/* About the Owner Section */}
      <section className="card">
        <div className="card-body">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Meet the Founder</h2>
          <div className="text-gray-600 space-y-4">
            <p className="text-lg">
              Jerrad has been a football fan for as long as he can remember. Growing up playing the game through college only deepened that passion and fueled a growing collection of kits that needed a better home than tucked away in the closet.
            </p>
            <p className="text-lg">
              Years of playing, watching, and collecting made one thing clear: the kits matter. They preserve moments, represent the pride of club and country, and most of all tell stories. These shirts are more than fabric. They're pieces of football history worth preserving.
            </p>
            <p className="text-lg">
              RecollectKits is the platform Jerrad built for himself and collectors like him, people who understand why a certain kit is worth the hunt. Built by a lifelong player and collector, for the community that gets it.
            </p>
          </div>
        </div>
      </section>

      {/* Our Mission Section */}
      <section className="card">
        <div className="card-body">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h2>
          <div className="text-gray-600 space-y-4">
            <p className="text-lg font-medium">
              To build the home for football kit collectors worldwide.
            </p>
            <p className="text-lg">
              We're creating a platform where collectors can:
            </p>
            <div className="text-lg space-y-2 ml-4">
              <p>• <span className="font-semibold">Preserve</span> their collections with detailed catalogs and provenance tracking</p>
              <p>• <span className="font-semibold">Discover</span> new and vintage kits through trusted retail partnerships</p>
              <p>• <span className="font-semibold">Connect</span> with fellow collectors who share their passion</p>
              <p>• <span className="font-semibold">Showcase</span> their collections and the stories behind each kit</p>
            </div>
            <p className="text-lg">
              RecollectKits is built by collectors, for collectors. We're building the specialized tool the community has always needed.
            </p>
            <p className="text-lg">
              Every feature, every partnership, every decision is guided by one question: "Does this serve collectors better?"
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
