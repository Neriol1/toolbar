export type LabelProps = {
  label: string
}

export const Label = ({ label }: LabelProps) => {
  return <h3 className="text-base font-medium mb-2">{label}</h3>
}
