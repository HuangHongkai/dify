import type { FC } from 'react'
import {
  memo, useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { APP_CHAT_WITH_MULTIPLE_MODEL } from '../types'
import DebugItem from './debug-item'
import {
  DebugWithMultipleModelContextProvider,
  useDebugWithMultipleModelContext,
} from './context'
import type { DebugWithMultipleModelContextType } from './context'
import { useEventEmitterContextContext } from '@/context/event-emitter'
import ChatInputArea from '@/app/components/base/chat/chat/chat-input-area'
import { useDebugConfigurationContext } from '@/context/debug-configuration'
import { useFeatures } from '@/app/components/base/features/hooks'
import { useStore as useAppStore } from '@/app/components/app/store'
import type { FileEntity } from '@/app/components/base/file-uploader/types'
import type { InputForm } from '@/app/components/base/chat/chat/type'

const DebugWithMultipleModel = () => {
  const {
    mode,
    inputs,
    modelConfig,
  } = useDebugConfigurationContext()
  const speech2text = useFeatures(s => s.features.speech2text)
  const file = useFeatures(s => s.features.file)
  const {
    multipleModelConfigs,
    checkCanSend,
  } = useDebugWithMultipleModelContext()

  const { eventEmitter } = useEventEmitterContextContext()
  const isChatMode = mode === 'chat' || mode === 'agent-chat'

  const handleSend = useCallback((message: string, files?: FileEntity[]) => {
    if (checkCanSend && !checkCanSend())
      return

    eventEmitter?.emit({
      type: APP_CHAT_WITH_MULTIPLE_MODEL,
      payload: {
        message,
        files,
      },
    } as any)
  }, [eventEmitter, checkCanSend])

  const [isFullScreen, setIsFullScreen] = useState(window.innerWidth > window.screen.width * 0.5)

  const checkScreenWidth = () => {
    setIsFullScreen(window.innerWidth > window.screen.width * 0.5)
  }
  // console.log('full', isFullScreen);
  useEffect(() => {
    checkScreenWidth() // Check on initial load
    window.addEventListener('resize', checkScreenWidth) // Add event listener on window resize

    return () => {
      window.removeEventListener('resize', checkScreenWidth) // Clean up the event listener
    }
  }, [])

  const twoLine = multipleModelConfigs.length === 2
  const threeLine = multipleModelConfigs.length === 3
  const fourLine = multipleModelConfigs.length === 4

  const size = useMemo(() => {
    let width = ''
    let height = ''
    if (isFullScreen) {
      if (twoLine) {
        width = 'calc(50% - 14px)'
        height = '100%'
      }
      if (threeLine) {
        width = 'calc(33.3% - 5.33px - 16px)'
        height = '100%'
      }
    }
    else {
      if (twoLine) {
        width = 'calc(100% - 14px)'
        height = 'calc(50% - 10px)'
      }
      if (threeLine) {
        width = 'calc(100% - 14px)'
        height = 'calc(33.3% - 5px)'
      }
    }
    if (fourLine) {
      width = 'calc(50% - 4px - 24px)'
      height = 'calc(50% - 4px)'
    }

    return {
      width,
      height,
    }
  }, [twoLine, threeLine, fourLine])
  const position = useCallback((idx: number) => {
    let translateX = '0'
    let translateY = '0'

    if (twoLine) {
      if (isFullScreen) {
        if (idx === 1)
          translateX = 'calc(100% + 8px)'
      }
      else {
        if (idx === 1)
          translateY = 'calc(100% + 8px)'
      }
    }
    if (threeLine) {
      if (isFullScreen) {
        if (idx === 1)
          translateX = 'calc(100% + 8px)'
        if (idx === 2)
          translateX = 'calc(200% + 16px)'
      }
      else {
        if (idx === 1)
          translateY = 'calc(100% + 8px)'
        else if (idx === 2)
          translateY = 'calc(200% + 16px)'
      }
    }
    if (fourLine) {
      if (idx === 1)
        translateX = 'calc(100% + 8px)'
      if (idx === 2)
        translateY = 'calc(100% + 8px)'
      if (idx === 3) {
        translateX = 'calc(100% + 8px)'
        translateY = 'calc(100% + 8px)'
      }
    }

    return {
      translateX,
      translateY,
    }
  }, [twoLine, threeLine, fourLine])

  const setShowAppConfigureFeaturesModal = useAppStore(s => s.setShowAppConfigureFeaturesModal)
  const inputsForm = modelConfig.configs.prompt_variables.filter(item => item.type !== 'api').map(item => ({ ...item, label: item.name, variable: item.key })) as InputForm[]
  const isDebug = window.location.search.includes('debug=1')

  return (
    <div className='flex flex-col h-full'>
      <div
        className={`grow mb-3 relative overflow-auto${isDebug ? '' : ' px-6'}`}
        style={{ height: isChatMode ? 'calc(100% - 60px)' : '100%' }}
      >
        {
          multipleModelConfigs.map((modelConfig, index) => (
            <DebugItem
              key={modelConfig.id}
              modelAndParameter={modelConfig}
              className={`
                absolute left-6 top-0 min-h-[200px]
                ${twoLine && index === 0 && 'mr-2'}
                ${threeLine && (index === 0 || index === 1) && 'mr-2'}
                ${fourLine && (index === 0 || index === 2) && 'mr-2'}
                ${fourLine && (index === 0 || index === 1) && 'mb-2'}
              `}
              style={{
                width: size.width,
                height: size.height,
                transform: `translateX(${position(index).translateX}) translateY(${position(index).translateY})`,
              }}
            />
          ))
        }
      </div>
      {isChatMode && (
        <div className='shrink-0 pb-0 px-6'>
          <ChatInputArea
            showFeatureBar
            showFileUpload={false}
            onFeatureBarClick={setShowAppConfigureFeaturesModal}
            onSend={handleSend}
            speechToTextConfig={speech2text as any}
            visionConfig={file}
            inputs={inputs}
            inputsForm={inputsForm}
          />
        </div>
      )}
    </div>
  )
}

const DebugWithMultipleModelMemoed = memo(DebugWithMultipleModel)

const DebugWithMultipleModelWrapper: FC<DebugWithMultipleModelContextType> = ({
  onMultipleModelConfigsChange,
  multipleModelConfigs,
  onDebugWithMultipleModelChange,
  checkCanSend,
}) => {
  return (
    <DebugWithMultipleModelContextProvider
      onMultipleModelConfigsChange={onMultipleModelConfigsChange}
      multipleModelConfigs={multipleModelConfigs}
      onDebugWithMultipleModelChange={onDebugWithMultipleModelChange}
      checkCanSend={checkCanSend}
    >
      <DebugWithMultipleModelMemoed />
    </DebugWithMultipleModelContextProvider>
  )
}

export default memo(DebugWithMultipleModelWrapper)
