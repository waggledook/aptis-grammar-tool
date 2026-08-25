export const WRITING_MOCK_ROOT = "/writing/mock-tests";

export function getWritingMockPath(mockId, suffix = "") {
  const base = `${WRITING_MOCK_ROOT}/${mockId}`;
  return suffix ? `${base}/${String(suffix).replace(/^\/+/, "")}` : base;
}

export function getWritingMockSubmissionPath(submissionId) {
  return `${WRITING_MOCK_ROOT}/submitted/${submissionId}`;
}
