"use client";

import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <div
      style={{
        width: "100%",
        minHeight: "100vh",
        backgroundColor: "#050505",
        color: "white",
        fontFamily: "sans-serif",
      }}
    >
      {/* Navbar */}
      <div
        style={{
          width: "100%",
          height: 60,
          background: "#050505",
          backdropFilter: "blur(50px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 2rem",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            color: "white",
            fontSize: 44,
            fontFamily: "Nova Square, sans-serif",
            fontWeight: 400,
          }}
        >
          CareeriCS
        </div>

        <div style={{ display: "flex", gap: "2rem", alignItems: "center" }}>
          {["Home", "Toolkit", "Journey Flow"].map((item) => (
            <div
              key={item}
              style={{
                color: "white",
                fontSize: 28,
                fontFamily: "Jura",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              {item}
            </div>
          ))}
        </div>

        <Link href="/auth/login" style={{ textDecoration: "none" }}>
          <button
            style={{
              width: 150,
              height: 40,
              background: "white",
              borderRadius: 20,
              fontSize: 20,
              fontFamily: "Jura, sans-serif",
              fontWeight: 700,
              color: "#1E1E1E",
              cursor: "pointer",
              border: "none",
            }}
          >
            Sign In
          </button>
        </Link>
      </div>

      <div style={{ marginTop: "5rem", textAlign: "center" }}>
        <p
          style={{
            color: "white",
            fontSize: 48,
            fontFamily: "Jura",
            fontWeight: 700,
            wordWrap: "break-word",
          }}
        >
          Choose from our various features
        </p>
      </div>

      <div
        style={{
          width: "100%",
          maxWidth: 1200,
          margin: "1rem auto",
          padding: "0 2rem",
          boxSizing: "border-box",
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gridTemplateRows: "200px 200px 200px",
          gap: "14px",
        }}
      >
        <div
          style={{
            width: "100%",
            height: 500,
            position: "relative",
          }}
        >
          <Image
            src="/landing/Journey+Text.svg"
            alt="Section Image"
            fill
            style={{ objectFit: "fill" }}
          />
        </div>


        {/* Row 1: Career Quiz | CV Builder (tall) | CV Enhancer (wide) */}
        <div style={{ gridColumn: "1 / 2", gridRow: "1 / 2", position: "relative", borderRadius: 14, overflow: "hidden", backgroundColor: "#0f1d32" }}>
          <Image src="/landing/Career Quiz Card.svg" alt="Career Quiz" fill style={{ objectFit: "cover" }} />
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: 16 }}>
            <h3 style={{ marginTop: 20, paddingTop: 20, fontSize: 18, fontFamily: "Jura, sans-serif", fontWeight: 700, color: "white", textAlign: "center" }}>Career Quiz</h3>
            <p style={{ margin: "4px 0 0", fontSize: 11, textAlign: "center", fontFamily: "Jura, sans-serif", color: "rgba(255,255,255,0.8)", lineHeight: 1.4 }}>{"Career confusion? We don't know her. Discover where you'd thrive with our 5-minutes Quiz."}</p>
        {/* Row 1 */}
        <div
          style={{
            gridColumn: "1 / 2",
            gridRow: "1 / 2",
            position: "relative",
            borderRadius: 14,
            overflow: "hidden",
            backgroundColor: "#0f1d32",
          }}
        >
          <Image
            src="/landing/Career Quiz Card.svg"
            alt="Career Quiz"
            fill
            style={{ objectFit: "cover" }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-end",
              padding: 16,
            }}
          >
            <h3
              style={{
                marginTop: "30rem",
                paddingTop: 20,
                fontSize: 32,
                fontFamily: "Nova Square, sans-serif",
                fontWeight: 400,
                color: "white",
                textAlign: "left",
                marginBottom: "0.5rem",
              }}
            >
              Career Quiz
            </h3>
            <p
              style={{
                margin: "4px 0 0",
                fontSize: 20,
                textAlign: "center",
                fontFamily: "Jura",
                color: "#AAAAAA",
                fontWeight: 400, 
                lineHeight: 1.4,
              }}
            >
              Career confusion? We don't know her. Discover where you'd thrive with our 5-minutes Quiz.
            </p>
          </div>
        </div>

        <div
          style={{
            gridColumn: "2 / 3",
            gridRow: "1 / 3",
            position: "relative",
            borderRadius: 14,
            overflow: "hidden",
            backgroundColor: "#0f1d32",
            height: 200,
          }}
        >
          <Image
            src="/landing/CV Builder Card.svg"
            alt="CV Builder"
            fill
            style={{ objectFit: "cover" }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              paddingTop: 60,
              paddingLeft: 10,
              paddingRight: 10,
            }}
          >
            <h3
              style={{
                // margin: 0,
                fontSize: 22,
                fontFamily: "Jura, sans-serif",
                fontWeight: 700,
                color: "white",
                textAlign: "right",
                marginBottom: "2rem",
              }}
            >
              CV Builder
            </h3>
            <p
              style={{
                margin: "8px 0 0",
                fontSize: 12,
                fontFamily: "Jura, sans-serif",
                color: "rgba(255,255,255,0.8)",
                lineHeight: 1.4,
                textAlign: "center",
              }}
            >
              Never had a CV before and not sure how to make one? Build a professional, ATS-friendly CV in minutes. No guesswork. Just results.
            </p>
          </div>
        </div>

        <div
          style={{
            gridColumn: "3 / 5",
            gridRow: "1 / 2",
            position: "relative",
            borderRadius: 14,
            overflow: "hidden",
            backgroundColor: "#0f1d32",
          }}
        >
          <Image
            src="/landing/CV Enhancer Card.svg"
            alt="CV Enhancer"
            fill
            style={{ objectFit: "cover" }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              padding: 20,
            }}
          >
            <h3
              style={{
                margin: 0,
                fontSize: 22,
                fontFamily: "Jura, sans-serif",
                fontWeight: 700,
                color: "white",
              }}
            >
              CV Enhancer
            </h3>
            <p
              style={{
                margin: "6px 0 0",
                fontSize: 12,
                fontFamily: "Jura, sans-serif",
                color: "rgba(255,255,255,0.8)",
                lineHeight: 1.4,
              }}
            >
              Already have a CV but it's not getting you anywhere? We'll optimize it to get you recruiters attention.
            </p>
          </div>
        </div>

        {/* Row 2 */}
        <div
          style={{
            gridColumn: "1 / 2",
            gridRow: "2 / 4",
            position: "relative",
            borderRadius: 14,
            overflow: "hidden",
            backgroundColor: "#0f1d32",
            height: 400,
          }}
        >
          <Image
            src="/landing/Roadmap Card.svg"
            alt="Roadmap Generation"
            fill
            style={{ objectFit: "cover" }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-start",
              padding: 16,
            }}
          >
            <h3
              style={{
                margin: 0,
                fontSize: 20,
                fontFamily: "Jura, sans-serif",
                fontWeight: 700,
                color: "white",
              }}
            >
              Roadmap Generation
            </h3>
            <p
              style={{
                margin: "6px 0 0",
                fontSize: 11,
                fontFamily: "Jura, sans-serif",
                color: "rgba(255,255,255,0.8)",
                lineHeight: 1.4,
              }}
            >
              Confused about your next steps? Get a clear map towards your dream role. We'll tell you exactly what to learn and how.
            </p>
          </div>
        </div>

        <div
          style={{
            gridColumn: "2 / 3",
            gridRow: "2 / 3",
            position: "relative",
            borderRadius: 14,
            overflow: "hidden",
            backgroundColor: "#0f1d32",
          }}
        >
          <Image
            src="/landing/Courses Card.svg"
            alt="Courses"
            fill
            style={{ objectFit: "cover" }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-start",
              padding: 16,
            }}
          >
            <h3
              style={{
                margin: 0,
                fontSize: 18,
                fontFamily: "Jura, sans-serif",
                fontWeight: 700,
                color: "white",
              }}
            >
              Courses
            </h3>
            <p
              style={{
                margin: "4px 0 0",
                fontSize: 11,
                fontFamily: "Jura, sans-serif",
                color: "rgba(255,255,255,0.8)",
                lineHeight: 1.4,
              }}
            >
              Learn skills that companies are actually hiring for.
            </p>
          </div>
        </div>

        <div
          style={{
            gridColumn: "3 / 4",
            gridRow: "2 / 3",
            position: "relative",
            borderRadius: 14,
            overflow: "hidden",
            backgroundColor: "#0f1d32",
          }}
        >
          <Image
            src="/landing/Interview Card.svg"
            alt="HR Interview"
            fill
            style={{ objectFit: "cover" }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-start",
              padding: 16,
            }}
          >
            <h3
              style={{
                margin: 0,
                fontSize: 18,
                fontFamily: "Jura, sans-serif",
                fontWeight: 700,
                color: "white",
              }}
            >
              HR Interview
            </h3>
            <p
              style={{
                margin: "4px 0 0",
                fontSize: 11,
                fontFamily: "Jura, sans-serif",
                color: "rgba(255,255,255,0.8)",
                lineHeight: 1.4,
              }}
            >
              Practice smart answers to the impossible Question.
            </p>
          </div>
        </div>

        <div
          style={{
            gridColumn: "4 / 5",
            gridRow: "2 / 4",
            position: "relative",
            borderRadius: 14,
            overflow: "hidden",
            backgroundColor: "#0f1d32",
          }}
        >
          <Image
            src="/landing/Job Applicator Card.svg"
            alt="Job Applicator"
            fill
            style={{ objectFit: "cover" }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-start",
              padding: 16,
            }}
          >
            <h3
              style={{
                margin: 0,
                fontSize: 20,
                fontFamily: "Jura, sans-serif",
                fontWeight: 700,
                color: "white",
              }}
            >
              Job Applicator
            </h3>
            <p
              style={{
                margin: "6px 0 0",
                fontSize: 11,
                fontFamily: "Jura, sans-serif",
                color: "rgba(255,255,255,0.8)",
                lineHeight: 1.4,
              }}
            >
              Job hunting shouldn't feel like a full time job. CareeriCS will look for you and give you only the best matches, saving you the hustle.
            </p>
          </div>
        </div>

        {/* Row 3 */}
        <div
          style={{
            gridColumn: "2 / 3",
            gridRow: "3 / 4",
            position: "relative",
            borderRadius: 14,
            overflow: "hidden",
            backgroundColor: "#0f1d32",
          }}
        >
          <Image
            src="/landing/Skill Assessment Card.svg"
            alt="Skill Assessment"
            fill
            style={{ objectFit: "cover" }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-end",
              padding: 16,
            }}
          >
            <h3
              style={{
                margin: 0,
                fontSize: 18,
                fontFamily: "Jura, sans-serif",
                fontWeight: 700,
                color: "white",
              }}
            >
              Skill Assessment
            </h3>
            <p
              style={{
                margin: "4px 0 0",
                fontSize: 11,
                fontFamily: "Jura, sans-serif",
                color: "rgba(255,255,255,0.8)",
                lineHeight: 1.4,
              }}
            >
              Find out where you truly stand. Identify strengths, uncover gaps, and know what to improve.
            </p>
          </div>
        </div>

        <div
          style={{
            gridColumn: "3 / 4",
            gridRow: "3 / 4",
            position: "relative",
            borderRadius: 14,
            overflow: "hidden",
            backgroundColor: "#0f1d32",
          }}
        >
          <Image
            src="/landing/Interview Card.svg"
            alt="Tech Interview"
            fill
            style={{ objectFit: "cover" }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-end",
              padding: 16,
            }}
          >
            <h3
              style={{
                margin: 0,
                fontSize: 18,
                fontFamily: "Jura, sans-serif",
                fontWeight: 700,
                color: "white",
              }}
            >
              Tech Interview
            </h3>
            <p
              style={{
                margin: "4px 0 0",
                fontSize: 11,
                fontFamily: "Jura, sans-serif",
                color: "rgba(255,255,255,0.8)",
                lineHeight: 1.4,
              }}
            >
              Explain your thinking clearly even under pressure.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}