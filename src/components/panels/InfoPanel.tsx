import { ArrowRight, Clock, FileJson, BookOpen, Lightbulb, CheckCircle2, Info } from 'lucide-react'
import { useAnimationStore } from '../../stores/animationStore'
import { useScenarioStore } from '../../stores/scenarioStore'

export default function InfoPanel() {
  const { currentStepIndex } = useAnimationStore()
  const { getCurrentStep, getCurrentScenario } = useScenarioStore()

  const currentStep = getCurrentStep(currentStepIndex)
  const scenario = getCurrentScenario()
  const totalSteps = scenario?.steps.length || 0

  // Показываем заглушку только если нет текущего шага
  if (!currentStep) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4">
        <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <BookOpen size={18} />
          Описание шага
        </h3>
        <div className="text-center py-8 text-gray-400">
          <Info size={32} className="mx-auto mb-3 opacity-50" />
          <p className="text-sm">Нажмите Play чтобы начать анимацию</p>
          <p className="text-xs mt-2">или используйте кнопки Step для навигации</p>
        </div>
      </div>
    )
  }

  const getStepTypeColor = (type: string) => {
    switch (type) {
      case 'request':
        return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'response':
        return 'bg-green-100 text-green-700 border-green-200'
      case 'async':
        return 'bg-orange-100 text-orange-700 border-orange-200'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getStepTypeLabel = (type: string) => {
    switch (type) {
      case 'request':
        return 'Запрос'
      case 'response':
        return 'Ответ'
      case 'async':
        return 'Async Event'
      default:
        return type
    }
  }

  // Парсим detailedInfo для структурированного отображения
  const parseDetailedInfo = (info?: string) => {
    if (!info) return null

    const sections: { title: string; content: string; icon: 'why' | 'what' | 'pattern' | 'result' }[] = []

    // Разбиваем по секциям
    const lines = info.split('\n')
    let currentSection: { title: string; content: string; icon: 'why' | 'what' | 'pattern' | 'result' } | null = null

    for (const line of lines) {
      const trimmed = line.trim()
      if (trimmed.startsWith('ЗАЧЕМ:')) {
        if (currentSection) sections.push(currentSection)
        currentSection = { title: 'Зачем это нужно', content: trimmed.replace('ЗАЧЕМ:', '').trim(), icon: 'why' }
      } else if (trimmed.startsWith('ЧТО ПРОИСХОДИТ:')) {
        if (currentSection) sections.push(currentSection)
        currentSection = { title: 'Что происходит', content: '', icon: 'what' }
      } else if (trimmed.startsWith('ПАТТЕРН:')) {
        if (currentSection) sections.push(currentSection)
        currentSection = { title: 'Паттерн', content: trimmed.replace('ПАТТЕРН:', '').trim(), icon: 'pattern' }
      } else if (trimmed.startsWith('РЕЗУЛЬТАТ:')) {
        if (currentSection) sections.push(currentSection)
        currentSection = { title: 'Результат', content: trimmed.replace('РЕЗУЛЬТАТ:', '').trim(), icon: 'result' }
      } else if (currentSection && trimmed) {
        currentSection.content += (currentSection.content ? '\n' : '') + trimmed
      }
    }
    if (currentSection) sections.push(currentSection)

    return sections
  }

  const sections = parseDetailedInfo(currentStep.detailedInfo)

  const getSectionIcon = (icon: string) => {
    switch (icon) {
      case 'why':
        return <Lightbulb size={14} className="text-yellow-600" />
      case 'what':
        return <Info size={14} className="text-blue-600" />
      case 'pattern':
        return <BookOpen size={14} className="text-purple-600" />
      case 'result':
        return <CheckCircle2 size={14} className="text-green-600" />
      default:
        return <Info size={14} />
    }
  }

  const getSectionStyle = (icon: string) => {
    switch (icon) {
      case 'why':
        return 'bg-yellow-50 border-yellow-200'
      case 'what':
        return 'bg-blue-50 border-blue-200'
      case 'pattern':
        return 'bg-purple-50 border-purple-200'
      case 'result':
        return 'bg-green-50 border-green-200'
      default:
        return 'bg-gray-50 border-gray-200'
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4">
      {/* Header with progress */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-700 flex items-center gap-2">
          <BookOpen size={18} />
          Описание шага
        </h3>
        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
          {currentStepIndex + 1} / {totalSteps}
        </span>
      </div>

      {/* Step header */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <span className={`px-2 py-0.5 rounded text-xs font-medium border ${getStepTypeColor(currentStep.type)}`}>
            {getStepTypeLabel(currentStep.type)}
          </span>
          <span className="text-xs text-gray-400 flex items-center gap-1">
            <Clock size={12} />
            {currentStep.realLatency < 1 ? `${currentStep.realLatency}ms` : `~${Math.round(currentStep.realLatency)}ms`}
          </span>
        </div>
        <h4 className="font-bold text-lg text-gray-800">{currentStep.title}</h4>
        <p className="text-sm text-gray-600 mt-1">{currentStep.description}</p>
      </div>

      {/* Route */}
      <div className="flex items-center gap-2 mb-4 p-3 bg-gray-50 rounded-lg border border-gray-100">
        <code className="text-sm font-mono text-blue-600 bg-blue-50 px-2 py-0.5 rounded">{currentStep.fromNode}</code>
        <ArrowRight size={16} className="text-gray-400 flex-shrink-0" />
        <code className="text-sm font-mono text-green-600 bg-green-50 px-2 py-0.5 rounded">{currentStep.toNode}</code>
      </div>

      {/* Detailed Info - structured sections */}
      {sections && sections.length > 0 && (
        <div className="space-y-3 mb-4">
          {sections.map((section, idx) => (
            <div key={idx} className={`p-3 rounded-lg border ${getSectionStyle(section.icon)}`}>
              <div className="flex items-center gap-2 mb-1">
                {getSectionIcon(section.icon)}
                <span className="text-sm font-semibold text-gray-700">{section.title}</span>
              </div>
              <div className="text-sm text-gray-600 whitespace-pre-line leading-relaxed pl-5">
                {section.content}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Payload */}
      {currentStep.payload && (
        <details className="group">
          <summary className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1 cursor-pointer hover:text-gray-900">
            <FileJson size={14} />
            Payload (данные)
            <span className="text-xs text-gray-400 group-open:hidden">▶ показать</span>
            <span className="text-xs text-gray-400 hidden group-open:inline">▼ скрыть</span>
          </summary>
          <pre className="text-xs bg-gray-900 text-green-400 p-3 rounded-lg overflow-auto max-h-40 mt-2">
            {JSON.stringify(currentStep.payload, null, 2)}
          </pre>
        </details>
      )}
    </div>
  )
}
