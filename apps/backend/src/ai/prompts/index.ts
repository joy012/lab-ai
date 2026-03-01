/**
 * AI Prompt Index
 *
 * Central export for all AI prompts used in LabAI.
 * Prompts are organized by report type and function.
 */

// ── Report Type Detection ──
export { REPORT_DETECTION_PROMPT } from './detection.prompt.js';

// ── Lab Report ──
export { LAB_REPORT_EXTRACTION_PROMPT } from './lab-report-extraction.prompt.js';
export { buildLabReportInterpretationPrompt } from './lab-report-interpretation.prompt.js';

// ── ECG ──
export { ECG_EXTRACTION_PROMPT } from './ecg-extraction.prompt.js';
export { buildECGInterpretationPrompt } from './ecg-interpretation.prompt.js';

// ── Imaging ──
export { buildImagingExtractionPrompt } from './imaging-extraction.prompt.js';
export { buildImagingInterpretationPrompt } from './imaging-interpretation.prompt.js';
