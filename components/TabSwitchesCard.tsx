


interface Props {
    count: number
}


function TabSwitchesCard({ count } : Props) {
  return (
     <div className="w-32 p-4 flex flex-col items-center gap-2 bg-secondary rounded-md text-center">
              <span className="text-4xl">🔁</span>
              <span className="text-2xl font-semibold">{count}</span>
              <p className="text-muted">Tab Switches</p>
    </div>
  )
}

export default TabSwitchesCard