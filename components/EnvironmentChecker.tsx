import React from 'react';

// This component has been modified to be a pass-through, effectively disabling the
// environment variable check that was causing a UI prompt for an API key.
// The application should assume the API_KEY is provided via environment variables
// without prompting the user.
export const EnvironmentChecker: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <>{children}</>;
};
