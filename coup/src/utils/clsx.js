/**
 * clsx - 조건부 클래스명 결합 유틸리티
 *
 * @param  {...any} args - 클래스명, 객체, 배열 등
 * @returns {string} - 결합된 클래스명 문자열
 */
export default function clsx(...args) {
  const classes = []

  for (let i = 0; i < args.length; i++) {
    const arg = args[i]
    if (!arg) continue

    const argType = typeof arg

    if (argType === 'string' || argType === 'number') {
      classes.push(arg)
    } else if (Array.isArray(arg)) {
      if (arg.length) {
        const inner = clsx(...arg)
        if (inner) {
          classes.push(inner)
        }
      }
    } else if (argType === 'object') {
      for (const key in arg) {
        if (arg.hasOwnProperty(key) && arg[key]) {
          classes.push(key)
        }
      }
    }
  }

  return classes.join(' ')
}

// Named export
export { clsx }

