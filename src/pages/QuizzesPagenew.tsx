import { useMemo, useState } from "react";

/* ============================================================
   TYPES
   ============================================================ */
type QPQuestion = {
  qno: string;
  text: string;
  marks: string;
  time?: string;
  hint?: string;
};

type QPSection = {
  key: string;
  name: string;
  bloom_level?: string;
  marks: string | number;
  bonus?: boolean;
  questions: QPQuestion[];
};

type QPStudentInfo = {
  name: string;
  student_id: string;
  class: string;
  section: string;
  date: string;
};

type QPState = {
  title: string;
  student_info: QPStudentInfo;
  total_marks: string | number;
  time: string;
  personalization: string;
  general_instructions: string[];
  sections: QPSection[];
};

/* ============================================================
   DEFAULT SAMPLE DATA
   ============================================================ */
const defaultPaper: QPState = {
  title: "",
  student_info: { name: "Arjun Patel", student_id: "STU-2345", class: "6", section: "", date: "" },
  total_marks: 50,
  time: "2 Hours",
  personalization:
    "This paper is tailored for you, Arjun! Your strengths are in Recall (85%) and Interpret & Explain (80%). This paper challenges you in the areas where you can grow — Evaluation (Judge & Justify), Deep Analysis, and Innovation.",
  general_instructions: [
    "All questions are COMPULSORY. Attempt all sections in order.",
    "Write your answers neatly and clearly. Avoid overwriting.",
    "Read each question carefully before writing your answer.",
    "Marks for each question are indicated in brackets [  ].",
    "Draw diagrams / examples wherever it helps explain your answer.",
    "Show your reasoning step-by-step, especially in analysis and evaluation questions.",
  ],
  sections: [
    {
      key: "A",
      name: "Remember & Recall",
      bloom_level: "Level 1 — Remember",
      marks: 10,
      questions: [
        { qno: "Q1", text: "Name any FIVE food items that come from plants and FIVE food items that come from animals. Write them in two separate lists.", marks: "2", time: "4" },
        { qno: "Q2", text: "Define the terms 'herbivore', 'carnivore', and 'omnivore'. Give one example of each from the animals you know.", marks: "2", time: "4" },
        { qno: "Q3", text: "What are the two main sources of food for all living beings? Name at least three nutrients that food provides to our body.", marks: "2", time: "4" },
        { qno: "Q4", text: "List any four parts of a plant that are used as food by humans. Give one food example for each part you name.", marks: "2", time: "4" },
        { qno: "Q5", text: "What is meant by 'sprouting'? Name two food items that are commonly eaten in sprouted form.", marks: "2", time: "4" },
      ],
    },
    {
      key: "B",
      name: "Understand & Explain",
      bloom_level: "Level 2 — Understand",
      marks: 15,
      questions: [
        { qno: "Q6", text: "Explain the difference between a food 'ingredient' and a 'food item'. Using a dish like khichdi or dal, show how ingredients combine to make a complete meal.", marks: "3", time: "6" },
        { qno: "Q7", text: "Why do we say that plants are the primary source of food for almost all living beings on Earth? Explain using the concept of the food chain.", marks: "3", time: "6" },
        { qno: "Q8", text: "Compare the eating habits of a cow and a lion. Based on this, explain what type of animals they are and what that means about their food sources.", marks: "3", time: "6" },
        { qno: "Q9", text: "Explain how honey is produced. What is the role of bees in this process? Why is honey considered a food item of animal origin?", marks: "3", time: "6" },
        { qno: "Q10", text: "What do you understand by 'edible' and 'non-edible' parts of a plant? Using the example of a mango tree or a wheat plant, identify which parts are edible and which are not.", marks: "3", time: "6" },
      ],
    },
    {
      key: "C",
      name: "Apply & Solve",
      bloom_level: "Level 3 — Apply",
      marks: 12,
      questions: [
        { qno: "Q11", text: "You have been given the following list of food items: milk, carrot, chicken, coconut oil, spinach, egg, wheat flour, honey, mushroom, curd. Classify each item under 'Plant Origin', 'Animal Origin', or 'Both / Uncertain'. Explain your reasoning for at least THREE of them.", marks: "4", time: "8" },
        { qno: "Q12", text: "A student made the following food chart for a day: Breakfast — bread and milk; Lunch — rice, dal, and salad; Snack — fruit juice; Dinner — chicken curry with roti. For each meal, identify at least one ingredient from plant source and one from animal source.", marks: "4", time: "8" },
        { qno: "Q13", text: "Seeds of some plants are eaten as food (like wheat, rice, mustard), while seeds of other plants are not eaten (like mango seed). Using what you know about plant parts and food, explain the difference and give TWO examples from each category.", marks: "4", time: "8" },
      ],
    },
    {
      key: "D",
      name: "Analyse & Examine",
      bloom_level: "Level 4 — Analyse",
      marks: 8,
      questions: [
        { qno: "Q14", text: "Analyse the statement: 'Even non-vegetarians ultimately depend on plants for their food.' Break down this idea step-by-step using examples from the food chain.", marks: "4", time: "9" },
        { qno: "Q15", text: "Examine the role of WATER as part of food. Even though water itself is not a 'food' in the traditional sense, why is it essential when we talk about nutrition and food?", marks: "4", time: "9" },
      ],
    },
    {
      key: "E",
      name: "Evaluate & Judge",
      bloom_level: "Level 5 — Evaluate",
      marks: 5,
      questions: [
        { qno: "Q16", text: 'EVALUATE the following claim: "A person who eats ONLY plant-based food (a vegetarian) can still have a complete, healthy, and balanced diet without eating any animal products at all."', marks: "5", time: "12" },
      ],
    },
    {
      key: "F",
      name: "Create & Innovate",
      bloom_level: "Level 6 — Create",
      marks: "Bonus",
      bonus: true,
      questions: [
        { qno: "Q17", text: "DESIGN a 'Smart Food Plate' for a student of Class 6 using ONLY foods mentioned or related to Chapter 1.", marks: "Bonus", time: "10" },
      ],
    },
  ],
};

const emptyQuestionDraft: QPQuestion = { qno: "", text: "", marks: "", time: "", hint: "" };
const emptySectionDraft = { key: "", name: "", bloom_level: "", marks: "", bonus: false };

/* ============================================================
   COMPONENT
   ============================================================ */
export default function PaperBuilderTab() {
  const [paper, setPaper] = useState<QPState>(defaultPaper);
  const [mode, setMode] = useState<"build" | "view">("build");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [openHints, setOpenHints] = useState<Record<string, boolean>>({});

  const [toastMsg, setToastMsg] = useState("");
  const [toastVisible, setToastVisible] = useState(false);
  const showToast = (msg: string) => {
    setToastMsg(msg);
    setToastVisible(true);
    window.setTimeout(() => setToastVisible(false), 2200);
  };

  /* ---------- Instruction modal ---------- */
  const [instrModalOpen, setInstrModalOpen] = useState(false);
  const [instrDraft, setInstrDraft] = useState("");

  /* ---------- Section modal ---------- */
  const [sectionModalOpen, setSectionModalOpen] = useState(false);
  const [sectionDraft, setSectionDraft] = useState(emptySectionDraft);
  const [sectionDraftQuestions, setSectionDraftQuestions] = useState<QPQuestion[]>([]);

  /* ---------- Question modal (shared: existing section idx | "pending" for new-section draft) ---------- */
  const [questionModalOpen, setQuestionModalOpen] = useState(false);
  const [questionDraft, setQuestionDraft] = useState<QPQuestion>(emptyQuestionDraft);
  const [questionTarget, setQuestionTarget] = useState<number | "pending" | null>(null);

  /* ============================================================
     STATE UPDATE HELPERS
     ============================================================ */
  const updateStudentInfo = (field: keyof QPStudentInfo, value: string) =>
    setPaper((p) => ({ ...p, student_info: { ...p.student_info, [field]: value } }));

  const addInstruction = (text: string) =>
    setPaper((p) => ({ ...p, general_instructions: [...p.general_instructions, text] }));
  const updateInstruction = (idx: number, value: string) =>
    setPaper((p) => {
      const arr = [...p.general_instructions];
      arr[idx] = value;
      return { ...p, general_instructions: arr };
    });
  const removeInstruction = (idx: number) =>
    setPaper((p) => ({ ...p, general_instructions: p.general_instructions.filter((_, i) => i !== idx) }));

  const updateSectionField = (sIdx: number, field: keyof QPSection, value: any) =>
    setPaper((p) => ({
      ...p,
      sections: p.sections.map((s, i) => (i === sIdx ? { ...s, [field]: value } : s)),
    }));
  const removeSection = (sIdx: number) => {
    if (!window.confirm("Remove this entire section?")) return;
    setPaper((p) => ({ ...p, sections: p.sections.filter((_, i) => i !== sIdx) }));
  };

  const updateQuestionField = (sIdx: number, qIdx: number, field: keyof QPQuestion, value: string) =>
    setPaper((p) => ({
      ...p,
      sections: p.sections.map((s, i) =>
        i === sIdx
          ? { ...s, questions: s.questions.map((q, j) => (j === qIdx ? { ...q, [field]: value } : q)) }
          : s,
      ),
    }));
  const removeQuestionFromSection = (sIdx: number, qIdx: number) =>
    setPaper((p) => ({
      ...p,
      sections: p.sections.map((s, i) => (i === sIdx ? { ...s, questions: s.questions.filter((_, j) => j !== qIdx) } : s)),
    }));

  const addSection = (section: QPSection) => setPaper((p) => ({ ...p, sections: [...p.sections, section] }));
  const addQuestionToSection = (sIdx: number, q: QPQuestion) =>
    setPaper((p) => ({
      ...p,
      sections: p.sections.map((s, i) => (i === sIdx ? { ...s, questions: [...s.questions, q] } : s)),
    }));

  /* ============================================================
     MODAL ACTIONS
     ============================================================ */
  const openAddInstrModal = () => {
    setInstrDraft("");
    setInstrModalOpen(true);
  };
  const confirmAddInstr = () => {
    const text = instrDraft.trim();
    if (!text) {
      showToast("Please write an instruction first");
      return;
    }
    addInstruction(text);
    setInstrModalOpen(false);
    showToast("✓ Instruction added");
  };

  const openAddSectionModal = () => {
    setSectionDraft({ ...emptySectionDraft, key: String.fromCharCode(65 + paper.sections.length) });
    setSectionDraftQuestions([]);
    setSectionModalOpen(true);
  };
  const confirmAddSection = () => {
    const name = sectionDraft.name.trim();
    if (!name) {
      showToast("Please give the section a name");
      return;
    }
    const key = sectionDraft.key.trim() || String.fromCharCode(65 + paper.sections.length);
    addSection({
      key,
      name,
      bloom_level: sectionDraft.bloom_level.trim(),
      marks: sectionDraft.bonus ? "Bonus" : sectionDraft.marks.trim() || 0,
      bonus: sectionDraft.bonus,
      questions: sectionDraftQuestions.slice(),
    });
    setSectionModalOpen(false);
    showToast("✓ Section added");
  };
  const removeDraftQuestion = (idx: number) => setSectionDraftQuestions((prev) => prev.filter((_, i) => i !== idx));

  const openAddQuestionModal = (target: number | "pending") => {
    setQuestionTarget(target);
    const nextCount = (target === "pending" ? sectionDraftQuestions.length : paper.sections[target].questions.length) + 1;
    setQuestionDraft({ ...emptyQuestionDraft, qno: `Q${nextCount}` });
    setQuestionModalOpen(true);
  };
  const confirmAddQuestion = () => {
    const text = questionDraft.text.trim();
    if (!text) {
      showToast("Please write the question text");
      return;
    }
    const newQ: QPQuestion = {
      qno: questionDraft.qno.trim() || `Q${Date.now() % 1000}`,
      text,
      marks: questionDraft.marks.trim() || "1",
      time: questionDraft.time?.trim() || "",
      hint: questionDraft.hint?.trim() || "",
    };
    if (questionTarget === "pending") {
      setSectionDraftQuestions((prev) => [...prev, newQ]);
    } else if (typeof questionTarget === "number") {
      addQuestionToSection(questionTarget, newQ);
    }
    setQuestionModalOpen(false);
    showToast("✓ Question added");
  };

  /* ============================================================
     PAPER VIEW derived data
     ============================================================ */
  const totalQuestions = useMemo(() => paper.sections.reduce((n, s) => n + s.questions.length, 0), [paper.sections]);
  const answeredCount = useMemo(
    () =>
      paper.sections.reduce(
        (n, s) => n + s.questions.filter((q) => (answers[q.qno] || "").trim().length > 0).length,
        0,
      ),
    [paper.sections, answers],
  );
  const progressPct = totalQuestions ? Math.round((answeredCount / totalQuestions) * 100) : 0;

  const wordCount = (qno: string) => {
    const v = (answers[qno] || "").trim();
    if (!v) return 0;
    return v.split(/\s+/).length;
  };

  const handlePrint = () => {
    setMode("view");
    window.setTimeout(() => window.print(), 200);
  };
  const handleClear = () => {
    if (window.confirm("Clear all written answers? This cannot be undone.")) {
      setAnswers({});
      showToast("All answers cleared");
    }
  };

  /* ============================================================
     RENDER
     ============================================================ */
  return (
    <div className="qpb-root">
      <style>{qpbCss}</style>

      <div className="qpb-wrap">
        

        {mode === "build" ? (
          <BuilderPanel
            paper={paper}
            setPaper={setPaper}
            updateStudentInfo={updateStudentInfo}
            updateInstruction={updateInstruction}
            removeInstruction={removeInstruction}
            openAddInstrModal={openAddInstrModal}
            updateSectionField={updateSectionField}
            removeSection={removeSection}
            updateQuestionField={updateQuestionField}
            removeQuestionFromSection={removeQuestionFromSection}
            openAddQuestionModal={openAddQuestionModal}
            openAddSectionModal={openAddSectionModal}
          />
        ) : (
          <PaperViewPanel
            paper={paper}
            updateStudentInfo={updateStudentInfo}
            setPaper={setPaper}
            answers={answers}
            setAnswers={setAnswers}
            openHints={openHints}
            setOpenHints={setOpenHints}
            totalQuestions={totalQuestions}
            answeredCount={answeredCount}
            progressPct={progressPct}
            wordCount={wordCount}
          />
        )}

        <div className="qpb-controls">
          <button type="button" className="qpb-btn qpb-btn-primary" onClick={() => showToast("✓ Progress saved for this session")}>
            💾 Save Progress
          </button>
          <button type="button" className="qpb-btn qpb-btn-secondary" onClick={handlePrint}>
            🖨️ Print / Save as PDF
          </button>
          <button type="button" className="qpb-btn qpb-btn-danger" onClick={handleClear}>
            🗑️ Clear All Answers
          </button>
        </div>

        <div className={`qpb-toast ${toastVisible ? "show" : ""}`}>{toastMsg}</div>

        {/* ============ MODAL: Add Instruction ============ */}
        {instrModalOpen && (
          <div className="qpb-modal-overlay" onClick={(e) => e.target === e.currentTarget && setInstrModalOpen(false)}>
            <div className="qpb-modal-box">
              <div className="qpb-modal-head">
                <h3>➕ Add General Instruction</h3>
                <button type="button" className="qpb-modal-close" onClick={() => setInstrModalOpen(false)}>
                  ×
                </button>
              </div>
              <div className="qpb-modal-body">
                <div className="qpb-field">
                  <label>Instruction Text</label>
                  <textarea
                    value={instrDraft}
                    onChange={(e) => setInstrDraft(e.target.value)}
                    placeholder="e.g. Draw diagrams wherever it helps explain your answer."
                    autoFocus
                  />
                </div>
              </div>
              <div className="qpb-modal-foot">
                <button type="button" className="qpb-mini-btn danger" onClick={() => setInstrModalOpen(false)}>
                  Cancel
                </button>
                <button type="button" className="qpb-mini-btn add" onClick={confirmAddInstr}>
                  + Add Instruction
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ============ MODAL: Add Section (with questions + hints) ============ */}
        {sectionModalOpen && (
          <div className="qpb-modal-overlay" onClick={(e) => e.target === e.currentTarget && setSectionModalOpen(false)}>
            <div className="qpb-modal-box">
              <div className="qpb-modal-head">
                <h3>➕ Add New Section</h3>
                <button type="button" className="qpb-modal-close" onClick={() => setSectionModalOpen(false)}>
                  ×
                </button>
              </div>
              <div className="qpb-modal-body">
                <div className="qpb-grid2" style={{ marginBottom: 14 }}>
                  <div className="qpb-field">
                    <label>Section Key</label>
                    <input
                      type="text"
                      value={sectionDraft.key}
                      onChange={(e) => setSectionDraft((d) => ({ ...d, key: e.target.value }))}
                      placeholder="e.g. G"
                    />
                  </div>
                  <div className="qpb-field">
                    <label>Section Marks</label>
                    <input
                      type="text"
                      value={sectionDraft.marks}
                      onChange={(e) => setSectionDraft((d) => ({ ...d, marks: e.target.value }))}
                      placeholder="e.g. 10"
                    />
                  </div>
                  <div className="qpb-field" style={{ gridColumn: "1/-1" }}>
                    <label>Section Name</label>
                    <input
                      type="text"
                      value={sectionDraft.name}
                      onChange={(e) => setSectionDraft((d) => ({ ...d, name: e.target.value }))}
                      placeholder="e.g. Reflect & Connect"
                    />
                  </div>
                  <div className="qpb-field" style={{ gridColumn: "1/-1" }}>
                    <label>Bloom Level</label>
                    <input
                      type="text"
                      value={sectionDraft.bloom_level}
                      onChange={(e) => setSectionDraft((d) => ({ ...d, bloom_level: e.target.value }))}
                      placeholder="e.g. Level 7 — Reflect"
                    />
                  </div>
                  <div className="qpb-field">
                    <label style={{ display: "flex", alignItems: "center", gap: 6, textTransform: "none" }}>
                      <input
                        type="checkbox"
                        style={{ width: "auto" }}
                        checked={sectionDraft.bonus}
                        onChange={(e) => setSectionDraft((d) => ({ ...d, bonus: e.target.checked }))}
                      />{" "}
                      Bonus section
                    </label>
                  </div>
                </div>

                <h3 style={{ marginBottom: 8 }}>Questions</h3>
                {sectionDraftQuestions.length === 0 ? (
                  <div className="qpb-field-note">No questions added yet — click "Add Question to this Section" below.</div>
                ) : (
                  sectionDraftQuestions.map((q, idx) => (
                    <div className="qpb-modal-qcard" key={idx}>
                      <div className="qpb-modal-qcard-top">
                        <span>
                          {q.qno} · {q.marks} marks{q.time ? ` · ${q.time} min` : ""}
                        </span>
                        <button type="button" className="qpb-mini-btn danger" onClick={() => removeDraftQuestion(idx)}>
                          Remove
                        </button>
                      </div>
                      <div>{q.text}</div>
                      {q.hint && (
                        <div className="qpb-hint-box" style={{ marginTop: 8 }}>
                          <label>Hint</label>
                          <div style={{ fontSize: 13 }}>{q.hint}</div>
                        </div>
                      )}
                    </div>
                  ))
                )}
                <button type="button" className="qpb-mini-btn add qpb-add-modal-q-btn" onClick={() => openAddQuestionModal("pending")}>
                  + Add Question to this Section
                </button>
              </div>
              <div className="qpb-modal-foot">
                <button type="button" className="qpb-mini-btn danger" onClick={() => setSectionModalOpen(false)}>
                  Cancel
                </button>
                <button type="button" className="qpb-mini-btn add" onClick={confirmAddSection}>
                  ✓ Create Section
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ============ MODAL: Add Question ============ */}
        {questionModalOpen && (
          <div className="qpb-modal-overlay" onClick={(e) => e.target === e.currentTarget && setQuestionModalOpen(false)}>
            <div className="qpb-modal-box">
              <div className="qpb-modal-head">
                <h3>➕ Add Question</h3>
                <button type="button" className="qpb-modal-close" onClick={() => setQuestionModalOpen(false)}>
                  ×
                </button>
              </div>
              <div className="qpb-modal-body">
                <div className="qpb-grid2" style={{ marginBottom: 10 }}>
                  <div className="qpb-field">
                    <label>Question No.</label>
                    <input
                      type="text"
                      value={questionDraft.qno}
                      onChange={(e) => setQuestionDraft((d) => ({ ...d, qno: e.target.value }))}
                      placeholder="e.g. Q18"
                    />
                  </div>
                  <div className="qpb-field">
                    <label>Marks</label>
                    <input
                      type="text"
                      value={questionDraft.marks}
                      onChange={(e) => setQuestionDraft((d) => ({ ...d, marks: e.target.value }))}
                      placeholder="e.g. 3"
                    />
                  </div>
                  <div className="qpb-field">
                    <label>Time (minutes)</label>
                    <input
                      type="text"
                      value={questionDraft.time}
                      onChange={(e) => setQuestionDraft((d) => ({ ...d, time: e.target.value }))}
                      placeholder="e.g. 5"
                    />
                  </div>
                </div>
                <div className="qpb-field">
                  <label>Question Text</label>
                  <textarea
                    value={questionDraft.text}
                    onChange={(e) => setQuestionDraft((d) => ({ ...d, text: e.target.value }))}
                    placeholder="Type the full question here..."
                    autoFocus
                  />
                </div>
                <div className="qpb-hint-box">
                  <label>Hint (optional — shown to student as a help note)</label>
                  <textarea
                    value={questionDraft.hint}
                    onChange={(e) => setQuestionDraft((d) => ({ ...d, hint: e.target.value }))}
                    placeholder="e.g. Think about what a cow eats vs what a lion eats."
                  />
                </div>
              </div>
              <div className="qpb-modal-foot">
                <button type="button" className="qpb-mini-btn danger" onClick={() => setQuestionModalOpen(false)}>
                  Cancel
                </button>
                <button type="button" className="qpb-mini-btn add" onClick={confirmAddQuestion}>
                  + Add Question
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ============================================================
   BUILDER PANEL
   ============================================================ */
function BuilderPanel({
  paper,
  setPaper,
  updateStudentInfo,
  updateInstruction,
  removeInstruction,
  openAddInstrModal,
  updateSectionField,
  removeSection,
  updateQuestionField,
  removeQuestionFromSection,
  openAddQuestionModal,
  openAddSectionModal,
}: {
  paper: QPState;
  setPaper: React.Dispatch<React.SetStateAction<QPState>>;
  updateStudentInfo: (field: keyof QPStudentInfo, value: string) => void;
  updateInstruction: (idx: number, value: string) => void;
  removeInstruction: (idx: number) => void;
  openAddInstrModal: () => void;
  updateSectionField: (sIdx: number, field: keyof QPSection, value: any) => void;
  removeSection: (sIdx: number) => void;
  updateQuestionField: (sIdx: number, qIdx: number, field: keyof QPQuestion, value: string) => void;
  removeQuestionFromSection: (sIdx: number, qIdx: number) => void;
  openAddQuestionModal: (target: number | "pending") => void;
  openAddSectionModal: () => void;
}) {
  return (
    <div>
      <div className="qpb-card">
        <h3>Paper Details</h3>
        <div className="qpb-grid2">
          <div className="qpb-field" style={{ gridColumn: "1/-1" }}>
            <label>Paper Title</label>
            <input
              type="text"
              value={paper.title}
              onChange={(e) => setPaper((p) => ({ ...p, title: e.target.value }))}
              placeholder="e.g. Class 6 CBSE Science Chapter 1: Food"
            />
          </div>
          <div className="qpb-field" style={{ gridColumn: "1/-1" }}>
            <label>Personalization Note (optional)</label>
            <textarea
              value={paper.personalization}
              onChange={(e) => setPaper((p) => ({ ...p, personalization: e.target.value }))}
              placeholder="e.g. This paper is tailored for you..."
            />
          </div>
          <div className="qpb-field">
            <label>Total Marks</label>
            <input
              type="text"
              value={paper.total_marks}
              onChange={(e) => setPaper((p) => ({ ...p, total_marks: e.target.value }))}
              placeholder="e.g. 50"
            />
          </div>
          <div className="qpb-field">
            <label>Time Allowed</label>
            <input
              type="text"
              value={paper.time}
              onChange={(e) => setPaper((p) => ({ ...p, time: e.target.value }))}
              placeholder="e.g. 2 Hours"
            />
          </div>
        </div>
      </div>


      <div className="qpb-card">
        <h3>General Instructions</h3>
        {paper.general_instructions.map((text, idx) => (
          <div className="qpb-q-row" key={idx}>
            <div className="qpb-q-row-top">
              <div className="qpb-field">
                <input type="text" value={text} onChange={(e) => updateInstruction(idx, e.target.value)} />
              </div>
            </div>
            <div className="qpb-q-row-actions">
              <button type="button" className="qpb-mini-btn danger" onClick={() => removeInstruction(idx)}>
                Remove
              </button>
            </div>
          </div>
        ))}
        <button type="button" className="qpb-mini-btn add" onClick={openAddInstrModal}>
          + Add Instruction
        </button>
      </div>

      <div className="qpb-card">
        <h3>Sections &amp; Questions</h3>
        {paper.sections.map((sec, sIdx) => (
          <div className="qpb-section-card" key={sIdx}>
            <div className="qpb-section-card-head">
              <span style={{ fontFamily: "Verdana,sans-serif", fontSize: 12 }}>Sec</span>
              <input
                className="qpb-sec-name qpb-sec-key"
                type="text"
                value={sec.key}
                onChange={(e) => updateSectionField(sIdx, "key", e.target.value)}
                placeholder="Key"
              />
              <input
                className="qpb-sec-name"
                type="text"
                value={sec.name}
                onChange={(e) => updateSectionField(sIdx, "name", e.target.value)}
                placeholder="Section name"
              />
              <button type="button" className="qpb-remove-sec-btn" onClick={() => removeSection(sIdx)}>
                ×
              </button>
            </div>
            <div className="qpb-section-card-body">
              <div className="qpb-sec-meta">
                <div className="qpb-field">
                  <label>Bloom Level</label>
                  <input
                    type="text"
                    value={sec.bloom_level || ""}
                    onChange={(e) => updateSectionField(sIdx, "bloom_level", e.target.value)}
                  />
                </div>
                <div className="qpb-field">
                  <label>Section Marks</label>
                  <input type="text" value={String(sec.marks)} onChange={(e) => updateSectionField(sIdx, "marks", e.target.value)} />
                </div>
                <div className="qpb-field">
                  <label style={{ display: "flex", alignItems: "center", gap: 6, textTransform: "none" }}>
                    <input
                      type="checkbox"
                      style={{ width: "auto" }}
                      checked={!!sec.bonus}
                      onChange={(e) => updateSectionField(sIdx, "bonus", e.target.checked)}
                    />
                    Bonus section
                  </label>
                </div>
              </div>

              {sec.questions.map((q, qIdx) => (
                <div className="qpb-q-row" key={qIdx}>
                  <div className="qpb-q-row-top">
                    <div className="qpb-field small">
                      <label>No.</label>
                      <input type="text" value={q.qno} onChange={(e) => updateQuestionField(sIdx, qIdx, "qno", e.target.value)} />
                    </div>
                    <div className="qpb-field small">
                      <label>Marks</label>
                      <input type="text" value={q.marks} onChange={(e) => updateQuestionField(sIdx, qIdx, "marks", e.target.value)} />
                    </div>
                    <div className="qpb-field small">
                      <label>Time (min)</label>
                      <input
                        type="text"
                        value={q.time || ""}
                        placeholder="e.g. 5"
                        onChange={(e) => updateQuestionField(sIdx, qIdx, "time", e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="qpb-field">
                    <label>Question Text</label>
                    <textarea value={q.text} onChange={(e) => updateQuestionField(sIdx, qIdx, "text", e.target.value)} />
                  </div>
                  <div className="qpb-hint-box">
                    <label>Hint (optional)</label>
                    <textarea
                      value={q.hint || ""}
                      placeholder="A short help note for the student..."
                      onChange={(e) => updateQuestionField(sIdx, qIdx, "hint", e.target.value)}
                    />
                  </div>
                  <div className="qpb-q-row-actions">
                    <button type="button" className="qpb-mini-btn danger" onClick={() => removeQuestionFromSection(sIdx, qIdx)}>
                      Remove Question
                    </button>
                  </div>
                </div>
              ))}

              <button type="button" className="qpb-mini-btn add" onClick={() => openAddQuestionModal(sIdx)}>
                + Add Question
              </button>
            </div>
          </div>
        ))}
        <button type="button" className="qpb-add-section-btn" onClick={openAddSectionModal}>
          + Add New Section
        </button>
      </div>
    </div>
  );
}

/* ============================================================
   PAPER VIEW PANEL
   ============================================================ */
function PaperViewPanel({
  paper,
  updateStudentInfo,
  setPaper,
  answers,
  setAnswers,
  openHints,
  setOpenHints,
  totalQuestions,
  answeredCount,
  progressPct,
  wordCount,
}: {
  paper: QPState;
  updateStudentInfo: (field: keyof QPStudentInfo, value: string) => void;
  setPaper: React.Dispatch<React.SetStateAction<QPState>>;
  answers: Record<string, string>;
  setAnswers: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  openHints: Record<string, boolean>;
  setOpenHints: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  totalQuestions: number;
  answeredCount: number;
  progressPct: number;
  wordCount: (qno: string) => number;
}) {
  return (
    <div>
      {paper.personalization && <div className="qpb-note-banner">{paper.personalization}</div>}

      <div className="qpb-card qpb-info-card">
        <h3>Student Details</h3>
        <div className="qpb-info-grid">
          <div className="qpb-field">
            <label>Name</label>
            <input type="text" value={paper.student_info.name} onChange={(e) => updateStudentInfo("name", e.target.value)} />
          </div>
          <div className="qpb-field">
            <label>Student ID</label>
            <input type="text" value={paper.student_info.student_id} onChange={(e) => updateStudentInfo("student_id", e.target.value)} />
          </div>
          <div className="qpb-field">
            <label>Class</label>
            <input type="text" value={paper.student_info.class} onChange={(e) => updateStudentInfo("class", e.target.value)} />
          </div>
          <div className="qpb-field">
            <label>Section</label>
            <input type="text" value={paper.student_info.section} onChange={(e) => updateStudentInfo("section", e.target.value)} />
          </div>
          <div className="qpb-field">
            <label>Date</label>
            <input type="date" value={paper.student_info.date} onChange={(e) => updateStudentInfo("date", e.target.value)} />
          </div>
          <div className="qpb-field">
            <label>Total Marks</label>
            <input type="text" value={String(paper.total_marks)} disabled />
          </div>
          <div className="qpb-field">
            <label>Time Allowed</label>
            <input type="text" value={paper.time} disabled />
          </div>
        </div>
      </div>

      <div className="qpb-progress-bar-wrap">
        <div className="qpb-progress-shell">
          <div className="qpb-progress-fill" style={{ width: `${progressPct}%` }} />
        </div>
        <div className="qpb-progress-label">
          {answeredCount} of {totalQuestions} questions answered
        </div>
      </div>

      {paper.sections.length === 0 ? (
        <div className="qpb-empty-hint">No sections yet. Go to the Builder tab to add sections and questions.</div>
      ) : (
        paper.sections.map((sec, sIdx) => (
          <section className={`qpb-section-block ${sec.bonus ? "qpb-bonus" : ""}`} key={sIdx}>
            <div className="qpb-section-head">
              <span className="qpb-badge">{sec.key}</span>
              <h2>{sec.name || "Untitled Section"}</h2>
              <span className="qpb-marks">
                {sec.bloom_level ? `${sec.bloom_level} · ` : ""}
                {sec.marks === "Bonus" || sec.bonus ? "Bonus" : `${sec.marks || 0} marks`}
              </span>
            </div>
            <div className="qpb-section-body">
              {sec.questions.map((q) => {
                const showHint = !!openHints[q.qno];
                return (
                  <div className="qpb-question" key={q.qno}>
                    <div className="qpb-qhead">
                      <span className="qpb-qno">{q.qno}</span>
                      <span className="qpb-qmeta">
                        <span className="qpb-qmarks">[{q.marks === "Bonus" ? "Bonus" : `${q.marks || 0} marks`}]</span>
                        {q.time && <span className="qpb-qtime">⏱ {q.time} min</span>}
                      </span>
                    </div>
                    <p className="qpb-qtext">{q.text}</p>
                    {q.hint && (
                      <>
                        <button
                          type="button"
                          className="qpb-hint-toggle"
                          onClick={() => setOpenHints((h) => ({ ...h, [q.qno]: !h[q.qno] }))}
                        >
                          💡 {showHint ? "Hide hint" : "Show hint"}
                        </button>
                        <div className={`qpb-hint-display ${showHint ? "show" : ""}`}>{q.hint}</div>
                      </>
                    )}
                    <textarea
                      className="qpb-answer"
                      placeholder="Write your answer here..."
                      value={answers[q.qno] || ""}
                      onChange={(e) => setAnswers((a) => ({ ...a, [q.qno]: e.target.value }))}
                    />
                    <div className="qpb-word-count">
                      {wordCount(q.qno)} word{wordCount(q.qno) === 1 ? "" : "s"}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ))
      )}
    </div>
  );
}

/* ============================================================
   SCOPED CSS (prefixed with .qpb-root so it never leaks into
   the rest of the app's Tailwind styles)
   ============================================================ */
const qpbCss = `
.qpb-root{
  --qpb-paper:#faf6ec;
  --qpb-ink:#2b2620;
  --qpb-wheat:#c98a3d;
  --qpb-wheat-dark:#8f5c1f;
  --qpb-leaf:#5c7a4a;
  --qpb-leaf-dark:#3e5533;
  --qpb-line:#d8cdb2;
  --qpb-card:#ffffff;
  --qpb-shadow: 0 2px 10px rgba(43,38,32,0.08);
  font-family: 'Georgia', 'Iowan Old Style', serif;
  background: var(--qpb-paper);
  background-image:
    radial-gradient(circle at 20% 10%, rgba(92,122,74,0.06), transparent 40%),
    radial-gradient(circle at 90% 80%, rgba(201,138,61,0.08), transparent 45%);
  color: var(--qpb-ink);
  line-height:1.5;
  border-radius: 14px;
  overflow: hidden;
}
.qpb-root *{ box-sizing:border-box; }
.qpb-wrap{ max-width: 920px; margin: 0 auto; padding: 24px 20px; }

.qpb-head{ text-align:center; border-bottom: 3px double var(--qpb-wheat-dark); padding-bottom: 18px; margin-bottom: 22px; }
.qpb-eyebrow{ letter-spacing:.14em; text-transform:uppercase; font-size:12px; color: var(--qpb-wheat-dark); font-family: Verdana, sans-serif; font-weight:700; }
.qpb-h1{ font-size: clamp(20px, 4vw, 30px); margin: 6px 0 4px; color: var(--qpb-leaf-dark); }
.qpb-subtitle{ font-size:13px; color:#6b6151; font-style: italic; }

.qpb-mode-tabs{ display:flex; gap:8px; justify-content:center; margin-bottom: 22px; background: #efe6cf; padding:5px; border-radius: 30px; width: fit-content; margin-left:auto; margin-right:auto; }
.qpb-mode-tab{ font-family: Verdana, sans-serif; font-size:12.5px; font-weight:700; padding: 9px 20px; border-radius: 24px; cursor:pointer; border:none; background:transparent; color:#6b6151; letter-spacing:.03em; }
.qpb-mode-tab.active{ background: var(--qpb-leaf-dark); color:#fff; }

.qpb-card{ background: var(--qpb-card); border:1px solid var(--qpb-line); border-radius:8px; box-shadow: var(--qpb-shadow); padding:16px 18px; margin-bottom:18px; }
.qpb-card h3{ margin:0 0 12px; font-size:14px; font-family:Verdana,sans-serif; color: var(--qpb-leaf-dark); text-transform:uppercase; letter-spacing:.05em; }
.qpb-grid2{ display:grid; grid-template-columns: repeat(auto-fit,minmax(200px,1fr)); gap:12px 18px; }
.qpb-field label{ display:block; font-family: Verdana, sans-serif; font-size:10.5px; text-transform:uppercase; letter-spacing:.06em; color: var(--qpb-wheat-dark); margin-bottom:3px; }
.qpb-field input, .qpb-field textarea, .qpb-field select{ width:100%; border:1px solid var(--qpb-line); border-radius:5px; background:#fffefb; font-family: Georgia, serif; font-size:14px; padding:7px 9px; color: var(--qpb-ink); }
.qpb-field textarea{ min-height:50px; resize:vertical; }
.qpb-field input:focus, .qpb-field textarea:focus, .qpb-field select:focus{ outline:none; border-color: var(--qpb-leaf); box-shadow:0 0 0 3px rgba(92,122,74,0.12); }

.qpb-section-card{ border:1.5px solid var(--qpb-line); border-radius:10px; margin-bottom:16px; overflow:hidden; background:#fffefb; }
.qpb-section-card-head{ display:flex; align-items:center; gap:10px; background: var(--qpb-leaf-dark); color:#faf6ec; padding:10px 14px; }
.qpb-section-card-head input.qpb-sec-name{ flex:1; background: rgba(255,255,255,0.12); border:1px solid rgba(255,255,255,0.3); color:#fff; border-radius:5px; padding:6px 9px; font-size:14px; font-family:Georgia,serif; }
.qpb-section-card-head input.qpb-sec-name::placeholder{ color: rgba(255,255,255,0.6); }
.qpb-section-card-head input.qpb-sec-key{ flex:0 0 50px; max-width:50px; text-align:center; }
.qpb-section-card-body{ padding:14px; }
.qpb-sec-meta{ display:grid; grid-template-columns: repeat(auto-fit,minmax(140px,1fr)); gap:10px; margin-bottom:14px; }

.qpb-q-row{ border:1px dashed var(--qpb-line); border-radius:7px; padding:10px 12px; margin-bottom:10px; background:#fff; }
.qpb-q-row-top{ display:flex; gap:10px; margin-bottom:8px; }
.qpb-q-row-top .qpb-field{ flex:1; }
.qpb-q-row-top .qpb-field.small{ max-width:110px; }
.qpb-q-row textarea{ min-height:60px; }
.qpb-q-row-actions{ text-align:right; margin-top:6px; }

.qpb-mini-btn{ font-family: Verdana, sans-serif; font-size:11px; font-weight:700; padding:6px 12px; border-radius:16px; border:1.5px solid var(--qpb-wheat-dark); background:#fff; color: var(--qpb-wheat-dark); cursor:pointer; }
.qpb-mini-btn.danger{ border-color:#a1442d; color:#a1442d; }
.qpb-mini-btn.add{ border-color: var(--qpb-leaf-dark); color: var(--qpb-leaf-dark); }
.qpb-mini-btn:hover{ background: #f4ead2; }

.qpb-add-section-btn{ display:block; width:100%; text-align:center; padding:12px; border-radius:8px; border:2px dashed var(--qpb-wheat); background: transparent; color: var(--qpb-wheat-dark); font-family: Verdana, sans-serif; font-weight:700; font-size:13px; cursor:pointer; }
.qpb-add-section-btn:hover{ background: rgba(201,138,61,0.08); }

.qpb-remove-sec-btn{ margin-left:auto; background: rgba(0,0,0,0.15); border:none; color:#fff; width:26px; height:26px; border-radius:50%; cursor:pointer; font-size:14px; line-height:1; }

.qpb-note-banner{ background: linear-gradient(135deg, #f4ead2, #eef3e6); border:1px solid var(--qpb-line); border-left:5px solid var(--qpb-leaf); border-radius:6px; padding:12px 16px; font-size:14px; margin-bottom:20px; color:#4a4636; }
.qpb-info-card .qpb-info-grid{ display:grid; grid-template-columns: repeat(auto-fit, minmax(160px,1fr)); gap:12px 18px; }

.qpb-section-block{ margin-bottom:26px; }
.qpb-section-head{ display:flex; align-items:center; gap:10px; background: var(--qpb-leaf-dark); color:#faf6ec; padding:10px 16px; border-radius:8px 8px 0 0; }
.qpb-section-head .qpb-badge{ font-family: Verdana, sans-serif; font-size:11px; background: rgba(255,255,255,0.18); padding:3px 9px; border-radius:20px; letter-spacing:.04em; }
.qpb-section-head h2{ font-size:16px; margin:0; flex:1; font-weight:600; }
.qpb-section-head .qpb-marks{ font-family: Verdana, sans-serif; font-size:12px; opacity:.9; }
.qpb-section-body{ background: var(--qpb-card); border:1px solid var(--qpb-line); border-top:none; border-radius:0 0 8px 8px; box-shadow: var(--qpb-shadow); padding:6px 18px 10px; }
.qpb-question{ padding:16px 0; border-bottom:1px dashed var(--qpb-line); }
.qpb-question:last-child{ border-bottom:none; }
.qpb-qhead{ display:flex; justify-content:space-between; align-items:baseline; gap:12px; margin-bottom:8px; }
.qpb-qno{ font-family: Verdana, sans-serif; font-weight:700; color: var(--qpb-wheat-dark); font-size:13px; white-space:nowrap; }
.qpb-qmarks{ font-family: Verdana, sans-serif; font-size:11px; color:#8a8168; white-space:nowrap; }
.qpb-qtext{ font-size:15px; margin:0 0 10px; }
textarea.qpb-answer{ width:100%; min-height:90px; border:1px solid var(--qpb-line); border-radius:6px; background: repeating-linear-gradient(to bottom, #fffefb 0px, #fffefb 27px, #e9e2cc 28px); line-height:28px; padding:4px 10px; font-family: Georgia, serif; font-size:14.5px; resize:vertical; }
textarea.qpb-answer:focus{ outline:none; border-color: var(--qpb-leaf); box-shadow:0 0 0 3px rgba(92,122,74,0.12); }
.qpb-word-count{ text-align:right; font-family: Verdana, sans-serif; font-size:10.5px; color:#9b9179; margin-top:3px; }
.qpb-bonus .qpb-section-head{ background: var(--qpb-wheat-dark); }
.qpb-empty-hint{ text-align:center; padding: 30px 10px; color:#8a8168; font-family: Verdana, sans-serif; font-size:13px; }

.qpb-progress-bar-wrap{ background: var(--qpb-paper); padding:10px 0 14px; }
.qpb-progress-shell{ background:#efe6cf; border:1px solid var(--qpb-line); border-radius:20px; height:22px; overflow:hidden; box-shadow: inset 0 1px 3px rgba(0,0,0,0.08); }
.qpb-progress-fill{ height:100%; width:0%; background: linear-gradient(90deg, var(--qpb-leaf), var(--qpb-wheat)); transition: width .4s ease; border-radius:20px 0 0 20px; }
.qpb-progress-label{ text-align:center; font-family: Verdana, sans-serif; font-size:11px; color:#6b6151; margin-top:5px; }

.qpb-controls{ display:flex; gap:10px; justify-content:center; flex-wrap:wrap; padding:16px 20px 20px; }
.qpb-btn{ font-family: Verdana, sans-serif; font-size:13px; font-weight:700; letter-spacing:.03em; padding:10px 20px; border-radius:24px; border:none; cursor:pointer; transition: transform .15s ease; }
.qpb-btn:hover{ transform: translateY(-1px); }
.qpb-btn-primary{ background: var(--qpb-leaf-dark); color:#faf6ec; box-shadow: 0 3px 10px rgba(62,85,51,0.35); }
.qpb-btn-secondary{ background: var(--qpb-card); color: var(--qpb-leaf-dark); border:1.5px solid var(--qpb-leaf-dark); }
.qpb-btn-danger{ background: var(--qpb-card); color:#a1442d; border:1.5px solid #a1442d; }

.qpb-toast{ position: fixed; left:50%; bottom:24px; transform: translateX(-50%) translateY(20px); background: var(--qpb-leaf-dark); color:#fff; padding:10px 20px; border-radius:24px; font-family: Verdana, sans-serif; font-size:12.5px; opacity:0; pointer-events:none; transition: all .3s ease; box-shadow: 0 4px 14px rgba(0,0,0,0.2); z-index:200; }
.qpb-toast.show{ opacity:1; transform: translateX(-50%) translateY(0); }

.qpb-modal-overlay{ position: fixed; inset:0; background: rgba(43,38,32,0.55); display:flex; align-items:flex-start; justify-content:center; z-index: 300; padding: 40px 16px; overflow-y:auto; }
.qpb-modal-box{ background: var(--qpb-paper); border-radius: 12px; max-width: 640px; width:100%; box-shadow: 0 12px 40px rgba(0,0,0,0.3); border:1px solid var(--qpb-line); font-family: Georgia, serif; }
.qpb-modal-head{ display:flex; align-items:center; justify-content:space-between; background: var(--qpb-leaf-dark); color:#faf6ec; padding:14px 18px; border-radius:12px 12px 0 0; }
.qpb-modal-head h3{ margin:0; font-size:15px; font-family:Verdana,sans-serif; letter-spacing:.03em; }
.qpb-modal-close{ background:rgba(255,255,255,0.15); border:none; color:#fff; width:26px; height:26px; border-radius:50%; cursor:pointer; font-size:14px; line-height:1; }
.qpb-modal-body{ padding:18px; max-height: 65vh; overflow-y:auto; }
.qpb-modal-foot{ display:flex; gap:10px; justify-content:flex-end; padding:14px 18px; border-top:1px solid var(--qpb-line); }
.qpb-modal-qcard{ border:1px dashed var(--qpb-line); border-radius:8px; padding:12px; margin-bottom:12px; background:#fffefb; }
.qpb-modal-qcard-top{ display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; }
.qpb-modal-qcard-top span{ font-family:Verdana,sans-serif; font-size:12px; font-weight:700; color:var(--qpb-wheat-dark); }
.qpb-hint-box{ background: linear-gradient(135deg, #fbf3de, #f4ead2); border:1px solid var(--qpb-wheat); border-left:4px solid var(--qpb-wheat-dark); border-radius:8px; padding:10px 12px; margin-top:10px; }
.qpb-hint-box label{ color: var(--qpb-wheat-dark) !important; display:flex; align-items:center; gap:6px; font-size:10.5px !important; }
.qpb-hint-box label::before{ content:"💡"; font-size:13px; }
.qpb-hint-box textarea, .qpb-hint-box input{ background:#fffefb; border-color: var(--qpb-line); }
.qpb-add-modal-q-btn{ width:100%; }
.qpb-field-note{ font-family:Verdana,sans-serif; font-size:11px; color:#8a8168; margin-top:4px; }

.qpb-hint-toggle{ font-family:Verdana,sans-serif; font-size:11.5px; font-weight:700; color: var(--qpb-wheat-dark); cursor:pointer; background: #fbf3de; border:1px solid var(--qpb-wheat); border-radius:14px; padding:5px 12px; margin-top:6px; display:inline-flex; align-items:center; gap:5px; }
.qpb-hint-toggle:hover{ background: #f4ead2; }
.qpb-hint-display{ background: linear-gradient(135deg, #fbf3de, #f4ead2); border-left:4px solid var(--qpb-wheat-dark); border-radius:6px; padding:10px 12px; font-size:13.5px; color:#4a4636; margin:8px 0 10px; display:none; }
.qpb-hint-display.show{ display:block; }
.qpb-qmeta{ display:flex; gap:10px; align-items:baseline; white-space:nowrap; }
.qpb-qtime{ font-family: Verdana, sans-serif; font-size:11px; color:#8a8168; }

@media print{
  body *{ visibility:hidden; }
  .qpb-root, .qpb-root *{ visibility:visible; }
  .qpb-root{ position:absolute; left:0; top:0; width:100%; border-radius:0; }
  .qpb-controls, .qpb-progress-bar-wrap, .qpb-mode-tabs{ display:none !important; }
  textarea.qpb-answer{ background:#fff; }
  .qpb-section-block{ page-break-inside: avoid; }
}

@media (max-width: 640px){
  .qpb-wrap{ padding: 16px 12px; }
  .qpb-head{ padding-bottom:14px; margin-bottom:16px; }
  .qpb-h1{ font-size: clamp(17px, 5.5vw, 22px); }
  .qpb-mode-tabs{ width:100%; }
  .qpb-mode-tab{ flex:1; padding:9px 6px; font-size:11.5px; }
  .qpb-card{ padding:13px 12px; }
  .qpb-grid2{ grid-template-columns: 1fr; gap:10px; }
  .qpb-sec-meta{ grid-template-columns: 1fr 1fr; }
  .qpb-info-card .qpb-info-grid{ grid-template-columns: 1fr 1fr; }
  .qpb-section-card-head{ flex-wrap:wrap; row-gap:8px; }
  .qpb-section-card-head .qpb-sec-key{ order:1; flex:0 0 70px; max-width:70px; }
  .qpb-section-card-head .qpb-remove-sec-btn{ order:2; }
  .qpb-section-card-head .qpb-sec-name:not(.qpb-sec-key){ order:3; flex:1 1 100%; }
  .qpb-q-row-top{ flex-wrap:wrap; gap:8px; }
  .qpb-q-row-top .qpb-field{ flex:1 1 100%; min-width:0; }
  .qpb-q-row-top .qpb-field.small{ max-width:none; flex:1 1 calc(50% - 4px); }
  .qpb-modal-overlay{ padding:16px 8px; align-items:center; }
  .qpb-modal-box{ max-width:100%; }
  .qpb-modal-body{ padding:14px; max-height:72vh; }
  .qpb-modal-head{ padding:12px 14px; }
  .qpb-modal-foot{ padding:12px 14px; flex-wrap:wrap; }
  .qpb-modal-foot button{ flex:1 1 auto; }
  .qpb-controls{ flex-direction:column; }
  .qpb-controls button{ width:100%; }
  .qpb-qhead{ flex-wrap:wrap; row-gap:4px; }
  .qpb-section-head h2{ font-size:14.5px; }
  .qpb-section-head{ flex-wrap:wrap; row-gap:4px; }
  .qpb-section-head .qpb-marks{ flex-basis:100%; }
}
`;