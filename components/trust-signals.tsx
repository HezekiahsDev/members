export function TrustSignals() {
  return (
    <section className="py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold text-center mb-8">Trusted by Businesses Like Yours</h2>

        {/* Placeholder logos */}
        <div className="flex flex-wrap justify-center items-center gap-8 mb-12">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="w-32 h-16 bg-gray-100 flex items-center justify-center rounded">
              <span className="text-gray-400 font-medium">LOGO {i}</span>
            </div>
          ))}
        </div>

        {/* Testimonials */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-gray-50 p-6 rounded-lg">
            <p className="italic mb-4">"Kefford Consulting helped us grow 25% in 3 months!"</p>
            <p className="font-medium">John, Boise Plumber</p>
          </div>
          <div className="bg-gray-50 p-6 rounded-lg">
            <p className="italic mb-4">"The ACT bot gave us exactly what we needed to scale our business."</p>
            <p className="font-medium">Sarah, Marketing Agency</p>
          </div>
          <div className="bg-gray-50 p-6 rounded-lg">
            <p className="italic mb-4">"We saved 15 hours of planning time and increased revenue by 30%."</p>
            <p className="font-medium">Michael, IT Services</p>
          </div>
        </div>
      </div>
    </section>
  )
}
