import styled, { RuleSet } from "styled-components";

export const Backdrop = styled.div<{
  $blur?: boolean;
  $zIndex?: number | string;
}>`
  position: fixed;
  top: 0px;
  left: 0px;
  right: 0px;
  bottom: 0px;
  background-color: rgba(0, 0, 0, 0.125);
  z-index: ${(attr) => attr?.$zIndex ?? 2000};
  display: flex;
  justify-content: center;
  overflow: hidden;
  ${(attr) => (attr?.$blur ? "backdrop-filter: blur(4px);" : "")}
`;

export const Container = styled.div<{ $css?: RuleSet<object> }>`
  position: relative;
  margin-top: 5em;
  border-radius: 0.5em;
  background-color: var(--modal-background);
  color: var(--text-2);
  overflow: hidden;
  box-shadow: 5px 5px 10px rgba(0, 0, 0, 0.28);
  ${(attr) => attr?.$css ?? ""}
`;

export const PanelBottom = styled.div<{
  $css?: RuleSet<object>;
  $show?: boolean;
  $direction?: "from-bottom" | "from-right" | "from-left" | "center";
}>`
  background: #5f5f5f;
  padding: 10px 8px;
  position: fixed;
  transition-property: transform, opacity;
  transition-duration: 0.3s;
  transition-timing-function: cubic-bezier(0.075, 0.82, 0.165, 1);
  transition-delay: 0s;

  @media screen and (min-width: 500px) {
    height: max-content;
    top: 50%;
    transform: translate(-50%, -50%);
    border-radius: 15px;
    padding: 16px;
    left: 50%;
    bottom: unset;
    opacity: ${(attr) => (attr?.$show ? 1 : 0)};
  }

  ${(attr) => {
    switch (attr?.$direction) {
      case "from-right":
        return `height: 100%;
        right: 0;
        width: 100%;
        max-width: 500px;
        transform: ${`translateX(${attr?.$show ? "0%" : "100%"})`};
        `;
      case "from-left":
        return `height: 100%;
        left: 0;
        width: 100%;
        max-width: 500px;
        transform: ${`translateX(${attr?.$show ? "0%" : "-100%"})`};
        `;
      case "from-bottom":
        return `border-radius: 15px 15px 0 0;
          left: calc(50% - (97%/2));
          bottom: 0;
          width: 97%;
          transform: ${`translateY(${attr?.$show ? "0%" : "100%"})`};`;
      case "center":
        return "";
    }
  }}

  ${(attr) => attr?.$css ?? ""}
`;
