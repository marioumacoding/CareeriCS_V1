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
    """Helper to sort items reverse-chronologically based on period or date string."""
    if not items:
        return []
    def get_sort_key(item):
        # Check 'period' first, then 'date'
        raw_date = item.get('period') or item.get('date', '')
        date_str = str(raw_date).split('-')[-1].strip().lower()
        
        if 'present' in date_str or 'current' in date_str or not date_str:
            return datetime.max
        try:
            # Try parsing 'Month Year' or just 'Year'
            return datetime.strptime(date_str, '%B %Y') if ' ' in date_str else datetime.strptime(date_str, '%Y')
        except:
            return datetime.min
    return sorted(items, key=get_sort_key, reverse=True)

def build_cv_pdf(
    user_data: dict, skills: list, experiences: list, education: list,
    certifications: list, projects: list, languages: list, awards: list, 
    references: list, enhance_ai: bool = True
) -> BytesIO:

    pdf_buffer = BytesIO()
    doc = SimpleDocTemplate(
        pdf_buffer, pagesize=LETTER,
        rightMargin=40, leftMargin=40, topMargin=40, bottomMargin=40
    )

    styles = getSampleStyleSheet()

    # =========================
    # MODERN TEMPLATE STYLES
    # =========================
    name_style = ParagraphStyle(
        "NameStyle", parent=styles["Normal"],
        fontSize=22, leading=26, alignment=TA_LEFT,
        fontName="Helvetica-Bold", spaceAfter=4
    )

    section_style = ParagraphStyle(
        "SectionStyle", parent=styles["Normal"],
        fontSize=11, leading=13, alignment=TA_LEFT,
        spaceBefore=12, spaceAfter=2,
        fontName="Helvetica-Bold", textTransform='uppercase'
    )

    bold_style = ParagraphStyle(
        "BoldStyle", parent=styles["Normal"],
        fontSize=10, leading=12, fontName="Helvetica-Bold"
    )

    normal_style = ParagraphStyle(
        "NormalStyle", parent=styles["Normal"],
        fontSize=10, leading=12, fontName="Helvetica"
    )

    date_right_style = ParagraphStyle("DateStyle", parent=normal_style, alignment=TA_RIGHT)

    flowables = []

    # =========================
    # HEADER & CONTACT
    # =========================
    if user_data.get("full_name"):
        flowables.append(Paragraph(user_data["full_name"], name_style))

    if user_data.get("summary"):
        flowables.append(Paragraph(user_data["summary"], normal_style))
        flowables.append(Spacer(1, 4))

    contact_parts = [
        f"✉ {user_data.get('email')}" if user_data.get('email') else None,
        f"📞 {user_data.get('phone')}" if user_data.get('phone') else None,
        f"📍 {user_data.get('city', '')}, {user_data.get('country', '')}" if user_data.get('city') else None,
        f"🔗 {user_data.get('linkedin')}" if user_data.get('linkedin') else None,
    ]
    flowables.append(Paragraph("  |  ".join([p for p in contact_parts if p]), normal_style))

    # =========================
    # EXPERIENCE
    # =========================
    if experiences:
        flowables.append(Paragraph("WORK EXPERIENCE", section_style))
        flowables.append(HRFlowable(width="100%", thickness=1, color=colors.black, spaceAfter=6))
        
        for exp in sort_by_date(experiences):
            flowables.append(Paragraph(exp.get('organization',''), bold_style))
            data = [[Paragraph(exp.get('role',''), normal_style), Paragraph(exp.get('period',''), date_right_style)]]
            t = Table(data, colWidths=[doc.width * 0.7, doc.width * 0.3])
            t.setStyle(TableStyle([('LEFTPADDING', (0,0), (-1,-1), 0), ('RIGHTPADDING', (0,0), (-1,-1), 0)]))
            flowables.append(t)
            
            bullets = [ListItem(Paragraph(r, normal_style), leftIndent=10) for r in exp.get("responsibilities") or []]
            if exp.get("achievements"):
                bullets.append(ListItem(Paragraph(f"<b>Achievement:</b> {exp['achievements']}", normal_style), leftIndent=10))
            
            if bullets:
                flowables.append(ListFlowable(bullets, bulletType="bullet", leftIndent=15))
            flowables.append(Spacer(1, 6))

    # =========================
    # EDUCATION
    # =========================
    if education:
        flowables.append(Paragraph("EDUCATION", section_style))
        flowables.append(HRFlowable(width="100%", thickness=1, color=colors.black, spaceAfter=6))
        for edu in sort_by_date(education):
            flowables.append(Paragraph(f"<b>{edu.get('institution','')}</b>", normal_style))
            data = [[Paragraph(f"{edu.get('qualification','')} {edu.get('details', '')}", normal_style), Paragraph(edu.get('period',''), date_right_style)]]
            t = Table(data, colWidths=[doc.width * 0.8, doc.width * 0.2])
            t.setStyle(TableStyle([('LEFTPADDING', (0,0), (-1,-1), 0), ('RIGHTPADDING', (0,0), (-1,-1), 0)]))
            flowables.append(t)

    # =========================
    # PROJECTS
    # =========================
    if projects:
        flowables.append(Paragraph("PROJECTS", section_style))
        flowables.append(HRFlowable(width="100%", thickness=1, color=colors.black, spaceAfter=6))
        for proj in projects:
            flowables.append(Paragraph(f"<b>{proj.get('title','')}</b> | {proj.get('role','')}", normal_style))
            if proj.get("description"):
                flowables.append(Paragraph(proj["description"], normal_style))
            if proj.get("technologies"):
                flowables.append(Paragraph(f"<i>Tech: {', '.join(proj['technologies'])}</i>", normal_style))
            flowables.append(Spacer(1, 4))

    # =========================
    # CERTIFICATIONS & AWARDS
    # =========================
    if certifications or awards:
        flowables.append(Paragraph("CERTIFICATIONS & AWARDS", section_style))
        flowables.append(HRFlowable(width="100%", thickness=1, color=colors.black, spaceAfter=6))
        combined = sort_by_date(certifications + awards)
        for item in combined:
            title = item.get('title') or item.get('certification_name')
            org = item.get('organization') or ""
            date_val = item.get('period') or item.get('date', '')
            flowables.append(Paragraph(f"• <b>{title}</b>, {org} ({date_val})", normal_style))

    # =========================
    # SKILLS & LANGUAGES
    # =========================
    if skills or languages:
        flowables.append(Paragraph("SKILLS & LANGUAGES", section_style))
        flowables.append(HRFlowable(width="100%", thickness=1, color=colors.black, spaceAfter=6))
        if skills:
            skill_str = ", ".join([f"{s.get('skill_name')} " for s in skills])
            flowables.append(Paragraph(f"<b>Skills:</b> {skill_str}", normal_style))
        if languages:
            lang_str = ", ".join([f"{l.get('language')} ({l.get('proficiency','')})" for l in languages])
            flowables.append(Paragraph(f"<b>Languages:</b> {lang_str}", normal_style))

    # =========================
    # REFERENCES
    # =========================
    if references:
        flowables.append(Paragraph("REFERENCES", section_style))
        flowables.append(HRFlowable(width="100%", thickness=1, color=colors.black, spaceAfter=6))
        ref_data = []
        for ref in references:
            ref_data.append(Paragraph(f"<b>{ref.get('name')}</b><br/>{ref.get('role')} at {ref.get('organization')}<br/>{ref.get('contact_info')}", normal_style))
        
        # Display references in a simple 2-column table
        ref_table_data = [ref_data[i:i+2] for i in range(0, len(ref_data), 2)]
        if ref_table_data:
            t = Table(ref_table_data, colWidths=[doc.width/2.0]*2)
            t.setStyle(TableStyle([('VALIGN', (0,0), (-1,-1), 'TOP'), ('LEFTPADDING', (0,0), (-1,-1), 0)]))
            flowables.append(t)

    doc.build(flowables)
    pdf_buffer.seek(0)
    return pdf_buffer