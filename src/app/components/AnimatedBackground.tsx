"use client";

import React, { useEffect, useState } from "react";
import { getMoodStyle } from "../utils/moodStyles";

interface AnimatedBackgroundProps {
  mood: string;
}

interface ColorSet {
  bg1: string;
  bg2: string;
  color1: string;
  color2: string;
  color3: string;
  color4: string;
  color5: string;
}

type MoodColorMap = {
  [key: string]: ColorSet;
};

const AnimatedBackground: React.FC<AnimatedBackgroundProps> = ({ mood }) => {
  const [bgColors, setBgColors] = useState<ColorSet>({
    bg1: "rgb(108, 0, 162)",
    bg2: "rgb(0, 17, 82)",
    color1: "18, 113, 255",
    color2: "221, 74, 255",
    color3: "100, 220, 255",
    color4: "200, 50, 50",
    color5: "180, 180, 50",
  });

  // Animation speed adjustments based on mood
  const getAnimationSpeed = (baseMood: string) => {
    if (baseMood === 'Sad' || baseMood === 'Melancholic') {
      return {
        circle: '10s',
        vertical: '12s',
        horizontal: '15s',
        diagonal: '12s',
        pulsate: '6s'
      };
    }
    
    return {
      circle: '12s',
      vertical: '15s',
      horizontal: '18s',
      diagonal: '14s',
      pulsate: '8s'
    };
  };

  useEffect(() => {
    // Update colors based on mood
    if (mood) {
      const moodStyle = getMoodStyle(mood);
      
      // Extract colors from Tailwind classes
      // The moodStyle.gradient contains classes like 'from-yellow-200 via-orange-200 to-pink-200'
      const extractColorMap: MoodColorMap = {
        Happy: {
          bg1: "rgb(254, 240, 138)", // yellow-200
          bg2: "rgb(254, 215, 170)", // orange-200
          color1: "254, 240, 138", // yellow-200
          color2: "253, 224, 71", // yellow-300
          color3: "254, 215, 170", // orange-200
          color4: "253, 186, 116", // orange-300
          color5: "252, 211, 77", // amber-300
        },
        Sad: {
          bg1: "rgb(191, 219, 254)", // blue-200
          bg2: "rgb(199, 210, 254)", // indigo-200
          color1: "191, 219, 254", // blue-200
          color2: "147, 197, 253", // blue-300
          color3: "199, 210, 254", // indigo-200
          color4: "165, 180, 252", // indigo-300
          color5: "186, 230, 253", // sky-300
        },
        Energetic: {
          bg1: "rgb(254, 202, 202)", // red-200
          bg2: "rgb(254, 215, 170)", // orange-200
          color1: "254, 202, 202", // red-200
          color2: "253, 164, 175", // red-300
          color3: "254, 215, 170", // orange-200
          color4: "253, 186, 116", // orange-300
          color5: "251, 113, 133", // rose-400
        },
        Calm: {
          bg1: "rgb(187, 247, 208)", // green-200
          bg2: "rgb(153, 246, 228)", // teal-200
          color1: "187, 247, 208", // green
          color2: "153, 246, 228", // teal
          color3: "191, 219, 254", // blue
          color4: "134, 239, 172", // green-300
          color5: "94, 234, 212", // teal-300
        },
        Anxious: {
          bg1: "rgb(221, 214, 254)", // purple-200
          bg2: "rgb(254, 205, 211)", // pink-200
          color1: "221, 214, 254", // purple
          color2: "254, 205, 211", // pink
          color3: "254, 202, 202", // red
          color4: "196, 181, 253", // purple-300
          color5: "252, 165, 165", // red-300
        },
        Focused: {
          bg1: "rgb(229, 231, 235)", // gray-200
          bg2: "rgb(226, 232, 240)", // slate-200
          color1: "229, 231, 235", // gray
          color2: "226, 232, 240", // slate
          color3: "228, 228, 231", // zinc
          color4: "209, 213, 219", // gray-300
          color5: "203, 213, 225", // slate-300
        },
        Romantic: {
          bg1: "rgb(254, 205, 211)", // pink-200
          bg2: "rgb(255, 228, 230)", // rose-200
          color1: "254, 205, 211", // pink
          color2: "255, 228, 230", // rose
          color3: "254, 202, 202", // red
          color4: "249, 168, 212", // pink-300
          color5: "253, 164, 175", // red-300
        },
        Nostalgic: {
          bg1: "rgb(253, 230, 138)", // amber-200
          bg2: "rgb(254, 240, 138)", // yellow-200
          color1: "253, 230, 138", // amber
          color2: "254, 240, 138", // yellow
          color3: "254, 215, 170", // orange
          color4: "252, 211, 77", // amber-300
          color5: "253, 186, 116", // orange-300
        },
        Melancholic: {
          bg1: "rgb(226, 232, 240)", // slate-200
          bg2: "rgb(229, 231, 235)", // gray-200
          color1: "226, 232, 240", // slate-200
          color2: "203, 213, 225", // slate-300
          color3: "229, 231, 235", // gray-200
          color4: "209, 213, 219", // gray-300
          color5: "226, 232, 240", // slate-200
        },
        Excited: {
          bg1: "rgb(254, 240, 138)", // yellow-200
          bg2: "rgb(254, 215, 170)", // orange-200
          color1: "254, 240, 138", // yellow-200
          color2: "254, 215, 170", // orange-200
          color3: "217, 249, 157", // lime-200
          color4: "190, 242, 100", // lime-300
          color5: "252, 231, 121", // yellow-300
        },
        Peaceful: {
          bg1: "rgb(191, 219, 254)", // blue-200
          bg2: "rgb(165, 243, 252)", // cyan-200
          color1: "191, 219, 254", // blue
          color2: "165, 243, 252", // cyan
          color3: "153, 246, 228", // teal
          color4: "147, 197, 253", // blue-300
          color5: "103, 232, 249", // cyan-300
        },
        Stressed: {
          bg1: "rgb(254, 202, 202)", // red-200
          bg2: "rgb(254, 215, 170)", // orange-200
          color1: "254, 202, 202", // red-200
          color2: "253, 164, 175", // red-300
          color3: "254, 215, 170", // orange-200
          color4: "252, 165, 165", // red-300
          color5: "253, 186, 116", // orange-300
        },
        Playful: {
          bg1: "rgb(254, 205, 211)", // pink-200
          bg2: "rgb(221, 214, 254)", // purple-200
          color1: "254, 205, 211", // pink
          color2: "221, 214, 254", // purple
          color3: "199, 210, 254", // indigo
          color4: "249, 168, 212", // pink-300
          color5: "196, 181, 253", // purple-300
        },
        Reflective: {
          bg1: "rgb(199, 210, 254)", // indigo-200
          bg2: "rgb(221, 214, 254)", // purple-200
          color1: "199, 210, 254", // indigo
          color2: "221, 214, 254", // purple
          color3: "254, 205, 211", // pink
          color4: "165, 180, 252", // indigo-300
          color5: "196, 181, 253", // purple-300
        },
        Motivated: {
          bg1: "rgb(187, 247, 208)", // green-200
          bg2: "rgb(167, 243, 208)", // emerald-200
          color1: "187, 247, 208", // green
          color2: "167, 243, 208", // emerald
          color3: "153, 246, 228", // teal
          color4: "134, 239, 172", // green-300
          color5: "110, 231, 183", // emerald-300
        },
      };

      // Set colors based on mood
      if (extractColorMap[mood]) {
        setBgColors(extractColorMap[mood]);
      }
    }
  }, [mood]);

  const animationSpeeds = getAnimationSpeed(mood || '');

  return (
    <>
      <div className="fixed w-full h-full top-0 left-0 -z-10 overflow-hidden" 
        style={{
          background: `linear-gradient(40deg, ${bgColors.bg1}, ${bgColors.bg2})`,
        }}>
        <svg style={{ position: 'fixed', width: 0, height: 0 }}>
          <filter id="goo">
            <feGaussianBlur in="SourceGraphic" stdDeviation="30" result="blur" />
            <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 30 -15" result="goo" />
          </filter>
        </svg>

        <div className="w-full h-full" style={{ filter: 'url(#goo) blur(40px)' }}>
          <div 
            className="absolute"
            style={{
              background: `radial-gradient(circle at center, rgba(${bgColors.color1}, 0.8) 0, rgba(${bgColors.color1}, 0) 50%) no-repeat`,
              mixBlendMode: 'soft-light',
              width: '120%',
              height: '120%',
              top: 'calc(50% - 60%)',
              left: 'calc(50% - 60%)',
              transformOrigin: 'center center',
              animation: `moveVertical ${animationSpeeds.vertical} ease infinite`,
              opacity: 1
            }}
          />
          <div 
            className="absolute"
            style={{
              background: `radial-gradient(circle at center, rgba(${bgColors.color2}, 0.8) 0, rgba(${bgColors.color2}, 0) 50%) no-repeat`,
              mixBlendMode: 'soft-light',
              width: '120%',
              height: '120%',
              top: 'calc(50% - 60%)',
              left: 'calc(50% - 60%)',
              transformOrigin: 'calc(50% - 400px)',
              animation: `moveInCircle ${animationSpeeds.circle} reverse infinite`,
              opacity: 1
            }}
          />
          <div 
            className="absolute"
            style={{
              background: `radial-gradient(circle at center, rgba(${bgColors.color3}, 0.8) 0, rgba(${bgColors.color3}, 0) 50%) no-repeat`,
              mixBlendMode: 'soft-light',
              width: '120%',
              height: '120%',
              top: 'calc(50% - 60% + 200px)',
              left: 'calc(50% - 60% - 500px)',
              transformOrigin: 'calc(50% + 400px)',
              animation: `moveInCircle ${animationSpeeds.circle} linear infinite`,
              opacity: 1
            }}
          />
          <div 
            className="absolute"
            style={{
              background: `radial-gradient(circle at center, rgba(${bgColors.color4}, 0.8) 0, rgba(${bgColors.color4}, 0) 50%) no-repeat`,
              mixBlendMode: 'soft-light',
              width: '120%',
              height: '120%',
              top: 'calc(50% - 60%)',
              left: 'calc(50% - 60%)',
              transformOrigin: 'calc(50% - 200px)',
              animation: `moveHorizontal ${animationSpeeds.horizontal} ease infinite`,
              opacity: 0.9
            }}
          />
          <div 
            className="absolute"
            style={{
              background: `radial-gradient(circle at center, rgba(${bgColors.color5}, 0.8) 0, rgba(${bgColors.color5}, 0) 50%) no-repeat`,
              mixBlendMode: 'soft-light',
              width: '200%',
              height: '200%',
              top: 'calc(50% - 100%)',
              left: 'calc(50% - 100%)',
              transformOrigin: 'calc(50% - 800px) calc(50% + 200px)',
              animation: `moveInCircle ${animationSpeeds.circle} ease infinite`,
              opacity: 1
            }}
          />
          <div 
            className="absolute"
            style={{
              background: `radial-gradient(circle at center, rgba(${bgColors.color1}, 0.8) 0, rgba(${bgColors.color1}, 0) 50%) no-repeat`,
              mixBlendMode: 'soft-light',
              width: '150%',
              height: '150%',
              top: 'calc(50% - 75%)',
              left: 'calc(50% - 75%)',
              transformOrigin: 'center center',
              animation: `moveDiagonal ${animationSpeeds.diagonal} ease-in-out infinite`,
              opacity: 0.9
            }}
          />
          <div 
            className="absolute"
            style={{
              background: `radial-gradient(circle at center, rgba(${bgColors.color3}, 0.8) 0, rgba(${bgColors.color3}, 0) 50%) no-repeat`,
              mixBlendMode: 'soft-light',
              width: '180%',
              height: '180%',
              top: 'calc(50% - 90%)',
              left: 'calc(50% - 90%)',
              transformOrigin: 'center center',
              animation: `pulsate ${animationSpeeds.pulsate} ease-in-out infinite`,
              opacity: 0.85
            }}
          />
          <div 
            className="absolute"
            style={{
              background: `radial-gradient(circle at center, rgba(${bgColors.color2}, 0.8) 0, rgba(${bgColors.color2}, 0) 50%) no-repeat`,
              mixBlendMode: 'soft-light',
              width: '140%',
              height: '140%',
              top: 'calc(50% - 70%)',
              left: 'calc(50% - 70%)',
              transformOrigin: 'calc(50% + 300px) calc(50% - 200px)',
              animation: `moveDiagonal ${animationSpeeds.diagonal} reverse ease-in-out infinite`,
              opacity: 0.9
            }}
          />
        </div>
      </div>

      <style jsx>{`
        @keyframes moveInCircle {
          0% {
            transform: rotate(0deg) scale(0.8);
          }
          25% {
            transform: rotate(90deg) scale(1.2);
          }
          50% {
            transform: rotate(180deg) scale(0.9);
          }
          75% {
            transform: rotate(270deg) scale(1.1);
          }
          100% {
            transform: rotate(360deg) scale(0.8);
          }
        }

        @keyframes moveVertical {
          0% {
            transform: translateY(-70%) scale(0.9);
          }
          25% {
            transform: translateY(-35%) scale(1.1);
          }
          50% {
            transform: translateY(70%) scale(0.8);
          }
          75% {
            transform: translateY(35%) scale(1.2);
          }
          100% {
            transform: translateY(-70%) scale(0.9);
          }
        }

        @keyframes moveHorizontal {
          0% {
            transform: translateX(-70%) translateY(-20%) scale(0.9);
          }
          25% {
            transform: translateX(-35%) translateY(15%) scale(1.1);
          }
          50% {
            transform: translateX(70%) translateY(20%) scale(0.8);
          }
          75% {
            transform: translateX(35%) translateY(-15%) scale(1.2);
          }
          100% {
            transform: translateX(-70%) translateY(-20%) scale(0.9);
          }
        }

        @keyframes moveDiagonal {
          0% {
            transform: translate(-60%, -60%) scale(0.8) rotate(0deg);
          }
          25% {
            transform: translate(-30%, 30%) scale(1.2) rotate(90deg);
          }
          50% {
            transform: translate(60%, 60%) scale(0.9) rotate(180deg);
          }
          75% {
            transform: translate(30%, -30%) scale(1.1) rotate(270deg);
          }
          100% {
            transform: translate(-60%, -60%) scale(0.8) rotate(360deg);
          }
        }

        @keyframes pulsate {
          0% {
            transform: scale(0.8);
            opacity: 0.8;
          }
          50% {
            transform: scale(1.2);
            opacity: 1;
          }
          100% {
            transform: scale(0.8);
            opacity: 0.8;
          }
        }
      `}</style>
    </>
  );
};

export default AnimatedBackground;