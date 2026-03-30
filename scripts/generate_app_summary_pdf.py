from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import (
    ListFlowable,
    ListItem,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "output" / "pdf" / "aptis-grammar-tool-summary.pdf"


def build_styles():
    styles = getSampleStyleSheet()
    styles.add(
        ParagraphStyle(
            name="TitleCompact",
            parent=styles["Title"],
            fontName="Helvetica-Bold",
            fontSize=18,
            leading=21,
            textColor=colors.HexColor("#13213B"),
            spaceAfter=4,
            alignment=TA_LEFT,
        )
    )
    styles.add(
        ParagraphStyle(
            name="Subtle",
            parent=styles["BodyText"],
            fontName="Helvetica",
            fontSize=8.5,
            leading=10,
            textColor=colors.HexColor("#5C6B82"),
            spaceAfter=0,
        )
    )
    styles.add(
        ParagraphStyle(
            name="SectionHeadingCompact",
            parent=styles["Heading2"],
            fontName="Helvetica-Bold",
            fontSize=10.5,
            leading=12,
            textColor=colors.white,
            backColor=colors.HexColor("#13213B"),
            borderPadding=(4, 6, 4),
            spaceBefore=0,
            spaceAfter=5,
        )
    )
    styles.add(
        ParagraphStyle(
            name="BodyCompact",
            parent=styles["BodyText"],
            fontName="Helvetica",
            fontSize=8.7,
            leading=10.6,
            textColor=colors.HexColor("#182433"),
            spaceAfter=0,
        )
    )
    styles.add(
        ParagraphStyle(
            name="BulletCompact",
            parent=styles["BodyText"],
            fontName="Helvetica",
            fontSize=8.4,
            leading=9.8,
            leftIndent=0,
            firstLineIndent=0,
            textColor=colors.HexColor("#182433"),
            spaceAfter=0,
        )
    )
    return styles


def section(title, body):
    return [
        Paragraph(title, STYLES["SectionHeadingCompact"]),
        body,
        Spacer(1, 4),
    ]


def bullet_list(items):
    return ListFlowable(
        [
            ListItem(Paragraph(item, STYLES["BulletCompact"]), leftIndent=0)
            for item in items
        ],
        bulletType="bullet",
        start="circle",
        leftIndent=10,
        bulletFontName="Helvetica",
        bulletFontSize=7,
        spaceBefore=0,
        spaceAfter=0,
    )


def build_pdf():
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    doc = SimpleDocTemplate(
        str(OUTPUT),
        pagesize=A4,
        leftMargin=13 * mm,
        rightMargin=13 * mm,
        topMargin=12 * mm,
        bottomMargin=11 * mm,
    )

    story = [
        Paragraph("Aptis Grammar Tool - App Summary", STYLES["TitleCompact"]),
        Paragraph(
            "One-page repo-based summary generated from source files only.",
            STYLES["Subtle"],
        ),
        Spacer(1, 6),
    ]

    left_column = []
    left_column += section(
        "What It Is",
        Paragraph(
            "A React + Vite web app for Aptis-style English practice that combines grammar, reading, writing, speaking, listening, vocabulary, and private hub activities in one interface. The codebase also includes teacher, admin, and live-game flows built on Firebase services.",
            STYLES["BodyCompact"],
        ),
    )
    left_column += section(
        "Who It's For",
        Paragraph(
            "Primary persona: learners preparing for the Aptis exam or academy students using guided English practice. Secondary personas visible in the repo: teachers managing custom grammar sets and student results, plus admins managing roles and access.",
            STYLES["BodyCompact"],
        ),
    )
    left_column += section(
        "What It Does",
        bullet_list(
            [
                "Delivers grammar gap-fill practice filtered by CEFR level and tags, with unseen-item preference for signed-in users.",
                "Covers all major Aptis practice areas surfaced in the menu: reading, speaking, writing, listening, and vocabulary.",
                "Includes Use of English trainers for keyword transformations, open cloze, and word formation.",
                "Tracks profile progress, mistakes, favourites, submissions, and activity dashboards.",
                "Provides teacher-only tools to build grammar sets and review student results.",
                "Supports live multiplayer games, PIN/QR joins, countdown rounds, and leaderboards through the hub/live features.",
            ]
        ),
    )

    right_column = []
    right_column += section(
        "How It Works",
        bullet_list(
            [
                "Frontend: React 19 single-page app mounted in `src/main.jsx`, with route-driven feature areas defined in `src/App.jsx` using React Router.",
                "Content layer: many activities read from local JSON/data modules; grammar questions come from `scripts/grammar-items.json` through `src/api/grammar.js`.",
                "Firebase client: `src/firebase.js` initializes Auth, Firestore, Realtime Database, Storage, and cookie-gated Analytics.",
                "Firestore appears to hold user profiles, progress/favourites, teacher/admin data, and hub access requests.",
                "Realtime Database powers live games and shared state such as lobby, players, answers, timers, and scores via `src/api/liveGames.js`.",
                "Hosting/backend: `firebase.json` serves the built SPA from `dist` and rewrites `/speak` to Cloud Functions; `functions/index.js` shows email notifications and text-to-speech support.",
            ]
        ),
    )
    right_column += section(
        "How To Run",
        bullet_list(
            [
                "Install dependencies: `npm install`",
                "Start the app locally: `npm run dev`",
                "Open the local Vite URL shown in the terminal, usually `http://localhost:5173`",
                "Build for production when needed: `npm run build`",
                "Frontend env file: Not found in repo. Firebase web config is committed in `src/firebase.js`.",
                "Documented full local backend/emulator workflow: Not found in repo.",
            ]
        ),
    )

    table = Table(
        [[left_column, right_column]],
        colWidths=[88 * mm, 88 * mm],
        hAlign="LEFT",
    )
    table.setStyle(
        TableStyle(
            [
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("LEFTPADDING", (0, 0), (-1, -1), 0),
                ("RIGHTPADDING", (0, 0), (-1, -1), 6),
                ("TOPPADDING", (0, 0), (-1, -1), 0),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 0),
            ]
        )
    )
    story.append(table)

    def draw_frame(canvas, _doc):
        canvas.saveState()
        canvas.setStrokeColor(colors.HexColor("#D9E1EC"))
        canvas.setLineWidth(0.6)
        canvas.roundRect(10 * mm, 10 * mm, 190 * mm, 277 * mm, 4 * mm, stroke=1, fill=0)
        canvas.restoreState()

    doc.build(story, onFirstPage=draw_frame)


if __name__ == "__main__":
    STYLES = build_styles()
    build_pdf()
