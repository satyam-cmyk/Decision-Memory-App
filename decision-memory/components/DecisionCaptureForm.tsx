'use client';

import { FormEvent, useCallback, useState } from 'react';
import { decisionRepository } from '@/lib';
import { validateDecisionForm, getDefaultReviewDate, getMinReviewDate, type FormData, type FormErrors } from '@/lib/validation/formValidation';
import type { DecisionType, Importance, DecisionSpeed, DecisionDriver } from '@/lib/types';

/**
 * Parse a date string (from <input type="date">) as local time, not UTC
 * This fixes timezone bugs where "2026-02-18" becomes 2026-02-17 in some timezones
 */
function parseLocalDate(dateString: string): Date {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day, 0, 0, 0, 0);
}

export interface DecisionForm {
  onSuccess?: (decisionId: string) => void;
  showOptionalFields?: boolean;
}

export default function DecisionCaptureForm({ onSuccess, showOptionalFields = true }: DecisionForm) {
  const DECISION_TYPES: DecisionType[] = ['personal', 'work', 'finance', 'health', 'other'];
  const IMPORTANCE_LEVELS: Importance[] = ['low', 'medium', 'high'];
  const DECISION_SPEEDS: DecisionSpeed[] = ['quick', 'moderate', 'slow'];
  const DECISION_DRIVERS: DecisionDriver[] = ['logic', 'urgency', 'fear', 'opportunity', 'external_pressure'];

  // Form state
  const [formData, setFormData] = useState<FormData>({
    title: '',
    reasoning: '',
    confidence: 75,
    decision_type: 'personal',
    importance: 'medium',
    decision_speed: 'moderate',
    decision_driver: undefined,
    expected_outcome: '',
    review_date: getDefaultReviewDate(),
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Handle input changes
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name, value } = e.target;

      setFormData((prev) => {
        const updated = { ...prev, [name]: value };
        // Auto-convert confidence to number
        if (name === 'confidence') {
          updated.confidence = value === '' ? 0 : parseInt(value, 10);
        }
        return updated;
      });

      // Clear error for this field when user starts typing
      if (errors[name as keyof FormErrors]) {
        setErrors((prev) => ({ ...prev, [name]: undefined }));
      }
    },
    [errors]
  );

  // Handle form submission
  const handleSubmit = useCallback(
    async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      // Validate
      const formErrors = validateDecisionForm(formData);
      if (Object.keys(formErrors).length > 0) {
        setErrors(formErrors);
        return;
      }

      // Submit
      try {
        setIsSubmitting(true);
        const decisionId = await decisionRepository.create({
          title: formData.title.trim(),
          reasoning: formData.reasoning.trim(),
          confidence: formData.confidence,
          decision_type: formData.decision_type,
          importance: formData.importance,
          decision_speed: formData.decision_speed,
          decision_driver: formData.decision_driver,
          expected_outcome: formData.expected_outcome.trim(),
          review_date: parseLocalDate(formData.review_date),
        });

        // Success state
        setSubmitSuccess(true);
        setFormData({
          title: '',
          reasoning: '',
          confidence: 75,
          decision_type: 'personal',
          importance: 'medium',
          decision_speed: 'moderate',
          decision_driver: undefined,
          expected_outcome: '',
          review_date: getDefaultReviewDate(),
        });
        setErrors({});

        // Call callback
        if (onSuccess) {
          onSuccess(decisionId);
        }

        // Auto-reset success message after 3 seconds
        setTimeout(() => setSubmitSuccess(false), 3000);
      } catch (error) {
        console.error('Failed to create decision:', error);
        setErrors({
          title: 'Failed to save decision. Please try again.',
        });
      } finally {
        setIsSubmitting(false);
      }
    },
    [formData, onSuccess]
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
      {/* Success Message */}
      {submitSuccess && (
        <div className="rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900/50 p-4">
          <p className="text-green-800 dark:text-green-400 font-medium">✓ Decision logged. Good job!</p>
        </div>
      )}

      {/* Title */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          What decision did you make? <span className="text-red-500">*</span>
        </label>
        <input
          id="title"
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="e.g., Switch to Next.js for new project"
          className={`w-full px-4 py-2 border rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors ${
            errors.title ? 'border-red-500 dark:border-red-900' : 'border-gray-300 dark:border-slate-700'
          }`}
          disabled={isSubmitting}
        />
        {errors.title && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.title}</p>}
      </div>

      {/* Reasoning */}
      <div>
        <label htmlFor="reasoning" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Why did you make this choice? <span className="text-red-500">*</span>
        </label>
        <textarea
          id="reasoning"
          name="reasoning"
          value={formData.reasoning}
          onChange={handleChange}
          placeholder="Your reasoning, factors considered, alternatives rejected..."
          rows={3}
          className={`w-full px-4 py-2 border rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 resize-none transition-colors ${
            errors.reasoning ? 'border-red-500 dark:border-red-900' : 'border-gray-300 dark:border-slate-700'
          }`}
          disabled={isSubmitting}
        />
        {errors.reasoning && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.reasoning}</p>}
      </div>

      {/* Confidence */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label htmlFor="confidence" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            How confident are you? <span className="text-red-500">*</span>
          </label>
          <span className="text-lg font-semibold text-blue-600 dark:text-blue-400">{formData.confidence}%</span>
        </div>
        <input
          id="confidence"
          type="range"
          name="confidence"
          min="0"
          max="100"
          value={formData.confidence}
          onChange={handleChange}
          className="w-full h-2 bg-gray-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600 dark:accent-blue-400"
          disabled={isSubmitting}
        />
        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
          <span>Not confident</span>
          <span>Very confident</span>
        </div>
        {errors.confidence && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.confidence}</p>}
      </div>

      {/* Expected Outcome */}
      <div>
        <label htmlFor="expected_outcome" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          What do you expect to happen? <span className="text-red-500">*</span>
        </label>
        <textarea
          id="expected_outcome"
          name="expected_outcome"
          value={formData.expected_outcome}
          onChange={handleChange}
          placeholder="The outcome you're hoping for..."
          rows={2}
          className={`w-full px-4 py-2 border rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 resize-none transition-colors ${
            errors.expected_outcome ? 'border-red-500 dark:border-red-900' : 'border-gray-300 dark:border-slate-700'
          }`}
          disabled={isSubmitting}
        />
        {errors.expected_outcome && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.expected_outcome}</p>}
      </div>

      {/* Review Date */}
      <div>
        <label htmlFor="review_date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          When will you review this? <span className="text-red-500">*</span>
        </label>
        <input
          id="review_date"
          type="date"
          name="review_date"
          value={formData.review_date}
          onChange={handleChange}
          min={getMinReviewDate()}
          className={`w-full px-4 py-2 border rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors ${
            errors.review_date ? 'border-red-500 dark:border-red-900' : 'border-gray-300 dark:border-slate-700'
          }`}
          disabled={isSubmitting}
        />
        {errors.review_date && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.review_date}</p>}
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Default: 30 days from now. This is your re-engagement date.
        </p>
      </div>

      {/* Decision Speed */}
      <div>
        <label htmlFor="decision_speed" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          How quickly did you make this decision? <span className="text-red-500">*</span>
        </label>
        <div className="space-y-2">
          {[
            { value: 'quick', label: '⚡ Quick', description: 'Made in moments' },
            { value: 'moderate', label: '⏱️ Moderate', description: 'Took some time to decide' },
            { value: 'slow', label: '🐢 Slow', description: 'Deliberated carefully' },
          ].map((option) => (
            <label
              key={option.value}
              className={`flex items-center p-3 border rounded-lg cursor-pointer transition-all ${
                formData.decision_speed === option.value
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800'
              }`}
            >
              <input
                type="radio"
                name="decision_speed"
                value={option.value}
                checked={formData.decision_speed === option.value}
                onChange={handleChange}
                className="w-4 h-4 text-blue-600 cursor-pointer"
                disabled={isSubmitting}
              />
              <div className="ml-3">
                <p className="font-medium text-gray-900 dark:text-white">{option.label}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{option.description}</p>
              </div>
            </label>
          ))}
        </div>
        {errors.decision_speed && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.decision_speed}</p>}
      </div>

      {/* Optional Fields */}
      {showOptionalFields && (
        <>
          {/* Decision Driver */}
          <div>
            <label htmlFor="decision_driver" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              What influenced this decision most? (optional)
            </label>
            <div className="space-y-2">
              {[
                { value: 'logic', label: '🧠 Logic', description: 'Reasoned analysis and facts' },
                { value: 'urgency', label: '⏰ Urgency', description: 'Time pressure or deadlines' },
                { value: 'fear', label: '😰 Fear', description: 'Avoiding loss or bad outcomes' },
                { value: 'opportunity', label: '✨ Opportunity', description: 'Gaining something good' },
                { value: 'external_pressure', label: '👥 External Pressure', description: 'Someone else influenced it' },
              ].map((option) => (
                <label
                  key={option.value}
                  className={`flex items-center p-3 border rounded-lg cursor-pointer transition-all ${
                    formData.decision_driver === option.value
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <input
                    type="radio"
                    name="decision_driver"
                    value={option.value}
                    checked={formData.decision_driver === option.value}
                    onChange={handleChange}
                    className="w-4 h-4 text-blue-600 cursor-pointer"
                    disabled={isSubmitting}
                  />
                  <div className="ml-3">
                    <p className="font-medium text-gray-900 dark:text-white">{option.label}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{option.description}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Decision Type */}
          <div>
            <label htmlFor="decision_type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Category (optional)
            </label>
            <select
              id="decision_type"
              name="decision_type"
              value={formData.decision_type}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors"
              disabled={isSubmitting}
            >
              {DECISION_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Importance */}
          <div>
            <label htmlFor="importance" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              How important is this? (optional)
            </label>
            <select
              id="importance"
              name="importance"
              value={formData.importance}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors"
              disabled={isSubmitting}
            >
              {IMPORTANCE_LEVELS.map((level) => (
                <option key={level} value={level}>
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </>
      )}

      {/* Submit Button */}
      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 disabled:bg-gray-400 dark:disabled:bg-slate-700 text-white font-medium py-3 rounded-lg transition-colors"
        >
          {isSubmitting ? 'Saving...' : 'Log Decision'}
        </button>
      </div>

      {/* Help Text */}
      <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
        ⏱️ This should take less than 2 minutes. Be specific, not perfect.
      </p>
    </form>
  );
}
