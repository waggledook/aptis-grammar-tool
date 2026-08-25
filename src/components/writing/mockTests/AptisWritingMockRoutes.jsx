import React from "react";
import { Navigate, Outlet, Route, Routes, useNavigate, useParams } from "react-router-dom";
import Layout from "./components/Layout.jsx";
import { AnswersProvider } from "./context/AnswersContext.jsx";
import { MockContext } from "./context/MockContext.jsx";
import { TimerProvider } from "./context/TimerContext.jsx";
import { getWritingMock } from "./data/mocks.js";
import InstructionsPage from "./pages/InstructionsPage.jsx";
import OpeningPage from "./pages/OpeningPage.jsx";
import Part1 from "./pages/Part1.jsx";
import Part2 from "./pages/Part2.jsx";
import Part3 from "./pages/Part3.jsx";
import Part4 from "./pages/Part4.jsx";
import ReviewPage from "./pages/ReviewPage.jsx";
import SubmissionPage from "./pages/SubmissionPage.jsx";
import styles from "./AptisWritingMockRoutes.module.css";

function ExamShell({ user, onRequireSignIn }) {
  const { mockId } = useParams();
  const navigate = useNavigate();
  const mock = getWritingMock(mockId);

  if (mock.requiresAuth && !user) {
    return (
      <main className={styles.accessPage}>
        <section className={styles.accessCard}>
          <h1>Sign in to open {mock.menuTitle}</h1>
          <p>This mock uses your existing Aptis Trainer account and saves the completed paper under the same Firebase project.</p>
          <div className={styles.actions}>
            <button type="button" onClick={onRequireSignIn}>Sign in / Sign up</button>
            <button className={styles.secondary} type="button" onClick={() => navigate("/writing/mock-tests")}>Back to mock tests</button>
          </div>
        </section>
      </main>
    );
  }

  return (
    <MockContext.Provider value={mock}>
      <AnswersProvider key={mock.id} mockId={mock.id}>
        <TimerProvider mockId={mock.id}>
          <Layout user={user}>
            <Outlet />
          </Layout>
        </TimerProvider>
      </AnswersProvider>
    </MockContext.Provider>
  );
}

export default function AptisWritingMockRoutes({ user, onRequireSignIn }) {
  return (
    <Routes>
      <Route index element={<OpeningPage user={user} onRequireSignIn={onRequireSignIn} />} />
      <Route path="submitted/:id" element={<SubmissionPage user={user} />} />
      <Route path=":mockId" element={<ExamShell user={user} onRequireSignIn={onRequireSignIn} />}>
        <Route index element={<Navigate to="instructions" replace />} />
        <Route path="instructions" element={<InstructionsPage />} />
        <Route path="part/1" element={<Part1 />} />
        <Route path="part/2" element={<Part2 />} />
        <Route path="part/3" element={<Part3 />} />
        <Route path="part/4" element={<Part4 />} />
        <Route path="review" element={<ReviewPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/writing/mock-tests" replace />} />
    </Routes>
  );
}
