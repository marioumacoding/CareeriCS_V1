import os
import uuid
import json
from io import BytesIO
from openai import OpenAI
from datetime import datetime
from dotenv import load_dotenv
from reportlab.lib import colors
from reportlab.platypus import HRFlowable
from reportlab.lib.pagesizes import LETTER
from reportlab.lib.enums import TA_CENTER, TA_RIGHT, TA_LEFT
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, ListFlowable, ListItem, Table, TableStyle


def sort_by_date(items):
    if not items:
        return []

    def get_sort_key(item):
        raw_date = item.get("period") or item.get("date") or ""
        date_str = str(raw_date).split("-")[-1].strip().lower()

        if not date_str or "present" in date_str or "current" in date_str:
            return datetime.max

        for fmt in ("%B %Y", "%b %Y", "%Y"):
            try:
                return datetime.strptime(date_str, fmt)
            except:
                continue

        return datetime.min

    return sorted(items, key=get_sort_key, reverse=True)


def safe(value):
    return "" if value is None else str(value)


def build_cv_pdf(
    user_data: dict,
    skills: list,
    experiences: list,
    education: list,
    certifications: list,
    projects: list,
    languages: list,
    awards: list,
    references: list,
    enhance_ai: bool = True,
):

    pdf_buffer = BytesIO()

    doc = SimpleDocTemplate(
        pdf_buffer,
        pagesize=LETTER,
        rightMargin=40,
        leftMargin=40,
        topMargin=40,
        bottomMargin=40,
    )

    styles = getSampleStyleSheet()

    name_style = ParagraphStyle(
        "NameStyle",
        parent=styles["Normal"],
        fontSize=22,
        leading=26,
        alignment=TA_LEFT,
        fontName="Helvetica-Bold",
        spaceAfter=4,
    )

    section_style = ParagraphStyle(
        "SectionStyle",
        parent=styles["Normal"],
        fontSize=11,
        leading=13,
        alignment=TA_LEFT,
        spaceBefore=12,
        spaceAfter=2,
        fontName="Helvetica-Bold",
        textTransform="uppercase",
    )

    bold_style = ParagraphStyle(
        "BoldStyle",
        parent=styles["Normal"],
        fontSize=10,
        leading=12,
        fontName="Helvetica-Bold",
    )

    normal_style = ParagraphStyle(
        "NormalStyle",
        parent=styles["Normal"],
        fontSize=10,
        leading=12,
        fontName="Helvetica",
    )

    date_right_style = ParagraphStyle(
        "DateStyle",
        parent=normal_style,
        alignment=TA_RIGHT,
    )

    flowables = []

    if user_data.get("full_name"):
        flowables.append(Paragraph(safe(user_data["full_name"]), name_style))

    if user_data.get("summary"):
        flowables.append(Paragraph(safe(user_data["summary"]), normal_style))
        flowables.append(Spacer(1, 4))

    contact_parts = [
        f"✉ {safe(user_data.get('email'))}" if user_data.get("email") else None,
        f"📞 {safe(user_data.get('phone'))}" if user_data.get("phone") else None,
        f"📍 {safe(user_data.get('city'))}, {safe(user_data.get('country'))}" if user_data.get("city") else None,
        f"🔗 {safe(user_data.get('linkedin'))}" if user_data.get("linkedin") else None,
    ]

    contact_parts = [p for p in contact_parts if p]

    if contact_parts:
        flowables.append(Paragraph("  |  ".join(contact_parts), normal_style))

    if experiences:
        flowables.append(Paragraph("WORK EXPERIENCE", section_style))
        flowables.append(
            HRFlowable(width="100%", thickness=1, color=colors.black, spaceAfter=6)
        )

        for exp in sort_by_date(experiences):

            org = safe(exp.get("organization"))
            role = safe(exp.get("role"))
            period = safe(exp.get("period"))

            if org:
                flowables.append(Paragraph(org, bold_style))

            data = [
                [
                    Paragraph(role, normal_style),
                    Paragraph(period, date_right_style),
                ]
            ]

            t = Table(data, colWidths=[doc.width * 0.7, doc.width * 0.3])
            t.setStyle(
                TableStyle(
                    [
                        ("LEFTPADDING", (0, 0), (-1, -1), 0),
                        ("RIGHTPADDING", (0, 0), (-1, -1), 0),
                    ]
                )
            )

            flowables.append(t)

            bullets = []

            for r in exp.get("responsibilities") or []:
                if r:
                    bullets.append(
                        ListItem(
                            Paragraph(safe(r), normal_style),
                            leftIndent=10,
                        )
                    )

            if exp.get("achievements"):
                bullets.append(
                    ListItem(
                        Paragraph(
                            f"<b>Achievement:</b> {safe(exp.get('achievements'))}",
                            normal_style,
                        ),
                        leftIndent=10,
                    )
                )

            if bullets:
                flowables.append(
                    ListFlowable(
                        bullets,
                        bulletType="bullet",
                        leftIndent=15,
                    )
                )

            flowables.append(Spacer(1, 6))

    if education:
        flowables.append(Paragraph("EDUCATION", section_style))
        flowables.append(
            HRFlowable(width="100%", thickness=1, color=colors.black, spaceAfter=6)
        )

        for edu in sort_by_date(education):

            institution = safe(edu.get("institution"))
            qualification = safe(edu.get("qualification"))
            details = safe(edu.get("details"))
            period = safe(edu.get("period"))

            flowables.append(Paragraph(f"<b>{institution}</b>", normal_style))

            data = [
                [
                    Paragraph(f"{qualification} {details}", normal_style),
                    Paragraph(period, date_right_style),
                ]
            ]

            t = Table(data, colWidths=[doc.width * 0.8, doc.width * 0.2])
            t.setStyle(
                TableStyle(
                    [
                        ("LEFTPADDING", (0, 0), (-1, -1), 0),
                        ("RIGHTPADDING", (0, 0), (-1, -1), 0),
                    ]
                )
            )

            flowables.append(t)

    if projects:
        flowables.append(Paragraph("PROJECTS", section_style))
        flowables.append(
            HRFlowable(width="100%", thickness=1, color=colors.black, spaceAfter=6)
        )

        for proj in projects:

            title = safe(proj.get("title"))
            role = safe(proj.get("role"))

            flowables.append(
                Paragraph(f"<b>{title}</b> | {role}", normal_style)
            )

            if proj.get("description"):
                flowables.append(
                    Paragraph(safe(proj.get("description")), normal_style)
                )

            if proj.get("technologies"):
                techs = ", ".join([safe(t) for t in proj["technologies"] if t])
                if techs:
                    flowables.append(
                        Paragraph(f"<i>Tech: {techs}</i>", normal_style)
                    )

            flowables.append(Spacer(1, 4))

    if certifications or awards:

        flowables.append(Paragraph("CERTIFICATIONS & AWARDS", section_style))
        flowables.append(
            HRFlowable(width="100%", thickness=1, color=colors.black, spaceAfter=6)
        )

        combined = sort_by_date((certifications or []) + (awards or []))

        for item in combined:

            title = safe(item.get("title") or item.get("certification_name"))
            org = safe(item.get("organization"))
            date_val = safe(item.get("period") or item.get("date"))

            text = f"• <b>{title}</b>"

            if org:
                text += f", {org}"

            if date_val:
                text += f" ({date_val})"

            flowables.append(Paragraph(text, normal_style))

    if skills or languages:

        flowables.append(Paragraph("SKILLS & LANGUAGES", section_style))
        flowables.append(
            HRFlowable(width="100%", thickness=1, color=colors.black, spaceAfter=6)
        )

        if skills:
            skill_str = ", ".join(
                [safe(s.get("skill_name")) for s in skills if s.get("skill_name")]
            )

            if skill_str:
                flowables.append(
                    Paragraph(f"<b>Skills:</b> {skill_str}", normal_style)
                )

        if languages:
            lang_str = ", ".join(
                [
                    f"{safe(l.get('language'))} ({safe(l.get('proficiency'))})"
                    for l in languages
                    if l.get("language")
                ]
            )

            if lang_str:
                flowables.append(
                    Paragraph(f"<b>Languages:</b> {lang_str}", normal_style)
                )

    if references:

        flowables.append(Paragraph("REFERENCES", section_style))
        flowables.append(
            HRFlowable(width="100%", thickness=1, color=colors.black, spaceAfter=6)
        )

        ref_data = []

        for ref in references:

            name = safe(ref.get("name"))
            role = safe(ref.get("role"))
            org = safe(ref.get("organization"))
            contact = safe(ref.get("contact_info"))

            role_line = role if not org else f"{role} at {org}"

            ref_text = f"<b>{name}</b><br/>{role_line}<br/>{contact}"

            ref_data.append(Paragraph(ref_text, normal_style))

        ref_table_data = [
            ref_data[i : i + 2] for i in range(0, len(ref_data), 2)
        ]

        if ref_table_data:

            if len(ref_table_data[-1]) == 1:
                ref_table_data[-1].append("")

            t = Table(ref_table_data, colWidths=[doc.width / 2.0] * 2)

            t.setStyle(
                TableStyle(
                    [
                        ("VALIGN", (0, 0), (-1, -1), "TOP"),
                        ("LEFTPADDING", (0, 0), (-1, -1), 0),
                    ]
                )
            )

            flowables.append(t)

    doc.build(flowables)

    pdf_buffer.seek(0)

    return pdf_buffer