"use client"

import React, { useContext, useEffect, useRef, useState } from "react"
import Image from "next/image"
import { CSSTransition as ReactCSSTransition } from "react-transition-group"

const TransitionContext = React.createContext({
  parent: {
    show: true,
    isInitialRender: true,
    appear: false,
  },
})

function useIsInitialRender() {
  const isInitialRender = useRef(true)
  useEffect(() => {
    isInitialRender.current = false
  }, [])
  return isInitialRender.current
}

function CSSTransition({
  show,
  enter = "",
  enterStart = "",
  enterEnd = "",
  leave = "",
  leaveStart = "",
  leaveEnd = "",
  appear = false,
  unmountOnExit = undefined,
  tag = "div",
  children = null,
  ...rest
}) {
  const enterClasses = enter.split(" ").filter((s) => s.length)
  const enterStartClasses = enterStart.split(" ").filter((s) => s.length)
  const enterEndClasses = enterEnd.split(" ").filter((s) => s.length)
  const leaveClasses = leave.split(" ").filter((s) => s.length)
  const leaveStartClasses = leaveStart.split(" ").filter((s) => s.length)
  const leaveEndClasses = leaveEnd.split(" ").filter((s) => s.length)
  const removeFromDom = unmountOnExit

  function addClasses(node, classes) {
    classes.length && node.classList.add(...classes)
  }

  function removeClasses(node, classes) {
    classes.length && node.classList.remove(...classes)
  }

  const nodeRef = React.useRef(null) as any
  const Component = tag as any

  return (
    <ReactCSSTransition
      appear={appear}
      nodeRef={nodeRef}
      unmountOnExit={removeFromDom}
      in={show}
      addEndListener={(done) => {
        nodeRef.current.addEventListener("transitionend", done, false)
      }}
      onEnter={() => {
        if (!removeFromDom) nodeRef.current.style.display = null
        addClasses(nodeRef.current, [...enterClasses, ...enterStartClasses])
      }}
      onEntering={() => {
        removeClasses(nodeRef.current, enterStartClasses)
        addClasses(nodeRef.current, enterEndClasses)
      }}
      onEntered={() => {
        removeClasses(nodeRef.current, [...enterEndClasses, ...enterClasses])
      }}
      onExit={() => {
        addClasses(nodeRef.current, [...leaveClasses, ...leaveStartClasses])
      }}
      onExiting={() => {
        removeClasses(nodeRef.current, leaveStartClasses)
        addClasses(nodeRef.current, leaveEndClasses)
      }}
      onExited={() => {
        removeClasses(nodeRef.current, [...leaveEndClasses, ...leaveClasses])
        if (!removeFromDom) nodeRef.current.style.display = "none"
      }}
    >
      <Component
        ref={nodeRef}
        {...rest}
        style={{ display: !removeFromDom ? "none" : null }}
      >
        {children}
      </Component>
    </ReactCSSTransition>
  )
}

function Transition({ show, appear, ...rest }) {
  const { parent } = useContext(TransitionContext)
  const isInitialRender = useIsInitialRender()
  const isChild = show === undefined

  if (isChild) {
    return (
      <CSSTransition
        appear={(parent.appear || !parent.isInitialRender) as any}
        show={parent.show}
        {...rest}
      />
    )
  }

  return (
    <TransitionContext.Provider
      value={{
        parent: {
          show,
          isInitialRender,
          appear,
        },
      }}
    >
      <CSSTransition appear={appear} show={show} {...rest} />
    </TransitionContext.Provider>
  )
}

function Features({
  steps,
}: {
  steps: {
    name: string
    description: string
    image: string
  }[]
}) {
  const [tab, setTab] = useState(1)

  const tabs = useRef(null) as any

  const heightFix = () => {
    if (tabs.current.children[tab]) {
      tabs.current.style.height =
        tabs.current.children[tab - 1].offsetHeight + "px"
    }
  }

  useEffect(() => {
    heightFix()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab])

  return (
    <section className="container relative space-y-6 bg-slate-50 py-8 dark:bg-transparent md:py-12 lg:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div>
          <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
            <h2 className="font-heading text-3xl leading-[1.1] sm:text-3xl md:text-6xl">
              How it Works
            </h2>
            <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
              Get access to the library in under 30 seconds. All that&apos;s
              needed is a GitHub account.
            </p>
          </div>
          <div className="pt-8 md:grid md:gap-6 md:pt-0 lg:grid-cols-12">
            <div className="mx-auto max-w-xl md:col-span-7 md:mt-6 md:w-full md:max-w-none lg:col-span-6">
              {/* <div className="mb-8 md:pr-4 lg:pr-12 xl:pr-16">
                <h2 className="font-heading text-xl leading-[1.1] md:text-2xl">
                  Streamline the Technical Interview
                </h2>
                <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
                  We believe that technical interviews should reflect daily
                  activities — instead of rote memorization. We&apos;re building
                  a library of real-world programming scenarios to own your
                  interview process and find your next technical hire.
                </p>
              </div> */}
              <div className="mb-8 sm:mt-8 md:mb-0">
                {steps.map((step, i) => (
                  <a
                    key={step.name}
                    className={`mb-3 flex items-center rounded-lg border p-5 text-lg transition duration-300 ease-in-out ${
                      tab !== i + 1 ? "border-transparent" : "border-slate-600"
                    }`}
                    href={`#${i}`}
                    onClick={(e) => {
                      e.preventDefault()
                      setTab(i + 1)
                    }}
                  >
                    <div>
                      <div className="mb-1 font-bold leading-snug tracking-tight">
                        {step.name}
                      </div>
                      <div className="text-muted-foreground">
                        {step.description}
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </div>
            <div
              className="mx-auto mb-8 max-w-xl md:order-1 md:col-span-5 md:mb-0 md:w-full md:max-w-none lg:col-span-6"
              ref={tabs}
            >
              <div className="relative flex flex-col text-center lg:text-right">
                {steps.map((step, i) => (
                  <Transition
                    key={step.name}
                    show={tab === i + 1}
                    appear={true}
                    className="w-full"
                    enter="transition ease-in-out duration-700 transform order-first"
                    enterStart="opacity-0 translate-y-16"
                    enterEnd="opacity-100 translate-y-0"
                    leave="transition ease-in-out duration-300 transform absolute"
                    leaveStart="opacity-100 translate-y-0"
                    leaveEnd="opacity-0 -translate-y-16"
                  >
                    <div className="relative inline-flex flex-col sm:mt-12">
                      <Image
                        className="mx-auto rounded md:max-w-none"
                        src={step.image}
                        width="500"
                        height="462"
                        alt="Features bg"
                      />
                    </div>
                  </Transition>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Features
