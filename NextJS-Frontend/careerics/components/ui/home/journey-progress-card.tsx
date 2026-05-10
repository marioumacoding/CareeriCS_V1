export const JourneyProgressCard = ({ percentage = 10, style }: any) => {


  return (
    <div
      style={{
        backgroundColor: "var(--dark-blue)",
        borderRadius: " 3vh",
        paddingTop: "3vh",
        color: "white",
        alignContent: "center",
        justifyItems: "center",
        ...style,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <h3
        style={{
          fontSize: "1.1rem",
          marginBottom: "1vh",
          fontFamily: "var(--font-nova-square)",
        }}
      >
        Journey Progress
      </h3>

      <img
        src={`/home/journey-progress/${percentage}.svg`}
        alt="Progress"
        style={{
          position: "relative",
          height: "70%"
        }}
      />

    </div>
  );
};