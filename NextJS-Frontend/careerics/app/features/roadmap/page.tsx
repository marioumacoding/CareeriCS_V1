import Link from "next/link";
import { RoadmapCatalog } from "@/components/roadmaps/roadmap-catalog";
import { roadmapCatalog } from "@/services";

export default function RoadmapFeaturePage() {
	return (
		<div
			style={{
				width: "100%",
				height: "100%",
				display: "grid",
				gridTemplateRows: "auto auto 1fr",
				gap: "1.5rem",
				color: "white",
			}}
		>
			<section
				style={{
					borderRadius: "32px",
					padding: "2rem",
					background:
						"radial-gradient(circle at top left, rgba(184,239,70,0.18), rgba(184,239,70,0) 28%), linear-gradient(135deg, rgba(20,33,67,1), rgba(10,10,10,0.98))",
					border: "1px solid rgba(255,255,255,0.08)",
					display: "grid",
					gap: "1rem",
				}}
			>
				<div
					style={{
						fontSize: "0.85rem",
						letterSpacing: "0.16em",
						textTransform: "uppercase",
						color: "var(--primary-green)",
					}}
				>
					Backend-powered learning journey
				</div>
				<div
					style={{
						display: "flex",
						justifyContent: "space-between",
						alignItems: "flex-end",
						gap: "1rem",
						flexWrap: "wrap",
					}}
				>
					<div style={{ maxWidth: "48rem" }}>
						<h1
							style={{
								margin: "0 0 0.85rem",
								fontSize: "clamp(2rem, 4vw, 3.6rem)",
								lineHeight: 1.05,
								fontFamily: "var(--font-nova-square)",
							}}
						>
							Turn your target role into a visible step-by-step roadmap.
						</h1>
						<p
							style={{
								margin: 0,
								color: "rgba(255,255,255,0.78)",
								lineHeight: 1.7,
								fontSize: "1rem",
							}}
						>
							This frontend reads roadmap structure from your .NET backend, opens step-specific markdown content,
							and syncs completion state per authenticated user.
						</p>
					</div>
					<Link
						href="/dashboard/roadmaps"
						style={{
							textDecoration: "none",
							padding: "1rem 1.35rem",
							borderRadius: "18px",
							backgroundColor: "var(--primary-green)",
							color: "black",
							fontWeight: 700,
						}}
					>
						Open dashboard view
					</Link>
				</div>
			</section>

			<section
				style={{
					display: "grid",
					gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
					gap: "1rem",
				}}
			>
				{[
					{ label: "Available roadmaps", value: String(roadmapCatalog.length) },
					{ label: "Content source", value: "Markdown nodes" },
					{ label: "Progress sync", value: "Per user" },
				].map((item) => (
					<div
						key={item.label}
						style={{
							padding: "1.1rem 1.2rem",
							borderRadius: "22px",
							backgroundColor: "rgba(255,255,255,0.05)",
							border: "1px solid rgba(255,255,255,0.08)",
						}}
					>
						<div style={{ color: "rgba(255,255,255,0.58)", fontSize: "0.82rem", marginBottom: "0.35rem" }}>
							{item.label}
						</div>
						<div style={{ fontSize: "1.15rem", fontWeight: 700 }}>{item.value}</div>
					</div>
				))}
			</section>

			<section style={{ display: "grid", gap: "1rem", alignContent: "start" }}>
				<div>
					<h2 style={{ margin: 0, fontSize: "1.6rem", fontFamily: "var(--font-nova-square)" }}>
						Start with a role roadmap
					</h2>
					<p style={{ margin: "0.5rem 0 0", color: "rgba(255,255,255,0.72)", lineHeight: 1.6 }}>
						The catalog can grow as you add more roadmap folders and API-backed definitions to the backend.
					</p>
				</div>
				<RoadmapCatalog items={roadmapCatalog} />
			</section>
		</div>
	);
}
