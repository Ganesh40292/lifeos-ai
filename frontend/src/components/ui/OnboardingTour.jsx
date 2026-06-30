import { useState, useEffect } from 'react';
import { Joyride, STATUS } from 'react-joyride';

const OnboardingTour = () => {
  const [run, setRun] = useState(false);

  useEffect(() => {
    // Run tour ONLY if they registered just now and haven't completed it yet
    const shouldShow = localStorage.getItem('lifeos_show_onboarding');
    const completed = localStorage.getItem('lifeos_onboarding_completed');
    
    if (shouldShow === 'true' && !completed) {
      // Small delay to ensure all DOM elements are mounted and visible
      const timer = setTimeout(() => {
        setRun(true);
        // Mark as completed immediately so it only pops up once
        localStorage.setItem('lifeos_onboarding_completed', 'true');
        localStorage.removeItem('lifeos_show_onboarding');
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const steps = [
    {
      target: 'body',
      content: 'Welcome to LifeOS! Let’s take a quick 1-minute tour to see how to navigate and make the most of your virtual life operating system.',
      placement: 'center',
      title: 'Welcome 👋',
    },
    {
      target: '#sidebar-nav-container',
      content: 'This is your navigation panel. Switch between your Dashboard, Academics (Student), Finance Tracker, Notes, and Health dashboard here.',
      placement: 'right',
      title: 'Main Navigation 🧭',
    },
    {
      target: '#xp-bar-container',
      content: 'Earn XP for every action you complete: logging workouts, creating notes, completing assignments, and tracking expenses. Watch your level grow! ⚡',
      placement: 'bottom',
      title: 'Gamification Stats 🎮',
    },
    {
      target: '#notification-bell-btn',
      content: 'Real-time WebSocket alerts appear here when you level up, hit streaks, or when budget categories near their limits. 🔔',
      placement: 'bottom',
      title: 'Real-Time Alerts 💬',
    },
    {
      target: 'button[aria-label="Voice Input"]',
      content: 'Click here or press the "V" key to trigger SiriOS, your Natural Language Voice Assistant. Say "spent 150 on food" to auto-log! 🎙️',
      placement: 'bottom',
      title: 'Voice Assistant 🗣️',
    },
    {
      target: '#theme-toggle-btn',
      content: 'Switch between light and dark modes here. For the full multi-palette custom colors, head to Settings -> Appearance. 🎨',
      placement: 'bottom',
      title: 'Color Themes ✨',
    },
    {
      target: 'body',
      content: 'You’re all set! Press "Ctrl+K" at any time to open the Command Palette, or press "?" to view all hotkeys.',
      placement: 'center',
      title: 'Ready to go! 🚀',
    }
  ];

  const handleJoyrideCallback = (data) => {
    const { status } = data;
    const finishedStatuses = [STATUS.FINISHED, STATUS.SKIPPED];

    if (finishedStatuses.includes(status)) {
      setRun(false);
      localStorage.setItem('lifeos_onboarding_completed', 'true');
      localStorage.removeItem('lifeos_show_onboarding');
    }
  };

  return (
    <Joyride
      callback={handleJoyrideCallback}
      continuous
      run={run}
      scrollToFirstStep
      showProgress
      showSkipButton
      steps={steps}
      styles={{
        options: {
          overlayColor: 'rgba(0, 0, 0, 0.65)',
          zIndex: 10000,
        }
      }}
    />
  );
};

export default OnboardingTour;
