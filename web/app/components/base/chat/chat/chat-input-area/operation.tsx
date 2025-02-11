import React, {
  forwardRef,
  memo,
} from 'react'
import {
  RiMicLine,
  RiSendPlane2Fill,
} from '@remixicon/react'
import type {
  EnableType,
} from '../../types'
import type { Theme } from '../../embedded-chatbot/theme/theme-context'
import Button from '@/app/components/base/button'
import ActionButton from '@/app/components/base/action-button'
import { FileUploaderInChatInput } from '@/app/components/base/file-uploader'
import type { FileUpload } from '@/app/components/base/features/types'
import cn from '@/utils/classnames'
import {RefreshCcw01} from "@/app/components/base/icons/src/vender/line/arrows";
import {APP_CHAT_WITH_MULTIPLE_MODEL_RESTART} from "@/app/components/app/configuration/debug/types";
import {useEventEmitterContextContext} from "@/context/event-emitter";
import TooltipPlus from '@/app/components/base/tooltip'

type OperationProps = {
  fileConfig?: FileUpload
  speechToTextConfig?: EnableType
  onShowVoiceInput?: () => void
  onSend: () => void
  theme?: Theme | null
}
const Operation = forwardRef<HTMLDivElement, OperationProps>(({
  fileConfig,
  speechToTextConfig,
  onShowVoiceInput,
  onSend,
  theme,
}, ref) => {
  const { eventEmitter } = useEventEmitterContextContext()
  const clearConversation = async () => {
    eventEmitter?.emit({
      type: APP_CHAT_WITH_MULTIPLE_MODEL_RESTART,
    } as any)
  }

  return (
    <div
      className={cn(
        'shrink-0 flex items-center justify-end',
      )}
    >
      <div
        className='flex items-center pl-1'
        ref={ref}
      >
        <div className='flex items-center space-x-1'>
          <TooltipPlus
            popupContent={'发起新对话'}
          >
            <ActionButton onClick={clearConversation}>
              <RefreshCcw01 className='w-4 h-4' />
            </ActionButton>
          </TooltipPlus>
          {fileConfig?.enabled && <FileUploaderInChatInput fileConfig={fileConfig} />}
          {
            speechToTextConfig?.enabled && (
              <ActionButton
                size='l'
                onClick={onShowVoiceInput}
              >
                <RiMicLine className='w-5 h-5' />
              </ActionButton>
            )
          }
        </div>
        <Button
          className='ml-3 px-0 w-8'
          variant='primary'
          onClick={onSend}
          style={
            theme
              ? {
                backgroundColor: theme.primaryColor,
              }
              : {}
          }
        >
          <RiSendPlane2Fill className='w-4 h-4' />
        </Button>
      </div>
    </div>
  )
})
Operation.displayName = 'Operation'

export default memo(Operation)
