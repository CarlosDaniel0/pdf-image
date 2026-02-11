import { useEffect, useMemo, useState } from "react";
import { SnackBarProps } from "./types";
import { Timeout } from "@/utils/types";

export default function SnackBar(props: SnackBarProps) {
  const { type, message, show, setShow, time = 3.5 } = props;
  const [controller, setController] = useState({
    show: false,
    hidde: true,
    timer: null as null | Timeout,
    timeout: null as null | Timeout,
  });
  const color = useMemo(() => {
    switch (type) {
      case "error":
        return "bg-red-400";
      case "info":
        return "bg-blue-400";
      case "warning":
        return "bg-orange-400";
      case "success":
      default:
        return "bg-green-400";
    }
  }, [type]);

   const reset = (controller: {
    show: boolean;
    hidde: boolean;
    timer: null | Timeout;
  }) => {
    if (controller.timer) reset(controller);
    setShow?.(false);
    document.body.style.overflow = "";
    return { show: true, timeout: null, timer: null, hidde: false };
  };

  const toggle = () => {
    setController((prev) => {
      if (prev.show) return { ...prev, hidde: true };
      if (prev.timer) clearTimeout(prev.timer);
      if (prev.timeout) clearTimeout(prev.timeout)
      const timer = setTimeout(
        () => setController({ ...prev, show: true, hidde: false }),
        50,
      );
      const timeout = setTimeout(
        () => setController(c => reset(c)),
        time * 1000,
      );
      return { ...prev, timer, timeout, show: !prev.show };
    });
  };

 
  const handleAnimation = () => {
    setController((controller) => {
      if (controller.hidde) return reset(controller);
      return controller;
    });
  };

  useEffect(() => {
    if (!show) setController((prev) => ({ ...prev, close: true }));
    else toggle();
  }, [show]);

  return (
    <>
      {show && (
        <div
          id="snackbar"
          onTransitionEnd={handleAnimation}
          className={`fixed bottom-5 left-1/2 transform -translate-x-1/2 mb-4 px-4 py-3 rounded-lg shadow-lg text-white ${color} transition-opacity duration-300 opacity-${controller.show ? 1 : 0} w-[90%] md:max-w-1/2`}
        >
          {message}
        </div>
      )}
    </>
  );
}
