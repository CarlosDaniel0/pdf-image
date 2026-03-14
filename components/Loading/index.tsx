export default function Loading(props: { label?: string; percent?: number }) {
  const { label, percent } = props;
  return (
    <div className="w-screen h-screen flex justify-center items-center">
      <div role="status" className="flex flex-col items-center gap-2 relative">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="80"
          height="80"
          viewBox="0 0 17 17"
        >
          <path
            strokeLinecap="round"
            strokeWidth="0.8"
            stroke="#414141"
            fill="none"
            d="M8.5 0.6 l2.75 2.4 l2.75 0 l0 3.3 l2.3 2.3 l-2.3 2.3 l0 3.1 l-3.1 0 l-2.4 2.4 l-2.4 -2.4 l-3.1 0 l0 -2.8 l-2.3 -2.6 l2.3 -2.8l0 -2.8l2.75 0z"
          />
          <path
            strokeLinecap="round"
            strokeDasharray={!!percent ? 60 + percent * 51 : 60}
            strokeDashoffset="60"
            strokeWidth="1"
            stroke="#e5a2ff"
            fill="none"
            d="M8.5 0.6 l2.75 2.4 l2.75 0 l0 3.3 l2.3 2.3 l-2.3 2.3 l0 3.1 l-3.1 0 l-2.4 2.4 l-2.4 -2.4 l-3.1 0 l0 -2.8 l-2.3 -2.6 l2.3 -2.8l0 -2.8l2.75 0z"
          >
            <animate
              attributeName="stroke-dashoffset"
              calcMode="spline"
              values="60;-60"
              dur="2s"
              keySplines="0 0 1 1"
              repeatCount="indefinite"
            /> 
          </path>
        </svg>
        <span className="absolute top-[32%] text-sm">
          {!!percent &&
            Intl.NumberFormat("pt-BR", {
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
              style: "percent",
            }).format(percent)}
        </span>
        <span className={label || !percent ? "whitespace-pre text-center" : "sr-only"}>
          {label ? label : "Carregando..."}
        </span>
      </div>
    </div>
  );
}
