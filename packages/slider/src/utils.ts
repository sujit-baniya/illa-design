import { BarLocation } from "./content"

export const formatValue = (val: string | number) => {
  if (typeof val === "number") return val
  return Array.from(val.split(","), (v) => parseInt(v))
}

export const getMarkBound = (
  containerWidth: number,
  value: number | number[],
  location: BarLocation,
  partLength: number,
  max: number,
  step: number,
) => {
  if (Array.isArray(value)) {
    switch (location) {
      default:
      case BarLocation.RIGHT: {
        return {
          left: Math.round(value[0] / step + 1) * partLength - containerWidth,
          right: Math.floor(max / step) * partLength - containerWidth,
        }
      }
      case BarLocation.LEFT: {
        return {
          left: -containerWidth,
          right: Math.floor((value[1] - step) / step) * partLength,
        }
      }
    }
  }
  return {
    left: -containerWidth,
    right: Math.floor(max / step) * partLength,
  }
}

export const verifyRightValue = (
  max: number,
  min: number,
  step: number,
  rightVal: number,
  leftVal: number | undefined,
): number => {
  if (rightVal >= max) return max
  if (leftVal === undefined && rightVal <= min) {
    return min
  }
  return rightVal
}
export const verifyLeftValue = (
  max: number,
  min: number,
  step: number,
  rightVal: number,
  leftVal: number | undefined,
): undefined | number => {
  if (leftVal === undefined) return leftVal
  if (leftVal <= min) return min
  if (leftVal >= max) return max
  return leftVal
}

export const verifyValue = (value: number | number[]) => {
  if (Array.isArray(value)) {
    return !value.every((v) => isNaN(v))
  } else {
    return !isNaN(value)
  }
}

export const getSafeStep = (step: number) => (step && step > 0 ? step : 1)
