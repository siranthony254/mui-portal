// Brand Voice: Empowering, Growth-Oriented, Culturally Grounded, Professional yet Warm

export const microcopy = {
  // Welcome & Onboarding
  welcome: {
    heading: "Welcome to your formation journey",
    subheading: "You're about to embark on 12 weeks of intentional growth",
    cta: "Let's begin",
  },
  
  // Progress & Achievement
  progress: {
    milestone: "Milestone reached! 🎉",
    complete: "You're crushing it!",
    streak: "You're on fire! Keep the momentum going",
    weekComplete: "Week complete — you're growing stronger",
  },
  
  // Task & Learning
  task: {
    pending: "Ready when you are",
    submitted: "In review — your mentor will respond soon",
    approved: "Excellent work! Keep pushing forward",
    feedback: "Your mentor has shared feedback",
  },
  
  // Mentorship
  mentorship: {
    assigned: "Your mentor has been assigned",
    message: "Reach out — your mentor is here to guide you",
    session: "Monthly session coming up — mark your calendar",
  },
  
  // Community
  community: {
    connect: "Your peers are on this journey too",
    collaborate: "Learn together, grow together",
    celebrate: "Celebrate each other's wins",
  },
  
  // Errors & States
  error: {
    generic: "Something went wrong — let's try that again",
    network: "Connection lost — check your internet and try again",
    auth: "Session expired — please sign in again",
  },
  
  // Empty States
  empty: {
    tasks: "No tasks yet — your week is just beginning",
    messages: "Start the conversation with your mentor",
    journal: "Your journal is waiting for your thoughts",
  },
  
  // Success
  success: {
    saved: "Saved successfully",
    submitted: "Submitted for review",
    updated: "Updated successfully",
    created: "Created successfully",
  },
  
  // CTAs
  cta: {
    primary: "Continue your journey",
    secondary: "Learn more",
    tertiary: "View details",
  },
  
  // Loading
  loading: {
    default: "Loading your experience...",
    saving: "Saving your progress...",
    submitting: "Submitting your work...",
  },
}

export const getMicrocopy = (category: keyof typeof microcopy, key?: string) => {
  if (key && typeof microcopy[category] === 'object' && key in microcopy[category]) {
    return (microcopy[category] as Record<string, string>)[key]
  }
  return microcopy[category]
}
