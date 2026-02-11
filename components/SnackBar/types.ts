import { SetState } from "@/utils/types"

export interface SnackBarProps {
  type: 'error' | 'info' | 'warning' | 'success'
  message: string,
  show: boolean,
  setShow: SetState<boolean>,
  time?: number
}