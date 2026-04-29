type BaseProps = {
  style?: React.CSSProperties;
  phaseNumber: string;
};

type PhaseCardProps =
  | {
      type: "current";
    } & BaseProps
  | {
      type: "next";
      desc: string;
    } & BaseProps;

export const PhaseCard = (props: PhaseCardProps) => {
  const baseStyle: React.CSSProperties = {
    backgroundColor: "#142143",
    borderRadius: "3vh",
    color: "white",
  };

  // --- CURRENT PHASE ---
  if (props.type === "current") {
    const { style, phaseNumber } = props;

    return (
      <div
        style={{
          ...baseStyle,
          paddingTop: "3vh",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyItems: "center",
          ...style,
        }}
      >
        <h3
          style={{
            fontSize: "1.1rem",
            fontFamily: "var(--font-nova-square)",
            marginBottom: "auto",
          }}
        >
          Current Phase
        </h3>

        <img
          src={`/home/current-phase/${phaseNumber}.svg`}
          alt="Current Phase"
          style={{
            position: "relative",
            marginLeft: "auto",
            width: "100%",
          }}
        />
      </div>
    );
  }

  // --- NEXT PHASE ---
  const { style, phaseNumber, desc } = props;

  return (
    <div
      style={{
        ...baseStyle,
        display: "flex",
        justifyContent: "space-between",
        height: "100%",
        paddingLeft: "3vw",
        overflow: "clip",
        ...style,
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-start",
          width: "fit-content",
        }}
      >
        <h3
          style={{
            fontSize: "1.1rem",
            marginBottom: "10px",
            fontFamily: "var(--font-nova-square)",
            marginTop: "3vh",
          }}
        >
          Next Phase
        </h3>

        <p
          style={{
            fontSize: "0.9rem",
            opacity: 0.7,
            lineHeight: "1.4",
            margin: 0,
            width: "25ch",
          }}
        >
          {desc}
        </p>
      </div>

      <div
        style={{
          height: "100%",
          position: "relative",
          width: "fit-content",
          display: "flex",
          alignItems: "center",
        }}
      >
        <div
          style={{
            backgroundColor: "white",
            height: "100%",
            width: "0.4vh",
          }}
        />

        <img
          src={`/home/next-phase/${phaseNumber}.svg`}
          alt="Next Phase"
          style={{
            position: "relative",
            height: "100%",
            marginLeft: "auto",
          }}
        />
      </div>
    </div>
  );
};