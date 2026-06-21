'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { submitTest } from '@/app/actions/submitTest'
import {
  TestFormData,
  TestStep,
  INITIAL_TEST_DATA,
  PART_A_QUESTIONS,
  PART_B_CASE,
} from '@/types/test'
import StepIndicator from './TestStepIndicator'
import PartA from './PartA'
import PartB from './PartB'
import PartC from './PartC'

const LS_KEY = 'test_progress_v1'

function validateStep(step: TestStep, data: TestFormData): Record<string, string> {
  const errors: Record<string, string> = {}

  if (step === 1) {
    const answered = PART_A_QUESTIONS.filter(q => data.partAAnswers[q.id])
    if (answered.length < PART_A_QUESTIONS.length) {
      errors.partA = `Ответьте на все вопросы (отвечено: ${answered.length} из ${PART_A_QUESTIONS.length})`
    }
  }

  return errors
}

export default function TestForm({ respondentId }: { respondentId: string }) {
  const router = useRouter()
  const [step, setStep] = useState<TestStep>(1)
  const [data, setData] = useState<TestFormData>(INITIAL_TEST_DATA)
  const [partCFile, setPartCFile] = useState<File | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  useEffect(() => {
    try {
      const saved = localStorage.getItem(`${LS_KEY}_${respondentId}`)
      if (saved) {
        const { step: s, data: d } = JSON.parse(saved)
        setData(d)
        setStep(s)
      }
    } catch {
      // ignore
    }
  }, [respondentId])

  useEffect(() => {
    try {
      localStorage.setItem(
        `${LS_KEY}_${respondentId}`,
        JSON.stringify({ step, data })
      )
    } catch {
      // ignore
    }
  }, [step, data, respondentId])

  const handleNext = () => {
    const errs = validateStep(step, data)
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    setErrors({})
    setStep(prev => (prev + 1) as TestStep)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleBack = () => {
    setErrors({})
    setStep(prev => (prev - 1) as TestStep)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    setSubmitError(null)

    let fileUrl: string | null = null

    // Fayl yuklash (agar tanlangan bo'lsa)
    if (partCFile) {
      const filename = `${respondentId}_${partCFile.name}`
      const { data: uploaded, error: uploadError } = await supabase.storage
        .from('test-files')
        .upload(filename, partCFile, { upsert: true })

      if (uploadError) {
        setSubmitError(`Ошибка загрузки файла: ${uploadError.message}`)
        setIsSubmitting(false)
        return
      }

      const { data: urlData } = supabase.storage
        .from('test-files')
        .getPublicUrl(uploaded.path)
      fileUrl = urlData.publicUrl
    }

    const result = await submitTest({
      respondentId,
      partAAnswers: data.partAAnswers,
      partBAnswer: data.partBAnswer,
      partCFileUrl: fileUrl,
      partCLink: data.partCLink || null,
      partCExplanation: data.partCExplanation,
    })

    if (!result.success) {
      console.error('Test submit error:', result.error)
      setSubmitError('retry')
      setIsSubmitting(false)
      return
    }

    try {
      localStorage.removeItem(`${LS_KEY}_${respondentId}`)
    } catch {
      // ignore
    }

    router.push('/spasibo')
  }

  return (
    <div>
      <StepIndicator current={step} />

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        {step === 1 && (
          <PartA
            questions={PART_A_QUESTIONS}
            answers={data.partAAnswers}
            onChange={(id, val) =>
              setData(prev => ({
                ...prev,
                partAAnswers: { ...prev.partAAnswers, [id]: val },
              }))
            }
            errors={errors}
          />
        )}
        {step === 2 && (
          <PartB
            caseText={PART_B_CASE}
            answer={data.partBAnswer}
            onChange={val => setData(prev => ({ ...prev, partBAnswer: val }))}
          />
        )}
        {step === 3 && (
          <PartC
            mode={data.partCMode}
            file={partCFile}
            link={data.partCLink}
            explanation={data.partCExplanation}
            onModeChange={m => setData(prev => ({ ...prev, partCMode: m }))}
            onFileChange={setPartCFile}
            onLinkChange={val => setData(prev => ({ ...prev, partCLink: val }))}
            onExplanationChange={val => setData(prev => ({ ...prev, partCExplanation: val }))}
            errors={errors}
          />
        )}

        {submitError && (
          <div className="mt-6 p-4 bg-orange-50 border border-orange-200 rounded-lg text-center">
            <p className="text-sm text-orange-800 font-medium mb-1">
              Не удалось отправить ответы
            </p>
            <p className="text-sm text-orange-700">
              Проверьте подключение к интернету и попробуйте ещё раз.
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

          {step < 3 ? (
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
                {isSubmitting ? 'Отправка...' : 'Завершить тест'}
              </button>
            )
          )}
        </div>
      </div>
    </div>
  )
}
