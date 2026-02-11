import { RuleSet } from "styled-components"

export type ResponsiveSizes = 'sm' | 'md' | 'lg' | 'xl'
export interface IModalProps extends Pick<React.ComponentPropsWithRef<'div'>, 'ref'> {
  show: boolean
  setShow?: React.Dispatch<boolean>
  children: React.ReactElement | React.ReactElement[]
  backdrop?: React.HTMLAttributes<HTMLDivElement>
  container?: React.HTMLAttributes<HTMLDivElement> & { css?: RuleSet<object>, [key: string]: any }
  zIndex?: string | number
  blur?: boolean
  direction?: 'from-bottom' | 'from-right' | 'from-left' | 'center'
}