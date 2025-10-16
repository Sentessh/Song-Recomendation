import Typewriter from 'typewriter-effect';
import React from 'react';

export default function Home() {
  return (
    <div className="text-center text-lg font-semibold">
      <Typewriter
        onInit={(typewriter) => {
          typewriter
            .typeString('<strong>Tired</strong> of listening the same things?')
            .pauseFor(1500)
            .deleteAll()
            .typeString('We can <strong>help you</strong>')
            .pauseFor(2500)
            .start();
        }}
        options={{
          loop: true, // Mantém o loop
          delay: 50,
          deleteSpeed: 50,
        }}
      />
    </div>
  );
}