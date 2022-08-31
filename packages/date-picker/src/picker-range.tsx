import { cloneElement, forwardRef, useEffect, useRef, useState } from "react"
import { CommonRangeProps } from "./interface"
import { Trigger } from "@illa-design/trigger"
import { CalendarIcon } from "@illa-design/icon"
import { RangeInput, RangeInputRef } from "@illa-design/input"
import {
  applyRangeFooterCss, applyShortContainerCss, buttonBoxCss,
  rangeBodyCss,
  rangeLeftContentCss,
  rangePickerCss, rangeRightContentCss, shortCutsCss,
  showTimeHeaderCss,
  triContentCommonCss,
  wrapCss,
} from "./style"
import { TimePickerPopup } from "@illa-design/time-picker"
import dayjs, { Dayjs } from "dayjs"
import { Calendar } from "@illa-design/calendar"
import { css } from "@emotion/react"
import { Button } from "@illa-design/button"
import { initFormat, isValidTime } from "./utils"
import {
  dayjsPro,
  getDayjsValue,
  getSortedDayjsArray,
  isArray,
  isDayjsArrayChange,
  useMergeValue,
} from "@illa-design/system"

const formatTime = (str: Dayjs, format: string) => {
  return str ? dayjsPro(str)?.format(format) : ""
}

export const PickerRange = forwardRef<HTMLDivElement, CommonRangeProps>(
  (props, ref) => {
    const {
      disabled,
      disableConfirm,
      order = true,
      allowClear = true,
      position = "bottom-start",
      placeholder = [],
      shortcuts,
      shortcutsPlacementLeft,
      size = "medium",
      error,
      popupVisible,
      onVisibleChange,
      onChange,
      onSelect,
      editable = true,
      separator,
      disabledDate,
      onOk,
      defaultPickerValue,
      format,
      defaultValue,
      showTime,
      timepickerProps,
      disabledTime,
      onSelectShortcut,
      onClear,
      colorScheme,
      value,
      readOnly,
      ...otherProps
    } = props

    const inputGroupRef = useRef({} as RangeInputRef)
    const tpProps = typeof showTime === "object" ? showTime : {}
    const isBooleanShowTime = typeof showTime === "boolean" ? showTime : false

    const finalFormat = initFormat("day", isBooleanShowTime, format)
    const [leftCalendarDate, setLeftCalendarDate] = useState<Dayjs>(
      defaultPickerValue?.[0] ? dayjs(defaultPickerValue[0]) : dayjs(),
    )
    const [rightCalendarDate, setRightCalendarDate] = useState<Dayjs>(
      !defaultPickerValue?.[0] && defaultPickerValue?.[1]
        ? dayjs(defaultPickerValue[1])
        : dayjs().add(1, "month"),
    )
    const [preChangeValue, setPreChangeValue] = useState<number>(0)
    let initVal = defaultValue
      ? [
        dayjs(defaultValue[0]).format(finalFormat as string),
        dayjs(defaultValue[1]).format(finalFormat as string),
      ]
      : []
    const [inputVal, setInputVal] = useState<string[]>()
    const [valueShow, setValueShow] = useState<Dayjs[]>()
    const [currentValue, setCurrentValue] = useMergeValue(
      value
        ? getDayjsValue(value, finalFormat) as Dayjs[]
        : defaultValue
          ? getDayjsValue(defaultValue, finalFormat) as Dayjs[]
          : undefined,
      {
        value: getDayjsValue(value, finalFormat) as Dayjs[],
        defaultValue: undefined,
      },
    )
    const [focusedInputIndex, setFocusedInputIndex] = useState<number>(0)

    // useEffect(() => {
    //   if (value) {
    //     setInputVal([
    //       dayjs(value[0]).format(finalFormat as string),
    //       dayjs(value[1]).format(finalFormat as string),
    //     ])
    //   }
    // }, [value])

    const [showTrigger, setShowTrigger] = useState<boolean>(
      popupVisible as boolean,
    )
    const [showTimePicker, setShowTimePicker] = useState<boolean>(false)
    const [valueShowLeft, setValueShowLeft] = useState<Dayjs>()
    const [valueShowRight, setValueShowRight] = useState<Dayjs>()
    const shortcutsShowLeft = shortcuts?.length && shortcutsPlacementLeft
    const shortcutsShowBottom = shortcuts?.length && !shortcutsPlacementLeft
    // calendar range value
    const [rangeValueFirst, setRangeValueFirst] = useState<Dayjs | undefined>()
    const [rangeValueSecond, setRangeValueSecond] = useState<Dayjs | undefined>()
    const [rangeValueHover, setRangeValueHover] = useState<Dayjs | undefined>()

    const onClearDate = () => {
      setInputVal([])
    }

    const changeHeader = (date: Dayjs) => {
      let difValue = date.diff(dayjs(), "day")
      let result = difValue - preChangeValue
      if (result < 0) {
        // pre
        if (leftCalendarDate.isSame(date, "date")) {
          return
        }
        setLeftCalendarDate(date)
        setRightCalendarDate(date.add(1, "month"))
      } else {
        // next
        if (rightCalendarDate.isSame(date, "date")) {
          return
        }
        setRightCalendarDate(date)
        setLeftCalendarDate(date.subtract(1, "month"))
      }
      setPreChangeValue(difValue)
    }

    const handleRangeVal = (
      date: Dayjs | undefined,
      type: "first" | "second" | "hover",
    ) => {
      if (type === "first") {
        setRangeValueFirst(date)
      } else if (type === "second") {
        if (date?.isBefore(rangeValueFirst)) {
          setRangeValueSecond(rangeValueFirst)
          setRangeValueFirst(date)
        } else {
          setRangeValueSecond(date)
        }
      } else if (type === "hover") {
        setRangeValueHover(date)
      }
    }

    useEffect(() => {
      if (!rangeValueFirst || !rangeValueSecond) return
      let formatPre = rangeValueFirst.format(finalFormat as string)
      let formatAfter = rangeValueSecond.format(finalFormat as string)
      if (showTime) {
        onSelect?.(
          [formatPre, formatAfter],
          [rangeValueFirst, rangeValueSecond],
        )
        return
      }
      setInputVal([formatPre, formatAfter])
      setShowTrigger(false)
      onChange?.([formatPre, formatAfter], [rangeValueFirst, rangeValueSecond])
    }, [rangeValueSecond])

    const showTimeConfirm = () => {
      if (!rangeValueFirst || !rangeValueSecond) return
      let defaultTime = dayjs()
      let calendarPre = dayjs(
        Math.min(rangeValueFirst.valueOf(), rangeValueSecond.valueOf()),
      ).format("YYYY-MM-DD")
      let calendarAfter = dayjs(
        Math.max(rangeValueFirst.valueOf(), rangeValueSecond.valueOf()),
      ).format("YYYY-MM-DD")
      let timePickerPre = (valueShowLeft || defaultTime).format("HH:mm:ss")
      let timePickerAfter = (valueShowRight || defaultTime).format("HH:mm:ss")
      setInputVal([
        `${calendarPre} ${timePickerPre}`,
        `${calendarAfter} ${timePickerAfter}`,
      ])
      onChange?.(
        [
          `${calendarPre} ${timePickerPre}`,
          `${calendarAfter} ${timePickerAfter}`,
        ],
        [
          dayjs(`${calendarPre} ${timePickerPre}`),
          dayjs(`${calendarAfter} ${timePickerAfter}`),
        ],
      )
      onOk?.(
        [
          `${calendarPre} ${timePickerPre}`,
          `${calendarAfter} ${timePickerAfter}`,
        ],
        [
          dayjs(`${calendarPre} ${timePickerPre}`),
          dayjs(`${calendarAfter} ${timePickerAfter}`),
        ],
      )
      setShowTrigger(false)
    }

    function ShortcutsCompt() {
      return shortcuts ? (
        <div css={applyShortContainerCss(shortcutsPlacementLeft)}>
          {shortcuts.map((item: any, key) => {
            return (
              <div
                css={shortCutsCss}
                key={key}
                onClick={() => {
                  setRangeValueFirst(item.value()[0])
                  setRangeValueSecond(item.value()[1])
                  onSelectShortcut?.(item)
                }}
              >
                {item.text}
              </div>
            )
          })}
        </div>
      ) : null
    }

    const tryUpdatePopupVisible = (value: boolean) => {
      if (popupVisible !== value) {
        setShowTrigger?.(value)
        onVisibleChange?.(value)
      }
    }

    const changeFocusedInputIndex = (index: number) => {
      setFocusedInputIndex(index)
      setTimeout(() => inputGroupRef?.current?.focus?.(index))
    }

    const focusInput = (focus: boolean = true) => {
      if (focus) {
        inputGroupRef.current?.focus?.(focusedInputIndex)
      } else {
        inputGroupRef.current?.blur?.()
      }
    }

    const onConfirmValue = (vs?: Dayjs[]) => {
      //  when disabled = array, Deal with the problem of changing the time sequence
      const currentOrder =
        !(isArray(disabled) && (disabled[0] || disabled[1])) && order
      const newValue =
        currentOrder ? getSortedDayjsArray(vs as Dayjs[]) : vs
      setCurrentValue(newValue)
      setValueShow(undefined)
      setInputVal(undefined)

      if (
        isArray(newValue) &&
        isDayjsArrayChange(currentValue as Dayjs[], newValue)
      ) {
        onChange?.(
          newValue.map((t) => t.format(finalFormat)),
          newValue,
        )
      }

      if (!disableConfirm) {
        tryUpdatePopupVisible(false)
        setTimeout(() => focusInput(false))
      }
    }


    return (
      <Trigger
        showArrow={false}
        position={position}
        trigger={"click"}
        colorScheme={"white"}
        maxW={"700px"}
        popupVisible={popupVisible}
        content={<div css={wrapCss}>
          {shortcutsShowLeft && <ShortcutsCompt />}
          <div>
            <div css={rangeBodyCss}>
              {showTimePicker && (
                <div css={rangePickerCss}>
                  <div>
                    <div css={showTimeHeaderCss}>time</div>
                    {cloneElement(<TimePickerPopup />, {
                      isRangePicker: false,
                      disableConfirm: true,
                      format: "HH:mm:ss",
                      valueShow: valueShowLeft,
                      setValueShow: setValueShowLeft,
                      popupVisible: showTrigger,
                      showNowBtn: false,
                      disabledHours: disabledTime?.(dayjs(), "start")
                        .disabledHours,
                      disabledMinutes: disabledTime?.(dayjs(), "start")
                        .disabledMinutes,
                      disabledSeconds: disabledTime?.(dayjs(), "start")
                        .disabledSeconds,
                      ...timepickerProps,
                      ...tpProps,
                    })}
                  </div>
                  <div>
                    <div css={showTimeHeaderCss}>time</div>
                    {cloneElement(<TimePickerPopup />, {
                      isRangePicker: false,
                      disableConfirm: true,
                      format: "HH:mm:ss",
                      valueShow: valueShowRight,
                      setValueShow: setValueShowRight,
                      popupVisible: showTrigger,
                      showNowBtn: false,
                      disabledHours: disabledTime?.(dayjs(), "end")
                        .disabledHours,
                      disabledMinutes: disabledTime?.(dayjs(), "end")
                        .disabledMinutes,
                      disabledSeconds: disabledTime?.(dayjs(), "end")
                        .disabledSeconds,
                      ...timepickerProps,
                      ...tpProps,
                    })}
                  </div>
                </div>
              )}
              {!showTimePicker && (
                <>
                  <Calendar
                    panel
                    mode={"day"}
                    _css={css`
                      ${triContentCommonCss};
                      ${rangeLeftContentCss}
                    `}
                    panelOperations={["doubleLeft", "left"]}
                    panelTodayBtn={false}
                    onPanelChange={(date: Dayjs) => changeHeader(date)}
                    disabledDate={disabledDate}
                    // extra
                    rangePicker
                    isTodayTarget
                    defaultDate={leftCalendarDate}
                    rangeValueFirst={rangeValueFirst}
                    rangeValueSecond={rangeValueSecond}
                    rangeValueHover={rangeValueHover}
                    handleRangeVal={handleRangeVal}
                  />
                  <Calendar
                    panel
                    mode={"day"}
                    _css={css`
                      ${triContentCommonCss};
                      ${rangeRightContentCss}
                    `}
                    panelOperations={["doubleRight", "right"]}
                    panelTodayBtn={false}
                    onPanelChange={(date: Dayjs) => changeHeader(date)}
                    disabledDate={disabledDate}
                    // extra
                    rangePicker
                    isTodayTarget
                    defaultDate={rightCalendarDate}
                    rangeValueFirst={rangeValueFirst}
                    rangeValueSecond={rangeValueSecond}
                    rangeValueHover={rangeValueHover}
                    handleRangeVal={handleRangeVal}
                  />
                </>
              )}
            </div>
            {(showTime || shortcutsShowBottom) && (
              <div
                css={applyRangeFooterCss(!!showTime, !!shortcutsShowBottom)}
              >
                {shortcutsShowBottom && <ShortcutsCompt />}
                {showTime && (
                  <div css={buttonBoxCss}>
                    <Button
                      variant={"text"}
                      onClick={() => setShowTimePicker(!showTimePicker)}
                    >
                      choose {showTimePicker ? "date" : "time"}
                    </Button>
                    <Button onClick={() => showTimeConfirm()}>ok</Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>}
        closeOnClick={false}
        clickOutsideToClose
        onVisibleChange={tryUpdatePopupVisible}
      >
        <RangeInput
          {...otherProps}
          ref={ref}
          disabled={disabled}
          value={inputVal
            ? inputVal
            : isArray(valueShow) && valueShow.length
              ? [formatTime(valueShow[0], finalFormat), formatTime(valueShow?.[1], finalFormat)]
              : isArray(currentValue) && currentValue.length
                ? [formatTime(currentValue[0], finalFormat), formatTime(currentValue?.[1], finalFormat)]
                : []}
          borderColor={colorScheme}
          allowClear={allowClear}
          onClear={() => onClearDate?.()}
          placeholder={placeholder}
          error={error}
          readOnly={readOnly}
          size={size}
          suffix={{ render: <CalendarIcon /> }}
          separator={separator}
          onPressEnter={() => {
            if (isArray(valueShow) && valueShow.length) {
              if (
                valueShow[0] === undefined ||
                valueShow[1] === undefined
              ) {
                changeFocusedInputIndex(focusedInputIndex === 0 ? 1 : 0)
              } else if (valueShow.length === 2) {
                // onConfirmValue(valueShow)
              }
            } else {
              tryUpdatePopupVisible(false)
            }
          }}
          onChange={(value?: string[]) => {
            if (editable) {
              console.log({
                value,
                focusedInputIndex,
                val: value?.[focusedInputIndex],
                isValidTime: isValidTime(value?.[focusedInputIndex], finalFormat),
              })
              if (!value) {
                setInputVal(undefined)
                return
              }
              if (!isArray(value)) return
              setInputVal(value)
              const val = value[focusedInputIndex]
              const newValueShow = [
                ...(valueShow || currentValue || []),
              ]
              if (isValidTime(val, finalFormat)) {
                newValueShow[focusedInputIndex] = getDayjsValue(
                  val,
                  finalFormat,
                ) as Dayjs
                setValueShow(newValueShow)
                setInputVal(undefined)
              }
            }
          }}
          changeFocusedInputIndex={changeFocusedInputIndex}
        />
      </Trigger>
    )
  },
)
PickerRange.displayName = "PickerRange"
