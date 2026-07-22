import React, { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, CheckCircle2, ChevronDown, Clock3, RotateCcw } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import Seo from "../../components/common/Seo.jsx";
import { logOteTrainingCompleted, logOteTrainingStarted } from "../../firebase.js";
import { getSitePath } from "../../siteConfig.js";
import "./styles/ote.css";

const TIME_SECONDS = 8 * 60;

const noteTakingReviewers = {
  A: {
    name: "Dr Lena Ortiz",
    role: "Cognitive psychologist",
    text: [
      "Arguments about handwriting and typing are often presented as though one method must be cognitively superior in every situation. The evidence is less tidy. Some studies find that handwritten notes lead to better recall, but participants using laptops frequently attempt to record speech almost word for word, while those writing by hand are forced to select and reorganize ideas. We may therefore be comparing two styles of note-taking rather than two technologies. When researchers instruct both groups to summarize actively, the difference often narrows.",
      "This does not make the choice of medium irrelevant. Handwriting can support memory for diagrams, unfamiliar symbols and material whose spatial arrangement matters. Typed notes, meanwhile, are easier to search, edit and combine with other sources. I use both: a keyboard when gathering information quickly, and paper when I need to sketch relationships or work through an argument.",
      "What concerns me is the tendency to turn limited findings into universal classroom rules. A short laboratory task cannot tell us whether every student should use the same method throughout a degree programme. The more useful question is not whether pens defeat keyboards, but whether learners are transforming information, testing their understanding and returning to their notes afterwards. A beautifully handwritten page can be as mentally passive as a copied digital transcript. That distinction matters more than the surface on which the words appear.",
    ],
  },
  B: {
    name: "Professor Daniel Mercer",
    role: "Education-technology researcher",
    text: [
      "The current enthusiasm for restoring handwriting to classrooms is partly driven by a familiar kind of nostalgia. People remember notebooks without remembering how often those notebooks contained incomplete, disorganized or barely legible material. Digital note-taking certainly creates problems: notifications invite distraction, and the ease of copying can encourage accumulation without reflection. Yet neither problem is an unavoidable property of the device. They are design and teaching problems, and they can be addressed by disabling alerts, structuring activities and asking students to produce short summaries rather than continuous transcripts.",
      "Blanket laptop bans are especially difficult to justify. Some students type more accurately than they write, while others rely on digital tools because of physical, visual or language-related needs. A policy intended to improve attention may therefore make participation harder for precisely those learners who already face obstacles.",
      "Digital notes also allow groups to build shared records, comment on one another's interpretations and connect lecture material with sources immediately. That collaborative potential is often absent from comparisons based on individual memory tests. I am not suggesting that every screen improves learning, or that handwriting has no place. I am suggesting that education should stop treating the medium as a moral choice. We should judge practices by what they enable students to do, not by whether they resemble the classrooms adults remember from their own youth.",
    ],
  },
  C: {
    name: "Nadia Iqbal",
    role: "University lecturer",
    text: [
      "For several years I allowed students to use any note-taking method they preferred, assuming that adults could manage their own attention. Then I noticed that seminar discussions were becoming strangely flat. Many students had produced extremely detailed laptop notes, yet struggled to explain the argument they had just recorded. They had captured the lecture efficiently without deciding what mattered.",
      "I responded by introducing brief device-free intervals. After each section, students close their laptops and write, by hand, the three points they consider most important before comparing them with a partner.",
      "I do not claim that handwriting possesses some special intellectual power. The useful feature is partly its inconvenience. Because most people cannot write as quickly as they type, they must leave information out, and choosing what to omit can expose whether they have understood it. Students initially complained that the pauses interrupted the flow, but many later said those interruptions helped them notice gaps in their comprehension.",
      "I still permit laptops during most of the class, and digital notes remain invaluable when students search earlier material or prepare later assignments. Nor would I recommend the same routine in every subject. In my seminars, however, alternating between fast digital capture and slower handwritten selection has produced more thoughtful questions. The aim is not to preserve an old skill for sentimental reasons, but to create moments in which students cannot avoid making decisions about meaning.",
    ],
  },
};

const noteTakingQuestions = [
  { id: "nostalgia", prompt: "Who thinks nostalgia influences criticism of digital note-taking?", answer: "B", feedback: "Mercer links the enthusiasm for handwriting to idealised memories of older classrooms." },
  { id: "teaching-change", prompt: "Who changed their teaching after noticing students were recording information without understanding it?", answer: "C", feedback: "Iqbal changed her teaching after students produced detailed notes but could not explain the ideas they had recorded." },
  { id: "research-comparison", prompt: "Who warns that research may compare note-taking behaviours rather than the tools themselves?", answer: "A", feedback: "Ortiz argues that some research may be comparing verbatim transcription with selective summarising, not typing with handwriting." },
  { id: "device-ban", prompt: "Who argues that banning digital devices may disadvantage some learners?", answer: "B", feedback: "Mercer says blanket bans can make participation harder for learners with physical, visual, or language-related needs." },
  { id: "slower-handwriting", prompt: "Who deliberately uses the slower pace of handwriting as a teaching technique?", answer: "C", feedback: "Iqbal uses short handwritten intervals because choosing what to leave out can reveal whether students understand." },
  { id: "personal-tools", prompt: "Who personally chooses different note-taking tools for different tasks?", answer: "A", feedback: "Ortiz uses a keyboard for gathering information quickly and paper for sketching relationships or arguments." },
  { id: "collaboration", prompt: "Who believes digital tools can improve learning through collaboration?", answer: "B", feedback: "Mercer highlights shared records, peer comments, and connections to other sources." },
];

const recruitmentReviewers = {
  A: { name: "Dr Marcus Chen", role: "Organisational psychologist", text: ["Personality tests are neither the objective window into a candidate's character that some employers imagine nor the meaningless entertainment their critics describe. Used carefully, they can add information. Used carelessly, they give weak decisions an impressive scientific appearance.", "One obvious difficulty is that most recruitment questionnaires rely on self-reporting. Candidates are rarely unaware of what an employer is looking for, and may answer as the imaginary ideal employee rather than as themselves. More sophisticated tests can detect unusually inconsistent responses, but no questionnaire can guarantee complete honesty. Nor should employers assume that a particular score predicts how someone will behave in every situation.", "The most serious mistake occurs earlier, when an organisation buys a fashionable assessment and only afterwards asks what it might reveal. Testing should begin with a proper analysis of the job. If a role genuinely requires sustained attention, comfort with uncertainty or frequent social interaction, it may be reasonable to assess related tendencies. A general preference for outgoing personalities, however, is not the same thing as identifying a genuine occupational requirement.", "Even then, test results should be combined with structured interviews, relevant work samples and evidence of previous performance. They should generate questions rather than automatic decisions. Personality can influence behaviour, but so can experience, motivation, management and workplace culture. A score describes a tendency under certain conditions; it does not establish what a person is permanently capable of becoming."] },
  B: { name: "Elena Varga", role: "Human-resources director", text: ["Before introducing personality questionnaires, our recruitment process depended heavily on interviews. This seemed personal and flexible, but it consistently favoured candidates who were confident, quick to establish rapport and familiar with the unwritten conventions of professional interviews. Those qualities were not always relevant to the vacancies concerned. Excellent analysts and technical staff sometimes appeared hesitant in conversation, while polished interviewees occasionally proved less effective once appointed.", "We now begin with a practical task related to the position. Only candidates who meet the required standard proceed to the next stage, where a short personality questionnaire is used to help structure the final interview. Nobody is rejected simply because of a particular profile. Instead, we ask candidates to comment on the results and provide examples that support or challenge them.", "This has sometimes allowed quieter applicants to discuss strengths that were not immediately visible in an interview. A candidate who appeared reserved, for example, demonstrated through specific experiences that she communicated extremely effectively in small project teams.", "The approach still requires care. Candidates must understand how their information will be used, alternative arrangements must be available for anyone who cannot access the standard test, and managers need training to interpret the results. I would not claim that the questionnaire eliminates bias. It does, however, prevent one brief social performance from carrying quite so much weight. Used as one part of a transparent process, it can broaden rather than narrow the evidence on which a decision is based."] },
  C: { name: "Professor Imani Brooks", role: "Sociologist of work", text: ["Personality testing appeals to employers because it converts an uncertain human judgement into a tidy profile. Commercial providers have an obvious interest in encouraging the belief that complex individuals can be placed into stable categories, preferably categories that require a licensed questionnaire and a trained consultant to interpret. The language of the reports may be cautious, but the attractive diagrams and precise-looking scores often convey far more certainty than the evidence deserves.", "There is also a contradiction in the way organisations use these tests. Employers regularly say they want greater diversity, yet some define an ideal personality for their organisation and then search for candidates who resemble it. The result may be a workforce containing people from different backgrounds who nevertheless approach problems, communication and risk in remarkably similar ways. Qualities praised as a good cultural fit can easily become a polite term for familiarity.", "Tests may also reflect assumptions about how confidence, cooperation or leadership are expressed in a particular cultural setting. Treating the resulting score as neutral does not remove those assumptions.", "I am less opposed to personality questionnaires once selection is over. Used voluntarily in an established team, they can begin useful conversations about working preferences, conflict and communication. The value lies in people discussing whether a description fits them, not in accepting it as a diagnosis. As a tool for reflection, a questionnaire may be productive. As a gate through which applicants must pass, it encourages employers to mistake classification for understanding."] },
};

const recruitmentQuestions = [
  { id: "interview-benefit", prompt: "Who believes personality tests may benefit applicants who perform poorly in conventional interviews?", answer: "B", feedback: "Varga argues that traditional interviews can disadvantage quieter candidates whose relevant strengths are not immediately visible." },
  { id: "adapted-answers", prompt: "Who warns that candidates may adapt their answers to appear suitable for a position?", answer: "A", feedback: "Chen notes that applicants may respond as the employer's imagined ideal rather than answer entirely honestly." },
  { id: "providers-benefit", prompt: "Who suggests test providers benefit from presenting uncertain results as authoritative?", answer: "C", feedback: "Brooks says commercial providers profit from authoritative-looking categories and precise scores." },
  { id: "earlier-stage", prompt: "Who uses personality results only after candidates have passed an earlier selection stage?", answer: "B", feedback: "Varga's candidates complete a practical task first; only those who meet the standard proceed to the questionnaire." },
  { id: "job-connected", prompt: "Who says tests should measure characteristics genuinely connected to the work involved?", answer: "A", feedback: "Chen says assessed characteristics must arise from a proper analysis of the role and its requirements." },
  { id: "similar-employees", prompt: "Who thinks personality testing may encourage organisations to recruit overly similar employees?", answer: "C", feedback: "Brooks warns that defining an ideal personality can lead to employees who think and behave in similar ways." },
  { id: "after-recruitment", prompt: "Who sees greater value in using test results after recruitment than during it?", answer: "C", feedback: "Brooks sees value in voluntary reflection within an established team, not as a recruitment gate." },
];

const rewildingReviewers = {
  A: { name: "Dr Sofia Lind", role: "Urban ecologist", text: ["Urban rewilding is sometimes described as simply allowing grass to grow and nature to return. In reality, successful projects require more thought than traditional maintenance. A meadow that is never cut may eventually lose the range of plants it was intended to support, while an area planted with visually attractive wildflowers may provide little value if the species are unsuitable for local insects.", "Appearance creates another difficulty. Municipal parks have traditionally communicated care through short grass, neat borders and the rapid removal of dead material. Ecologically valuable spaces may display the opposite qualities. Seed heads left standing through winter provide food and shelter; fallen wood supports fungi and insects; uneven growth creates different habitats. What looks neglected according to one set of expectations may demonstrate that an ecosystem is functioning.", "Nevertheless, placing a miniature meadow in the middle of an otherwise hostile landscape achieves relatively little. Wildlife needs connected routes between feeding, nesting and breeding areas. Cities should therefore think in terms of networks involving parks, railway edges, gardens, street trees and waterways rather than isolated demonstration projects.", "That does not mean excluding people. Paths, seating and clear information can help residents understand and enjoy these areas. Nor should ecological claims be accepted without evidence: changes in species and habitat quality should be monitored. Rewilding is most convincing when it is treated neither as decoration nor as an excuse to reduce maintenance budgets, but as long-term urban infrastructure requiring expertise, continuity and measurable goals."] },
  B: { name: "Amira Patel", role: "Inclusive-design consultant", text: ["The environmental case for introducing more varied planting into cities is strong. Yet discussions about rewilding sometimes assume that anything more natural is automatically more inclusive. That is not always the experience of the people using the space.", "Narrow routes over soft or uneven ground may be difficult for wheelchair users or people with limited mobility. Vegetation that grows across the edge of a path can make it hard to follow with a cane, while dense planting near entrances may reduce visibility and create understandable anxiety. Some visitors also need frequent seating, predictable surfaces or clear boundaries in order to feel confident moving through a park.", "These concerns are occasionally dismissed as hostility towards nature. That is unhelpful. They are design problems, and many have practical solutions: firm paths through less-managed areas, regular resting places, clear sightlines near key routes and deliberate contrasts between path surfaces and surrounding vegetation. It is possible to retain complex habitat while making movement legible and secure.", "The difficulty is that accessibility specialists and disabled residents are often invited to comment only after the main ecological design has been approved. At that point, suggested changes are treated as expensive compromises rather than essential elements of the project. Consultation should begin while purposes and layouts are still being decided.", "Inclusive rewilding does not mean making every part of every space accessible in exactly the same way. It means ensuring that environmental improvement does not quietly remove opportunities for some citizens to use public land."] },
  C: { name: "Leon Mensah", role: "Community organiser", text: ["I initially opposed a proposal to convert part of our neighbourhood park into meadow. The planners described the existing lawn as ecologically empty, but local residents used it for informal football, family gatherings, exercise classes and community celebrations. A place can contain little biodiversity and still be socially full. Treating attachment to a familiar landscape as ignorance is a reliable way to create resistance.", "My view changed after visiting a project in another district. Residents there had rejected the original plan to transform nearly the entire park. Instead, they retained the central playing area, introduced meadow around its edges and added a shallow wetland in a section that had previously flooded after heavy rain. The result supported more wildlife without removing the activities that had made the park valuable to the community.", "That example did not convince me that every compromise will work. It showed me that rewilding need not be an all-or-nothing decision. Too often, consultation presents residents with a completed ecological vision and asks them to approve it. By then, existing uses have been classified as obstacles rather than information.", "Urban land is limited, and environmental improvement is urgent. But planners should first observe how a place is already used, including activities that leave no official booking or economic record. The question should not be whether nature or people deserve the space. It should be how ecological recovery can be added without erasing the relationships that already exist there."] },
};

const rewildingQuestions = [
  { id: "untidy-success", prompt: "Who argues that an untidy appearance may indicate environmental success?", answer: "A", feedback: "Lind explains that seed heads, dead wood, and uneven growth can look neglected while providing valuable habitat." },
  { id: "accessibility-advice", prompt: "Who says specialist accessibility advice should be included before plans are finalised?", answer: "B", feedback: "Patel argues that accessibility specialists and disabled users should be involved while purposes and layouts are still being decided." },
  { id: "social-activities", prompt: "Who warns that rewilding may remove places used for informal social activities?", answer: "C", feedback: "Mensah points out that lawns can be used for sport, gatherings, exercise, and community events." },
  { id: "isolated-projects", prompt: "Who believes isolated wildlife projects have limited ecological value?", answer: "A", feedback: "Lind says small projects achieve little unless they connect with wider habitats." },
  { id: "compromise", prompt: "Who became more supportive after seeing a compromise implemented elsewhere?", answer: "C", feedback: "Mensah's opposition softened after seeing a project preserve a playing area while adding meadow and wetland habitat." },
  { id: "safety", prompt: "Who believes some safety concerns can be addressed without abandoning rewilding?", answer: "B", feedback: "Patel accepts concerns about visibility and movement but argues that careful design can solve many of them." },
  { id: "conventional-spaces", prompt: "Who thinks planners may misunderstand why residents value conventional green spaces?", answer: "C", feedback: "Mensah criticises planners for treating attachment to a familiar park as ignorance instead of genuine social value." },
];

const openPlanOfficeReviewers = {
  A: {
    name: "Lena Morris",
    role: "Organisational psychologist",
    text: [
      "Supporters of open-plan offices often assume that removing walls will increase collaboration. Visibility certainly creates more opportunities for brief contact, but contact and collaboration are not the same thing. In several organisations I have studied, employees in open rooms actually relied more heavily on email and messaging because they did not want every conversation to become public. Headphones then appeared as a defence against interruption, making colleagues physically close but socially unavailable.",
      "Noise is part of the problem, though volume alone does not explain people’s reactions. A conversation can be more distracting than a louder, steady sound because it is unpredictable and carries meaning. More importantly, irritation rises when employees feel they have no control over whether they hear it or where they can go to escape it. This is why offering a range of settings matters more than declaring one layout universally superior. Employees should be able to move between quiet, social and confidential spaces without having to justify each move as a special request.",
      "I am also cautious about judging an office by the percentage of desks occupied at any moment. A nearly full room may look efficient on a spreadsheet while staff struggle to concentrate, hold confidential conversations or find space for joint work. Equally, a quiet room that appears “underused” may prevent errors during the few hours when intense concentration is essential. The sensible question is not how continuously every square metre is occupied, but whether people can find an appropriate place for the task they are doing.",
    ],
  },
  B: {
    name: "Rafael Chen",
    role: "Workplace architect",
    text: [
      "Open-plan offices are frequently criticised as though they were a single design. In reality, the label covers everything from carefully planned workplaces with acoustic treatment and enclosed rooms to large halls in which rows of desks have simply replaced walls. Many failures blamed on openness are therefore failures of implementation. Organisations sometimes copy photographs of fashionable offices without asking what work their employees actually perform.",
      "Early in my career, I assumed that a central café would naturally become the social heart of any workplace. A post-occupancy study changed my mind. Staff used the café at lunch, but for short, useful exchanges they preferred a wide corridor beside the windows, where they could pause without feeling committed to a longer conversation. We redesigned later projects to include several modest stopping places rather than one impressive communal feature. Watching how people occupied the building proved more informative than asking whether they liked its appearance. It also reminded us that successful spaces are sometimes ordinary ones whose value becomes visible only through repeated use.",
      "Good design begins with tasks: concentrated work, confidential discussion, informal contact, formal meetings and recovery from constant interaction. It should also avoid treating private rooms as rewards for seniority. When every enclosed office is reserved for managers, employees who genuinely need quiet have nowhere to go. An open plan can work, but only when it is supported by alternatives and when those alternatives are distributed according to need rather than status.",
    ],
  },
  C: {
    name: "Amara Okafor",
    role: "Disability and inclusion consultant",
    text: [
      "The language of flexibility sounds positive, but it can hide unequal consequences. Hot-desking may allow some employees to choose a different seat each day, while requiring others to repeatedly search for a place that meets basic physical or sensory needs. A worker who uses adapted equipment, needs a predictable route through the room or finds visual and auditory stimulation exhausting may experience “choice” as the loss of a reliable working environment.",
      "For that reason, an assigned desk should not automatically be viewed as a privilege or resistance to change. For some people, it is a reasonable adjustment that makes participation possible. Nor should working from home become the routine answer when the office itself is inaccessible. Remote work can be valuable, but telling an employee to stay away transfers the cost of poor design to the individual and may exclude them from informal information and professional relationships. Inclusion should not depend on becoming less physically present than colleagues.",
      "Consultation is often offered only after a new layout has produced complaints. By then, budgets are spent and requests for change are framed as personal preferences that threaten a completed plan. Employees with different needs should be involved before furniture is ordered and policies are fixed. This does not mean every person can receive an ideal private office. It means that claims about collaboration, efficiency and flexibility should be tested against the people who will actually have to work in the space.",
    ],
  },
};

const openPlanOfficeQuestions = [
  { id: "contact-collaboration", prompt: "Who argues that increased opportunities for informal contact do not necessarily produce genuine collaboration?", answer: "A", feedback: "Morris distinguishes physical visibility from genuine collaboration and notes that open offices may push employees towards messaging and headphones." },
  { id: "late-consultation", prompt: "Who criticises involving employees only after changes have become difficult to reverse?", answer: "C", feedback: "Okafor says consultation often begins only after the layout is complete and the budget has been spent, when changes are treated as threats to an established plan." },
  { id: "social-space", prompt: "Who says their view of an effective social space was altered by observing how staff actually behaved?", answer: "B", feedback: "Chen expected the café to be the main social area, but observation showed that staff preferred brief conversations in a corridor, influencing his later designs." },
  { id: "noise-control", prompt: "Who suggests that the effect of office noise depends partly on workers’ ability to predict or escape it?", answer: "A", feedback: "Morris argues that meaningful, unpredictable noise is especially distracting and that reactions depend on whether workers can move somewhere quieter." },
  { id: "choice-stability", prompt: "Who warns that a policy presented as offering choice may remove stability from some employees?", answer: "C", feedback: "Okafor argues that hot-desking may be described as choice while depriving some employees of a predictable environment or adapted equipment." },
  { id: "poor-execution", prompt: "Who believes that open-plan offices are often blamed for problems caused by poor execution?", answer: "B", feedback: "Chen says the label covers very different designs and that problems attributed to openness often result from poor implementation." },
  { id: "desk-use", prompt: "Who questions whether a high rate of desk use is a reliable sign of an effective workplace?", answer: "A", feedback: "Morris rejects desk-occupancy percentages as sufficient: a full room may still prevent concentration, while an apparently underused quiet room may serve an essential function." },
];

const practiceSets = {
  "c1-full-mock-1": { id: "c1-full-mock-1", title: "C1 Full Mock Task", topic: "open-plan offices", heading: "Open-plan offices", intro: "Open-plan offices are intended to encourage communication and make better use of space. Three specialists discuss whether they achieve these aims.", reviewers: openPlanOfficeReviewers, questions: openPlanOfficeQuestions },
  "c1-pilot-1": { id: "c1-pilot-1", title: "Handwriting or Digital Notes?", topic: "handwriting and digital note-taking", heading: "Should students take notes by hand?", intro: "Three education specialists consider whether handwriting is better for learning than digital note-taking.", reviewers: noteTakingReviewers, questions: noteTakingQuestions },
  "c1-pilot-2": { id: "c1-pilot-2", title: "Personality Tests at Work", topic: "personality tests in recruitment", heading: "Should employers use personality tests?", intro: "Three workplace specialists discuss the growing use of personality assessments in recruitment.", reviewers: recruitmentReviewers, questions: recruitmentQuestions },
  "c1-pilot-3": { id: "c1-pilot-3", title: "Making Cities Wilder", topic: "urban rewilding", heading: "Should cities make more room for nature?", intro: "Three specialists consider the advantages and possible drawbacks of urban rewilding.", reviewers: rewildingReviewers, questions: rewildingQuestions },
};

const evidenceBySet = {
  "c1-pilot-1": {
    nostalgia: ["partly driven by a familiar kind of nostalgia", "People remember notebooks without remembering how often those notebooks contained incomplete, disorganized or barely legible material"],
    "teaching-change": ["Many students had produced extremely detailed laptop notes, yet struggled to explain the argument they had just recorded", "I responded by introducing brief device-free intervals"],
    "research-comparison": ["We may therefore be comparing two styles of note-taking rather than two technologies", "those writing by hand are forced to select and reorganize ideas"],
    "device-ban": ["Some students type more accurately than they write", "make participation harder for precisely those learners who already face obstacles"],
    "slower-handwriting": ["Because most people cannot write as quickly as they type", "choosing what to omit can expose whether they have understood it"],
    "personal-tools": ["I use both: a keyboard when gathering information quickly, and paper", "when I need to sketch relationships or work through an argument"],
    collaboration: ["build shared records", "comment on one another's interpretations and connect lecture material with sources immediately"],
  },
  "c1-pilot-2": {
    "interview-benefit": ["favoured candidates who were confident, quick to establish rapport", "allowed quieter applicants to discuss strengths that were not immediately visible in an interview"],
    "adapted-answers": ["may answer as the imaginary ideal employee rather than as themselves", "no questionnaire can guarantee complete honesty"],
    "providers-benefit": ["Commercial providers have an obvious interest", "precise-looking scores often convey far more certainty than the evidence deserves"],
    "earlier-stage": ["We now begin with a practical task related to the position", "Only candidates who meet the required standard proceed to the next stage"],
    "job-connected": ["Testing should begin with a proper analysis of the job", "identifying a genuine occupational requirement"],
    "similar-employees": ["define an ideal personality for their organisation", "search for candidates who resemble it"],
    "after-recruitment": ["once selection is over", "Used voluntarily in an established team"],
  },
  "c1-pilot-3": {
    "untidy-success": ["Seed heads left standing through winter provide food and shelter", "What looks neglected according to one set of expectations may demonstrate that an ecosystem is functioning"],
    "accessibility-advice": ["often invited to comment only after the main ecological design has been approved", "Consultation should begin while purposes and layouts are still being decided"],
    "social-activities": ["informal football, family gatherings, exercise classes and community celebrations", "A place can contain little biodiversity and still be socially full"],
    "isolated-projects": ["placing a miniature meadow in the middle of an otherwise hostile landscape achieves relatively little", "Wildlife needs connected routes between feeding, nesting and breeding areas"],
    compromise: ["retained the central playing area", "introduced meadow around its edges and added a shallow wetland"],
    safety: ["dense planting near entrances may reduce visibility", "firm paths through less-managed areas"],
    "conventional-spaces": ["local residents used it for informal football, family gatherings, exercise classes and community celebrations", "Treating attachment to a familiar landscape as ignorance"],
  },
};

function formatTime(seconds) {
  const safe = Math.max(0, Math.ceil(seconds));
  return `${String(Math.floor(safe / 60)).padStart(2, "0")}:${String(safe % 60).padStart(2, "0")}`;
}

export default function OteAdvancedReadingPart2Practice({ user, nativeRoutes = false }) {
  const navigate = useNavigate();
  const { setId = "c1-pilot-1" } = useParams();
  const practiceSet = practiceSets[setId] || practiceSets["c1-pilot-1"];
  const questions = practiceSet.questions;
  const reviewers = practiceSet.reviewers;
  const menuPath = getSitePath(nativeRoutes ? "/reading/advanced/part-2-matching" : "/ote/reading/advanced/part-2-matching");
  const [phase, setPhase] = useState("ready");
  const [answers, setAnswers] = useState({});
  const [expandedId, setExpandedId] = useState(questions[0].id);
  const [secondsLeft, setSecondsLeft] = useState(TIME_SECONDS);
  const completionLogged = useRef(false);
  const completionPromise = useRef(null);
  const answeredCount = Object.keys(answers).length;
  const score = useMemo(() => questions.reduce((total, item) => total + (answers[item.id] === item.answer ? 1 : 0), 0), [answers]);

  useEffect(() => {
    if (user?.oteVersion && user.oteVersion !== "advanced") return undefined;
    if (phase !== "active" || answeredCount === questions.length) return undefined;
    if (secondsLeft <= 0) {
      checkAnswers("time");
      return undefined;
    }
    const timer = window.setTimeout(() => setSecondsLeft((current) => current - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [answeredCount, phase, secondsLeft, user?.oteVersion]);

  function startPractice() {
    completionLogged.current = false;
    completionPromise.current = null;
    setAnswers({});
    setExpandedId(questions[0].id);
    setSecondsLeft(TIME_SECONDS);
    setPhase("active");
    logOteTrainingStarted({ section: "reading", part: "part-2", mode: "timed_practice", taskId: `advanced-reading-part-2-${practiceSet.id}`, taskTitle: `Advanced Reading Part 2 ${practiceSet.title}`, variant: "advanced" });
  }

  function chooseAnswer(questionId, choice) {
    if (phase !== "active") return;
    setAnswers((current) => ({ ...current, [questionId]: choice }));
  }

  function recordCompletion(reason) {
    if (completionLogged.current) return Promise.resolve(true);
    if (completionPromise.current) return completionPromise.current;
    completionPromise.current = logOteTrainingCompleted({ section: "reading", part: "part-2", mode: "timed_practice", taskId: `advanced-reading-part-2-${practiceSet.id}`, taskTitle: `Advanced Reading Part 2 ${practiceSet.title}`, variant: "advanced", score, total: questions.length, reason: typeof reason === "string" ? reason : "checked" })
      .then(() => { completionLogged.current = true; return true; })
      .catch((error) => { console.warn("[OTE Reading Part 2] completion save failed", error); return false; })
      .finally(() => { completionPromise.current = null; });
    return completionPromise.current;
  }

  function checkAnswers(reason = "checked") {
    setPhase("review");
    recordCompletion(reason);
  }

  async function finishPractice(reason = "manual") {
    setPhase("complete");
    const saved = await recordCompletion(reason);
    if (!saved) void recordCompletion(reason);
  }

  if (user?.oteVersion && user.oteVersion !== "advanced") return <Unavailable onBack={() => navigate(getSitePath(nativeRoutes ? "/reading" : "/ote/reading"))} />;

  return (
    <main className="ote-training-page ote-reading-practice-page ote-reading-matching-page">
      <Seo title="OTE Advanced Reading Part 2 Timed Practice | Seif English" description="Timed Advanced OTE Reading Part 2 matching practice." />
      <button className="ote-training-back" type="button" onClick={() => navigate(menuPath)}><ArrowLeft size={18} aria-hidden="true" /> Back to Part 2</button>
      <header className="ote-training-hero"><p className="ote-kicker">Advanced Reading Part 2</p><h1>{practiceSet.title}</h1><p>Match seven statements to the correct specialist response about {practiceSet.topic}.</p></header>
      {phase === "active" ? <div className="ote-writing-floating-timer" aria-live="polite"><Clock3 size={20} aria-hidden="true" /><strong>{formatTime(secondsLeft)}</strong><span>Matching</span></div> : null}

      <section className="ote-practice-runner">
        <div className="ote-practice-progress"><div><span>{phase === "complete" ? "Complete" : phase === "review" ? "Answers checked" : `${answeredCount} of ${questions.length} matched`}</span><strong>{phase === "complete" || phase === "review" ? `${score} / ${questions.length} correct` : "8 minutes for the full task"}</strong></div><div className="ote-practice-progress-bar" aria-hidden="true"><span style={{ width: `${phase === "complete" || phase === "review" ? 100 : (answeredCount / questions.length) * 100}%` }} /></div></div>
        {phase === "ready" ? <ReadyCard user={user} onStart={startPractice} /> : phase === "active" || phase === "review" ? (
          <article className="ote-practice-task-card ote-reading-matching-task">
            <div className="ote-recorder-top"><div><p className="ote-kicker">Matching task</p><h2>Which specialist matches each statement?</h2></div><div className="ote-recorder-timer is-recording" aria-hidden="true"><Clock3 size={22} /><strong>{formatTime(secondsLeft)}</strong><span>Remaining</span></div></div>
            <div className="ote-reading-matching-layout">
              <div className="ote-reading-question-column">
              <div className="ote-reading-match-list">
                {questions.map((item, index) => {
                  const expanded = expandedId === item.id;
                  const answer = answers[item.id];
                  const isCorrect = answer === item.answer;
                  const reviewed = phase === "review";
                  return <article className={`ote-reading-match-item ${expanded ? "is-open" : ""} ${reviewed ? (isCorrect ? "is-correct" : "is-wrong") : ""}`} key={item.id}>
                    <button type="button" className="ote-reading-match-toggle" onClick={() => setExpandedId(expanded ? "" : item.id)} aria-expanded={expanded}><span>{index + 1}. {item.prompt}</span><ChevronDown size={22} aria-hidden="true" /></button>
                    {expanded ? <div className="ote-reading-match-options">{["A", "B", "C"].map((choice) => <button key={choice} type="button" className={`${answer === choice ? "is-selected" : ""} ${reviewed && choice === item.answer ? "is-answer" : ""} ${reviewed && answer === choice && !isCorrect ? "is-incorrect" : ""}`} disabled={reviewed} onClick={() => chooseAnswer(item.id, choice)}>{choice}. {reviewers[choice].name}</button>)}{reviewed ? <div className={`ote-reading-item-feedback ${isCorrect ? "is-correct" : "is-wrong"}`}><strong>{isCorrect ? "Correct." : "Not quite."}</strong><p>{item.feedback}</p></div> : null}</div> : null}
                  </article>;
                })}
              </div>
              <div className="ote-recorder-actions">{phase === "review" ? <button type="button" onClick={() => finishPractice("manual")}>View final report</button> : <button type="button" disabled={answeredCount !== questions.length} onClick={() => checkAnswers("checked")}>Check answers</button>}</div>
              </div>
              <ReviewArticle practiceSet={practiceSet} evidence={phase === "review" ? evidenceBySet[practiceSet.id]?.[expandedId] : ""} />
            </div>
          </article>
        ) : <CompleteCard score={score} answers={answers} questions={questions} reviewers={reviewers} setTitle={practiceSet.title} onRetry={startPractice} onBack={() => navigate(menuPath)} />}
      </section>
    </main>
  );
}

function ReadyCard({ user, onStart }) {
  return <article className="ote-practice-task-card ote-reading-ready-card"><div className="ote-recorder-top"><div><p className="ote-kicker">Ready to start</p><h2>Timed matching set</h2></div><div className="ote-recorder-timer is-ready"><Clock3 size={22} aria-hidden="true" /><strong>08:00</strong><span>Full task</span></div></div><div className="ote-training-rule-grid"><article><h3>Seven statements</h3><p>Match each statement with one of the three specialists.</p></article><article><h3>One full timer</h3><p>You have eight minutes to complete all seven matches.</p></article><article><h3>Review after checking</h3><p>Check all answers together, then inspect the highlighted source evidence.</p></article></div>{!user ? <p className="ote-warning">Sign in to save this completed practice set to your progress.</p> : null}<div className="ote-recorder-actions"><button type="button" onClick={onStart}><Clock3 size={18} aria-hidden="true" /> Start timed practice</button></div></article>;
}

function ReviewArticle({ practiceSet, evidence }) {
  return <article className="ote-reading-matching-source"><header><p className="ote-kicker">Specialist review</p><h3>{practiceSet.heading}</h3><strong>{practiceSet.intro}</strong></header>{Object.entries(practiceSet.reviewers).map(([id, reviewer]) => <section key={id}><div><span>{id}</span><h4>{reviewer.name}</h4><p>{reviewer.role}</p></div>{reviewer.text.map((paragraph) => <p key={paragraph}><HighlightedText text={paragraph} phrase={evidence} /></p>)}</section>)}</article>;
}

function HighlightedText({ text, phrase }) {
  const phrases = (Array.isArray(phrase) ? phrase : [phrase]).filter((item) => item && text.includes(item));
  if (!phrases.length) return text;
  const pattern = new RegExp(`(${phrases.sort((a, b) => b.length - a.length).map((item) => item.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`, "g");
  return text.split(pattern).map((part, index) => phrases.includes(part) ? <mark className="ote-reading-evidence" key={`${part}-${index}`}>{part}</mark> : part);
}

function CompleteCard({ score, answers, questions, reviewers, setTitle, onRetry, onBack }) {
  return <section className="ote-practice-complete ote-reading-native-complete"><CheckCircle2 size={38} aria-hidden="true" /><div><p className="ote-kicker">{setTitle} complete</p><h2>{score} / {questions.length}</h2><p>{score === questions.length ? "Excellent work. Every match was correct." : "Review the matches and rationales below."}</p><div className="ote-reading-review-list">{questions.map((item, index) => { const correct = answers[item.id] === item.answer; return <article className={correct ? "is-correct" : "is-wrong"} key={item.id}><div><strong>{index + 1}. {item.prompt}</strong><span>{correct ? "Correct" : "Review"}</span></div><p><b>Answer:</b> {item.answer}. {reviewers[item.answer].name}</p><p>{item.feedback}</p></article>; })}</div><div className="ote-complete-actions"><button type="button" onClick={onBack}>Back to Part 2</button><button type="button" onClick={onRetry}><RotateCcw size={18} aria-hidden="true" /> Try again</button></div></div></section>;
}

function Unavailable({ onBack }) {
  return <main className="ote-training-page"><button className="ote-training-back" type="button" onClick={onBack}><ArrowLeft size={18} aria-hidden="true" /> Back to reading</button><header className="ote-training-hero"><p className="ote-kicker">Advanced Reading Part 2</p><h1>Practice not available</h1><p>This timed set is available in the Advanced OTE workspace.</p></header></main>;
}

export { practiceSets as advancedReadingPart2PracticeSets };
