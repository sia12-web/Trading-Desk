'use client'

import ReactMarkdown from 'react-markdown'

export function StoryNarrative({ content }: { content: string }) {
    return (
        <div className="prose prose-invert prose-sm max-w-none
            prose-headings:text-neutral-200 prose-headings:font-bold
            prose-p:text-neutral-300 prose-p:leading-relaxed
            prose-strong:text-white
            prose-em:text-blue-300
            prose-ul:text-neutral-300 prose-ol:text-neutral-300
            prose-code:text-blue-300 prose-code:bg-blue-500/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded
        ">
            <ReactMarkdown>{content}</ReactMarkdown>
        </div>
    )
}
