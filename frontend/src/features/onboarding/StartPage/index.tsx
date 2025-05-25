'use client'
import Image from 'next/image'
import './styles.css'

export function StartPage({ readmeContent }: { readmeContent: string }) {
  return (
    <div className="container">
     <header className="headerContainer">
      <div className="inner">
        <button className="logoButton">
          <Image
            src="/icons/new/logo-icon.svg"
            alt="logo"
            width={24}
            height={24}
          />
          Vibe Editor
        </button>
        <a
         className="actionButton"
          href="https://marketplace.visualstudio.com/items?itemName=VibeEditor.vibe-editor"
          target="_blank"
          rel="noopener noreferrer"
        >
          VS Code 확장 프로그램
        </a>
      </div>
    </header>
      <div className="main">
        <div className="markdownViewer" dangerouslySetInnerHTML={{ __html: readmeContent }} />
      </div>
    </div>
  )
}
