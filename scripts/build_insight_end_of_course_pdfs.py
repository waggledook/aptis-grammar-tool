"""Build complete classroom papers and detailed keys for both Insight levels.

Source questions come directly from the current online end-of-year templates.
Explicit print corrections and teacher explanations are held in the companion
insight_end_of_course_notes module. The application templates are not changed.
"""

import json
import re
import subprocess
from pathlib import Path

from reportlab.lib.styles import ParagraphStyle
from reportlab.pdfgen import canvas
from reportlab.platypus import Paragraph, Table, TableStyle

from build_insight_progress_pdfs import (
    ROOT, OUT, W, H, M, CW, INK, TEAL, MUTED, LINE, PALE, BOTTOM,
    PAGE_LOG, esc, para, label, rule, page, section, question, answer_text,
    key_entry,
)
from insight_end_of_course_notes import NOTES


SPECS = [
    {
        "code": "upper", "id": "oxford-insight-upper-intermediate-end-of-year-a",
        "course": "Insight Upper-Intermediate", "stem": "Insight_Upper_Intermediate_End_of_Course_Test_A",
        "total": 62, "key_pages": 9, "counts": [20, 18, 6, 6, 6, 6],
        "audio_times": ["3 minutes 43 seconds", "4 minutes 3 seconds"],
        "article_size": 11.1, "article_leading": 15.3,
        "correction_note": "<b>Print corrections.</b> Grammar 4 removes the stray comma before <b>than</b>. Vocabulary 15 now reads <b>There are ... fish</b>, so <b>countless</b> fits grammatically. All answer letters and options are unchanged. <b>Fair marking:</b> Grammar 5 has a defensible alternative; see its detailed note.",
    },
    {
        "code": "advanced", "id": "oxford-insight-advanced-end-of-year-a",
        "course": "Insight Advanced", "stem": "Insight_Advanced_End_of_Course_Test_A",
        "total": 68, "key_pages": 10, "counts": [20, 6, 6, 6, 18, 6, 6],
        "audio_times": ["5 minutes", "4 minutes 24 seconds"],
        "article_size": 10.8, "article_leading": 14.3,
        "correction_note": "<b>Print correction.</b> Reading 1, question 3 now offers <b>The quality of the exhibits</b> as option C. The online option says <b>number</b>, which the text does not establish. The intended letter remains C. <b>Fair marking:</b> Grammar 10 and Vocabulary 2, question 3 have defensible alternatives; see the detailed notes.",
    },
]
PRINT_EDITS = {
    "upper": {
        "g1-4": {"prompt": "Well, ________ the money than spent it on books."},
        "v1-15": {"prompt": "There are ________ fish in the river - I've never seen so many!"},
    },
    "advanced": {
        "r1-3": {"options": ["The location of the gallery", "The facilities available", "The quality of the exhibits"]},
    },
}
MARKED = {"upper": {"g1-5"}, "advanced": {"g1-10", "v2-3"}}
STUDENT_PAGES = 11
TMP = ROOT / "tmp/pdfs/insight-end-of-course"


def load_tests():
    tests = json.loads(subprocess.check_output(
        ["node", "--input-type=module", "-e",
         'import {HUB_COURSE_TEST_TEMPLATES as ts} from "./src/data/hubCourseTestTemplates.js"; '
         'console.log(JSON.stringify(ts.filter(t=>t.course.includes("Insight")&&t.testKind==="end-of-course")));'],
        cwd=ROOT, text=True,
    ))
    return {t["id"]: t for t in tests}


def printed(spec, item):
    return {**item, **PRINT_EDITS[spec["code"]].get(item["id"], {})}


def new_canvas(spec, path, kind):
    c = canvas.Canvas(str(path), pagesize=(W, H), pageCompression=1)
    c.insight_course = spec["course"].upper()
    c.insight_scope = "END OF COURSE"
    c.setTitle(f"{spec['course']} | End-of-course Test A | {kind}")
    c.setAuthor("Seif English Academy")
    c.setSubject("Complete classroom edition of the current online end-of-year test, Version A")
    return c


def q(c, spec, item, n, y, **kwargs):
    return question(c, printed(spec, item), n, y, **kwargs)


def student_paper(spec, test):
    path = OUT / f"{spec['stem']}_Student.pdf"
    c = new_canvas(spec, path, "Student paper")
    secs = {s["id"]: s for s in test["sections"]}
    grammar, r1, r2 = (secs[k] for k in ("grammar-part-1", "reading-part-1", "reading-part-2"))
    vocab = [s for s in test["sections"] if s["skill"] == "vocabulary"]
    listening = [s for s in test["sections"] if s["skill"] == "listening"]
    minutes = test["deliveryPlan"]["mainPaper"]["durationMinutes"]
    main_marks = spec["total"] - 12

    y = page(c, spec["course"], "END-OF-COURSE TEST  /  VERSION A", total=STUDENT_PAGES, first=True)
    label(c, "NAME", M, y-5)
    rule(c, y-8, M+37, 237)
    label(c, "CLASS", M+292, y-5)
    rule(c, y-8, M+331, CW-331)
    y -= 29
    label(c, "DATE", M, y-5)
    rule(c, y-8, M+37, 135)
    label(c, "TOTAL", M+292, y-5)
    label(c, f"________ / {spec['total']}", M+343, y-5, 10, INK, "Body")
    y -= 28
    y = para(c, f"<b>{minutes} minutes</b> for Grammar, Vocabulary and Reading ({main_marks} marks). Listening is taken separately (12 marks). Write your answers on this paper. Circle <b>A</b>, <b>B</b> or <b>C</b> for multiple-choice questions. Each question is worth one mark.", M, y, CW, 9.4, 12.4, gap=14)
    y = section(c, "Grammar  /  Multiple choice", 20, y)
    for n, item in enumerate(grammar["items"][:10], 1):
        y = q(c, spec, item, n, y, gap=7, gap_len=12)
    c.showPage()

    y = page(c, "Grammar", "MULTIPLE CHOICE  /  QUESTIONS 11-20", total=STUDENT_PAGES)
    y = section(c, "Grammar  /  Continued", 20, y,
                "Choose the correct answer for each sentence. This section has 20 questions in total.")
    for n, item in enumerate(grammar["items"][10:], 11):
        y = q(c, spec, item, n, y, gap=12, gap_len=12)
    c.showPage()

    if spec["code"] == "upper":
        for part, items in enumerate([vocab[0]["items"][:9], vocab[0]["items"][9:]]):
            y = page(c, "Vocabulary", f"MULTIPLE CHOICE  /  QUESTIONS {1 if part==0 else 10}-{9 if part==0 else 18}", total=STUDENT_PAGES)
            y = section(c, "Choose the correct answer" if part == 0 else "Vocabulary  /  Continued", 18, y,
                        "This section has 18 questions in total. Circle A, B or C.")
            for n, item in enumerate(items, 1 if part == 0 else 10):
                y = q(c, spec, item, n, y, gap=18, gap_len=12)
            c.showPage()
    else:
        y = page(c, "Vocabulary", "WORD FORMATION & MULTIPLE CHOICE", total=STUDENT_PAGES)
        y = section(c, "Vocabulary 1  /  Word formation", 6, y,
                    "Complete each sentence with the correct form of the word in brackets.")
        for n, item in enumerate(vocab[0]["items"], 1):
            y = q(c, spec, item, n, y, mode="text", gap=14, gap_len=27)
        y -= 7
        y = section(c, "Vocabulary 2  /  Multiple choice", 18, y,
                    "Choose the correct answer. Questions 7-18 continue on the next page.")
        for n, item in enumerate(vocab[1]["items"][:6], 1):
            y = q(c, spec, item, n, y, gap=8, gap_len=12)
        c.showPage()
        y = page(c, "Vocabulary", "MULTIPLE CHOICE  /  QUESTIONS 7-18", total=STUDENT_PAGES)
        y = section(c, "Vocabulary 2  /  Continued", 18, y,
                    "Choose the correct answer. This section has 18 questions in total.")
        for n, item in enumerate(vocab[1]["items"][6:], 7):
            y = q(c, spec, item, n, y, gap=10, gap_len=12)
        c.showPage()

    for start in (0, 2, 4):
        y = page(c, "Reading 1", f"SHORT TEXTS  /  QUESTIONS {start+1}-{start+2}  /  6 MARKS IN TOTAL", total=STUDENT_PAGES)
        for offset in (0, 1):
            n = start+offset+1
            passage = r1["sharedPrompt"]["passages"][n-1]
            y = para(c, esc(passage["heading"]), M, y, CW, 12.8, 17, "DisplayBold", TEAL, gap=9)
            y = para(c, esc(passage["text"]), M+24, y, CW-24, 10.8, 14.5, "Display", gap=13)
            y = q(c, spec, r1["items"][n-1], n, y, mode="long-choice", gap=13)
            if offset == 0:
                rule(c, y)
                y -= 20
        c.showPage()

    article = r2["sharedPrompt"]["passages"][0]
    byline, *paragraphs = article["text"].split("\n\n")
    y = page(c, article["heading"], f"READING 2  /  {byline.upper()}  /  6 MARKS", total=STUDENT_PAGES)
    y = para(c, "Read the article, then answer questions 1-6 on the next page.", M, y, CW, 9.4, 12, color=MUTED, gap=6)
    for n, text in enumerate(paragraphs, 1):
        label(c, str(n), M, y-11, 8.5, TEAL)
        y = para(c, esc(text), M+20, y, CW-20, spec["article_size"], spec["article_leading"], "Display", gap=12)
    c.showPage()

    y = page(c, "Reading 2", f"{article['heading'].upper()}  /  QUESTIONS 1-6", total=STUDENT_PAGES)
    y = section(c, "Choose the correct answer", 6, y,
                "Circle A, B or C. Refer to the article on the previous page.")
    for n, item in enumerate(r2["items"], 1):
        y = q(c, spec, item, n, y, mode="long-choice", gap=10)
    y = para(c, f"<b>End of the main paper.</b> Check your answers in Grammar, Vocabulary and Reading before the {minutes} minutes finish. Wait for your teacher before starting Listening.", M, y-7, CW, 9.4, 13, color=MUTED)
    c.showPage()

    for part, s in enumerate(listening, 1):
        topic = ("Short conversations", "Culture shock")[part-1] if spec["code"] == "upper" else ("Short extracts", "Ancient people")[part-1]
        y = page(c, f"Listening {part}", topic.upper(), total=STUDENT_PAGES)
        label(c, "NAME", M, y-5)
        rule(c, y-8, M+37, 265)
        y -= 30
        y = section(c, "Choose the correct answer", 6, y,
                    "You have 45 seconds to read the questions. You will hear this recording twice, with a 10-second pause between plays. Circle A, B or C.")
        for n, item in enumerate(s["items"], 1):
            item_gap = 4 if spec["code"] == "advanced" and part == 1 else 8
            y = q(c, spec, item, n, y, mode="long-choice", gap=item_gap)
        y = para(c, "Wait for your teacher before Listening 2." if part == 1 else "End of the test.", M, y-1, CW, 9.6, 13, "BodyBold", TEAL)
        if part == 1:
            c.showPage()
    c.save()
    return path


def key_order(spec, test):
    secs = {s["id"]: s for s in test["sections"]}
    order = [(secs["grammar-part-1"], 0, 10, "STUDENT PAGE 1"),
             (secs["grammar-part-1"], 10, 20, "STUDENT PAGE 2")]
    if spec["code"] == "upper":
        order += [(secs["vocabulary-part-1"], 0, 9, "STUDENT PAGE 3"),
                  (secs["vocabulary-part-1"], 9, 18, "STUDENT PAGE 4")]
    else:
        order += [(secs["vocabulary-part-1"], 0, 6, "STUDENT PAGE 3"),
                  (secs["vocabulary-part-2"], 0, 9, "STUDENT PAGES 3-4"),
                  (secs["vocabulary-part-2"], 9, 18, "STUDENT PAGE 4")]
    order += [(secs["reading-part-1"], 0, 6, "STUDENT PAGES 5-7"),
              (secs["reading-part-2"], 0, 6, "STUDENT PAGES 8-9"),
              (secs["listening-part-1"], 0, 6, "STUDENT PAGE 10"),
              (secs["listening-part-2"], 0, 6, "STUDENT PAGE 11")]
    return order


def overview_table(c, spec, test, y):
    rows = [["Section", "Answers in question order", "Marks"]]
    seen = set()
    for s, _, _, _ in key_order(spec, test):
        if s["id"] in seen:
            continue
        seen.add(s["id"])
        chunks = []
        for n, raw in enumerate(s["items"], 1):
            item = printed(spec, raw)
            answer = chr(65+item["answerIndex"]) if item["type"] == "choice" else item["acceptedAnswers"][0]
            chunks.append(f"{n} {answer}" + ("*" if item["id"] in MARKED[spec["code"]] else ""))
        per_line = 10 if s["items"][0]["type"] == "choice" else 2
        text = "\n".join("   ".join(chunks[i:i+per_line]) for i in range(0, len(chunks), per_line))
        rows.append([s["title"].split(":")[0], text, str(len(s["items"]))])
    vocab_total = sum(len(s["items"]) for s in test["sections"] if s["skill"] == "vocabulary")
    rows.append(["TOTAL", f"Grammar 20  +  Vocabulary {vocab_total}  +  Reading 12  +  Listening 12", str(spec["total"])])
    st = ParagraphStyle("cell", fontName="Body", fontSize=8.8, leading=12.3, textColor=INK)
    t = Table([[Paragraph(esc(v), st) for v in row] for row in rows], colWidths=[80, CW-120, 40])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), PALE), ("BACKGROUND", (0, -1), (-1, -1), PALE),
        ("LINEBELOW", (0, 0), (-1, 0), .7, TEAL), ("LINEBELOW", (0, 1), (-1, -2), .35, LINE),
        ("VALIGN", (0, 0), (-1, -1), "TOP"), ("LEFTPADDING", (0, 0), (-1, -1), 8),
        ("RIGHTPADDING", (0, 0), (-1, -1), 6), ("TOPPADDING", (0, 0), (-1, -1), 9),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 9),
    ]))
    _, ht = t.wrap(CW, H)
    assert y-ht >= BOTTOM
    t.drawOn(c, M, y-ht)
    return y-ht-17


def teacher_key(spec, test):
    path = OUT / f"{spec['stem']}_Detailed_Key.pdf"
    c = new_canvas(spec, path, "Detailed teacher key")
    kind, pages = "TEACHER KEY", spec["key_pages"]
    y = page(c, "Detailed answer key", f"{spec['course'].upper()}  /  END OF COURSE  /  VERSION A", kind, pages, True)
    y = para(c, "Complete companion to the current online end-of-year test. Intended answers follow the course-test template. The detailed notes explain grammar, vocabulary, reading evidence and the distinctions between listening options.", M, y, CW, 10, 14, gap=16)
    y = overview_table(c, spec, test, y)
    minutes = test["deliveryPlan"]["mainPaper"]["durationMinutes"]
    y = para(c, f"<b>Marking.</b> One mark per numbered question; no negative marking. Main paper: <b>{spec['total']-12} marks in {minutes} minutes</b>. Listening: <b>12 marks</b>, taken separately. Overall: <b>{spec['total']}</b>. Percentage = score / {spec['total']} x 100. An asterisk identifies an item with a fair-marking note.", M, y, CW, 9.5, 13.2, gap=14)
    y = para(c, spec["correction_note"], M, y, CW, 9.4, 13, gap=14)
    y = para(c, "<b>Printing.</b> Use A4 at 100% / actual size. For double-sided student copies, select long-edge binding: article page 8 and questions page 9 then face each other. Keep this key separate from student copies. Main-paper timing excludes Listening.", M, y, CW, 9.3, 12.8, color=MUTED)
    c.showPage()

    order = key_order(spec, test)
    for page_index, (s, start, end, reference) in enumerate(order):
        title, task = s["title"].split(":", 1)
        descriptor = f"{task.strip().upper()}  /  QUESTIONS {start+1}-{end}  /  {reference}"
        y = page(c, title, descriptor, kind, pages)
        if s["id"] == "reading-part-1":
            y = para(c, "Each explanation refers to the matching numbered short text. Where the source wording permits a different interpretation, the note identifies it.", M, y, CW, 9.3, 12.8, color=MUTED, gap=18)
        if s["id"] == "reading-part-2":
            y = para(c, "Paragraph numbers refer to the numbers beside the article in the student paper. The byline is not counted as a paragraph.", M, y, CW, 9.3, 12.8, color=MUTED, gap=18)
        if s["skill"] == "listening":
            part = int(s["id"][-1])
            filename = Path(s["audioSrc"]).name
            y = para(c, f"<b>Audio:</b> <b>{esc(filename)}</b> (approximately {spec['audio_times'][part-1]}). Allow <b>45 seconds</b> to read this section; play the complete track <b>twice</b>, with <b>10 seconds</b> between plays. Repeat this procedure separately for each listening section.", M, y, CW, 9.4, 13, gap=13)
            y = para(c, "The answers reproduce the stored online listening key. These explanations distinguish the answer choices; they are not a transcript or an independent transcription of the audio. Students answer during playback; the online setup has no additional timed answer window.", M, y, CW, 9.1, 12.4, color=MUTED, gap=20)
        for n in range(start, end):
            item = printed(spec, s["items"][n])
            note = NOTES[spec["code"]][s["id"]][n]
            completed = None
            answer = answer_text(item)
            if item["type"] == "text-input":
                answer = " / ".join(item["acceptedAnswers"])
                completed = re.sub(r"_{8,}", f"<b>{esc(item['acceptedAnswers'][0])}</b>", esc(item["prompt"]))
                completed = re.sub(r" \([^)]*\)", "", completed)
            gap = 13 if s["skill"] in ("grammar", "vocabulary") else 18
            y = key_entry(c, n+1, answer, note, y, completed=completed, size=10.2, gap=gap)
        if page_index < len(order)-1:
            c.showPage()
    c.save()
    return path


def verify(spec, test, student, key):
    import pdfplumber
    from pypdf import PdfReader

    def norm(s):
        s = s.replace("\u2013", "-").replace("\u2014", "-").replace("\u2011", "-")
        return re.sub(r"\s+", "", re.sub(r"_+", "", s)).lower()

    stu, teacher = PdfReader(student), PdfReader(key)
    assert len(stu.pages) == STUDENT_PAGES
    assert len(teacher.pages) == spec["key_pages"]
    content = norm(" ".join(p.extract_text() for p in stu.pages))
    total = options = 0
    for s in test["sections"]:
        for raw in s["items"]:
            item = printed(spec, raw)
            total += 1
            for line in item["prompt"].split("\n"):
                assert norm(line) in content, (spec["code"], item["id"], "missing prompt")
            for option in item.get("options", []):
                options += 1
                assert norm(option) in content, (spec["code"], item["id"], "missing option")
        for p in (s.get("sharedPrompt") or {}).get("passages", []):
            for text in p["text"].split("\n\n"):
                assert norm(text) in content, (spec["code"], s["id"], "missing reading text")
    for i, (s, start, end, _) in enumerate(key_order(spec, test), 1):
        text = norm(teacher.pages[i].extract_text())
        for raw in s["items"][start:end]:
            item = printed(spec, raw)
            answers = [item["options"][item["answerIndex"]]] if item["type"] == "choice" else item["acceptedAnswers"]
            assert all(norm(answer) in text for answer in answers), (spec["code"], item["id"], "missing key answer")
    for path in (student, key):
        with pdfplumber.open(path) as pdf:
            for i, p in enumerate(pdf.pages, 1):
                assert all(M-1 <= ch["x0"] < ch["x1"] <= W-M+1 for ch in p.chars), (path.name, i, "margin overflow")
                assert not any(ch["text"] == "\ufffd" for ch in p.chars)
                assert "END OF COURSE" in p.extract_text()
        print(f"{path.name}: {len(PdfReader(path).pages)} A4 pages, {path.stat().st_size:,} bytes")
    with pdfplumber.open(student) as pdf:
        counts = []
        for p in pdf.pages:
            words = p.extract_words(extra_attrs=["size"])
            counts.append(sum(1 for w in words if abs(w["x0"]-M)<.2 and abs(w["size"]-9)<.05 and re.fullmatch(r"\d\d", w["text"])))
        expected = [10, 10, 9, 9, 2, 2, 2, 0, 6, 6, 6] if spec["code"] == "upper" else [10, 10, 12, 12, 2, 2, 2, 0, 6, 6, 6]
        assert counts == expected, counts
        assert sum(counts) == total == spec["total"]
    print(f"Coverage: {total} questions, {options} options, every reading text and every intended answer.")


if __name__ == "__main__":
    tests = load_tests()
    for spec in SPECS:
        test = tests[spec["id"]]
        assert [len(s["items"]) for s in test["sections"]] == spec["counts"]
        assert all(len(NOTES[spec["code"]][s["id"]]) == len(s["items"]) for s in test["sections"])
        student = student_paper(spec, test)
        key = teacher_key(spec, test)
        verify(spec, test, student, key)
    TMP.mkdir(parents=True, exist_ok=True)
    (TMP / "layout-log.json").write_text(json.dumps(PAGE_LOG, indent=2))
