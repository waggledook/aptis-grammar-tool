"""Print edition and teacher key for the current Insight Advanced Units 1-5 test.

Uses the same design as the Upper-Intermediate classroom PDFs. Run from the
repository root with Python containing reportlab, pypdf and pdfplumber.
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
    PAGE_LOG, esc, para, label, rule, page, section, question,
    answer_text, key_entry,
)


TEST_ID = "oxford-insight-advanced-progress-1-5"
TEST = json.loads(subprocess.check_output(
    ["node", "--input-type=module", "-e",
     'import {getHubCourseTestTemplate} from "./src/data/hubCourseTestTemplates.js"; '
     f'console.log(JSON.stringify(getHubCourseTestTemplate("{TEST_ID}")));'],
    cwd=ROOT, text=True,
))
GA, GB, GC, VD, VE, VF, VG, RD, LS = TEST["sections"]
COUNTS = [len(s["items"]) for s in TEST["sections"]]
assert COUNTS == [6, 8, 8, 6, 7, 6, 6, 6, 6]
TOTAL = sum(COUNTS)
MAIN_TOTAL = TOTAL - len(LS["items"])
MINUTES = TEST["deliveryPlan"]["mainPaper"]["durationMinutes"]
STUDENT_PAGES = 8
KEY_PAGES = 10
TMP = ROOT / "tmp/pdfs/insight-advanced-progress"

# The online definition includes consonants as well as vowels. This classroom
# edition corrects only that definition; options and the intended answer remain.
PRINT_EDITS = {
    "v1-6": "________ means repeating the same or similar vowel sounds in nearby words.",
}


def pdf_canvas(path, title):
    c = canvas.Canvas(str(path), pagesize=(W, H), pageCompression=1)
    c.insight_course = "INSIGHT ADVANCED"
    c.setTitle(title)
    c.setAuthor("Seif English Academy")
    c.setSubject("Classroom companion to the current online progress test, Units 1-5, Version A")
    return c


def student_item(c, item, n, y, **kwargs):
    printed = {**item, "prompt": PRINT_EDITS.get(item["id"], item["prompt"])}
    return question(c, printed, n, y, **kwargs)


def student_paper():
    path = OUT / "Insight_Advanced_Progress_Test_1-5_Student.pdf"
    c = pdf_canvas(path, "Insight Advanced | Units 1-5 | Student paper")

    y = page(c, "Insight Advanced", "PROGRESS TEST  /  UNITS 1-5  /  VERSION A", total=STUDENT_PAGES, first=True)
    label(c, "NAME", M, y-5)
    rule(c, y-8, M+37, 237)
    label(c, "CLASS", M+292, y-5)
    rule(c, y-8, M+331, CW-331)
    y -= 29
    label(c, "DATE", M, y-5)
    rule(c, y-8, M+37, 135)
    label(c, "TOTAL", M+292, y-5)
    label(c, f"________ / {TOTAL}", M+343, y-5, 10, INK, "Body")
    y -= 28
    y = para(c, f"<b>{MINUTES} minutes</b> for Grammar, Vocabulary and Reading ({MAIN_TOTAL} marks). Listening is taken separately (6 marks). Write your answers on this paper. Circle <b>A</b>, <b>B</b> or <b>C</b> for multiple-choice questions. Each question is worth one mark.", M, y, CW, 9.4, 12.4, gap=16)
    y = section(c, "Grammar A  /  Multiple choice", 6, y)
    for n, item in enumerate(GA["items"], 1):
        y = student_item(c, item, n, y, gap=8, gap_len=12)
    c.showPage()

    y = page(c, "Grammar", "SENTENCE COMPLETION & MULTIPLE CHOICE", total=STUDENT_PAGES)
    y = section(c, "Grammar B  /  Complete the sentences", 8, y,
                "Use the correct form of the words in brackets.")
    for n, item in enumerate(GB["items"], 1):
        y = student_item(c, item, n, y, mode="text", gap=16, gap_len=35)
    y -= 7
    y = section(c, "Grammar C  /  Multiple choice", 8, y,
                "Choose the correct answer. Questions 4-8 continue on the next page.")
    for n, item in enumerate(GC["items"][:3], 1):
        y = student_item(c, item, n, y, gap=9, gap_len=12)
    c.showPage()

    y = page(c, "Grammar & vocabulary", "MULTIPLE CHOICE", total=STUDENT_PAGES)
    y = section(c, "Grammar C  /  Continued", 8, y)
    for n, item in enumerate(GC["items"][3:], 4):
        y = student_item(c, item, n, y, gap=9, gap_len=12)
    y -= 10
    y = section(c, "Vocabulary D  /  Multiple choice", 6, y,
                "Choose the correct answer for each sentence.")
    for n, item in enumerate(VD["items"], 1):
        y = student_item(c, item, n, y, gap=9, gap_len=12)
    c.showPage()

    y = page(c, "Vocabulary", "MULTIPLE CHOICE", total=STUDENT_PAGES)
    y = section(c, "Vocabulary E  /  Multiple choice", 7, y,
                "Choose the correct answer for each sentence.")
    for n, item in enumerate(VE["items"], 1):
        y = student_item(c, item, n, y, gap=8, gap_len=12)
    y -= 7
    y = section(c, "Vocabulary F  /  Multiple choice", 6, y,
                "Choose the correct answer. Questions 5-6 continue on the next page.")
    for n, item in enumerate(VF["items"][:4], 1):
        y = student_item(c, item, n, y, gap=8, gap_len=12)
    c.showPage()

    y = page(c, "Vocabulary", "MULTIPLE CHOICE", total=STUDENT_PAGES)
    y = section(c, "Vocabulary F  /  Continued", 6, y)
    for n, item in enumerate(VF["items"][4:], 5):
        y = student_item(c, item, n, y, gap=15, gap_len=12)
    y -= 12
    y = section(c, "Vocabulary G  /  Multiple choice", 6, y,
                "Choose the correct answer for each sentence.")
    for n, item in enumerate(VG["items"], 1):
        y = student_item(c, item, n, y, gap=15, gap_len=12)
    c.showPage()

    y = page(c, "Working from home or away?", "READING H  /  DIGITAL NOMADS  /  BY ANDY WHITE  /  6 MARKS", total=STUDENT_PAGES)
    y = para(c, "Read the article, then answer questions 1-6 on the next page.", M, y, CW, 9.4, 12, color=MUTED, gap=6)
    paragraphs = RD["sharedPrompt"]["passages"][0]["text"].split("\n\n")
    assert paragraphs[0] == "Andy White"
    for n, text in enumerate(paragraphs[1:], 1):
        label(c, str(n), M, y-11, 8.5, TEAL)
        y = para(c, esc(text), M+20, y, CW-20, 10.8, 14.3, "Display", gap=12)
    c.showPage()

    y = page(c, "Reading", "H  /  DIGITAL NOMADS  /  QUESTIONS 1-6", total=STUDENT_PAGES)
    y = section(c, "Choose the correct answer", 6, y,
                "Circle A, B or C. Refer to the article on the previous page.")
    for n, item in enumerate(RD["items"], 1):
        y = student_item(c, item, n, y, mode="long-choice", gap=12)
    y = para(c, f"<b>End of the main paper.</b> Check your answers in Grammar, Vocabulary and Reading before the {MINUTES} minutes finish. Wait for your teacher before starting Listening.", M, y-8, CW, 9.6, 13, color=MUTED)
    c.showPage()

    y = page(c, "Listening", "I  /  PROCRASTINATION", total=STUDENT_PAGES)
    label(c, "NAME", M, y-5)
    rule(c, y-8, M+37, 265)
    y -= 30
    y = section(c, "Procrastination", 6, y,
                "You have 45 seconds to read the questions. You will hear the recording twice, with a 10-second pause between plays. Circle A, B or C for each question.")
    for n, item in enumerate(LS["items"], 1):
        y = student_item(c, item, n, y, mode="long-choice", gap=9)
    y = para(c, "End of the test.", M, y-1, CW, 10, 14, "BodyBold", TEAL)
    c.save()
    return path


NOTES = {
    GA["id"]: [
        "<b>Wish + past perfect</b> expresses regret about a past event. The doctor wishes the patient had sought help earlier. The present perfect and future perfect do not express that past regret.",
        "The <b>future perfect simple</b> describes marking completed before a future deadline: <b>by Monday</b>. The teacher is promising a finished result, not describing a past event.",
        "<b>Hope</b> can take a <b>to-infinitive</b>. The <b>perfect infinitive</b> (<b>to have + past participle</b>) emphasises completion before the end-of-week deadline. Neither an <b>-ing</b> form nor an unintroduced finite clause fits this gap.",
        "The <b>perfect participle clause</b> (<b>having + past participle</b>) places the decision before the start of medical school. Jenny is the understood subject of both actions.",
        "The <b>present perfect</b> compares the current feeling with all earlier experience up to now. <b>Have never been more proud</b> means the father feels as proud as he ever has.",
        "<b>What I meant</b> means <b>the thing that I meant</b>. It forms the subject of a <b>what-cleft</b> sentence that highlights the intended meaning. <b>That</b> and <b>which</b> cannot introduce this clause in the same way.",
    ],
    GB["id"]: [
        "Use the <b>present perfect passive</b>: <b>has been + past participle</b>. The restriction began on Monday and continues to the present. The singular subject is <b>access</b>.",
        "<b>Imagine</b> takes an <b>-ing</b> form. The subject would receive the teaching, so use the <b>passive gerund</b>: <b>being + past participle</b>. <b>Teach</b> has the irregular participle <b>taught</b>.",
        "This is a <b>passive reporting structure</b>: <b>it is believed to be...</b> reports other people's current belief. The singular subject <b>it</b> requires <b>is</b>.",
        "<b>Stop + -ing</b> means discontinue an activity. The speaker wants to give up Saturday work. <b>Stop to work</b> would mean interrupting another activity in order to work.",
        "The pattern is <b>persuade + object + to-infinitive</b>: <b>persuade her to change</b>.",
        "With a named object, use <b>allow + object + to-infinitive</b>: <b>allow one person to submit</b>. A bare infinitive would fit <b>let</b>, not <b>allow</b>.",
        "Initial <b>no sooner</b> triggers <b>subject-auxiliary inversion</b>. Use <b>had + subject + past participle</b>, followed by <b>than</b> and the later event.",
        "Emphatic <b>such ... that</b> places <b>was</b> before the subject: <b>Such was their self-confidence that...</b> Accept both <b>was their self-confidence</b> and <b>was their self confidence</b>, as in the online key.",
    ],
    GC["id"]: [
        "<b>Would + infinitive</b> expresses the future from a past viewpoint. The opening was still in the future when the museum made its announcement. <b>The following summer</b> fits reported time reference.",
        "<b>Would never perform</b> describes what lay ahead after the past farewell tour. It is a future-in-the-past use of <b>would</b>.",
        "<b>Would be + -ing</b> expresses a future expectation viewed from a past point. Her arrival was expected an hour after that night's reference point. No perfect aspect is required.",
        "<b>Were never to + infinitive</b> presents a later outcome in a past narrative, often with a sense of fate. At the moment of boarding, they did not know they would never return.",
        "<b>Confidence</b> is an uncountable noun used in a general sense here, so it takes <b>no article</b>. The sentence does not identify a particular previously mentioned confidence.",
        "Use the <b>causative have</b> pattern: <b>have + object + past participle</b>. The complete phrase is <b>I'm having it redecorated</b>, with <b>it</b> referring to the bedroom. The other choices omit the required object.",
        "<b>Is being + past participle</b> forms the <b>present continuous passive</b>. The store is receiving the redesign now; <b>at the moment</b> emphasises work in progress.",
        "The <b>it-cleft</b> pattern is <b>it was + focused information + that-clause</b>. It emphasises that the equipment's cost was the reason the speaker did not take up tennis.",
    ],
    VD["id"]: [
        "<b>Make no bones about something</b> means express a view openly and directly, without hiding doubts or feelings. The following sentence confirms that everyone knows his opinion.",
        "<b>Alter</b> means change or adjust. It takes <b>the wording</b> directly as its object. <b>Evolve</b> suggests gradual development; <b>substitute</b> normally describes replacing one thing with another.",
        "<b>Decay</b> means deteriorate or become damaged over time. Rust is evidence of that deterioration. <b>Restore</b> and <b>refine</b> describe improvement, not damage.",
        "<b>Rapport</b> is a friendly, understanding relationship. The pattern <b>have a good rapport with someone</b> matches the fact that the colleagues get on well.",
        "<b>Rejection</b> is the feeling of being refused acceptance or excluded. Not being invited to the party supplies that meaning; <b>loyalty</b> means faithfulness and <b>disaffection</b> suggests alienation or dissatisfaction.",
        "<b>Assonance</b> is repetition of the same or similar <b>vowel sounds</b> in nearby words. <b>Print correction:</b> the online definition also mentions consonants; that is consonance. This paper uses the precise vowel-only definition, with the same options and intended answer B.",
    ],
    VE["id"]: [
        "<b>Typical</b> means characteristic or representative of a place or group. The next sentence explains the occasions when this kind of hat is worn.",
        "<b>Concerned that...</b> means worried about a possible result. The late bus gives Emily reason to fear missing the beginning of class.",
        "<b>Go against the grain</b> means act contrary to a usual or expected pattern. Here Tom chooses a path against his parents' wishes. <b>Toe the line</b> would mean conforming.",
        "<b>Confess to someone that...</b> means admit something, especially wrongdoing. The sentence supplies the recipient (<b>his parents</b>) and the admitted action.",
        "<b>Give testimony</b> means provide a witness's account, especially in court. <b>Conviction</b> and <b>penalty</b> refer to other parts of the legal process.",
        "<b>Puffs of wind</b> are short, light bursts of moving air. The slight movement of smaller branches supports this meaning; drizzle is light rain.",
        "<b>Chug</b> describes moving with a repeated low engine sound, especially a train or boat. <b>Stroll</b> describes walking, and <b>flash</b> does not fit the train's movement here.",
    ],
    VF["id"]: [
        "<b>Fritter away</b> means waste money or time in small amounts. It directly takes <b>my pocket money</b> as an object. <b>Splash out</b> normally uses <b>on</b> and means spend a lot on something.",
        "<b>Boost sales</b> means increase the amount sold. A price discount is intended to encourage more purchases, rather than increase <b>behaviour</b> or <b>experience</b>.",
        "<b>Dip</b> means fall a small amount, matching <b>slightly</b>. <b>Plummet</b> means fall dramatically; <b>rocket</b> means rise rapidly, the opposite direction.",
        "<b>Result in + noun/-ing</b> introduces an outcome. The adverts caused the product to sell out. <b>Were attributed to</b> would reverse the intended cause-and-effect relationship.",
        "<b>Conduct market research</b> means investigate consumers and their buying habits. The question about shampoo purchases is an example of this research.",
        "<b>Volatile</b> describes conditions that can change suddenly or unpredictably. <b>Moderate</b> does not match the extreme events; <b>steadily</b> is an adverb and cannot modify <b>weather conditions</b> in this position.",
    ],
    VG["id"]: [
        "A <b>brainchild</b> is an idea, project or invention created by someone. <b>Brainiac</b> refers to a very intelligent person, while <b>birdbrained</b> is an adjective meaning foolish.",
        "<b>Pass on</b> means communicate or forward information to another person. The message is the object, and the sister is its recipient.",
        "A <b>discerning eye</b> is the ability to judge quality and notice important differences. Finding the best products illustrates that judgement.",
        "<b>Correspondence</b> means written communication, such as exchanged letters. It is uncountable in this use. A pen pal and the words they wrote establish the context.",
        "<b>Ascertain</b> means find out or establish something with certainty. It can introduce <b>exactly what had happened</b>.",
        "<b>Contradictory</b> means expressing incompatible accounts or claims. The two stories cannot both be believed as stated. <b>Interchangeable</b> would suggest either could be used in place of the other.",
    ],
    RD["id"]: [
        "<b>Paragraph 2.</b> The writer's earlier stereotype includes university education, a western background and people in their twenties working at distant beach resorts. C best gathers that profile. A adds an absence of ties that the passage does not state; B confuses working digitally with having a technology-sector job.",
        "<b>Paragraph 2.</b> The writer identifies flexibility as the key advantage, then illustrates it through multiple destinations and a variety of contracts. Lower living costs and special visas help attract workers, but they are not presented as the principal benefit.",
        "<b>Paragraph 3.</b> Contractual remote-working periods allow clearer planning and greater job security. C captures that security. The writer concedes that the arrangement may be less exciting, but the overall judgement is positive rather than dismissively boring.",
        "<b>Paragraph 4.</b> Workers gain confidence, adaptability, cultural sensitivity and communication skills. The writer assumes employers can benefit when staff bring that experience into their roles. A reverses the loyalty relationship: the text refers to employees who are already loyal. C reduces practical benefits to a claim about appearances.",
        "<b>Paragraph 5.</b> The passage directly describes a weaker sense of community identity, stability and trust when many residents stay briefly. B adds a rapid rate of rent increase that is not stated. C is a broader interpretation, while A closely matches the explicit social example.",
        "<b>Paragraph 6.</b> The writer argues for a balance between host communities and visiting workers and says nomads should contribute to their hosts. B captures concern for both sides; A and C each focus on only one part of that balance.",
    ],
    LS["id"]: [
        "The keyed contrast is between <b>how common procrastination is</b> and <b>its evident disadvantages</b>. A adds that people adopt it unconsciously, while C restricts its effects to the short term.",
        "<b>Present bias</b> favours what is immediate. The keyed answer concerns a favourable focus on present events, rather than selecting only important events (B) or carefully weighing consequences (C).",
        "The key identifies a preference for <b>immediate reward over a later reward</b>. A desire for freedom (A) or more socialising (B) is a different explanation for the split between present and future selves.",
        "The keyed definition concerns <b>fear of loss influencing decisions</b>. A specifically identifies losing; B and C replace that with making mistakes or regretting a choice.",
        "The selected benefit is an <b>opportunity to improve mood</b>. Time to solve complex problems (A) and perspective for planning (B) concern other possible benefits and do not match this keyed example of mental well-being.",
        "The stored key selects <b>informative and entertaining</b>: it combines explanation with an engaging tone. The alternatives describe a more specialised academic register or a formal attempt at persuasion. This note reports the keyed judgement rather than quoting the recording.",
    ],
}
for s in TEST["sections"]:
    assert len(NOTES[s["id"]]) == len(s["items"])


def quick_key(c, y):
    rows = [["Section", "Answers in question order", "Marks"]]
    for s in TEST["sections"]:
        title = s["title"].split(":")[0]
        if s is GB:
            content = "1 has been restricted; 2 being taught; 3 is believed;\n4 working; 5 to change; 6 to submit;\n7 had they published; 8 was their self-confidence"
        else:
            content = "   ".join(f"{i} {chr(65+x['answerIndex'])}" + ("*" if x["id"] in PRINT_EDITS else "") for i, x in enumerate(s["items"], 1))
        rows.append([title, content, str(len(s["items"]))])
    rows.append(["TOTAL", "Grammar 22  +  Vocabulary 25  +  Reading 6  +  Listening 6", str(TOTAL)])
    st = ParagraphStyle("cell", fontName="Body", fontSize=8.8, leading=12.3, textColor=INK)
    table = Table([[Paragraph(esc(cell), st) for cell in row] for row in rows], colWidths=[83, CW-123, 40])
    table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), PALE),
        ("BACKGROUND", (0, -1), (-1, -1), PALE),
        ("LINEBELOW", (0, 0), (-1, 0), .7, TEAL),
        ("LINEBELOW", (0, 1), (-1, -2), .35, LINE),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
        ("RIGHTPADDING", (0, 0), (-1, -1), 6),
        ("TOPPADDING", (0, 0), (-1, -1), 8),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
    ]))
    _, ht = table.wrap(CW, H)
    assert y - ht >= BOTTOM
    table.drawOn(c, M, y-ht)
    return y - ht - 16


KEY_PAGE_CONTEXT = {
    GA["id"]: ("Grammar A", "MULTIPLE CHOICE  /  6 MARKS  /  STUDENT PAGE 1"),
    GB["id"]: ("Grammar B", "SENTENCE COMPLETION  /  8 MARKS  /  STUDENT PAGE 2"),
    GC["id"]: ("Grammar C", "MULTIPLE CHOICE  /  8 MARKS  /  STUDENT PAGES 2-3"),
    VD["id"]: ("Vocabulary D", "MULTIPLE CHOICE  /  6 MARKS  /  STUDENT PAGE 3"),
    VE["id"]: ("Vocabulary E", "MULTIPLE CHOICE  /  7 MARKS  /  STUDENT PAGE 4"),
    VF["id"]: ("Vocabulary F", "MULTIPLE CHOICE  /  6 MARKS  /  STUDENT PAGES 4-5"),
    VG["id"]: ("Vocabulary G", "MULTIPLE CHOICE  /  6 MARKS  /  STUDENT PAGE 5"),
    RD["id"]: ("Reading H", "DIGITAL NOMADS  /  6 MARKS  /  STUDENT PAGES 6-7"),
    LS["id"]: ("Listening I", "PROCRASTINATION  /  6 MARKS  /  STUDENT PAGE 8"),
}


def teacher_key():
    path = OUT / "Insight_Advanced_Progress_Test_1-5_Detailed_Key.pdf"
    c = pdf_canvas(path, "Insight Advanced | Units 1-5 | Detailed teacher key")
    kind = "TEACHER KEY"
    y = page(c, "Detailed answer key", "INSIGHT ADVANCED  /  UNITS 1-5  /  VERSION A", kind, KEY_PAGES, True)
    y = para(c, "Classroom companion to the current online progress test. This key gives every intended answer, explains the language or evidence being tested, and identifies the small definition correction made for print.", M, y, CW, 10, 14, gap=16)
    y = quick_key(c, y)
    y = para(c, f"<b>Marking.</b> Award one mark per numbered question, with no negative marking. Grammar: <b>22</b>; Vocabulary: <b>25</b>; Reading: <b>6</b>; Listening: <b>6</b>. The main paper is <b>{MAIN_TOTAL} marks in {MINUTES} minutes</b>; Listening is taken separately. Overall total: <b>{TOTAL}</b>. Percentage = score / {TOTAL} x 100.", M, y, CW, 9.6, 13.2, gap=13)
    y = para(c, "<b>* Print correction, Vocabulary D6.</b> The question now defines assonance as repeated vowel sounds. The online wording also refers to consonants, which describes consonance. The intended answer and all three options are unchanged. No other question wording or intended answers have been changed.", M, y, CW, 9.4, 13, gap=13)
    y = para(c, "<b>Short answers.</b> Require accurate grammar and spelling in Grammar B. Ignore differences in capitalisation. Both hyphenated and unhyphenated <b>self-confidence</b> are accepted in B8, matching the online key. The detailed notes show the forms required.", M, y, CW, 9.4, 13)
    c.showPage()

    for s in TEST["sections"]:
        title, descriptor = KEY_PAGE_CONTEXT[s["id"]]
        y = page(c, title, descriptor, kind, KEY_PAGES)
        if s is GB:
            y = para(c, "The answer heading shows only the words required in the gap. The completed sentence underneath provides context; words in brackets are removed.", M, y, CW, 9.4, 13, color=MUTED, gap=18)
        if s is RD:
            y = para(c, "Paragraph numbers refer to those printed beside the article. The opening standfirst is paragraph 1; the writer's first main paragraph is paragraph 2.", M, y, CW, 9.4, 13, color=MUTED, gap=18)
        if s is LS:
            y = para(c, "<b>Administration.</b> Use <b>insight-advanced-progress-1-5-listening.mp3</b> (approximately 4 minutes 29 seconds). Allow <b>45 seconds</b> to read. Play the complete recording <b>twice</b>, with a <b>10-second</b> pause between plays. Students answer while listening; the online setup has no additional timed answer window.", M, y, CW, 9.6, 13.2, gap=13)
            y = para(c, "<b>About these notes.</b> The answers reproduce the stored online listening key. The commentary explains distinctions between the answer choices; it is not a transcript of the recording.", M, y, CW, 9.2, 12.5, color=MUTED, gap=20)
        for n, (item, note) in enumerate(zip(s["items"], NOTES[s["id"]]), 1):
            completed = None
            if s is GB:
                completed = esc(item["prompt"])
                completed = re.sub(r"_{8,}", f"<b>{esc(item['acceptedAnswers'][0])}</b>", completed)
                completed = re.sub(r" \([^)]*\)", "", completed)
            gap = 20 if s in (GA, VD, VE, VF, VG) else 16
            if s is GB:
                gap = 10
            if s is LS:
                gap = 17
            y = key_entry(c, n, answer_text(item), note, y, completed, gap=gap, size=10.3)
        if s is LS:
            y = para(c, "<b>Printing and use.</b> Print the student paper on A4 at 100% / actual size. Duplex printing with long-edge binding puts the article and reading questions on facing pages. Keep the teacher key separate. The main-paper time limit excludes Listening.", M, y-5, CW, 9.2, 12.5, color=MUTED)
        if s is not LS:
            c.showPage()
    c.save()
    return path


def verify(student, key):
    from pypdf import PdfReader
    import pdfplumber

    def norm(s):
        s = s.replace("\u2013", "-").replace("\u2014", "-").replace("\u2011", "-")
        return re.sub(r"\s+", "", re.sub(r"_+", "", s)).lower()

    student_doc, key_doc = PdfReader(student), PdfReader(key)
    assert len(student_doc.pages) == STUDENT_PAGES
    assert len(key_doc.pages) == KEY_PAGES
    all_text = norm(" ".join(p.extract_text() for p in student_doc.pages))
    for s in TEST["sections"]:
        for item in s["items"]:
            for part in PRINT_EDITS.get(item["id"], item["prompt"]).split("\n"):
                assert norm(part) in all_text, (item["id"], "prompt missing")
            for option in item.get("options", []):
                assert norm(option) in all_text, (item["id"], "option missing")
    for p in RD["sharedPrompt"]["passages"][0]["text"].split("\n\n"):
        assert norm(p) in all_text, "Reading paragraph missing"
    for i, s in enumerate(TEST["sections"], 1):
        key_text = norm(key_doc.pages[i].extract_text())
        for item in s["items"]:
            correct = item["options"][item["answerIndex"]] if item["type"] == "choice" else item["acceptedAnswers"][0]
            assert norm(correct) in key_text, (item["id"], "key missing")
    for path in (student, key):
        with pdfplumber.open(path) as doc:
            for i, p in enumerate(doc.pages, 1):
                assert all(M-1 <= ch["x0"] < ch["x1"] <= W-M+1 for ch in p.chars), (path.name, i, "margin overflow")
                assert not any(ch["text"] == "\ufffd" for ch in p.chars)
        print(f"{path}: {len(PdfReader(path).pages)} A4 pages, {path.stat().st_size:,} bytes")
    with pdfplumber.open(student) as doc:
        counts = []
        for p in doc.pages:
            words = p.extract_words(extra_attrs=["size"])
            counts.append(sum(1 for x in words if abs(x["x0"]-M)<.2 and abs(x["size"]-9)<.05 and re.fullmatch(r"\d\d", x["text"])))
        assert counts == [6, 11, 11, 11, 8, 0, 6, 6], counts
        assert sum(counts) == TOTAL
    print(f"Coverage passed: {TOTAL} questions, 153 options, all reading paragraphs and all intended key answers.")


if __name__ == "__main__":
    student, key = student_paper(), teacher_key()
    verify(student, key)
    TMP.mkdir(parents=True, exist_ok=True)
    (TMP / "layout-log.json").write_text(json.dumps(PAGE_LOG, indent=2))
