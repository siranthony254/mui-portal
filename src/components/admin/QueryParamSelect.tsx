'use client'

type QueryParamSelectProps = {
  name: string
  defaultValue?: string
  className?: string
  children: React.ReactNode
}

export function QueryParamSelect({ name, defaultValue = '', className, children }: QueryParamSelectProps) {
  return (
    <select
      defaultValue={defaultValue}
      onChange={(event) => {
        const url = new URL(window.location.href)
        const value = event.target.value

        if (value) {
          url.searchParams.set(name, value)
        } else {
          url.searchParams.delete(name)
        }

        window.location.href = url.toString()
      }}
      className={className}
    >
      {children}
    </select>
  )
}
