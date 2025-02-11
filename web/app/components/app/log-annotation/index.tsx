'use client'
import type { FC } from 'react'
import React, { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useRouter } from 'next/navigation'
import cn from '@/utils/classnames'
import Log from '@/app/components/app/log'
import WorkflowLog from '@/app/components/app/workflow-log'
import Annotation from '@/app/components/app/annotation'
import Loading from '@/app/components/base/loading'
import { PageType } from '@/app/components/base/features/new-feature-panel/annotation-reply/type'
import TabSlider from '@/app/components/base/tab-slider-plain'
import { useStore as useAppStore } from '@/app/components/app/store'

type Props = {
  pageType: PageType
}

const LogAnnotation: FC<Props> = ({
  pageType,
}) => {
  const { t } = useTranslation()
  const router = useRouter()
  const appDetail = useAppStore(state => state.appDetail)

  const options = useMemo(() => {
    if (appDetail?.mode === 'completion')
      return [{ value: PageType.log, text: t('appLog.title') }]
    return [
      { value: PageType.log, text: t('appLog.title') },
      { value: PageType.annotation, text: t('appAnnotation.title') },
    ]
  }, [appDetail])

  if (!appDetail) {
    return (
      <div className='flex h-full items-center justify-center bg-background-body'>
        <Loading />
      </div>
    )
  }
  const isDebug = window.location.search.includes('debug=1')

  return (
    <div className='pt-3 px-6 h-full flex flex-col'>
      {isDebug && <a href="/app/bc880743-850a-44e5-b073-9bf6ef4719f0/configuration?debug=1" style={{
        color: '#3498db',
        textDecoration: 'none',
        fontWeight: 'bold',
        transition: 'all 0.3s',
        display: 'inline-block',
        marginBottom: '8px',
      }}>
        大模型对话
      </a>}
      {appDetail.mode !== 'workflow' && (
        <TabSlider
          className='shrink-0'
          value={pageType}
          onChange={(value) => {
            router.push(`/app/${appDetail.id}/${value === PageType.log ? 'logs' : 'annotations'}`)
          }}
          options={options}
        />
      )}
      <div className={cn('grow h-0', appDetail.mode !== 'workflow' && 'mt-3')}>
        {pageType === PageType.log && appDetail.mode !== 'workflow' && (<Log appDetail={appDetail} />)}
        {pageType === PageType.annotation && (<Annotation appDetail={appDetail} />)}
        {pageType === PageType.log && appDetail.mode === 'workflow' && (<WorkflowLog appDetail={appDetail} />)}
      </div>
    </div>
  )
}
export default React.memo(LogAnnotation)
