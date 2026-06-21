'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import {
  AnketaFormData,
  FormStep,
  INITIAL_FORM_DATA,
  LIKERT_STATEMENTS,
  FREQUENCY_TOOLS,
} from '@/types/anketa'
import StepIndicator from './StepIndicator'
import BlockI from './BlockI'
import BlockII from './BlockII'
import BlockIII from './BlockIII'
import BlockIV from './BlockIV'
import BlockV from './BlockV'

const LS_KEY = 'anketa_progress_v1'

function validate(step: FormStep, data: AnketaFormData): Record<string, string> {
  const errors: Record<string, string> = {}

  if (step === 1) {
    if (!data.university) errors.university = 'Выберите вуз'
    if (!data.course) errors.course = 'Выберите курс'
    if (!data.major.trim()) errors.major = 'Укажите направление подготовки'
    if (!data.consent) errors.consent = 'Необходимо дать согласие для участия'
  }

  if (step === 2) {
    const answered = LIKERT_STATEMENTS.filter((_, i) => data.likert[`q${i + 1}`])
    if (answered.length < LIKERT_STATEMENTS.length) {
      errors.likert = 'Пожалуйста, оцените все утверждения'
    }
  }

  if (step === 3) {
    const answered = FREQUENCY_TOOLS.filter(t => data.frequency[t.key])
    if (answered.length < FREQUENCY_TOOLS.length) {
      errors.frequency = 'Пожалуйста, укажите частоту для каждого инструмента'
    }
  }

  return errors
}

export default function AnketaForm() {
  const router = useRouter()
  const [step, setStep] = useState<FormStep>(1)
  const [formData, setFormData] = useState<AnketaFormData>(INITIAL_FORM_DATA)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  // Saqlangan progressni yuklash
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LS_KEY)
      if (saved) {
        const { step: savedStep, data } = JSON.parse(saved)
        setFormData(data)
        setStep(savedStep)
      }
    } catch {
      // localStorage ishlamasa — muammo yo'q
    }
  }, [])

  // Har o'zgarishda localStorage ga saqlash
  useEffect(() => {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify({ step, data: formData }))
    } catch {
      // ignore
    }
  }, [step, formData])

  const handleChange = (
    field: keyof AnketaFormData,
    value: AnketaFormData[keyof AnketaFormData]
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setErrors(prev => {
      const next = { ...prev }
      delete next[field as string]
      return next
    })
  }

  const handleNext = () => {
    const validationErrors = validate(step, formData)
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    setErrors({})
    setStep(prev => (prev + 1) as FormStep)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleBack = () => {
    setErrors({})
    setStep(prev => (prev - 1) as FormStep)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    setSubmitError(null)

    const payload = {
      wave: 1,
      university: formData.university,
      course: formData.course,
      direction: formData.major,
      contact: formData.contact || null,
      consent: formData.consent,
      b2_q1: formData.likert.q1 ?? null,
      b2_q2: formData.likert.q2 ?? null,
      b2_q3: formData.likert.q3 ?? null,
      b2_q4: formData.likert.q4 ?? null,
      b2_q5: formData.likert.q5 ?? null,
      b2_q6: formData.likert.q6 ?? null,
      b3_lms: formData.frequency.lms ?? null,
      b3_interactive: formData.frequency.interactive ?? null,
      b3_ai: formData.frequency.ai ?? null,
      difficulties: formData.difficulties,
      open_answer: formData.openAnswer || null,
    }

    const { data: inserted, error } = await supabase
      .from('respondents')
      .insert(payload)
      .select('id')
      .single()

    if (error || !inserted) {
      console.error('[AnketaForm] Supabase insert error:', error)
      setSubmitError(error?.message ?? 'unknown')
      setIsSubmitting(false)
      return
    }

    try {
      localStorage.removeItem(LS_KEY)
    } catch {
      // ignore
    }

    router.push(`/test?rid=${inserted.id}`)
  }

  return (
    <div>
      <StepIndicator current={step} />

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        {step === 1 && (
          <BlockI
            data={formData}
            onChange={handleChange as (field: keyof AnketaFormData, value: string | boolean) => void}
            errors={errors}
          />
        )}
        {step === 2 && (
          <BlockII
            data={formData}
            onChange={handleChange as (field: 'likert', value: Record<string, number>) => void}
            errors={errors}
          />
        )}
        {step === 3 && (
          <BlockIII
            data={formData}
            onChange={handleChange as (field: 'frequency', value: Record<string, string>) => void}
            errors={errors}
          />
        )}
        {step === 4 && (
          <BlockIV
            data={formData}
            onChange={handleChange as (field: 'difficulties', value: string[]) => void}
          />
        )}
        {step === 5 && (
          <BlockV
            data={formData}
            onChange={handleChange as (field: 'openAnswer', value: string) => void}
          />
        )}

        {submitError && (
          <div className="mt-6 p-4 bg-orange-50 border border-orange-200 rounded-lg text-center">
            <p className="text-sm text-orange-800 font-medium mb-1">
              Не удалось отправить ответы
            </p>
            <p className="text-xs text-red-600 font-mono mt-1 break-all">
              {submitError}
            </p>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="mt-3 px-5 py-2 text-sm font-medium text-white bg-orange-500 rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-60"
            >
              {isSubmitting ? 'Отправка...' : 'Попробовать ещё раз'}
            </button>
          </div>
        )}

        <div className="flex justify-between mt-8 pt-6 border-t border-gray-100">
          {step > 1 ? (
            <button
              onClick={handleBack}
              className="px-5 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Назад
            </button>
          ) : (
            <div />
          )}

          {step < 5 ? (
            <button
              onClick={handleNext}
              className="px-6 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Далее
            </button>
          ) : (
            !submitError && (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-6 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Отправка...' : 'Отправить ответы'}
              </button>
            )
          )}
        </div>
      </div>
    </div>
  )
}
