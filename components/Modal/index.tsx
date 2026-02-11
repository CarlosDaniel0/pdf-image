import { useEffect, useState } from "react"
import { type IModalProps } from "./types"
import { Backdrop, PanelBottom } from "./styles"

const Modal = (props: IModalProps) => {
  const { children, show, backdrop, container, blur = true, zIndex, setShow, direction, ref } = props
  const { css, ...rest } = container ?? {}
  const [controller, setController] = useState({ show: false, close: true, timer: null as null | NodeJS.Timeout })

  const toggle = () => {
    setController(prev => {
      if (prev.show) return { ...prev, close: true }
      if (prev.timer) clearTimeout(prev.timer)
      const timer = setTimeout(() => setController({ ...prev, show: true, close: false }), 50)
      if (!prev.show) document.body.style.overflow = 'hidden'
      return { ...prev, timer, show: !prev.show }
    })
  }

  const reset = (controller: { show: boolean, close: boolean, timer: null | NodeJS.Timeout }) => {
    if (controller.timer) reset(controller)
    setShow?.(false)
    document.body.style.overflow = ''
    return { close: true, timer: null, show: false }
  }

  const handleAnimation = () => {
    setController(controller => {
      if (controller.close) return reset(controller)
      return controller
    })
  }

  useEffect(() => {
    if (!show) setController(prev => ({ ...prev, close: true }))
    else toggle()
  }, [show])

  return (controller.show ? (
    <Backdrop ref={ref} $zIndex={zIndex} $blur={blur} {...(backdrop ?? {})}>
      <PanelBottom className="shadow-xl/30" onTransitionEnd={handleAnimation} $direction={direction} $show={!controller.close} {...{ ...rest, $css: css }}>
        {children}
      </PanelBottom>
    </Backdrop>) : null)
}

export default Modal