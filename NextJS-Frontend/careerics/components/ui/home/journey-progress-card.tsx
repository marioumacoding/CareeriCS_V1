export const JourneyProgressCard = ({ percentage = 0, isLoading = false, style }: any) => {


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

      {isLoading ? (
        <div
          style={{
            color: "#D7E3FF",
            fontFamily: "var(--font-jura)",
            fontSize: "0.95rem",
            marginTop: "auto",
            marginBottom: "auto",
          }}
        >
          Loading progress...
        </div>
      ) : (
        <img
          src={`/home/journey-progress/${percentage}.svg`}
          alt="Progress"
          style={{
            position: "relative",
            height: "70%"
          }}
        />
      )}

    </div>
  );
};
