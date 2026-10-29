"""Build classroom PDFs from the revised Insight Units 1-5 online test.

Run from the repository root with Python containing reportlab and pypdf.
The source content and intended answers are read directly from the JS template.
"""

import html
import json
import re
import subprocess
from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas
from reportlab.platypus import Paragraph, Table, TableStyle


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "output/pdf"
OUT.mkdir(parents=True, exist_ok=True)
TEST_ID = "oxford-insight-upper-intermediate-progress-1-5"
NODE = "node"
source = subprocess.check_output(
    [NODE, "--input-type=module", "-e",
     'import {getHubCourseTestTemplate} from "./src/data/hubCourseTestTemplates.js"; '
     f'console.log(JSON.stringify(getHubCourseTestTemplate("{TEST_ID}")));'],
    cwd=ROOT, text=True,
)
TEST = json.loads(source)
GA, GB, GC, VC, VD, VE, RD, LS = TEST["sections"]
assert [len(s["items"]) for s in TEST["sections"]] == [10, 12, 8, 6, 12, 10, 6, 6]

FONT_DIR = Path("/System/Library/Fonts/Supplemental")
for name, filename in [
    ("Body", "Arial.ttf"), ("BodyBold", "Arial Bold.ttf"),
    ("BodyItalic", "Arial Italic.ttf"), ("Display", "Georgia.ttf"),
    ("DisplayBold", "Georgia Bold.ttf"), ("DisplayItalic", "Georgia Italic.ttf"),
]:
    pdfmetrics.registerFont(TTFont(name, str(FONT_DIR / filename)))
pdfmetrics.registerFontFamily("Body", normal="Body", bold="BodyBold", italic="BodyItalic", boldItalic="BodyBold")
pdfmetrics.registerFontFamily("Display", normal="Display", bold="DisplayBold", italic="DisplayItalic", boldItalic="DisplayBold")

W, H = A4
M = 46
CW = W - 2 * M
INK = colors.HexColor("#202A2D")
TEAL = colors.HexColor("#244F55")
MUTED = colors.HexColor("#566267")
LINE = colors.HexColor("#BAC4C5")
PALE = colors.HexColor("#F0F3F2")
BOTTOM = 60
PAGE_LOG = []


def clean(s):
    return str(s).replace("\u2013", "-").replace("\u2014", "-").replace("\u2011", "-")


def esc(s):
    return html.escape(clean(s)).replace("\n", "<br/>")


def para(c, text, x, y, width, size=10.8, leading=14.6, font="Body", color=INK, gap=0):
    style = ParagraphStyle(
        "p", fontName=font, fontSize=size, leading=leading, textColor=color,
        alignment=TA_LEFT, splitLongWords=False, allowWidows=0, allowOrphans=0,
    )
    p = Paragraph(text, style)
    _, height = p.wrap(width, H)
    if y - height < BOTTOM:
        raise ValueError(f"Page overflow: {c.getPageNumber()}, y={y}, height={height}, {text[:95]}")
    p.drawOn(c, x, y - height)
    PAGE_LOG.append((Path(c._filename).name, c.getPageNumber(), round(y - height, 1), re.sub("<[^>]+>", "", text)[:65]))
    return y - height - gap


def rule(c, y, x=M, width=CW, color=LINE, weight=.5):
    c.setStrokeColor(color)
    c.setLineWidth(weight)
    c.line(x, y, x + width, y)


def label(c, text, x, y, size=8.4, color=MUTED, font="BodyBold"):
    c.setFillColor(color)
    c.setFont(font, size)
    c.drawString(x, y, clean(text))


def page(c, title, descriptor, kind="STUDENT PAPER", total=8, first=False):
    c.setFillColor(TEAL)
    c.rect(M, H - 40, 23, 3, fill=1, stroke=0)
    label(c, "SEIF ENGLISH ACADEMY", M + 32, H - 40, 8.2, TEAL)
    c.setFont("Body", 8)
    c.setFillColor(MUTED)
    c.drawRightString(W - M, H - 40, kind)
    y = H - 70
    y = para(c, esc(title), M, y, CW, 24 if first else 21, 29 if first else 26, "Display", TEAL, 5)
    y = para(c, esc(descriptor), M, y, CW, 9, 12, color=MUTED, gap=12)
    rule(c, y)
    footer(c, total, kind)
    return y - 18


def footer(c, total, kind):
    rule(c, 45)
    course = getattr(c, "insight_course", "INSIGHT UPPER-INTERMEDIATE")
    scope = getattr(c, "insight_scope", "UNITS 1-5")
    label(c, f"{course}  /  {scope}  /  VERSION A", M, 31, 7.2, MUTED, "Body")
    c.setFont("Body", 7.5)
    c.setFillColor(MUTED)
    c.drawRightString(W - M, 31, f"{c.getPageNumber()} / {total}")


def section(c, title, marks, y, note=None):
    y = para(c, esc(title), M, y, CW - 66, 14, 18, "DisplayBold", TEAL)
    c.setFont("BodyBold", 9.2)
    c.setFillColor(TEAL)
    c.drawRightString(W - M, y + 5, f"{marks} marks")
    if note:
        y = para(c, esc(note), M, y - 7, CW, 9.4, 12.4, color=MUTED)
    return y - 13


def prompt_markup(item, gap_len=25):
    return esc(re.sub(r"_{8,}", "_" * gap_len, item["prompt"]))


def question(c, item, number, y, mode="choice", gap=10, size=10.8, gap_len=25):
    x = M + 24
    label(c, f"{number:02d}", M, y - 11, 9, TEAL)
    y = para(c, prompt_markup(item, gap_len), x, y, CW - 24, size, 14.6)
    if mode == "choice":
        y -= 6
        col = (CW - 24) / 3
        bottoms = []
        for j, option in enumerate(item["options"]):
            bottoms.append(para(c, f"<b>{chr(65+j)}</b>  {esc(option)}", x+j*col, y, col-8, 10, 13.2))
        y = min(bottoms)
    elif mode == "long-choice":
        y -= 7
        for j, option in enumerate(item["options"]):
            y = para(c, f"<b>{chr(65+j)}</b>  {esc(option)}", x+5, y, CW-34, size, 15.2, gap=4)
    return y - gap


def answer_lines(c, y, lines=1):
    for _ in range(lines):
        rule(c, y, M + 24, CW - 24, color=LINE, weight=.45)
        y -= 19
    return y


def student_paper():
    path = OUT / "Insight_Upper_Intermediate_Progress_Test_1-5_Student.pdf"
    c = canvas.Canvas(str(path), pagesize=A4, pageCompression=1)
    c.setTitle("Insight Upper-Intermediate | Units 1-5 | Student paper")
    c.setAuthor("Seif English Academy")
    c.setSubject("Classroom edition of the revised online progress test, Version A")

    y = page(c, "Insight Upper-Intermediate", "PROGRESS TEST  /  UNITS 1-5  /  VERSION A", first=True)
    label(c, "NAME", M, y - 5)
    rule(c, y - 8, M + 37, 237)
    label(c, "CLASS", M + 292, y - 5)
    rule(c, y - 8, M + 331, CW - 331)
    y -= 29
    label(c, "DATE", M, y - 5)
    rule(c, y - 8, M + 37, 135)
    label(c, "TOTAL", M + 292, y - 5)
    label(c, "________ / 70", M + 343, y - 5, 10, INK, "Body")
    y -= 28
    y = para(c, "<b>70 minutes</b> for Grammar, Vocabulary and Reading (64 marks). Listening is taken separately (6 marks). Write your answers on this paper. Circle <b>A</b>, <b>B</b> or <b>C</b> for multiple-choice questions. Each question is worth one mark.", M, y, CW, 9.4, 12.4, gap=16)
    y = section(c, "Grammar A  /  Multiple choice", 10, y)
    for n, item in enumerate(GA["items"], 1):
        y = question(c, item, n, y, gap=8, gap_len=12)
    c.showPage()

    y = page(c, "Grammar", "SENTENCE COMPLETION")
    y = section(c, "Grammar B  /  Complete the sentences", 12, y,
                "Use the correct form of the words in brackets. For questions 8 and 12, write one word or a dash (-) if no article is needed.")
    for n, item in enumerate(GB["items"], 1):
        y = question(c, item, n, y, mode="text", gap=19, gap_len=35)
    c.showPage()

    y = page(c, "Grammar", "KEY WORD TRANSFORMATIONS")
    y = section(c, "Grammar C  /  Keep the meaning", 8, y,
                "Complete the second sentence so that it has a similar meaning to the first. Use the word given without changing it. Write TWO to FIVE words in each gap. In this paper, contractions count as one word.")
    for n, item in enumerate(GC["items"], 1):
        original, keyword, target = item["prompt"].split("\n")
        label(c, f"{n:02d}", M, y - 11, 9, TEAL)
        y = para(c, esc(original), M+24, y, CW-24)
        y = para(c, esc(keyword), M+24, y-5, CW-24, 9.2, 12, "BodyBold", TEAL)
        before, after = re.split(r"_{8,}", target)
        available = CW - 28 - pdfmetrics.stringWidth(before + after, "Body", 10.8)
        count = min(42, int(available / pdfmetrics.stringWidth("_", "Body", 10.8)))
        target = esc(before + "_" * count + after)
        y = para(c, target, M+24, y-8, CW-24, 10.8, 18.5, gap=13)
    c.showPage()

    y = page(c, "Vocabulary", "WORD FORMATION & MULTIPLE CHOICE")
    y = section(c, "Vocabulary C  /  Word formation", 6, y,
                "Complete each sentence with the correct form of the word in brackets.")
    for n, item in enumerate(VC["items"], 1):
        y = question(c, item, n, y, mode="text", gap=16, gap_len=27)
    y -= 6
    y = section(c, "Vocabulary D  /  Multiple choice", 12, y,
                "Choose the correct answer. Questions 7-12 continue on the next page.")
    for n, item in enumerate(VD["items"][:6], 1):
        y = question(c, item, n, y, gap=10, gap_len=12)
    c.showPage()

    y = page(c, "Vocabulary", "MULTIPLE CHOICE & MISSING WORDS")
    y = section(c, "Vocabulary D  /  Continued", 12, y)
    for n, item in enumerate(VD["items"][6:], 7):
        y = question(c, item, n, y, gap=9, gap_len=12)
    y -= 7
    y = section(c, "Vocabulary E  /  Words and phrases", 10, y,
                "Complete the missing words or phrases. Some letters are given. Each complete answer is worth one mark.")
    for n, item in enumerate(VE["items"], 1):
        y = question(c, item, n, y, mode="text", gap=9, gap_len=10)
    c.showPage()

    y = page(c, "Reading", "METHOD ACTING  /  6 MARKS")
    y = para(c, "Read the article, then answer questions 1-6 on the next page.", M, y, CW, 10, 14, color=MUTED, gap=17)
    for n, text in enumerate(RD["sharedPrompt"]["passages"][0]["text"].split("\n\n"), 1):
        label(c, str(n), M, y-12, 8.5, TEAL)
        y = para(c, esc(text), M+20, y, CW-20, 11.1, 15.3, "Display", gap=13)
    c.showPage()

    y = page(c, "Reading", "METHOD ACTING  /  QUESTIONS 1-6")
    y = section(c, "Choose the correct answer", 6, y,
                "Circle A, B or C. Refer to the article on the previous page.")
    for n, item in enumerate(RD["items"], 1):
        y = question(c, item, n, y, mode="long-choice", gap=12)
    y = para(c, "<b>End of the main paper.</b> Check your answers in Grammar, Vocabulary and Reading before the 70 minutes finish. Wait for your teacher before starting Listening.", M, y-8, CW, 9.6, 13, color=MUTED)
    c.showPage()

    y = page(c, "Listening", "EXERCISE THAT DOESN'T FEEL LIKE EXERCISE")
    label(c, "NAME", M, y-5)
    rule(c, y-8, M+37, 265)
    y -= 30
    y = section(c, "A radio programme about exercise", 6, y,
                "You have 45 seconds to read the questions. You will hear the recording twice, with a 10-second pause between plays. Circle A, B or C for each question.")
    for n, item in enumerate(LS["items"], 1):
        y = question(c, item, n, y, mode="long-choice", gap=9)
    y = para(c, "End of the test.", M, y-1, CW, 10, 14, "BodyBold", TEAL)
    c.save()
    return path


GA_NOTES = [
    "<b>May + infinitive</b> expresses an uncertain future possibility. The speaker has not booked the trip, so the present continuous would suggest a firmer arrangement than the context supports.",
    "The <b>future perfect simple</b> describes something completed before a future deadline: the assignments will be handed in before the exams. The continuous forms focus on an activity in progress.",
    "<b>Was about to + infinitive</b> means something was going to happen very soon. Henry arrived just before Cathy started speaking.",
    "<b>Money</b> is uncountable, so use <b>much</b>. <b>Far too much</b> means an excessive amount and matches the comment about the high price.",
    "<b>Was able to</b> describes a successful achievement on a particular past occasion. <b>Once</b> introduces the event that made packing possible.",
    "The <b>present continuous + forever</b> is used here to complain about a repeated habit. The second sentence supplies the speaker's irritation.",
    "<b>Would + infinitive</b> expresses the future viewed from a past point: the inventor did not predict the later effects. The other options also use <b>were</b> with the singular subject <b>invention</b>.",
    "<b>Ought to have + past participle</b> expresses criticism or regret about a past action that was advisable. The intended meaning is that the speaker should have booked earlier.",
    "<b>Doesn't need to</b> expresses lack of necessity. The second sentence allows storage in a cupboard; it does not prohibit putting jam in the fridge.",
    "<b>Mustn't</b> expresses prohibition. <b>Don't have to</b> and <b>needn't</b> mean that something is unnecessary, which would not communicate the rule about noise.",
]

GB_NOTES = [
    "The <b>past perfect continuous</b> shows an activity continuing up to a past point. <b>Since early that morning</b> gives its starting point, and the grease is its visible result.",
    "The <b>past perfect simple</b> puts Anjali's departure before Max's arrival. Place <b>already</b> between <b>had</b> and the past participle <b>left</b>.",
    "The online key accepts all three future forms: <b>is going to visit</b> (intention), <b>will visit</b> (future statement) and <b>is visiting</b> (arrangement). <b>Fair marking:</b> <b>visits</b> is also defensible because <b>like every weekend</b> establishes a regular habit.",
    "The <b>present perfect continuous</b> describes an activity that began earlier and is still continuing. <b>All morning</b> and <b>when I'm done</b> support this meaning.",
    "The <b>past perfect</b> refers to the earlier period when Anh Long was out. Accept <b>had not cleaned</b> or <b>hadn't cleaned</b>.",
    "The <b>past continuous</b> describes an action already in progress when the shorter past event, her dad's arrival, occurred.",
    "Active <b>make + object</b> takes the <b>bare infinitive</b>: <b>make you sweat</b>. Do not add <b>to</b> or use an <b>-ing</b> form.",
    "Use <b>a</b> to mean <b>each/every</b> in a frequency expression. <b>Per</b> has the same meaning here and is also accepted by the online key.",
    "<b>Be used to + -ing</b> means be accustomed to something. This sentence is about a present preference, so it is not the past-habit construction <b>used to + infinitive</b>.",
    "A past-habit question uses <b>did + subject + use to + infinitive</b>. After <b>did</b>, write <b>use</b>, not <b>used</b>.",
    "<b>Try to do</b> means attempt an action. The sentence describes an unsuccessful effort, rather than experimenting with a method (<b>try doing</b>).",
    "Use <b>no article</b> before a plural countable noun with a general meaning. Students should write a dash (-) in the gap.",
]

GC_NOTES = [
    "The <b>present perfect negative + since</b> connects the last conversation in March with the present. <b>haven't spoken to Elena since</b> = 5 words under this paper's contraction rule.",
    "The <b>future continuous</b> places the journey in progress at nine tomorrow. Accept <b>will be travelling</b> (3 words) or <b>'ll be travelling</b>.",
    "The <b>future perfect continuous</b> gives the duration of an ongoing activity up to a future point. Accept <b>will have been working</b> (4 words) or <b>'ll have been working</b>.",
    "<b>Interest</b> is uncountable. <b>Little</b> means not much, preserving the negative sense of <b>very few people showed any interest</b>. The completion has 3 words.",
    "<b>Get used to + -ing</b> describes becoming accustomed to something. <b>Got</b> puts that change in the past. The completion has 4 words.",
    "<b>Would + infinitive</b> describes a repeated past action in the childhood time frame. <b>Take someone swimming</b> is the required pattern. The completion has 4 words.",
    "<b>Needn't have + past participle</b> means the action happened but was unnecessary. <b>Needn't have bought</b> has 3 words under this paper's contraction rule.",
    "<b>Had better not + infinitive</b> gives strong negative advice. Accept <b>had better not drive</b> (4 words) or <b>'d better not drive</b>.",
]

VC_NOTES = [
    "<b>Make a commitment</b> = promise to do something. The article requires a singular noun; add <b>-ment</b>.",
    "The noun <b>determination</b> means persistence and resolve. It is the object of <b>showed</b>.",
    "A <b>disappointment</b> is something that fails to meet a hope or expectation. The article <b>a</b> requires a noun.",
    "The adjective <b>innovative</b> describes a new or original <b>way</b> of doing something.",
    "<b>Self-control</b> means the ability to manage one's emotions or behaviour. The online key also accepts <b>self control</b>. <b>Fair marking:</b> plain <b>control</b> is grammatically possible in the unchanged sentence; accept it if the student uses that reading.",
    "<b>Incremental</b> is an adjective meaning increasing by small steps; it modifies <b>amounts</b>.",
]

VD_NOTES = [
    "<b>Pick out</b> means choose or select, here a dress.",
    "Adjective order here is <b>opinion + age + material</b>.",
    "<b>Handmade</b> describes something made by hand, such as cakes.",
    "The order is <b>shape + colour + purpose</b>: a square, grey room used for waiting.",
    "<b>Throw out</b> means discard something no longer wanted.",
    "<b>Never-ending</b> means seemingly without an end or limit.",
    "<b>Cheer someone on</b> means encourage them by shouting support.",
    "<b>Encourage someone to do something</b> means give support or motivation.",
    "<b>There's no point in + -ing</b> means the action has no useful purpose.",
    "<b>Brush up on</b> means refresh knowledge or a skill you have not used recently.",
    "<b>On the point of + -ing</b> means just about to do something.",
    "<b>Enclose</b> means include something with a letter or application.",
]

VE_ANS = ["self-interest", "resourceful", "run-down", "accessible", "make out", "keep an eye on", "empower", "benefit", "index", "worthwhile"]
VE_NOTES = [
    "Acting for one's own advantage rather than for other people's benefit. Complete both parts: <b>self</b> and <b>interest</b>.",
    "Able to solve problems using the materials and opportunities available. The sentence needs an adjective after <b>be</b>.",
    "In poor condition through age or neglect. The compound adjective modifies <b>buildings</b>; complete both parts.",
    "Easy for someone to reach, enter or use. <b>Accessible to</b> is the required adjective and preposition pattern.",
    "Manage to see, read or recognise something that is difficult to distinguish, here a faint address.",
    "Watch or look after something temporarily. The words to complete are <b>keep</b>, <b>eye</b> and <b>on</b>; <b>an</b> is already printed.",
    "Give people the power or authority to make decisions. The infinitive follows <b>aims to</b>.",
    "Help or have a positive effect on someone or something. A verb is needed after <b>should</b>.",
    "An alphabetical list of topics with page references, usually at the back of a book.",
    "Worth the time or effort spent. The positive view compensates for the exhausting journey.",
]

RD_NOTES = [
    "<b>Paragraph 1.</b> The introduction explains what method acting is and how actors prepare to become their characters. It defines the technique rather than recommending it (B) or mainly explaining why directors use it (A).",
    "<b>Paragraph 2.</b> The writer's main explanation is that method actors are harder to work with and this limits their opportunities. The paragraph mentions difficulty mastering the method and effects after filming, but the writer gives greater weight to the restriction on roles.",
    "<b>Paragraph 3.</b> Some actors find the method exhausting and prefer techniques that do not make a character part of their private lives. This supports a negative personal impact (B). The text does not claim other techniques are less successful (C).",
    "<b>Paragraph 4.</b> The online key selects <b>C</b>: the writer questions whether such extreme preparation is worthwhile when audiences probably cannot tell the difference. <b>Fair marking:</b> <b>A is also explicitly supported</b>, because the actor said his preparations helped his performance. The broad question wording allows both; accept A in classroom marking. B is not supported.",
    "<b>Paragraph 5.</b> Audiences would not necessarily know whether an actor used the method or more general acting skills. Historical figures and celebrities are a possible exception; this does not mean those films are audiences' favourites (A). Noticing weaknesses does not establish that audiences focus on them too much (C).",
    "<b>Paragraph 6.</b> The comments criticise extreme preparation, advise actors simply to act, and describe possible harm or disruption. Together they support the argument that the method is unnecessary (B). They do not establish that most actors now refuse it (C).",
]

LS_NOTES = [
    "The keyed distinction is that exercise <b>feels like work</b>. This concerns how people experience the activity, rather than a lack of time (A) or repetition (C).",
    "The keyed answer says her early participation came from <b>obligation</b>. It does not identify a preference for exercising alone (A) or a judgement about her sporting ability (B).",
    "The key identifies <b>another person as the source of her discovery</b>. Existing skills (B) and a negative judgement about the exercise (C) are different claims.",
    "The keyed reason is <b>nostalgia for childhood</b>. The general theme of exercise that feels fun does not replace Max's specific reason (B).",
    "The answer is an <b>analogy with beneficial food</b>: something can be good for you without being enjoyable. Regret about her ability (B) and trying to convince herself she liked jogging (C) are different ideas.",
    "The key identifies <b>enthusiasm about a new challenge</b>. Concern about safety (A) and surprise at other people's description of the activity (C) are different reactions.",
]


def answer_text(item, inline=False):
    if item["type"] == "choice":
        j = item["answerIndex"]
        return f"{chr(65+j)}  {item['options'][j]}"
    values = item["acceptedAnswers"]
    return clean(values[0])


def key_entry(c, number, answer, note, y, completed=None, size=10.2, gap=12):
    label(c, f"{number:02d}", M, y-11, 9, TEAL)
    y = para(c, esc(answer), M+24, y, CW-24, 10.6, 14.2, "BodyBold", TEAL, gap=4)
    if completed:
        y = para(c, completed, M+24, y, CW-24, 10.3, 14, gap=4)
    y = para(c, note, M+24, y, CW-24, size, 13.8, gap=gap)
    return y


def key_table(c, y):
    rows = [["Section", "Answers in question order", "Marks"]]
    rows += [
        ["Grammar A", "1 A   2 B   3 C   4 B   5 A   6 A   7 B   8 B   9 A   10 B", "10"],
        ["Grammar B", "1 had been fixing; 2 had already left; 3 is going to visit*;\n4 have been running; 5 had not cleaned; 6 was trying;\n7 sweat; 8 a / per; 9 am not used to having;\n10 did you use to visit; 11 to beat; 12 -", "12"],
        ["Grammar C", "1 haven't spoken to Elena since; 2 will be travelling;\n3 will have been working; 4 was little interest;\n5 got used to working; 6 would take us swimming;\n7 needn't have bought; 8 had better not drive", "8"],
        ["Vocabulary C", "1 commitment; 2 determination; 3 disappointment;\n4 innovative; 5 self-control*; 6 incremental", "6"],
        ["Vocabulary D", "1 B   2 A   3 A   4 C   5 B   6 C   7 B   8 A   9 C   10 B   11 C   12 B", "12"],
        ["Vocabulary E", "1 self-interest; 2 resourceful; 3 run-down; 4 accessible;\n5 make out; 6 keep an eye on; 7 empower; 8 benefit;\n9 index; 10 worthwhile", "10"],
        ["Reading", "1 C   2 A   3 B   4 C*   5 B   6 B", "6"],
        ["Listening", "1 B   2 C   3 A   4 B   5 A   6 B", "6"],
        ["TOTAL", "Grammar 30  +  Vocabulary 28  +  Reading 6  +  Listening 6", "70"],
    ]
    style = ParagraphStyle("cell", fontName="Body", fontSize=8.6, leading=12, textColor=INK)
    data = [[Paragraph(esc(cell), style) for cell in row] for row in rows]
    t = Table(data, colWidths=[83, CW-123, 40])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), PALE),
        ("BACKGROUND", (0, -1), (-1, -1), PALE),
        ("LINEBELOW", (0, 0), (-1, 0), .7, TEAL),
        ("LINEBELOW", (0, 1), (-1, -2), .35, LINE),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
        ("RIGHTPADDING", (0, 0), (-1, -1), 6),
        ("TOPPADDING", (0, 0), (-1, -1), 7),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
    ]))
    _, ht = t.wrap(CW, H)
    if y-ht < BOTTOM:
        raise ValueError("Quick key table overflow")
    t.drawOn(c, M, y-ht)
    return y - ht - 12


def teacher_key():
    path = OUT / "Insight_Upper_Intermediate_Progress_Test_1-5_Detailed_Key.pdf"
    c = canvas.Canvas(str(path), pagesize=A4, pageCompression=1)
    c.setTitle("Insight Upper-Intermediate | Units 1-5 | Detailed teacher key")
    c.setAuthor("Seif English Academy")
    c.setSubject("Answer key, explanations, accepted alternatives and classroom marking guidance")
    kind = "TEACHER KEY"
    total = 9
    y = page(c, "Detailed answer key", "INSIGHT UPPER-INTERMEDIATE  /  UNITS 1-5  /  VERSION A", kind, total, True)
    y = para(c, "Classroom companion to the revised online test. Intended answers follow the current course-test template. Explanations and fair-marking notes support in-person assessment.", M, y, CW, 10, 14, gap=14)
    y = key_table(c, y)
    y = para(c, "<b>* See the detailed notes:</b> Grammar B3 has several accepted future forms and a defensible habitual reading; Vocabulary C5 also permits a plain-noun reading; Reading 4 has a second defensible option. These notes distinguish classroom judgement from the stored online key.", M, y, CW, 9.1, 12.4, gap=10)
    y = para(c, "<b>Marking:</b> one mark per numbered question; no negative marking. In Vocabulary E, all parts of the word or phrase must be correct for the mark. Main paper: <b>64</b>; Listening: <b>6</b>; overall: <b>70</b>. Percentage = score / 70 x 100. Detailed alternatives follow.", M, y, CW, 9.1, 12.4)
    c.showPage()

    y = page(c, "Grammar A", "MULTIPLE CHOICE  /  10 MARKS  /  STUDENT PAGE 1", kind, total)
    for n, (item, note) in enumerate(zip(GA["items"], GA_NOTES), 1):
        y = key_entry(c, n, answer_text(item), note, y, gap=12)
    c.showPage()

    y = page(c, "Grammar B", "SENTENCE COMPLETION  /  12 MARKS  /  STUDENT PAGE 2", kind, total)
    alt = {3: "is going to visit / will visit / is visiting", 5: "had not cleaned / hadn't cleaned", 8: "a / per", 9: "am not used to having / 'm not used to having", 12: "-  (no article)"}
    for n, (item, note) in enumerate(zip(GB["items"], GB_NOTES), 1):
        y = key_entry(c, n, alt.get(n, answer_text(item)), note, y, gap=9, size=10)
    c.showPage()

    y = page(c, "Grammar C", "KEY WORD TRANSFORMATIONS  /  8 MARKS  /  STUDENT PAGE 3", kind, total)
    y = para(c, "Award one mark for a correct completion that preserves the meaning, retains the given word and contains two to five words. <b>Contractions count as one word in this classroom paper.</b> Other valid completions meeting these conditions may receive credit.", M, y, CW, 9.3, 12.5, gap=16)
    for n, (item, note) in enumerate(zip(GC["items"], GC_NOTES), 1):
        target = item["prompt"].split("\n")[2]
        completed = esc(target).replace("_"*34, f"<b>{esc(item['acceptedAnswers'][0])}</b>")
        y = key_entry(c, n, answer_text(item), note, y, completed, gap=10, size=10)
    c.showPage()

    y = page(c, "Vocabulary C", "WORD FORMATION  /  6 MARKS  /  STUDENT PAGE 4", kind, total)
    for n, (item, note) in enumerate(zip(VC["items"], VC_NOTES), 1):
        completed = esc(item["prompt"]).replace("_"*8, f"<b>{esc(item['acceptedAnswers'][0])}</b>")
        completed = re.sub(r" \([^)]*\)", "", completed)
        y = key_entry(c, n, answer_text(item), note, y, completed, gap=20)
    y = para(c, "<b>Spelling and forms.</b> Require the derived form and accurate spelling. Accept <b>self control</b> as an alternative to the hyphenated form, in line with the online key. Use the fair-marking note above for question 5.", M, y-5, CW, 9.6, 13.2, color=MUTED)
    c.showPage()

    y = page(c, "Vocabulary D", "MULTIPLE CHOICE  /  12 MARKS  /  STUDENT PAGES 4-5", kind, total)
    for n, (item, note) in enumerate(zip(VD["items"], VD_NOTES), 1):
        y = key_entry(c, n, answer_text(item), note, y, gap=12)
    c.showPage()

    y = page(c, "Vocabulary E", "MISSING WORDS & PHRASES  /  10 MARKS  /  STUDENT PAGE 5", kind, total)
    y = para(c, "Answers below show the <b>complete words or phrases</b>, including letters already printed. Give one mark only when the complete answer is correct; a phrase with several gaps still earns one mark in total.", M, y, CW, 9.6, 13, gap=17)
    for n, (answer, note) in enumerate(zip(VE_ANS, VE_NOTES), 1):
        y = key_entry(c, n, answer, note, y, gap=14)
    c.showPage()

    y = page(c, "Reading", "METHOD ACTING  /  6 MARKS  /  STUDENT PAGES 6-7", kind, total)
    y = para(c, "Paragraph numbers refer to the numbers printed beside the article. Explanations identify the evidence and the distinction between the correct option and its distractors.", M, y, CW, 9.5, 13, gap=17)
    for n, (item, note) in enumerate(zip(RD["items"], RD_NOTES), 1):
        y = key_entry(c, n, answer_text(item), note, y, gap=19, size=10.3)
    c.showPage()

    y = page(c, "Listening", "EXERCISE THAT DOESN'T FEEL LIKE EXERCISE  /  6 MARKS  /  STUDENT PAGE 8", kind, total)
    y = para(c, "<b>Administration.</b> Use the existing course-test audio: <b>insight-upper-int-progress-1-5.mp3</b> (approximately 4 minutes 8 seconds). Allow <b>45 seconds</b> to read; play the complete track <b>twice</b>, with <b>10 seconds</b> between plays. Students answer while listening; there is no additional timed answer window in the online setup.", M, y, CW, 9.6, 13.2, gap=12)
    y = para(c, "<b>About these notes.</b> The answers reproduce the stored online listening key. The commentary explains the distinctions between the keyed options; it is not an audio transcript.", M, y, CW, 9.2, 12.5, color=MUTED, gap=19)
    for n, (item, note) in enumerate(zip(LS["items"], LS_NOTES), 1):
        y = key_entry(c, n, answer_text(item), note, y, gap=17)
    y = para(c, "<b>Printing and use.</b> Print the student paper on A4 at 100% / actual size. Duplex printing with long-edge binding puts the reading article and questions on facing pages. Keep this key separate from student copies. The 70-minute main-paper limit excludes Listening.", M, y-5, CW, 9.1, 12.5, color=MUTED)
    c.save()
    return path


if __name__ == "__main__":
    student = student_paper()
    teacher = teacher_key()
    from pypdf import PdfReader
    for path, expected in [(student, 8), (teacher, 9)]:
        pdf = PdfReader(path)
        assert len(pdf.pages) == expected, (path, len(pdf.pages))
        assert all(len(p.extract_text() or "") > 150 for p in pdf.pages)
        print(f"{path}: {len(pdf.pages)} A4 pages, {path.stat().st_size:,} bytes")
    log = ROOT / "tmp/pdfs/insight-progress/layout-log.json"
    log.parent.mkdir(parents=True, exist_ok=True)
    log.write_text(json.dumps(PAGE_LOG, indent=2))
