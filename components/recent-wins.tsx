export function RecentWins() {
  const recentWins = [
    { name: "Jane", location: "Boise", profession: "Accountant", saved: "10 Hours", product: "Play" },
    { name: "Mark", location: "Seattle", profession: "Plumber", saved: "$3,000", product: "Growth Bundle" },
    { name: "Sarah", location: "Portland", profession: "Marketing", saved: "15 Hours", product: "Playbook" },
  ]

  return (
    <section className="py-12 px-4 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold text-center mb-8">Recent Wins</h2>

        <div className="grid md:grid-cols-3 gap-6">
          {recentWins.map((win, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <h3 className="font-medium text-lg mb-2">
                {win.name}, {win.location} {win.profession}
              </h3>
              <p className="text-gray-600">
                Saved {win.saved} with our {win.product}!
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
