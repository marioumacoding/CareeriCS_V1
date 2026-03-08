import { useState } from "react";

type CardType = "horizontal" | "square" | "vertical";

type CardProps = {
  type?: CardType;
  title?: string;
  description?: string;
  color?: string;
};

const layouts = {
  horizontal: {
    aspectRatio: "530 / 225",
    viewBox: "0 0 529 190",
    path: "M0 14C0 6.26802 6.26801 4.81271e-07 14 4.69107e-07L297.838 2.25909e-08C307.121 7.98663e-09 316.116 3.22911 323.28 9.13383L352.294 33.0493C359.458 38.9541 368.452 42.1832 377.736 42.1832H516C523.732 42.1832 530 48.4512 530 56.1832V177C530 184.732 523.732 191 516 191H14C6.26802 191 0 184.732 0 177V14Z",
    titleTop: "35%",
    titleWidth: "65%",
    descTop: "55%",
    left: "4%",
    descWidth: "77%",
  },

  square: {
    aspectRatio: "250 / 225",
    viewBox: "0 0 249 203",
    path: "M0 14C0 6.26802 6.26801 0 14 0H136.321C142.959 0 149.165 3.29367 152.885 8.79143L165.36 27.2274C169.08 32.7252 175.286 36.0189 181.924 36.0189H236C243.732 36.0189 250 42.2869 250 50.0189V190C250 197.732 243.732 204 236 204H14C6.26801 204 0 197.732 0 190V14Z",
    titleTop: "33%",
    titleWidth: "100%",
    descTop: "52%",
    left: "8%",
    descWidth: "80%",
  },

  vertical: {
    aspectRatio: "250 / 470",
    viewBox: "0 0 249 441",
    path: "M0 14C0 6.268 6.26801 0 14 0H125.602C130.952 0 136.08 2.14358 139.838 5.95161L164.627 31.0702C168.385 34.8783 173.512 37.0219 178.862 37.0219L236 37.0219C243.732 37.0219 250 43.2899 250 51.0219V430C250 437.732 243.732 444 236 444H14C6.26801 444 0 437.732 0 430V14Z",
    titleTop: "20%",
    titleWidth: "65%",
    descTop: "40%",
    left: "8%",
    descWidth: "72%",
  },
};

export default function FeatureCard({
  type = "horizontal",
  title = "",
  description = "",
  color = "#ffffff",
}: CardProps) {
  const [hover, setHover] = useState(false);

  const layout = layouts[type];

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        width: "100%",
        aspectRatio: layout.aspectRatio,
        backgroundColor: color,
        border: hover ? `3px solid ${color}` : "0px solid transparent",
        borderRadius: "15px",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-end",
        position: "relative",
      }}
    >
      <svg
        viewBox={layout.viewBox}
        preserveAspectRatio="none"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          position: "absolute",
          bottom: 0,
          right: 0,
          width: "100%",
        }}
      >
        <path d={layout.path} fill="#142041" />
      </svg>

      <div
        style={{
          fontFamily: "var(--font-nova-square)",
          position: "absolute",
          color: "white",
          fontSize: "2vw",
          fontWeight: "400",
          top: layout.titleTop,
          left: layout.left,
          textAlign: "left",
          maxWidth: layout.titleWidth,
        }}
      >
        {title}
      </div>

      <div
        style={{
          fontFamily: "var(--font-jura)",
          position: "absolute",
          color: "#AAAAAA",
          fontSize: "1vw",
          fontWeight: "400",
          top: layout.descTop,
          left: layout.left,
          maxWidth: layout.descWidth,
          textAlign: "left",
          whiteSpace: "pre-line",
        }}
      >
        {description}
      </div>
    </div>
  );
}