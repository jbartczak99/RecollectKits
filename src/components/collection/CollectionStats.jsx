export default function CollectionStats({ collection }) {
  const haveCount = collection.filter(item => item.status === 'have').length
  const wantCount = collection.filter(item => item.status === 'want').length
  const totalCount = collection.length

  const stats = [
    {
      label: 'Total Items',
      value: totalCount,
      color: 'text-gray-600',
      bgColor: 'bg-gray-100'
    },
    {
      label: 'Have',
      value: haveCount,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      label: 'Want',
      value: wantCount,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {stats.map((stat) => (
        <div key={stat.label} className={`${stat.bgColor} rounded-lg p-4 text-center`}>
          <div className={`text-2xl font-bold ${stat.color} mb-1`}>
            {stat.value}
          </div>
          <div className="text-sm text-gray-600">{stat.label}</div>
        </div>
      ))}
    </div>
  )
}