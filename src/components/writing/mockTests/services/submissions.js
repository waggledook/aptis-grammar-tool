import {
  fetchAptisWritingMockSubmission,
  saveAptisWritingMockSubmission
} from '../../../../firebase.js';

export async function saveSubmission(answers, options = {}) {
  return saveAptisWritingMockSubmission(answers, options);
}

export async function loadSubmission(id) {
  return fetchAptisWritingMockSubmission(id);
}
  
