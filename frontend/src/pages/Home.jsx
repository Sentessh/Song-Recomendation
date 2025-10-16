// src/pages/Home.jsx
import Typewriter from "typewriter-effect"

export default function Home() {
  const BLOCK = "Tired of<br/>listening<br/>the same<br/>thing?"
  const LINE2 = "<br/>We can help you"
  const TOTAL_LINES = 5 // 4 + 1

  return (
    <div className="min-h-[calc(100vh-56px)] bg-black text-white">
      {/* área da home: ocupa metade/60% da tela e serve de referência de posicionamento */}
      <section className="relative h-[60vh]">
        {/* **Top-left absoluto e COLADO na esquerda do viewport** */}
        <div className="absolute top-0 left-0 w-screen px-0 m-0">
          <h1
            className="text-left font-semibold tracking-tight leading-none text-[clamp(2rem,7vw,5rem)]"
            style={{
              fontVariantLigatures: "none",
              WebkitFontFeatureSettings: '"liga" 0, "calt" 0',
              fontFeatureSettings: '"liga" 0, "calt" 0'
            }}
          >
            {/* Wrapper com altura final reservada (sem “subir”) */}
            <span
              className="relative inline-block"
              style={{
                '--lh': '1.05em',
                lineHeight: 'var(--lh)',
                height: `calc(${TOTAL_LINES} * var(--lh))`,
                paddingLeft: 0, // colado
                marginLeft: 0
              }}
            >
              <span className="absolute top-0 left-0">
                <Typewriter
                  options={{
                    delay: 38,
                    loop: false,
                    cursor: "|",
                    html: true,
                    autoStart: true,
                    wrapperClassName: "tw-wrapper",
                    cursorClassName: "tw-caret",
                  }}
                  onInit={(tw) => {
                    tw.typeString(BLOCK)
                      .pauseFor(900)
                      .typeString(LINE2)
                      .start()
                  }}
                />
              </span>
            </span>
          </h1>
        </div>
      </section>

      <style>{`
        /* Monospace só durante a digitação (estabilidade do cursor/width) */
        .tw-wrapper{
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
          display:inline-block;
          margin:0; padding:0 0 .12em 0; /* nenhum padding à esquerda */
          line-height:1.05em;
          white-space:pre-wrap;
        }
        .tw-caret{
          margin-left: 2px;
          line-height:1em;
        }
        /* garante zero recuo nos pais comuns */
        body, #root { margin:0; }
        @media (prefers-reduced-motion: reduce){
          .Typewriter__cursor{ display:none !important; }
        }
      `}</style>
    </div>
  )
}