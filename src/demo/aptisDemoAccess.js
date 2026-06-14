export const APTIS_DEMO_GRAMMAR_QUESTION_LIMIT = 25;

export const APTIS_DEMO_GRAMMAR_ITEM_IDS = [
  "a1_art_01",
  "a1_qf_02",
  "a2_prep_02",
  "a2_future_04",
  "a2_adv_03",
  "a2_quant_11",
  "b1_cond_01",
  "B1_modal_02",
  "b1_passive_01",
  "b1_rep_01",
  "b2_verbpat_01",
  "pv_02",
  "b1_quants_01",
  "b1_rel_03",
  "b2_narr_03",
  "b2_link_15",
  "b2_prep_01",
  "b1_tag_09",
  "b2_wishes_01",
  "pv_03",
  "c1_invert_01",
  "c1_cleft_01",
  "c1_participles_01",
  "c1_subj_01",
  "c1_modals_01",
];

export const APTIS_DEMO_ACCESS = {
  grammar: {
    questionLimit: APTIS_DEMO_GRAMMAR_QUESTION_LIMIT,
    itemIds: APTIS_DEMO_GRAMMAR_ITEM_IDS,
  },
  reading: {
    part2TaskIds: ["cycling-lanes", "ebooks"],
    part4TaskIds: ["yawning"],
  },
  speaking: {
    part1QuestionIds: ["p1q001", "p1q002", "p1q003"],
    part2TaskIds: ["train-station"],
    part3TaskIds: ["sports"],
    part4TaskIds: ["weather-plans"],
  },
  writing: {
    part1QuestionIds: [
      "q_1000631738",
      "q_-1165863468",
      "q_-1763493799",
      "q_225244415",
      "q_988257069",
    ],
    part2TaskIds: ["sports-fee"],
    part3TaskIds: ["sports-fee"],
    part4TaskIds: ["sports-fee"],
  },
  vocabulary: {
    topicIds: ["transport", "education"],
    topicSetIds: {},
    synonymItemIds: [
      "syn-n-067",
      "syn-n-070",
      "syn-n-071",
      "syn-n-076",
      "syn-n-005",
      "syn-n-008",
      "syn-n-012",
      "syn-n-011",
    ],
  },
  listening: {
    part1TaskIds: ["message-time-1", "PA-shopping-1", "dialogue-plan-2"],
    part2TaskIds: ["learning-languages"],
  },
};
