export type FaqItem = {
  question: string;
  answer: string;
};

/**
 * Splits the FAQ text of a tour into question/answer pairs.
 *
 * The field is one free-text box in Sanity and the 85 tours that fill it do not
 * share a format: "Q:/A:", Spanish "P:/R:", French "Q :/R :" with a space before
 * the colon, indented answers, or no markers at all — just a question ending in
 * "?" followed by its answer. All of those are read here.
 *
 * Returns null when the text cannot be read as pairs, so the caller can show it
 * as plain text instead of dropping content.
 */
const QUESTION_MARKER = /^\s*(?:q|p|question|pregunta)\s*[.:]\s*/i;
const QUESTION_MARKER_SPACED = /^\s*(?:q|p)\s+:\s*/i;
const ANSWER_MARKER = /^\s*(?:a|r|answer|respuesta|réponse|reponse)\s*[.:]\s*/i;
const ANSWER_MARKER_SPACED = /^\s*(?:a|r)\s+:\s*/i;

function stripQuestionMarker(line: string): string | null {
  const match = QUESTION_MARKER.exec(line) ?? QUESTION_MARKER_SPACED.exec(line);
  return match ? line.slice(match[0].length) : null;
}

function stripAnswerMarker(line: string): string | null {
  const match = ANSWER_MARKER.exec(line) ?? ANSWER_MARKER_SPACED.exec(line);
  return match ? line.slice(match[0].length) : null;
}

export function parseFaqText(text: string | null | undefined): FaqItem[] | null {
  const lines = (text ?? "").replace(/\r\n/g, "\n").split("\n");
  const hasMarkers = lines.some((line) => stripQuestionMarker(line) !== null);

  const items: Array<{ question: string[]; answer: string[] }> = [];
  let current: { question: string[]; answer: string[] } | null = null;
  let inAnswer = false;

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) {
      // A blank line is a paragraph break inside an answer; elsewhere it is noise.
      if (current && inAnswer && current.answer.length > 0 && current.answer.at(-1) !== "") {
        current.answer.push("");
      }
      continue;
    }

    const question = stripQuestionMarker(line);
    if (question !== null) {
      // "Q: ...? A: ..." all on one line: the answer marker sits inside it.
      const inline = /\s+(?:a|r)\s*:\s+/i.exec(question);
      if (inline) {
        current = {
          question: [question.slice(0, inline.index)],
          answer: [question.slice(inline.index + inline[0].length)],
        };
        inAnswer = true;
      } else {
        current = { question: [question], answer: [] };
        inAnswer = false;
      }
      items.push(current);
      continue;
    }

    const answer = stripAnswerMarker(line);
    if (answer !== null && current) {
      inAnswer = true;
      if (answer) current.answer.push(answer);
      continue;
    }

    // Without markers, a short line ending in "?" opens a new question.
    if (!hasMarkers && line.endsWith("?") && line.length <= 220) {
      current = { question: [line], answer: [] };
      items.push(current);
      inAnswer = false;
      continue;
    }

    if (!current) return null;
    if (inAnswer || current.answer.length > 0) {
      current.answer.push(line);
      inAnswer = true;
    } else if (hasMarkers) {
      // Marker format with no "A:" yet: the text after the question is its answer.
      current.answer.push(line);
      inAnswer = true;
    } else {
      current.answer.push(line);
      inAnswer = true;
    }
  }

  const parsed = items
    .map((item) => ({
      question: item.question.join(" ").trim(),
      answer: item.answer
        .join("\n")
        .replace(/\n{3,}/g, "\n\n")
        .trim(),
    }))
    .filter((item) => item.question && item.answer);

  // Every question must have kept an answer; anything less means the text was
  // not in a shape this parser understands.
  if (parsed.length === 0 || parsed.length !== items.length) return null;
  return parsed;
}
