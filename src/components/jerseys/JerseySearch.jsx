export default function JerseySearch({ value, onChange, placeholder = "Search jerseys..." }) {
  return (
    <div className="w-full">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-gray-300 rounded-lg bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent text-base"
        placeholder={placeholder}
        style={{
          width: 'calc(100% - 20px)',
          height: '42px',
          paddingLeft: '16px',
          paddingRight: '16px',
          marginLeft: '10px',
          marginRight: '10px'
        }}
      />
    </div>
  )
}