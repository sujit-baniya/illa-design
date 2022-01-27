/** @jsxImportSource @emotion/react */
import * as React from "react"
import {
  ChangeEvent,
  forwardRef,
  ForwardRefExoticComponent,
  useImperativeHandle,
  useRef,
  useState,
} from "react"
import { omit, useMergeValue } from "@illa-design/system"
import { EyeOnIcon, EyeOffIcon } from "@illa-design/icon"
import {
  applyContainerCss,
  applyInputContainer,
  applySuffixCls,
  pointerStyle,
} from "./style"
import { InputRefType, PasswordProps } from "./interface"
import { InputElement } from "./input-element"

export type PasswordRef = ForwardRefExoticComponent<
  PasswordProps & React.RefAttributes<InputRefType>
>
export const Password: PasswordRef = forwardRef<InputRefType, PasswordProps>(
  (props, ref) => {
    const {
      style,
      className,
      allowClear,
      error,
      disabled,
      placeholder,
      invisibleButton = true,
      boarderColor = "blue",
      size = "medium",
      variant = "outline",
      defaultValue,
      onClear,
      onChange,
      onFocus,
      onBlur,
      ...rest
    } = props

    const inputRef = useRef<InputRefType>({} as InputRefType)
    const [visibility, setVisibility] = useState(false)
    const [focus, setFocus] = useState(false)
    const [value, setValue] = useMergeValue("", {
      defaultValue: defaultValue ? defaultValue : undefined,
      value: props.value ? props.value : undefined,
    })

    const stateValue = { error, disabled, focus, variant, size, boarderColor }
    const passwordProp = {
      ...rest,
      type: visibility ? "text" : "password",
      disabled,
      placeholder,
      allowClear,
      onClear,
    }

    const onValueChange = (v: string, e: ChangeEvent<HTMLInputElement>) => {
      if (!("value" in props) || !props.value) {
        setValue(v)
      }
      props.onChange && props.onChange(e)
    }
    useImperativeHandle(ref, () => inputRef?.current, [])

    return (
      <div style={style} className={className}>
        <span css={applyContainerCss(variant)}>
          <span css={applyInputContainer(stateValue)}>
            <InputElement
              ref={inputRef}
              {...passwordProp}
              onFocus={(e) => {
                setFocus(true)
                props.onFocus && props.onFocus(e)
              }}
              onBlur={(e) => {
                setFocus(false)
                props.onBlur && props.onBlur(e)
              }}
              onClear={() => {
                if (!("value" in props) || !props.value) {
                  setValue("")
                }
                onClear?.()
              }}
              value={value}
              onValueChange={onValueChange}
            />
            {invisibleButton ? (
              <span css={applySuffixCls}>
                <span
                  css={pointerStyle}
                  onClick={() => {
                    setVisibility(!visibility)
                  }}
                >
                  {visibility ? <EyeOnIcon /> : <EyeOffIcon />}
                </span>
              </span>
            ) : null}
          </span>
        </span>
      </div>
    )
  },
)

Password.displayName = "Password"
