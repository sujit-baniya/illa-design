import { DropListItem } from "@illa-design/dropdown"
import { forwardRef } from "react"
import { OptionProps } from "./interface"

export const Option = forwardRef<HTMLDivElement, OptionProps>((props, ref) => {
  const { value, isSelectOption, disabled, children, ...otherProps } = props

  return (
    <DropListItem
      value={value.toString()}
      isSelectOption={isSelectOption}
      title={children}
      disabled={disabled}
      {...otherProps}
    />
  )
})

Option.displayName = "Option"
